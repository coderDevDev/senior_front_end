import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useBag } from '@/context/bag-context';
import { cn } from '@/lib/utils';
import IMedicine from '@/modules/admin/medicines/medicine.interface';
import useCurrentUser from '@/modules/authentication/hooks/useCurrentUser';
import supabase from '@/shared/supabase';
import { MinusCircle, PlusCircle, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useMedicines from '../hooks/useMedicines';

interface ReceiptData {
  userId: string;
  seniorCitizenId: string;
  fullName: string;
  items: {
    id: string;
    name: string;
    stockQuantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  date: string;
  referenceNumber: string;
}
interface BagItem {
  id: string;
  name: string;
  unitPrice: number;
  stockQuantity: number;
}
export function CheckoutPage() {
  const { items, totalAmount, removeItem, clearBag } = useBag();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const { data: medicinesData } = useMedicines();
  const navigate = useNavigate();

  const { user } = useCurrentUser();

  // Assume userId is available from auth (replace with your auth logic)
  const userId = (user?.user_metadata as any)?.id; // TODO: Get from Supabase auth (e.g., supabase.auth.getUser())

  const medicines = medicinesData?.data?.data?.medicines || [];

  const itemsWithDetails = items.map((item: BagItem) => ({
    ...item,
    details: medicines.find((m: IMedicine) => m.medicineId === item.id)
  }));

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    toast.loading('Preparing receipt...', { id: 'receipt-prepare' });

    try {
      // Fetch user name
      const { data: userData, error: userError } = await supabase
        .from('senior_citizens')
        .select('firstName')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      // Fetch senior citizen ID
      const { data: seniorData, error: seniorError } = await supabase
        .from('senior_citizens')
        .select('id')
        .eq('id', userId)
        .single();

      if (seniorError || !seniorData) {
        throw new Error('Senior citizen record not found');
      }

      // Calculate discount
      const discountRate = 0.2;
      const discountAmount = totalAmount * discountRate;
      const finalTotal = totalAmount - discountAmount;

      // Prepare receipt data
      setReceiptData({
        userId,
        seniorCitizenId: seniorData.id,
        fullName: userData.firstName,
        items: items.map((item: BagItem) => ({
          id: item.id,
          name: item.name,
          stockQuantity: item.stockQuantity,
          unitPrice: item.unitPrice,
          total: item.unitPrice * item.stockQuantity
        })),
        subtotal: totalAmount,
        discountAmount,
        finalTotal,
        date: new Date().toLocaleDateString(),
        referenceNumber: `TRX-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`
      });

      toast.dismiss('receipt-prepare');
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error preparing receipt:', error);
      toast.dismiss('receipt-prepare');
      toast.error((error as Error).message || 'Failed to prepare receipt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!receiptData) return;

    try {
      const transaction = {
        id: parseInt(receiptData.userId),
        senior_citizen_id: receiptData.seniorCitizenId,
        medicines: receiptData.items,
        total_amount: receiptData.finalTotal,
        discount_amount: receiptData.discountAmount,
        status: 'Completed',
        reference_number: receiptData.referenceNumber,
        pharmacy: 'Sample Pharmacy'
      };

      const { error } = await supabase
        .from('transactions')
        .insert([transaction]);

      if (error) {
        throw new Error(`Transaction error: ${error.message}`);
      }

      toast.success('Purchase completed!');
      clearBag();
      setIsModalOpen(false);
      navigate('/transactions');
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error((error as Error).message || 'Failed to complete purchase');
    }
  };

  const handlestockQuantityChange = (id: string, delta: number) => {
    const item = items.find((i: BagItem) => i.id === id);
    if (!item) return;

    if (item.stockQuantity + delta <= 0) {
      removeItem(id);
      return;
    }

    // Update stockQuantity logic here
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Shopping Bag</h1>

      {itemsWithDetails.map((item: BagItem & { details?: IMedicine }) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img
                  src={item.details?.medicineImageUrl || '/placeholder.svg'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>

              <div className="flex-grow space-y-2">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.details?.description}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₱{(item.unitPrice * item.stockQuantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-full p-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => handlestockQuantityChange(item.id, -1)}>
                      <MinusCircle className="h-5 w-5" />
                    </Button>
                    <span className="w-8 text-center">
                      {item.stockQuantity}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => handlestockQuantityChange(item.id, 1)}>
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </div>

                  {item.details && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'px-3 py-1',
                        (item.details?.stockQuantity as number) < 10
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      )}>
                      {item.details.stockQuantity} in stock
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Brand: {item.details?.brandName}</p>
                  <p>Generic: {item.details?.genericName}</p>
                  <p>Strength: {item.details?.strength}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Amount</h3>
            <p className="text-lg font-bold">₱{totalAmount.toFixed(2)}</p>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleProceedToPayment}
            disabled={isLoading}>
            <ShoppingBag className="mr-2 h-5 w-5" />
            {isLoading ? 'Preparing...' : 'Proceed to Payment'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Receipt</DialogTitle>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-4">
              <div>
                <p>
                  <strong>Senior Citizen:</strong> {receiptData.fullName}
                </p>
                <p>
                  <strong>Date:</strong> {receiptData.date}
                </p>
                <p>
                  <strong>Reference Number:</strong>{' '}
                  {receiptData.referenceNumber}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Items Purchased:</h4>
                <ul className="list-disc pl-5">
                  {receiptData.items.map(item => (
                    <li key={item.id}>
                      {item.name} (x{item.stockQuantity}) - ₱
                      {item.total.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p>
                  <strong>Subtotal:</strong> ₱{receiptData.subtotal.toFixed(2)}
                </p>
                <p>
                  <strong>Senior Discount (20%):</strong> ₱
                  {receiptData.discountAmount.toFixed(2)}
                </p>
                <p>
                  <strong>Total:</strong> ₱{receiptData.finalTotal.toFixed(2)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase}>Confirm Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
