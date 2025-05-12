import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/sr-tabs";
import { Link, Outlet, useLocation } from "react-router-dom";
import PharmacyList from "./pharmacy-list";

const PharmacyPage = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").pop(); // Get current tab based on the route

  return (
    <Tabs defaultValue="pharmacy-list">
      <div className="flex items-center">
        <TabsList>
          <Link to={'pharmacy-list'}>
            <TabsTrigger value="pharmacy-list">All</TabsTrigger>
          </Link>
            
          <Link to={"archives"}>
            <TabsTrigger value="archives">Archive</TabsTrigger>
          </Link>
        </TabsList>
      </div>

      <TabsContent value={currentTab as string === "pharmacy" ? "pharmacy-list" : currentTab as string}>
        {currentTab === 'pharmacy' ? <PharmacyList /> : <Outlet />}
      </TabsContent>
    </Tabs>
  )
}

export default PharmacyPage
