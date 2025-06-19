/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { OrderHistoryTable } from './order-history';

export const OrderHistoryPage: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      {/* <h2 className="text-xl font-bold mb-4">Order History</h2> */}
      <OrderHistoryTable />
    </div>
  );
};
