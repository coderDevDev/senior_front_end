import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link } from "react-router-dom"



// Assume these functions make API calls to your backend
 

// const profileFormSchema = z.object({
//   firstName: z
//     .string()
//     .min(2, {
//       message: "First Name must be at least 2 characters.",
//     })
//     .max(30, {
//       message: "First Name must not be longer than 30 characters.",
//     }),
//     lastName: z
//     .string()
//     .min(2, {
//       message: "Last Name must be at least 2 characters.",
//     })
//     .max(30, {
//       message: "Last Name must not be longer than 30 characters.",
//     }),
//     middleName: z
//     .string()
//     .optional(),
    
//   email: z
//     .string({
//       required_error: "Please select an email to display.",
//     })
//     .email(),
//   password: z
//     .string({
//       required_error: "This field is required.",
//     })
//     .min(2, {
//       message: "Password must be at least 2 characters.",
//     })
//     .max(30, {
//       message: "Password must not be longer than 30 characters.",
//     }),
//   userRole: z.string({
//       required_error: "This field is required.",
//     })
// })







// type ProfileFormValues = z.infer<typeof profileFormSchema>
const ProfileInformation = () => {
  // const navigate = useNavigate();
  
  // // hooks
  // const  { createUser, isAddingUser } = useAddUser()
  // const { data: users , isLoading } = useReadUsers();




  // const form = useForm<ProfileFormValues>({
  //   resolver: zodResolver(profileFormSchema),
  //   mode: "onTouched", // Ensure errors are caught when the field is touched
  // })

  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const onSubmit = (data: any) => {
  //   const userData = {
  //     ...data,
  //     confirmPassword: data.password,
  //   }

  //   createUser(userData)

  // }
  
  return (
  //   <Tabs defaultValue="all">
  //   <div className="flex items-center">
  //     <TabsList>
  //       <TabsTrigger value="all">All</TabsTrigger>
  //     </TabsList>
  //     <div className="ml-auto flex items-center gap-2">
  //       <Button className="h-8 gap-1" size="sm" variant="outline">
  //         <FileIcon className="h-3.5 w-3.5" />
  //         <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
  //           Export
  //         </span>
  //       </Button>
  //       <Sheet>
  //         <SheetTrigger asChild>
  //           <Button
  //           className="h-8 gap-1 bg-[#0B0400]"
  //           size="sm"
  //           variant={"gooeyLeft"}
  //           >
  //             <PlusCircleIcon className="h-3.5 w-3.5" />
  //             <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
  //               Add Transaction
  //             </span>
  //           </Button>
  //         </SheetTrigger>
  //         <SheetContent className=" p-0 flex flex-col h-full">
  //             <header
  //               className={`py-4 bg-overlay-bg
  //             border-b border-overlay-border px-6 bg-overlay-bg border-b border-overlay-border flex-shrink-0`}
  //             >
  //               <div>
  //                 <h3 className="text-lg font-medium">Create User</h3>
  //                 <p className="text-xs text-muted-foreground">
  //                   Fill in the details to personalize how others will see you on the platform.
  //                 </p>
  //               </div>
  //             </header>
  //             <div className="flex-grow overflow-y-auto">
  //               <UserForm form={form} />
  //             </div>

  //           <SheetFooter className="flex-shrink-0 px-6 py-4 bg-overlay-bg border-t border-overlay-border">
  //             <Button disabled={isAddingUser} type="submit" onClick={form.handleSubmit(onSubmit)}>
  //               Create User
  //             </Button>
  //           </SheetFooter>
  //         </SheetContent>
  //       </Sheet>
  //     </div>
  //   </div>
  //   <TabsContent value="all">
  //     <Card x-chunk="dashboard-06-chunk-0">
  //       <CardHeader>
  //         <CardTitle className="text-[#492309]">Transaction History</CardTitle>
  //         <CardDescription>
  //           View your detailed transaction history in a modern table.
  //         </CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         <Table>
  //           <TableHeader>
  //             <TableRow>
  //               <TableHead className="hidden w-[100px] sm:table-cell">
  //                 <span className="sr-only">Image</span>
  //               </TableHead>
  //               <TableHead>Pharmacy</TableHead>
  //               <TableHead>Discount</TableHead>

  //               <TableHead className="hidden md:table-cell">
  //                 Price
  //               </TableHead>
  //               <TableHead className="hidden md:table-cell">
  //                 Created at
  //               </TableHead>
  //               <TableHead>
  //                 <span className="sr-only">Actions</span>
  //               </TableHead>
  //             </TableRow>
  //           </TableHeader>
  //           <TableBody>
  //             {
  //               isLoading ? <>
  //               Loading Bitch...
  //               </> : 
  //                users?.data.data.map((user: Partial<IUser>) => (
  //                 <TableRow>
  //                   <TableCell className="hidden sm:table-cell">
  //                     <img
  //                       alt="Product image"
  //                       className="aspect-square rounded-md object-cover"
  //                       height="64"
  //                       src={user.userImg}
  //                       width="64"
  //                     />
  //                   </TableCell>
  //                   <TableCell className="font-medium">
  //                     {user.firstName} {" "} {user.lastName}
  //                   </TableCell>
  //                   <TableCell>
  //                     <Badge variant="outline">Active</Badge>
  //                   </TableCell>
    
  //                   <TableCell className="hidden md:table-cell">
  //                     <Badge variant="default">{user.userRole}</Badge>
  //                   </TableCell>
  //                   <TableCell className="hidden md:table-cell">
  //                     2023-07-12 10:42 AM
  //                   </TableCell>
  //                   <TableCell>
  //                     <DropdownMenu>
  //                       <DropdownMenuTrigger asChild>
  //                         <Button
  //                           aria-haspopup="true"
  //                           size="icon"
  //                           variant="ghost"
  //                         >
  //                           <MoreHorizontalIcon className="h-4 w-4" />
  //                           <span className="sr-only">Toggle menu</span>
  //                         </Button>
  //                       </DropdownMenuTrigger>
  //                       <DropdownMenuContent align="end">
  //                         <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //                         <DropdownMenuItem onClick={() => navigate(`update_form/${user.id}`)}>Edit</DropdownMenuItem>
  //                         <DropdownMenuItem>Delete</DropdownMenuItem>
  //                       </DropdownMenuContent>
  //                     </DropdownMenu>
  //                   </TableCell>
  //                 </TableRow>
  //                 ))
  //             }
             
  //           </TableBody>
  //         </Table>
  //       </CardContent>
  //       <CardFooter>
  //         <div className="text-xs text-muted-foreground">
  //           Showing
  //           <strong>1-10</strong> of <strong>32</strong>
  //           Users
  //         </div>
  //       </CardFooter>
  //     </Card>
  //   </TabsContent>
  // </Tabs>

  <div className="min-h-screen bg-gray-50">
  <div className="mx-auto max-w-7xl p-6">
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <Card className="h-fit p-4">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full">
            <img
              src="/placeholder.svg"
              alt="Profile picture"
              className="h-full w-full object-cover"
              width={96}
              height={96}
            />
          </div>
          <div className="font-medium">John Doe</div>
        </div>
        <nav className="flex flex-col space-y-1">
          <Button
            variant="ghost"
            className="justify-start"
            asChild
          >
            <Link to="#profile">Profile</Link>
          </Button>
          <Button
            variant="ghost"
            className="justify-start font-medium text-primary"
            asChild
          >
            <Link to="#personal">PERSONAL INFORMATION</Link>
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            asChild
          >
            <Link to="#medical">MEDICAL INFORMATION</Link>
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            asChild
          >
            <Link to="#transaction">TRANSACTION</Link>
          </Button>
          <Button
            variant="ghost"
            className="justify-start bg-gray-900 text-white"
            asChild
          >
            <Link to="#others">OTHERS</Link>
          </Button>
        </nav>
      </Card>
      <Card className="p-6">
        <h2 className="mb-6 text-lg font-semibold">PERSONAL INFORMATION</h2>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <div className="font-medium">Name</div>
            <div>John Doe</div>
          </div>
          <div className="grid gap-2">
            <div className="font-medium">Birthday</div>
            <div>February 9, 1995</div>
          </div>
          <div className="grid gap-2">
            <div className="font-medium">Address</div>
            <div>Block, Ontario</div>
          </div>
          <div className="grid gap-2">
            <div className="font-medium">Email</div>
            <div>johndoe@gmail.com</div>
          </div>
          <div className="grid gap-2">
            <div className="font-medium">Phone</div>
            <div>+1 (555) 555-0123</div>
          </div>
          <div className="grid gap-2">
            <div className="font-medium">Status</div>
            <div>Married</div>
          </div>
          <div className="grid gap-2">
            <div className="font-medium">Phone</div>
            <div>+1 (555) 555-0123</div>
          </div>
          <div className="grid gap-2">
            <div className="font-medium">Home telephone</div>
            <div>+1 (555) 555-0123</div>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((page) => (
            <div
              key={page}
              className={`h-2 w-2 rounded-full ${
                page === 1 ? "bg-primary" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  </div>
</div>
  )
}

export default ProfileInformation
