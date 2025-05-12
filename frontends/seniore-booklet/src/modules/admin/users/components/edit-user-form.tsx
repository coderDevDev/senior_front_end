// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { updateUser } from "../services/user.service";
// import UserForm from "../user-form";
// import IUser from "../user.interface";
// import { useQueryClient } from "@tanstack/react-query";
// import { Q_KEYS } from "@/shared/qkeys";

// interface EditUserFormProps {
//   user: IUser;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export default function EditUserForm({ user, open, onOpenChange }: EditUserFormProps) {
//   const queryClient = useQueryClient();
//   const form = useForm<Partial<IUser>>({
//     defaultValues: {
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       userRole: user.userRole,
//     }
//   });

//   const onSubmit = async (data: Partial<IUser>) => {
//     try {
//       await updateUser(user.id!, data);
//       await queryClient.invalidateQueries({ queryKey: [Q_KEYS.USERS] });
//       toast.success("User updated successfully");
//       onOpenChange(false);
//     } catch (error) {
//       toast.error("Failed to update user");
//     }
//   };

//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       <SheetContent className="sm:max-w-[540px] flex flex-col h-full">
//         <SheetHeader>
//           <SheetTitle>Edit User</SheetTitle>
//         </SheetHeader>
//         <div className="flex-grow overflow-y-auto">
//           <UserForm form={form} />
//         </div>
//         <SheetFooter className="flex-shrink-0 px-6 py-4">
//           <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
//           <Button onClick={form.handleSubmit(onSubmit)}>Update User</Button>
//         </SheetFooter>
//       </SheetContent>
//     </Sheet>
//   );
// }
