export const getCategoryColor = (category: string | undefined): string => {
  if (!category) return "bg-gray-100 text-gray-800 border-gray-200";
  
  const colorMap: Record<string, string> = {
    "Pain Relief": "bg-red-100 text-red-800 border-red-200",
    "Blood Pressure": "bg-purple-100 text-purple-800 border-purple-200",
    "Diabetes": "bg-green-100 text-green-800 border-green-200",
    "Cholesterol": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Digestive Health": "bg-orange-100 text-orange-800 border-orange-200",
    "Thyroid": "bg-teal-100 text-teal-800 border-teal-200",
    "Antibiotics": "bg-blue-100 text-blue-800 border-blue-200",
    "Mental Health": "bg-indigo-100 text-indigo-800 border-indigo-200"
  };
  
  return colorMap[category] || "bg-gray-100 text-gray-800 border-gray-200";
};
