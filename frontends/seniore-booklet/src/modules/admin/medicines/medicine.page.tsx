import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/sr-tabs";
import { Link, Outlet, useLocation } from "react-router-dom";
import MedicineList from "./medicine-list";

const MedicinePage = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").pop(); // Get current tab based on the route

  return (
    <Tabs defaultValue="medicines-list">
      <div className="flex items-center">
        <TabsList>
          <Link to={'medicines-list'}>
            <TabsTrigger value="medicines-list">All</TabsTrigger>
          </Link>
            
          <Link to={"archives"}>
            <TabsTrigger value="archives">Archive</TabsTrigger>
          </Link>
        </TabsList>
      </div>

      <TabsContent value={currentTab as string === "medicines" ? "medicines-list" : currentTab as string}>
        {currentTab === 'medicines' ? <MedicineList /> : <Outlet />}
      </TabsContent>
    </Tabs>
  )
}

export default MedicinePage
