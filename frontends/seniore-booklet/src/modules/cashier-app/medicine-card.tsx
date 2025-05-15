import { FileText, MinusCircle, PlusCircle, ShoppingBag } from 'lucide-react';
import IMedicine from '../admin/medicines/medicine.interface';
import { getCategoryColor } from './category.utils';

interface MedicineCardProps {
  medicine: IMedicine;
  quantity: number;
  onQuantityChange: (medicineId: string | undefined, delta: number) => void;
  onAddToCart: (medicine: IMedicine) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  quantity,
  onQuantityChange,
  onAddToCart
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start">
          <div
            className={`flex-shrink-0 w-16 h-16 rounded-md flex items-center justify-center mr-4 ${getCategoryColor(
              medicine.brandName
            )}`}>
            <img
              src={medicine.medicineImageUrl || '/api/placeholder/80/80'}
              alt={medicine.name}
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800">{medicine.name}</h3>
              <span className="font-medium text-gray-800">
                ₱{medicine.unitPrice?.toFixed(2)}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">{medicine.description}</p>
            <div className="flex flex-wrap gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                  medicine.brandName
                )}`}>
                {medicine.brandName}
              </span>
              {/* <span className={`text-xs px-2 py-1 rounded-full ${medicine.stock === "Low Stock" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}>
                {medicine.stock}
              </span> */}
              {medicine.prescriptionRequired && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  Prescription
                </span>
              )}
              {medicine.dosageForm && medicine.strength && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                  {medicine.dosageForm} • {medicine.strength}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center bg-slate-100 rounded-full overflow-hidden">
            <button
              className="p-2 hover:bg-slate-200 transition-colors"
              onClick={() => onQuantityChange(medicine.medicineId, -1)}
              disabled={!quantity}>
              <MinusCircle
                className={`w-5 h-5 ${
                  quantity ? 'text-gray-700' : 'text-gray-400'
                }`}
              />
            </button>
            <span className="w-8 text-center">{quantity || 0}</span>
            <button
              className="p-2 hover:bg-slate-200 transition-colors"
              onClick={() => onQuantityChange(medicine.medicineId, 1)}>
              <PlusCircle className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="flex gap-2">
            {/* {medicine.prescriptionRequired && (
              <button 
                className="flex items-center px-3 py-2 rounded-full font-medium bg-blue-50 text-blue-600 border border-blue-200"
              >
                <FileText className="w-4 h-4 mr-1" />
                Rx
              </button>
            )}
             */}
            <button
              className={`flex items-center px-4 py-2 rounded-full font-medium ${
                quantity
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } transition-colors`}
              onClick={() => onAddToCart(medicine)}
              disabled={!quantity}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
