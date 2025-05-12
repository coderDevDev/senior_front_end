import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/sr-tabs";
import { Link, Outlet, useLocation } from "react-router-dom";

const SettingsPage = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").pop(); // Get current tab based on the route

  return (
    <Tabs defaultValue="brand-name">
      <div className="flex items-center">
        <TabsList>
          <Link to={'brand-name'}>
            <TabsTrigger value="brand-name">Brand Name</TabsTrigger>
          </Link>
          
          <Link to={"generic-name"}>
            <TabsTrigger value="generic-name">Generic Name</TabsTrigger>
          </Link>
        </TabsList>
      </div>

      <TabsContent value={currentTab as string === "settings" ? "brand-name" : currentTab as string}>
        <Outlet />
      </TabsContent>
  </Tabs>
  )
}

export default SettingsPage
