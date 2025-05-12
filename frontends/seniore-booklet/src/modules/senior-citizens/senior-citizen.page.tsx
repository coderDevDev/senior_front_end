import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/sr-tabs";
import { Link, Outlet, useLocation } from "react-router-dom";
import SeniorCitizenList from "./senior-citizen-list";

const SeniorCitizenPageList = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").pop(); // Get current tab based on the route

  return (
    <Tabs defaultValue="senior-citizens-list">
      <div className="flex items-center">
        <TabsList>
          <Link to={'senior-citizens-list'}>
            <TabsTrigger value="senior-citizens-list">All</TabsTrigger>
          </Link>

          <Link to={"archived-senior-citizens"}>
            <TabsTrigger value="archived-senior-citizens">Archive</TabsTrigger>
          </Link>
        </TabsList>
      </div>

      <TabsContent value={currentTab as string === "senior-citizen" ? "senior-citizens-list" : currentTab as string}>
        {currentTab === 'senior-citizens' ? <SeniorCitizenList /> : <Outlet />}
      </TabsContent>
    </Tabs>
  )
}

export default SeniorCitizenPageList
