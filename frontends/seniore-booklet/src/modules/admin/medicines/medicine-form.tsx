/* eslint-disable @typescript-eslint/no-unused-vars */
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UploadIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MedicineForm = ({ form, isEditingMode }: any) => {
  
  const { setFocus,  formState } = form;
  const { errors } = formState;

  console.log(isEditingMode)

  const [imagePreview, setImagePreview] = useState<string | null>(null); // To store the image preview URL


  useEffect(() => {
    // If there are errors, focus on the first field that has an error
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0]; // Get the first error key
      setFocus(firstErrorKey); // Automatically focus on the first error field
    }

    
  }, [errors, setFocus]);

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  };

  return (
    <div className="p-5">
      <Form {...form} >
        <form className="space-y-8">
        {/* <FormField
            control={form.control}
            name="userRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Role <span className="text-red-600">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role to user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name <span className="text-red-600">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="South Drugs" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <Input placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description <span className="text-red-600">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <FormField
            control={form.control}
            name="dosageForm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dosage Form <span className="text-red-600">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a dosage form" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="capsule">Capsule</SelectItem>
                    <SelectItem value="syrup">Syrup</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="strength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Strength <span className="text-red-600">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="eg. 500mg, 50mg/5m" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Generic Name<span className="text-red-600">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="eg. Panadol, Calpol" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="genericName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Generic Name<span className="text-red-600">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="eg. Paracetamol, Benzonatate" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="prescriptionRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  {...field}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Does this medicine need prescription by Health Professional?
                </FormLabel>
              </div>
            </FormItem>
          )}
          />

        <FormField
          control={form.control}
          name="medicineImageFile"
          render={({ field: { value, onChange, ...field }}) => (
            <FormItem className="flex flex-col items-start  space-x-3 space-y-0 rounded-md border p-4">
              <FormControl className="">
                   <div className="flex flex-col w-full justify-center items-center">
                     {imagePreview && (
                      <img
                        alt="Medicine preview"
                        className="aspect-square w-full rounded-md object-cover"
                        src={imagePreview} // Display the image preview
                      />)}
                      {/* <div className="grid auto-rows-max items-center gap-4 lg:col-span-2 lg:gap-8">
                          <UploadIcon className="h-4 w-4 text-muted-foreground" />


                      </div> */}

                      <div className="relative flex-1 md:grow-0 my-2">
                        <UploadIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="w-full h-8 rounded-lg bg-background pl-8 md:w-[150px] lg:w-[276px]"
                          placeholder="Upload medicine image..."
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              onChange(file)
                              handleFileChange(event)
                            }
                          }}
                          {...field}
                        />
                      </div>
                    </div>
              </FormControl>
              <FormMessage />
              <div className="space-y-1 leading-none text-muted-foreground pt-2">
                <FormLabel>
                  Dropoff your medicine image here
                </FormLabel>
              </div>
            </FormItem>
          )}
          />
         
        </form>
      </Form>
    </div>
  )
}

export default MedicineForm
