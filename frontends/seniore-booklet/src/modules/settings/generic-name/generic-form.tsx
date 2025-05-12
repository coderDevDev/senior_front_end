import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GenericForm = ({form}: any) => {

  const { setFocus,  formState } = form;
  const { errors } = formState;

  console.log(errors)

  useEffect(() => {
    // If there are errors, focus on the first field that has an error
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0]; // Get the first error key
      setFocus(firstErrorKey); // Automatically focus on the first error field
    }

    
  }, [errors, setFocus]);


  return (
    <div className="p-5">
      <Form {...form} >
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="genericName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name <span className="text-red-600">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ex. Paracetamol, Mefenamic" {...field} />
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

export default GenericForm
