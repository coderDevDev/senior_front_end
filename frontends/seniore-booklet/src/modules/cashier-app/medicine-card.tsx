import { MinusCircle, PlusCircle, ShoppingBag, Store } from 'lucide-react';
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
  // Determine category based on medicine type or use a default
  const getMedicineCategory = (medicine: IMedicine): string => {
    // You can add logic here to determine category based on medicine properties
    // For now, using genericName as a fallback or defaulting to "General"
    if (medicine.genericName) {
      // Map generic names to categories
      const genericName = medicine.genericName.toLowerCase();
      if (
        genericName.includes('paracetamol') ||
        genericName.includes('ibuprofen')
      ) {
        return 'Pain Relief';
      }
      if (
        genericName.includes('amlodipine') ||
        genericName.includes('losartan')
      ) {
        return 'Blood Pressure';
      }
      if (
        genericName.includes('metformin') ||
        genericName.includes('glimepiride')
      ) {
        return 'Diabetes';
      }
      if (
        genericName.includes('simvastatin') ||
        genericName.includes('atorvastatin')
      ) {
        return 'Cholesterol';
      }
      if (
        genericName.includes('omeprazole') ||
        genericName.includes('ranitidine')
      ) {
        return 'Digestive Health';
      }
      if (genericName.includes('levothyroxine')) {
        return 'Thyroid';
      }
      if (
        genericName.includes('amoxicillin') ||
        genericName.includes('azithromycin')
      ) {
        return 'Antibiotics';
      }
    }
    return 'General';
  };

  const category = getMedicineCategory(medicine);

  console.log({ medicine });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start">
          <div
            className={`flex-shrink-0 w-16 h-16 rounded-md flex items-center justify-center mr-4 ${getCategoryColor(
              category
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

            {/* Pharmacy Information */}
            <div className="flex items-start text-sm text-gray-500 mb-2">
              <Store className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
              {medicine.pharmacy ? (
                <div className="flex-1">
                  <span className="font-medium text-gray-700">
                    {medicine.pharmacy.name}
                  </span>
                  {medicine.pharmacy.address && (
                    <span className="block text-xs text-gray-400 mt-0.5">
                      {medicine.pharmacy.address}
                    </span>
                  )}
                  {medicine.pharmacy.operatingHours && (
                    <span className="block text-xs text-gray-400">
                      {medicine.pharmacy.operatingHours}
                      {medicine.pharmacy.is24Hours && ' • 24/7'}
                    </span>
                  )}
                  {medicine.pharmacy.phoneNumber && (
                    <span className="block text-xs text-gray-400">
                      📞 {medicine.pharmacy.phoneNumber}
                    </span>
                  )}
                </div>
              ) : medicine.pharmacies && medicine.pharmacies.length > 0 ? (
                <div className="flex-1">
                  <span className="font-medium text-gray-700">
                    {medicine.pharmacies[0].name}
                  </span>
                  {medicine.pharmacies[0].address && (
                    <span className="block text-xs text-gray-400 mt-0.5">
                      {medicine.pharmacies[0].address}
                    </span>
                  )}
                  {medicine.pharmacies[0].operatingHours && (
                    <span className="block text-xs text-gray-400">
                      {medicine.pharmacies[0].operatingHours}
                      {medicine.pharmacies[0].is24Hours && ' • 24/7'}
                    </span>
                  )}
                  {medicine.pharmacies[0].phoneNumber && (
                    <span className="block text-xs text-gray-400">
                      📞 {medicine.pharmacies[0].phoneNumber}
                    </span>
                  )}
                </div>
              ) : medicine.pharmacy_id ? (
                <div className="flex-1">
                  <span className="text-gray-600">
                    Pharmacy #{medicine.pharmacy_id}
                  </span>
                  <span className="block text-xs text-gray-400">
                    Contact store for details
                  </span>
                </div>
              ) : (
                <span className="flex-1">
                  Available at all partner pharmacies
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                  category
                )}`}>
                {category}
              </span>
              {medicine.brandName && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {medicine.brandName}
                </span>
              )}
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
              {medicine.stockQuantity !== undefined && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    medicine.stockQuantity <= 10
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                  {medicine.stockQuantity <= 10 ? 'Low Stock' : 'In Stock'}
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
