import { MinusCircle, PlusCircle, X } from 'lucide-react';
import React from 'react';
import IMedicine from '../admin/medicines/medicine.interface';
import { getCategoryColor } from './category.utils';


interface CartItemProps {
  item: IMedicine;
  onRemove: (medicineId: string | undefined) => void;
  onUpdateQuantity: (medicineId: string | undefined, newQuantity: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  onRemove, 
  onUpdateQuantity 
}) => {
  return (
    <div className="py-3 flex items-center">
      <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center mr-3">
        <img 
          src={item.medicineImageUrl || "/api/placeholder/40/40"} 
          alt={item.name} 
          className="w-8 h-8 object-contain" 
        />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between">
          <h4 className="font-medium text-gray-800">{item.name}</h4>
          <span className="font-medium">₱{item.unitPrice?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.brandName)}`}>
            {item.brandName}
          </span>
          <div className="flex items-center">
            <button 
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={() => onUpdateQuantity(item.medicineId, (item.stockQuantity || 0) - 1)}
            >
              <MinusCircle className="w-4 h-4 text-gray-500" />
            </button>
            <span className="mx-2 w-6 text-center">{item.stockQuantity}</span>
            <button 
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={() => onUpdateQuantity(item.medicineId, (item.stockQuantity || 0) + 1)}
            >
              <PlusCircle className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
      <button 
        className="ml-2 p-2 rounded-full hover:bg-red-50 text-red-500"
        onClick={() => onRemove(item.medicineId)}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
