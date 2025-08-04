import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { MoreHorizontalIcon, SearchIcon, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface OrderItem {
  id: string;
  order_id: string;
  medicine_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_applied: boolean;
  medicine?: {
    name: string;
    genericName?: string;
    brandName?: string;
  };
}

interface Order {
  id: string;
  senior_id: string;
  total_amount: number;
  discounted_amount: number;
  discount_percentage: number;
  discount_type: string;
  has_discount: boolean;
  note: string;
  status: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const TransactionHistoryList = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            *,
            medicine (
              name,
              genericName,
              brandName,
              unitPrice
            )
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

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

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="h-[400px] text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View your past transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>₱{order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === 'completed' ? 'default' : 'secondary'
                        }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Items</h4>
                <ul className="mt-2 space-y-2">
                  {selectedOrder.order_items?.map(item => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.medicine?.name} x {item.quantity}
                      </span>
                      <span>₱{item.total_price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₱{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Discount ({selectedOrder.discount_percentage}%)</span>
                  <span>₱{selectedOrder.discounted_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium mt-2">
                  <span>Total</span>
                  <span>
                    ₱
                    {(
                      selectedOrder.total_amount -
                      selectedOrder.discounted_amount
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TransactionHistoryList;
