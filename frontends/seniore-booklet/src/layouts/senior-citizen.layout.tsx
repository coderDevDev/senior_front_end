import LayoutPage from "@/modules/senior-citizens/layout.page";
import { Outlet } from "react-router-dom";

const SeniorCitizenLayout = () => {
  
  return (
    <div className="relative h-full">
          <LayoutPage>
              <Outlet />
          </LayoutPage>
    </div>
  )
}

export default SeniorCitizenLayout
