import { Layout, LayoutBody, LayoutHeader } from '@/components/layouts';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserHeader } from '@/components/user-header';
import { ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import useCurrentUser from '../authentication/hooks/useCurrentUser';

const LayoutPage = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const { userid } = useParams();
  const { user } = useCurrentUser();
  const identifierCrumb = (): string => {
    const lastRoute = pathname.split('/');
    const name = lastRoute[lastRoute.length - 1];

    let finalName = '';

    if (name === 'users') {
      finalName = 'All Users';
    } else if (name === 'add_form') {
      finalName = 'Create User';
    } else if (userid !== undefined) {
      finalName = 'Modify User';
    } else if (name === 'museums') {
      finalName = 'All Museums';
    } else if (name === 'add_museum') {
      finalName = 'Create Museum';
    } else if (name === 'pharmacy') {
      finalName = 'All Pharmacy';
    } else if (name === 'brand-name') {
      finalName = 'All Brands';
    } else if (name === 'settings') {
      finalName = 'All Brands';
    } else if (name === 'generic-name') {
      finalName = 'All Generics';
    } else if (name === 'overview' || name === 'detailed') {
      finalName = 'Insights, Metrics, and Summary';
    } else if (name === 'medicines') {
      finalName = 'All Medicines';
    } else if (name === 'senior-app') {
      finalName = 'Senior App';
    }

    return finalName;
  };

  const secondaryCrumb = (): string => {
    const lastRoute = pathname.split('/');
    const name = lastRoute[2];

    let finalName = '';

    if (name === 'users') {
      finalName = 'Users';
    } else if (name === 'museums') {
      finalName = 'Museums';
    } else if (name === 'pharmacy') {
      finalName = 'Pharmacy';
    } else if (name === 'settings') {
      finalName = 'Settings';
    } else if (name === 'overview') {
      finalName = 'Overview';
    } else if (name === 'detailed') {
      finalName = 'Detailed';
    } else if (name === 'medicines') {
      finalName = 'Medicine';
    }

    return finalName;
  };

  return (
    <Layout>
      <LayoutHeader>
        <SidebarTrigger className="-ml-1" />
        <UserHeader
          headerName={
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      to={'/dashboard-app'}
                      className="font-light text-[#927B6B]">
                      Dashboard
                    </Link>
                    {/* <Link href="#">Dashboard</Link> */}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      to={'../users'}
                      className="font-light  text-[#927B6B]">
                      {secondaryCrumb()}
                    </Link>
                    {/* <Link href="#">Users</Link> */}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {identifierCrumb().length < 2 ? (
                  `Welcome ${(user?.user_metadata as any)?.firstName || 'User'}`
                ) : (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-[#492309]">
                        {identifierCrumb()}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          }
        />
      </LayoutHeader>
      <LayoutBody>{children}</LayoutBody>
    </Layout>
  );
};

export default LayoutPage;
