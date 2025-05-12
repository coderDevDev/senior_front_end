/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { OrderHistoryTable } from './order-history';

interface OrderHistoryPageProps {
  orderHistory: Record<string, any>[];
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ orderHistory }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Order History</h2>
      <OrderHistoryTable orderHistory={orderHistory} />
    </div>
  );
};
