/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useAddUser } from "./hooks/useAddUser";
import { useUpdateUser } from "./hooks/useUpdateUser";
import UserForm from "./user-form";


const userSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "First Name must be at least 2 characters.",
    })
    .max(30, {
      message: "First Name must not be longer than 30 characters.",
    }),
  lastName: z
    .string()
    .min(2, {
      message: "Last Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Last Name must not be longer than 30 characters.",
    }),
  middleName: z
    .string()
    .optional(),

  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  password: z
    .string({
      required_error: "This field is required.",
    })
    .min(2, {
      message: "Password must be at least 2 characters.",
    })
    .max(30, {
      message: "Password must not be longer than 30 characters.",
    }),
  userRole: z.string({
    required_error: "This field is required.",
  }),
  userImg: z.any()
})

const defaultValues = {
  firstName: "",
  lastName: "",
  middleName: "",
  userImg: undefined,
  password: "",
  email: "",
  userRole: "",
}

export type UserFormValues = z.infer<typeof userSchema>;

interface UserContentFormProps {
  user?: Record<string, any>
  isUpdateMode?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
  trigger?: React.ReactNode
}

const UserContentForm = ({ user = {}, onOpenChange, open }: UserContentFormProps) => {
    const { user_id, ...otherData } = user;
    const isEditingMode = Boolean(user_id);
  
    const form = useForm<UserFormValues>({
      resolver: zodResolver(userSchema),
      mode: "onTouched",
      defaultValues: isEditingMode && user
      ? { ...otherData, }
      : defaultValues,
  });

  const { isAddingUser, createUser } = useAddUser()
  const { isUpdatingUser, updateUserHandler } = useUpdateUser()


 useEffect(() => {
     if (open) {
       form.reset(
         isEditingMode && user
           ? { ...otherData  }
           : defaultValues
       );
     } else {
       form.reset(defaultValues); // Reset when closing
     }
   }, [open, isEditingMode, user, form]);
 
   const setSheetOpen = useCallback(
     (value: boolean) => {
       if (onOpenChange) {
         onOpenChange(value);
       }
       if (!value) {
         form.reset(defaultValues);
         document.body.style.pointerEvents = "auto"; // Extra safety
       }
     },
     [onOpenChange, form]
   );
 

  const onSubmit: SubmitHandler<UserFormValues | any> = async (data: UserFormValues) => {
    try {

      const { firstName, lastName, middleName, userRole, userImg, password, email} = data;
      const userData = {
        firstName,
        lastName, middleName, email, password, userImg, userRole,
        confirmPassword: data.password,
        user_id, user_uid: otherData.user_uid
      }




      if (isEditingMode) {
        await updateUserHandler(userData)
      } else {
        await createUser(userData)
      }

      form.reset(defaultValues); // Reset form after submission

      setSheetOpen(false);




      console.log(form.getValues())

    } catch (err) {
      console.error(`[SubmittingError]: ${err}`)
    }


  }

  return (
    <Sheet onOpenChange={setSheetOpen} open={open}>
      <SheetContent className=" p-0 flex flex-col h-full md:max-w-[40rem]">
        <header
          className={`py-4 bg-overlay-bg
              border-b border-overlay-border px-6 bg-overlay-bg border-overlay-border flex-shrink-0`}
        >
          <div>
            <h3 className="text-lg font-medium">Adding User</h3>
            <p className="text-xs text-muted-foreground">
              Fill in the details.
            </p>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto">
          <UserForm form={form} />
        </div>
        <SheetFooter className="flex-shrink-0 px-6 py-4 bg-overlay-bg border-t border-overlay-border">
          <Button
                      type="submit"
                      disabled={isEditingMode ? isUpdatingUser : isAddingUser}
                      onClick={form.handleSubmit(onSubmit)}
                    >
                      {isEditingMode
                        ? isUpdatingUser ? "Updating User.. " : "Update User" 
                        : isAddingUser
                          ? "Creating User..."
                          : "Create User"}
                    </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}


export default UserContentForm

