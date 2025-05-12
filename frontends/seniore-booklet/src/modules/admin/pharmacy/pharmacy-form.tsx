/* eslint-disable @typescript-eslint/no-unused-vars */
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { UploadIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PharmacyForm = ({ form, isEditingMode }: any) => {
  
  const { setValue} = form;

  console.log(isEditingMode)
  const [imagePreview, setImagePreview] = useState<string | null>(null); // To store the image preview URL

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const img = reader.result as string
        setImagePreview(img)
        form.setValue("phamarcyImg", img)
      }
      
      // Call readAsDataURL only once
      reader.readAsDataURL(file)
    }
  }
  useEffect(() => {
    //  // If there are errors, focus on the first field that has an error
    //  if (Object.keys(errors).length > 0) {
    //   const firstErrorKey = Object.keys(errors)[0]; // Get the first error key
    //   setFocus(firstErrorKey); // Automatically focus on the first error field
    // }

    // Set image preview if phamarcyImgAttachment exists in form data
    const phamarcyImg = form.getValues("phamarcyImg")

    console.log(phamarcyImg)
    if (phamarcyImg && typeof phamarcyImg === "string") {
      setImagePreview(phamarcyImg)
    }

  }, [form, setValue])

  // Handle file change


  return (
    <div className="p-5">
      <Form {...form} >
        <form className="space-y-8">
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
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+6399 7728 909" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address <span className="text-red-600">*</span></FormLabel>
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-red-600">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="operatingHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operating Hours <span className="text-red-600">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ex. Mon-Fri: 9am-9pm, Sat-Sun: 10am-6pm" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="is24Hours"
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
                  Does your pharmacy open for 24 hours?
                </FormLabel>
              </div>
            </FormItem>
          )}
          />

<FormField
                        control={form.control}
                        name="phamarcyImg"
                        render={({ field: { value, onChange, ...field }}) => (
                          <FormItem className="flex flex-col items-start  space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl className="">
                                <div className="flex flex-col w-full justify-center items-center">
                                  {imagePreview && (
                                    <img
                                      alt="Pharmacy preview"
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
                                        placeholder="Upload pharmacy image..."
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
                          </FormItem>
                        )}
                        />
         
        </form>
      </Form>
    </div>
  )
}

export default PharmacyForm
