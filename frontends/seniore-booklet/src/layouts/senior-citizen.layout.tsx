import LayoutPage from '@/modules/senior-citizens/layout.page';
import { Outlet } from 'react-router-dom';
import { TabProvider } from '@/context/tab-context';

const SeniorCitizenLayout = () => {
  return (
    <TabProvider>
      <div className="relative h-full">
        <LayoutPage>
          <Outlet />
        </LayoutPage>
      </div>
    </TabProvider>
  );
};

export default SeniorCitizenLayout;
