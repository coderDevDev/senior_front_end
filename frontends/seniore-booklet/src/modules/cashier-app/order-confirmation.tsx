import { Check } from 'lucide-react';
import React from 'react';
import IMedicine from '../admin/medicines/medicine.interface';
import IUser from '../admin/users/user.interface';


interface OrderConfirmationProps {
  cart: IMedicine[];
  calculateTotal: () => string;
  user: Partial<IUser>;
  startNewOrder: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  cart,
  calculateTotal,
  user,
  startNewOrder
}) => {
  const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Completed</h2>
        <p className="text-gray-600 mb-6">Your order has been successfully placed and will be processed shortly.</p>
        
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Order Summary</h3>
          <div className="text-sm text-gray-600 mb-2">{cart.length} items • ₱{calculateTotal()}</div>
          <div className="text-sm text-gray-500">Order ID: {orderId}</div>
          <div className="text-sm text-gray-500 mt-1">Processed by: {user.firstName}</div>
        </div>
        
        <button 
          onClick={startNewOrder}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Start New Order
        </button>
      </div>
    </div>
  );
};
