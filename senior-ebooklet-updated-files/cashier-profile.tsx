import { ChevronDown, Clock, LogOut, ShoppingBag, User } from 'lucide-react';
import IUser from '../admin/users/user.interface';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';
import { format } from 'date-fns';

interface Order {
  id: string;
  senior_id: string;
  total_amount: number;
  discounted_amount: number;
  status: string;
  created_at: string;
  cashier_id: string;
  senior_citizens: {
    firstName: string;
    lastName: string;
  };
  order_items: {
    id: string;
    medicine_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    medicine: {
      name: string;
      genericName: string;
      brandName: string;
    };
  }[];
}

interface userProfileProps {
  user: Partial<IUser>;
  showNavMenu: boolean;
  setShowNavMenu: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const CashierProfile: React.FC<userProfileProps> = ({
  user,
  showNavMenu,
  setShowNavMenu,
  setActiveTab
}) => {
  const navigate = useNavigate();

  // Fetch orders with related data
  const { data: orders } = useQuery({
    queryKey: ['orders', user?.id],
    enabled: !!user?.id, // Only run query if we have a user ID
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          senior_citizens!senior_id (
            firstName,
            lastName
          ),
          order_items!order_id (
            *,
            medicine!medicine_id (
              name,
              genericName,
              brandName
            )
          )
        `
        )
        .eq('cashier_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    }
  });

  const handleLogout = () => {
    // Clear any stored tokens/session
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');

    // Show success message
    toast.success('Logged out successfully');

    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNavMenu(!showNavMenu)}
        className="flex items-center text-sm text-gray-600 bg-blue-50 hover:bg-blue-100 py-1 px-3 rounded-full transition-colors">
        <span className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">
            {user?.firstName || 'Cashier'}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 ml-1" />
      </button>

      {showNavMenu && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-100"
        style={{ minWidth: 240 }}>
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center">
              <div className="mr-3 relative">
                <img
                  src={
                    typeof user.userImg === 'string'
                      ? user.userImg
                      : '/default-avatar.png'
                  }
                  alt={user?.firstName || 'Cashier'}
                  className="w-10 h-10 rounded-full"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {user?.firstName || 'Cashier'}
                </div>
                <div className="text-xs text-gray-500">{user.userRole}</div>
                <div className="text-xs text-gray-500">ID: {user.id}</div>
              </div>
            </div>
          </div>

          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Recent Transactions
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orders?.slice(0, 5).map(order => (
                <div
                  key={order.id}
                  className="bg-gray-50 p-2 rounded-md text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {order.senior_citizens?.firstName}{' '}
                        {order.senior_citizens?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(
                          new Date(order.created_at),
                          'MMM d, yyyy h:mm a'
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₱{order.total_amount}</p>
                      <p className="text-xs text-green-600">
                        Saved: ₱
                        {(order.total_amount - order.discounted_amount).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {order.order_items.map(item => (
                      <p key={item.id}>
                        {item.quantity}x {item.medicine.name}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => {
              setActiveTab('order');
              setShowNavMenu(false);
            }}>
            <ShoppingBag className="w-4 h-4 mr-3 text-gray-400" />
            New Order
          </button>

          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => {
              setActiveTab('history');
              setShowNavMenu(false);
            }}>
            <Clock className="w-4 h-4 mr-3 text-gray-400" />
            Order History
          </button>

          <div className="border-t border-gray-100 my-1"></div>

          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
            onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3 text-gray-400" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};
