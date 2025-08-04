import { Layout, LayoutBody, LayoutHeader } from '@/components/layouts';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
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
    } else if (name === 'overview') {
      finalName = 'Insights, Metrics, and Summary';
    } else if (name === 'medicines') {
      finalName = 'All Medicines';
    } else if (name === 'transaction-history') {
      finalName = 'View usage, transaction history, and details.';
    } else if (name === 'my-profile') {
      finalName = 'See your details, and able to edit your information.';
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
    } else if (name === 'medicines') {
      finalName = 'Medicine';
    } else if (name === 'transaction-history') {
      finalName = 'Transaction';
    } else if (name === 'my-profile') {
      finalName = 'My Profile';
    }

    return finalName;
  };

  return (
    <Layout>
      <LayoutHeader>
        <UserHeader
          headerName={
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      to={'/senior-app'}
                      className="font-light text-[#927B6B]">
                      {pathname === '/senior-app' ? 'Senior App' : 'Dashboard'}
                    </Link>
                    {/* <Link href="#">Dashboard</Link> */}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathname !== '/senior-app' ? (
                  <>
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
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-[#492309]">
                        {identifierCrumb()}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {(user?.user_metadata as any)?.firstName ||
                        'Senior Citizen'}
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          }
        />
      </LayoutHeader>
      <LayoutBody className="pb-16 md:pb-0">
        {' '}
        {/* Add padding bottom for mobile */}
        {children}
      </LayoutBody>
    </Layout>
  );
};

export default LayoutPage;
