// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/sr-tabs"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Sheet, SheetContent, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { FileIcon, MoreHorizontalIcon, PlusCircleIcon } from "lucide-react"
// import { useForm } from "react-hook-form"
// import { useNavigate } from "react-router-dom"
// import UserForm from "./user-form"

// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import { useAddUser } from "./hooks/useAddUser"
// import useReadUsers from "./hooks/useReadUsers"
// import IUser from "./user.interface"

// import { Badge } from "@/components/ui/badge"

// // Assume these functions make API calls to your backend


// const profileFormSchema = z.object({
//   firstName: z
//     .string()
//     .min(2, {
//       message: "First Name must be at least 2 characters.",
//     })
//     .max(30, {
//       message: "First Name must not be longer than 30 characters.",
//     }),
//   lastName: z
//     .string()
//     .min(2, {
//       message: "Last Name must be at least 2 characters.",
//     })
//     .max(30, {
//       message: "Last Name must not be longer than 30 characters.",
//     }),
//   middleName: z
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
//     required_error: "This field is required.",
//   })
// })


// type ProfileFormValues = z.infer<typeof profileFormSchema>
// const TransactionHistoryList = () => {
//   const navigate = useNavigate();

//   // hooks
//   const { createUser, isAddingUser } = useAddUser()
//   const { data: users, isLoading } = useReadUsers();




//   const form = useForm<ProfileFormValues>({
//     resolver: zodResolver(profileFormSchema),
//     mode: "onTouched", // Ensure errors are caught when the field is touched
//   })

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const onSubmit = (data: any) => {
//     const userData = {
//       ...data,
//       confirmPassword: data.password,
//     }

//     createUser(userData)

//   }

//   return (
//     <Tabs defaultValue="all">
//       <div className="flex items-center">
//         <TabsList>
//           <TabsTrigger value="all">All</TabsTrigger>
//         </TabsList>
//         <div className="ml-auto flex items-center gap-2">
//           <Button className="h-8 gap-1" size="sm" variant="outline">
//             <FileIcon className="h-3.5 w-3.5" />
//             <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
//               Export
//             </span>
//           </Button>
//           <Sheet>
//             <SheetTrigger asChild>
//               <Button
//                 className="h-8 gap-1 bg-[#0B0400]"
//                 size="sm"
//                 variant={"gooeyLeft"}
//               >
//                 <PlusCircleIcon className="h-3.5 w-3.5" />
//                 <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
//                   Add Transaction
//                 </span>
//               </Button>
//             </SheetTrigger>
//             <SheetContent className=" p-0 flex flex-col h-full">
//               <header
//                 className={`py-4 bg-overlay-bg
//               border-b border-overlay-border px-6 bg-overlay-bg border-overlay-border flex-shrink-0`}
//               >
//                 <div>
//                   <h3 className="text-lg font-medium">Create User</h3>
//                   <p className="text-xs text-muted-foreground">
//                     Fill in the details to personalize how others will see you on the platform.
//                   </p>
//                 </div>
//               </header>
//               <div className="flex-grow overflow-y-auto">
//                 <UserForm form={form} />
//               </div>

//               <SheetFooter className="flex-shrink-0 px-6 py-4 bg-overlay-bg border-t border-overlay-border">
//                 <Button disabled={isAddingUser} type="submit" onClick={form.handleSubmit(onSubmit)}>
//                   Create User
//                 </Button>
//               </SheetFooter>
//             </SheetContent>
//           </Sheet>
//         </div>
//       </div>
//       <TabsContent value="all">
//         <Card x-chunk="dashboard-06-chunk-0">
//           <CardHeader>
//             <CardTitle className="text-[#492309]">Transaction History</CardTitle>
//             <CardDescription>
//               View your detailed transaction history in a modern table.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="hidden w-[100px] sm:table-cell">
//                     <span className="sr-only">Image</span>
//                   </TableHead>
//                   <TableHead>Pharmacy</TableHead>
//                   <TableHead>Discount</TableHead>

//                   <TableHead className="hidden md:table-cell">
//                     Price
//                   </TableHead>
//                   <TableHead className="hidden md:table-cell">
//                     Created at
//                   </TableHead>
//                   <TableHead>
//                     <span className="sr-only">Actions</span>
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {
//                   isLoading ? <>
//                     Loading Bitch...
//                   </> :
//                     users?.data.data.map((user: Partial<IUser>) => (
//                       <TableRow>
//                         <TableCell className="hidden sm:table-cell">
//                           <img
//                             alt="Product image"
//                             className="aspect-square rounded-md object-cover"
//                             height="64"
//                             src={user.userImg}
//                             width="64"
//                           />
//                         </TableCell>
//                         <TableCell className="font-medium">
//                           {user.firstName} {" "} {user.lastName}
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant="outline">Active</Badge>
//                         </TableCell>

//                         <TableCell className="hidden md:table-cell">
//                           <Badge variant="default">{user.userRole}</Badge>
//                         </TableCell>
//                         <TableCell className="hidden md:table-cell">
//                           2023-07-12 10:42 AM
//                         </TableCell>
//                         <TableCell>
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button
//                                 aria-haspopup="true"
//                                 size="icon"
//                                 variant="ghost"
//                               >
//                                 <MoreHorizontalIcon className="h-4 w-4" />
//                                 <span className="sr-only">Toggle menu</span>
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                               <DropdownMenuItem onClick={() => navigate(`update_form/${user.id}`)}>Edit</DropdownMenuItem>
//                               <DropdownMenuItem>Delete</DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                 };

//               </TableBody>
//             </Table>
//           </CardContent>
//           <CardFooter>
//             <div className="text-xs text-muted-foreground">
//               Showing
//               <strong>1-10</strong> of <strong>32</strong>
//               Users
//             </div>
//           </CardFooter>
//         </Card>
//       </TabsContent>
//     </Tabs>
//   )
// }

// export default TransactionHistoryList

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontalIcon, SearchIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTransactions } from "./hooks/userTransactions"

import { Spinner } from "@/components/spinner"
import { Input } from "@/components/ui/input"
import { useMemo } from "react"
import ISeniorCitizen from "../profiles/senior.user.interface"
import TransactionContentForm from "./transaction-form"

const TransactionHistoryList = () => {
  const navigate = useNavigate();
  const { data: transactions, isLoading, error } = useTransactions();

   const memoSeniorCitizens = useMemo(() => {
      return transactions?.data?.transactions || [];
    }, [transactions]);
  
    const pagination = useMemo(() => ({
      currentPage: transactions?.data?.currentPage?.page || 1,
      totalPages: transactions?.data?.totalPages || 1,
      totalDocs: transactions?.data?.totalDocs || 0,
      limit: transactions?.data?.currentPage?.limit || 20
    }), [transactions]);
  
    const renderTableContent = () => {
      if (isLoading) {
        return (
          <TableRow>
            <TableCell colSpan={6} className="h-[400px] text-center">
              <Spinner className="mx-auto" />
              <span className="sr-only">Loading senior citizens...</span>
            </TableCell>
          </TableRow>
        );
      }
  
      if (error) {
        return (
          <TableRow>
            <TableCell colSpan={6} className="h-[400px] text-center text-red-500">
              Error loading senior citizens. Please try again later.
            </TableCell>
          </TableRow>
        );
      }
  
      if (!memoSeniorCitizens || memoSeniorCitizens.length === 0) {
        return (
          <TableRow>
            <TableCell colSpan={6} className="h-[400px] text-center">
              No senior citizens found.
            </TableCell>
          </TableRow>
        );
      }
  
      return memoSeniorCitizens.map((seniorCitizen: ISeniorCitizen) => (
        <TableRow key={seniorCitizen.id}>
          <TableCell className="hidden sm:table-cell">
            <img
              alt={`${seniorCitizen.firstName}'s avatar`}
              className="aspect-square rounded-md object-cover"
              height="64"
              src={seniorCitizen.profileImg as string}
              width="64"
            />
          </TableCell>
          <TableCell className="font-light">
            <span className="text-md font-bold">{seniorCitizen.firstName} {seniorCitizen.lastName}</span> <br />
            <span className="text-xs">{seniorCitizen.age} years old</span>
          </TableCell>
          <TableCell>
            {/* <HealthStatusBadge status={seniorCitizen.healthStatus} /> */}
          </TableCell>
          <TableCell className="hidden md:table-cell">
            {seniorCitizen.emergencyContact}
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={`Actions for ${seniorCitizen.firstName} ${seniorCitizen.lastName}`}
                  size="icon"
                  variant="ghost"
                >
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate(`update_form/${seniorCitizen.id}`)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`medical_history/${seniorCitizen.id}`)}>View Medical History</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ));
    };

  return (
    <>
    <div className="flex items-center p-4">
      <div className="ml-auto flex items-center gap-2">
        <div className="relative ml-auto flex-1 md:grow-0">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="w-full h-8 rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            placeholder="Search senior citizen..."
            type="search"
          />
        </div>
        <TransactionContentForm />
      </div>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="text-[#492309]">Transaction</CardTitle>
        <CardDescription>
          Manage transactions for senior citizen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Health Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Emergency Contact
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Showing <strong>{(pagination.currentPage - 1) * pagination.limit + 1}-{Math.min(pagination.currentPage * pagination.limit, pagination.totalDocs)}</strong> of <strong>{pagination.totalDocs}</strong> Senior Citizens
        </div>
      </CardFooter>
    </Card>
  </>
  )
}

export default TransactionHistoryList;

