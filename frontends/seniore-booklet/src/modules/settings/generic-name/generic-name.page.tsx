import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTrigger
} from '@/components/ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileIcon, PlusCircleIcon, SearchIcon } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import GenericForm from './generic-form';
import GenericLists from './generic-list';

const genericSchema = z.object({
  brandName: z
    .string({
      message: 'Generic Name is required'
    })
    .min(3, 'Generic Name must be atleast 3 characters')
    .trim()
});

type GenericValues = z.infer<typeof genericSchema>;

const GenericNamePage = () => {
  const form = useForm<GenericValues>({
    resolver: zodResolver(genericSchema)
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit: SubmitHandler<GenericValues | any> = (
    data: GenericValues
  ) => {
    console.log(data);
  };

  return (
    <>
      <div className="flex flex-row-reverse items-center justify-between gap-2 pt-4">
        <div className="space-x-4">
          <Button className="h-8 gap-1" size="sm" variant="outline">
            <FileIcon className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="h-8 gap-1 bg-[#0B0400]"
                size="sm"
                variant={'default'}>
                <PlusCircleIcon className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Generic
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent className=" p-0 flex flex-col h-full">
              <header
                className={`py-4 bg-overlay-bg
                border-b border-overlay-border px-6 bg-overlay-bg border-b border-overlay-border flex-shrink-0`}>
                <div>
                  <h3 className="text-lg font-medium">Create Generic</h3>
                  <p className="text-xs text-muted-foreground">
                    Fill in the details to let the customers remind the brand.
                  </p>
                </div>
              </header>
              <div className="flex-grow overflow-y-auto">
                <GenericForm form={form} />
              </div>

              <SheetFooter className="flex-shrink-0 px-6 py-4 bg-overlay-bg border-t border-overlay-border">
                <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                  {/* */}
                  Create Generic
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="w-full h-8 rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            placeholder="Search generic..."
            type="search"
          />
        </div>
      </div>

      <main className="mt-4">
        <GenericLists />
      </main>
    </>
  );
};

export default GenericNamePage;
