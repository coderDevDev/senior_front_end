import React from 'react';

interface OrderHistoryTableProps {
  orderHistory: Record<string, any>[];
}

export const OrderHistoryTable: React.FC<OrderHistoryTableProps> = ({ orderHistory }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orderHistory.map((order, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">{order.orderId}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.total}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
