import React from 'react';

interface OrderSummaryProps {
  subtotal: string;
  total: string;
  discount?: string;
  discountPercentage?: number;
  seniorId?: string | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  total,
  discount,
  discountPercentage,
  seniorId
}) => {
  const hasDiscount = !!discount && parseFloat(discount) > 0;
  
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-800 mb-4">Order Summary</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₱ {subtotal}</span>
        </div>
        
        {hasDiscount && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center">
              Senior Citizen Discount
              {discountPercentage && <span className="ml-1">({discountPercentage}%)</span>}
            </span>
            <span className="font-medium">- ₱ {discount}</span>
          </div>
        )}
        
        {/* Add VAT exemption line if senior citizen */}
        {seniorId && (
          <div className="flex justify-between text-green-600">
            <span>VAT Exemption (12%)</span>
            <span className="font-medium">Included</span>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-3 flex justify-between">
        <span className="font-medium text-gray-700">Total</span>
        <span className="font-bold text-lg">
          ₱ {total}
          {hasDiscount && (
            <span className="ml-2 line-through text-sm text-gray-400">₱ {subtotal}</span>
          )}
        </span>
      </div>
      
      {seniorId && (
        <div className="mt-3 text-xs text-green-600">
          * Senior citizen discount applied according to Republic Act No. 9994 (Expanded Senior Citizens Act)
        </div>
      )}
    </div>
  );
};
