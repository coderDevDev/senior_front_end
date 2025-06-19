import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Eye, AlertCircle, Package, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface OrderItem {
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
}

interface Order {
  id: string;
  senior_id: string;
  total_amount: number;
  discounted_amount: number;
  status: string;
  created_at: string;
  cashier_id: string;
  note?: string;
  senior_citizens: {
    firstName: string;
    lastName: string;
  };
  cashier: {
    firstName: string;
    lastName: string;
  };
  order_items: OrderItem[];
}

// Add variant type for Badge
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
type FilterType = 'all' | 'medicine' | 'senior';

export const OrderHistoryTable: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const {
    data: orders,
    isLoading,
    error
  } = useQuery({
    queryKey: ['orders-history'],
    queryFn: async () => {
      try {
        // Get orders with senior info and order items in a single query
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(
            `
            *,
            senior_citizens!senior_id (
              firstName,
              lastName
            ),
            order_items (
              id,
              medicine_id,
              quantity,
              unit_price,
              total_price,
              medicine!medicine_id (
                name,
                genericName,
                brandName
              )
            )
          `
          )
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        if (!ordersData) return [];

        // Get all unique cashier IDs
        const cashierIds = [
          ...new Set(ordersData.map(order => order.cashier_id))
        ];

        // Fetch all cashiers in a single query
        const { data: cashiersData, error: cashiersError } = await supabase
          .from('sb_users')
          .select('user_uid, firstName, lastName')
          .in('user_uid', cashierIds);

        if (cashiersError) {
          console.error('Error fetching cashiers:', cashiersError);
        }

        // Create a map for quick cashier lookup
        const cashiersMap = new Map(
          (cashiersData || []).map(cashier => [cashier.user_uid, cashier])
        );

        // Process orders with cashier info
        const ordersWithDetails = ordersData.map(order => ({
          ...order,
          order_items: order.order_items || [],
          cashier: cashiersMap.get(order.cashier_id) || {
            firstName: 'Unknown',
            lastName: 'Cashier'
          }
        }));

        return ordersWithDetails as Order[];
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Filter orders based on search term and filter type
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (!searchTerm.trim()) return orders;

    const searchLower = searchTerm.toLowerCase().trim();

    return orders.filter(order => {
      switch (filterType) {
        case 'medicine': {
          // Check if any medicine in the order matches the search term
          return order.order_items.some(
            item =>
              item.medicine?.name?.toLowerCase().includes(searchLower) ||
              item.medicine?.genericName?.toLowerCase().includes(searchLower) ||
              item.medicine?.brandName?.toLowerCase().includes(searchLower)
          );
        }

        case 'senior': {
          // Check if senior citizen name matches the search term
          const seniorName = `${order.senior_citizens?.firstName || ''} ${
            order.senior_citizens?.lastName || ''
          }`.toLowerCase();
          return seniorName.includes(searchLower);
        }

        case 'all':
        default: {
          // Check both medicine and senior citizen
          const seniorName = `${order.senior_citizens?.firstName || ''} ${
            order.senior_citizens?.lastName || ''
          }`.toLowerCase();
          const hasMatchingSenior = seniorName.includes(searchLower);
          const hasMatchingMedicine = order.order_items.some(
            item =>
              item.medicine?.name?.toLowerCase().includes(searchLower) ||
              item.medicine?.genericName?.toLowerCase().includes(searchLower) ||
              item.medicine?.brandName?.toLowerCase().includes(searchLower)
          );
          return hasMatchingSenior || hasMatchingMedicine;
        }
      }
    });
  }, [orders, searchTerm, filterType]);

  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₱${amount.toFixed(2)}`;
  };

  const formatOrderId = (id: string): string => {
    return id.slice(0, 8).toUpperCase();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilterType('all');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Orders
        </h3>
        <p className="text-gray-600 mb-4">
          There was a problem loading the order history. Please try again.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Package className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Orders Found
        </h3>
        <p className="text-gray-600">There are no orders in the history yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Order History</h2>
        <p className="text-sm text-gray-600">
          {filteredOrders.length} of {orders.length} order
          {filteredOrders.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search by ${
              filterType === 'all'
                ? 'medicine or senior citizen'
                : filterType === 'medicine'
                ? 'medicine name'
                : 'senior citizen name'
            }...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Select
            value={filterType}
            onValueChange={(value: FilterType) => setFilterType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="medicine">By Medicine</SelectItem>
              <SelectItem value="senior">By Senior Citizen</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || filterType !== 'all') && (
            <Button
              variant="outline"
              onClick={clearSearch}
              className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* No results state */}
      {filteredOrders.length === 0 && (searchTerm || filterType !== 'all') && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Orders Found
          </h3>
          <p className="text-gray-600 mb-4">
            No orders match your search criteria.
          </p>
          <Button variant="outline" onClick={clearSearch}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Orders Table */}
      {filteredOrders.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Senior Citizen</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order.id} className="group hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatOrderId(order.id)}
                  </TableCell>
                  <TableCell>
                    {order.senior_citizens?.firstName &&
                    order.senior_citizens?.lastName
                      ? `${order.senior_citizens.firstName} ${order.senior_citizens.lastName}`
                      : 'Unknown Senior'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.order_items?.length > 0 ? (
                        order.order_items.map(item => (
                          <div key={item.id} className="text-sm">
                            {item.quantity}x{' '}
                            {item.medicine?.name || 'Unknown Medicine'}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No items</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(order.total_amount)}
                  </TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {formatCurrency(
                      order.total_amount - order.discounted_amount
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.cashier?.firstName && order.cashier?.lastName
                      ? `${order.cashier.firstName} ${order.cashier.lastName}`
                      : 'Unknown Cashier'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View order details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Order ID:</span>{' '}
                      <span className="font-mono">{selectedOrder.id}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Date:</span>{' '}
                      {format(
                        new Date(selectedOrder.created_at),
                        'MMM d, yyyy h:mm a'
                      )}
                    </p>
                    <p>
                      <span className="text-gray-500">Status:</span>{' '}
                      <Badge variant={getStatusVariant(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Senior Citizen</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      {selectedOrder.senior_citizens?.firstName &&
                      selectedOrder.senior_citizens?.lastName
                        ? `${selectedOrder.senior_citizens.firstName} ${selectedOrder.senior_citizens.lastName}`
                        : 'Unknown Senior'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Items Purchased</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items?.length > 0 ? (
                        <>
                          {selectedOrder.order_items.map(item => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {item.medicine?.name || 'Unknown Medicine'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {item.medicine?.genericName ||
                                      'No generic name'}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>
                                {formatCurrency(item.unit_price)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(item.total_price)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-right font-medium">
                              Subtotal
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(selectedOrder.total_amount)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-right font-medium">
                              Discount
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              {formatCurrency(
                                selectedOrder.total_amount -
                                  selectedOrder.discounted_amount
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-right font-bold">
                              Total
                            </TableCell>
                            <TableCell className="font-bold">
                              {formatCurrency(selectedOrder.discounted_amount)}
                            </TableCell>
                          </TableRow>
                        </>
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-gray-500">
                            No items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Notes if any */}
              {selectedOrder.note && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedOrder.note}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
