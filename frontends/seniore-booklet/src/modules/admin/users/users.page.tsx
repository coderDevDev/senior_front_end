import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/sr-tabs";
import { Link, Outlet, useLocation } from "react-router-dom";
import UsersList from "./user-list";

const UserPage = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").pop(); // Get current tab based on the route

  return (
    <Tabs defaultValue="users-list">
      <div className="flex items-center">
        <TabsList>
          <Link to={'users-list'}>
            <TabsTrigger value="users-list">User Page List</TabsTrigger>
          </Link>
            
        </TabsList>
      </div>

      <TabsContent value={currentTab as string === "users" ? "users-list" : currentTab as string}>
        {currentTab === 'users' ? <UsersList /> : <Outlet />}
      </TabsContent>
    </Tabs>
  )
}

export default UserPage
