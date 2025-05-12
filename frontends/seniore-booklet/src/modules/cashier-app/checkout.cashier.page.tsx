import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Fingerprint, Loader2, ShoppingBag } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import IMedicine from '../admin/medicines/medicine.interface';
import { CartItem } from './cart-item';
import FingerprintVerification from './fingerprint-senior.verification';
import { OrderSummary } from './order-summary';
import OrderService, { CreateOrderInput } from './order.service';

interface CheckoutCashierPageProps {
  cart: IMedicine[];
  calculateTotal: () => string;
  orderNote: string;
  setOrderNote: (note: string) => void;
  updateCartQuantity: (medicineId: string | undefined, newQuantity: number) => void;
  removeFromCart: (medicineId: string | undefined) => void;
  setShowCheckout: (show: boolean) => void;
  refetchCart?: () => void;
}

export const CheckoutCashierPage: React.FC<CheckoutCashierPageProps> = ({
  cart,
  calculateTotal,
  orderNote,
  setOrderNote,
  updateCartQuantity,
  removeFromCart,
  setShowCheckout,
  refetchCart
}) => {
  const [showVerification, setShowVerification] = useState<boolean>(false);
  const [verifiedSeniorId, setVerifiedSeniorId] = useState<string | null>(null);
  const [discountedTotal, setDiscountedTotal] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  
  // Calculate total without and with discount
  const regularTotal = parseFloat(calculateTotal());
  
  // Calculate discount if a senior is verified
  const calculateDiscount = (total: number, seniorId: string | null) => {
    if (!seniorId) return { total, discount: 0, discountedTotal: total };
    
    const result = OrderService.calculateSeniorDiscount(total);
    return {
      total,
      discount: result.discountAmount,
      discountedTotal: result.finalAmount
    };
  };
  
  // Order completion mutation with React Query
  const orderMutation = useMutation({
    mutationFn: (orderData: CreateOrderInput) => OrderService.createOrder(orderData),
    onSuccess: (data) => {
      console.log("Order completed:", data);
      toast.success('Order completed successfully!');
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (verifiedSeniorId) {
        queryClient.invalidateQueries({ queryKey: ['senior', verifiedSeniorId] });
      }
      
      setShowCheckout(false);
      refetchCart?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error processing your order');
    }
  });
  
  const handleVerificationRequest = (): void => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setShowVerification(true);
  };
  
  const handleVerificationComplete = (success: boolean, seniorId?: string): void => {
    setShowVerification(false);
    
    if (success && seniorId) {
      setVerifiedSeniorId(seniorId);
      
      // Calculate discount
      const { discountedTotal, discount } = calculateDiscount(regularTotal, seniorId);
      setDiscountedTotal(discountedTotal.toFixed(2));
      
      toast.success(`Senior citizen verified! ${discount.toFixed(2)} PHP discount applied.`);
    } else {
      setVerifiedSeniorId(null);
      setDiscountedTotal(null);
    }
  };
  
  const handleCancelVerification = (): void => {
    setShowVerification(false);
  };
  
  const handleCompleteOrder = (): void => {
    // Prepare order data
    const orderData: CreateOrderInput = {
      items: cart.map(item => ({
        medicineId: item.medicineId || '',
        stockQuantity: item.stockQuantity || 1,
        unitPrice: item.unitPrice || 0
      })),
      totalAmount: regularTotal,
      note: orderNote,
      seniorId: verifiedSeniorId
    };
    
    // Submit the order using the mutation
    orderMutation.mutate(orderData);
  };
  
  // Get discount information if senior is verified
  const discountInfo = verifiedSeniorId 
    ? calculateDiscount(regularTotal, verifiedSeniorId)
    : null;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      {showVerification ? (
        <FingerprintVerification
          onVerificationComplete={handleVerificationComplete}
          onCancel={handleCancelVerification}
        />
      ) : (
        <>
          <div className="flex items-center mb-4">
            <button 
              className="mr-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setShowCheckout(false)}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold">Checkout</h2>
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowCheckout(false)}
              >
                Browse Medicines
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Order Items</h3>
                <div className="divide-y">
                  {cart.map(item => (
                    <CartItem 
                      key={item.medicineId}
                      item={item}
                      onRemove={removeFromCart}
                      onUpdateQuantity={updateCartQuantity}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Order Notes</h3>
                <textarea
                  className="w-full rounded-lg border border-gray-200 p-3 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Add any special instructions..."
                  rows={3}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                ></textarea>
              </div>
              
              <div className="mb-6">
                <OrderSummary 
                  subtotal={calculateTotal()}
                  total={discountedTotal || calculateTotal()}
                  discount={discountInfo ? discountInfo.discount.toFixed(2) : undefined}
                  discountPercentage={verifiedSeniorId ? 20 : undefined}
                  seniorId={verifiedSeniorId}
                />
              </div>
              
              {verifiedSeniorId ? (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="flex items-center text-green-700">
                    <Fingerprint className="w-5 h-5 mr-2" />
                    <span className="font-medium">Senior Citizen Verified</span>
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    20% discount has been applied to your order.
                  </p>
                </div>
              ) : (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    <span className="font-medium">Senior Citizen Discount:</span> Verify fingerprint to receive a 20% discount.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!verifiedSeniorId && (
                  <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center transition-colors"
                    onClick={handleVerificationRequest}
                    disabled={orderMutation.isPending}
                  >
                    <Fingerprint className="w-5 h-5 mr-2" />
                    Verify Senior Citizen
                  </button>
                )}
                
                <button 
                  className={`w-full ${verifiedSeniorId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white font-medium py-3 rounded-lg flex items-center justify-center transition-colors ${!verifiedSeniorId ? 'md:col-span-2' : ''}`}
                  onClick={handleCompleteOrder}
                  disabled={orderMutation.isPending}
                >
                  {orderMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Complete Order'
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
