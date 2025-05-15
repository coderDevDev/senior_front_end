import React, { useState } from 'react';
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
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export const OrderHistoryTable: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders-history'],
    queryFn: async () => {
      // Get orders with senior info
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(
          `
          *,
          senior_citizens!senior_id (
            firstName,
            lastName
          )
        `
        )
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Process each order to get related data
      const ordersWithDetails = await Promise.all(
        ordersData.map(async order => {
          // Get order items with medicine info
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(
              `
              *,
              medicine!medicine_id (
                name,
                genericName,
                brandName
              )
            `
            )
            .eq('order_id', order.id);

          // Get cashier info
          const { data: cashierData, error: cashierError } = await supabase
            .from('sb_users')
            .select('firstName, lastName')
            .eq('user_uid', order.cashier_id)
            .single();

          return {
            ...order,
            order_items: itemsError ? [] : orderItems || [],
            cashier: cashierError
              ? { firstName: 'Unknown', lastName: 'Cashier' }
              : cashierData
          };
        })
      );

      return ordersWithDetails as Order[];
    }
  });

  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default'; // or use 'secondary' based on your design
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
            <TableHead>Cashiers</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map(order => (
            <TableRow key={order.id} className="group">
              <TableCell className="font-medium">
                {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
              </TableCell>
              <TableCell>{order.id.slice(0, 8)}</TableCell>
              <TableCell>
                {order.senior_citizens?.firstName}{' '}
                {order.senior_citizens?.lastName}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {order.order_items?.map(item => (
                    <div key={item.id} className="text-sm">
                      {item.quantity}x {item.medicine?.name}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>₱{order.total_amount.toFixed(2)}</TableCell>
              <TableCell className="text-green-600">
                ₱{(order.total_amount - order.discounted_amount).toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                {order.cashier?.firstName} {order.cashier?.lastName}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(order)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
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
                      {selectedOrder.id}
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
                      {selectedOrder.senior_citizens?.firstName}{' '}
                      {selectedOrder.senior_citizens?.lastName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Items Purchased</h3>
                <div className="border rounded-lg">
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
                      {selectedOrder.order_items?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {item.medicine?.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.medicine?.genericName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₱{item.unit_price.toFixed(2)}</TableCell>
                          <TableCell>₱{item.total_price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-right font-medium">
                          Subtotal
                        </TableCell>
                        <TableCell className="font-medium">
                          ₱{selectedOrder.total_amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-right font-medium">
                          Discount
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          ₱
                          {(
                            selectedOrder.total_amount -
                            selectedOrder.discounted_amount
                          ).toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">
                          Total
                        </TableCell>
                        <TableCell className="font-bold">
                          ₱{selectedOrder.discounted_amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Notes if any */}
              {selectedOrder.note && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
