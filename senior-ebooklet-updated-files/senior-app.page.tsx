/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserNav } from '@/components/user-header';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  Home,
  Info,
  LogOut,
  Phone,
  Pill,
  CrossIcon,
  Search,
  User,
  X,
  Building2,
  ChevronRight
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLogout } from '../authentication/hooks/useLogout';
import { HelpPage } from './help/help.page';
import useMedicines from './hooks/useMedicines';
import { ProfilePage } from './profile/profile.page';
import { TransactionHistoryPage } from './transaction-history/transaction-history.page';
import { useTab } from '@/context/tab-context';
import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';

const categories = [
  'All',
  'Pain Relief',
  'Blood Pressure',
  'Diabetes',
  'Cholesterol',
  'Digestive Health',
  'Thyroid'
];

interface Pharmacy {
  pharmacy_id: number;
  name: string;
  address: string;
  phoneNumber: string;
  operatingHours: string;
  is24Hours: boolean;
  status: string;
}

interface Medicine {
  medicineId: number;
  name: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  description: string;
  medicineImageUrl: string;
  unitPrice: number;
  prescriptionRequired: boolean;
  pharmacies: Pharmacy[];
}

interface MedicinePharmacy {
  pharmacy_id: number;
  medicine_id: number;
  stock_quantity: number;
}

export function SeniorCitizenPage() {
  const { activeTab, setActiveTab } = useTab();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize] = useState('medium');
  const [expandedMedicine, setExpandedMedicine] = useState<number | null>(null);
  const [isDarkMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Setup the useLogout hook
  const {
    logout,
    confirmLogout,
    cancelLogout,
    showConfirmDialog,
    isLoggingOut
  } = useLogout({
    redirectTo: '/login',
    onLogoutSuccess: () => {
      // Additional cleanup specific to your app (if needed)
      console.log('Logged out successfully');
    }
  });

  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines', searchQuery, selectedCategory],
    queryFn: async () => {
      // Get medicines with their associated pharmacy
      let query = supabase
        .from('medicine')
        .select(
          `
          *,
          pharmacy:pharmacy_id (
            pharmacy_id,
            name,
            address,
            phoneNumber,
            operatingHours,
            is24Hours,
            status
          )
        `
        )
        .eq('isActive', true);

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,genericName.ilike.%${searchQuery}%,brandName.ilike.%${searchQuery}%`
        );
      }

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      const { data: medicinesData, error } = await query;
      if (error) throw error;

      // Transform the data to match our interface
      const medicinesWithPharmacies = medicinesData.map(medicine => ({
        ...medicine,
        pharmacies: medicine.pharmacy ? [medicine.pharmacy] : []
      }));

      return medicinesWithPharmacies;
    }
  });

  const handleShowDetails = (medicine: any) => {
    setExpandedMedicine(medicine.medicineId);
  };

  // Font size classes based on user preference
  const fontSizeClasses = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
    extraLarge: 'text-2xl'
  };

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Get background color based on category
  const getCategoryColor = (category: string, isDark: boolean) => {
    const colorMap: Record<string, { light: string; dark: string }> = {
      All: { light: 'bg-blue-50', dark: 'bg-blue-900/20' },
      'Pain Relief': { light: 'bg-red-50', dark: 'bg-red-900/20' },
      'Blood Pressure': { light: 'bg-purple-50', dark: 'bg-purple-900/20' },
      Diabetes: { light: 'bg-green-50', dark: 'bg-green-900/20' },
      Cholesterol: { light: 'bg-yellow-50', dark: 'bg-yellow-900/20' },
      'Digestive Health': { light: 'bg-orange-50', dark: 'bg-orange-900/20' },
      Thyroid: { light: 'bg-teal-50', dark: 'bg-teal-900/20' }
    };

    const defaultColor = { light: 'bg-gray-50', dark: 'bg-gray-900/20' };
    const color = colorMap[category] || defaultColor;

    return isDark ? color.dark : color.light;
  };

  // Get text color based on category
  const getCategoryTextColor = (category: string, isDark: boolean) => {
    const colorMap: Record<string, { light: string; dark: string }> = {
      All: { light: 'text-blue-700', dark: 'text-blue-300' },
      'Pain Relief': { light: 'text-red-700', dark: 'text-red-300' },
      'Blood Pressure': { light: 'text-purple-700', dark: 'text-purple-300' },
      Diabetes: { light: 'text-green-700', dark: 'text-green-300' },
      Cholesterol: { light: 'text-yellow-700', dark: 'text-yellow-300' },
      'Digestive Health': { light: 'text-orange-700', dark: 'text-orange-300' },
      Thyroid: { light: 'text-teal-700', dark: 'text-teal-300' }
    };

    const defaultColor = { light: 'text-gray-700', dark: 'text-gray-300' };
    const color = colorMap[category] || defaultColor;

    return isDark ? color.dark : color.light;
  };

  // Get border color based on category
  const getCategoryBorderColor = (category: string, isDark: boolean) => {
    const colorMap: Record<string, { light: string; dark: string }> = {
      All: { light: 'border-blue-200', dark: 'border-blue-800' },
      'Pain Relief': { light: 'border-red-200', dark: 'border-red-800' },
      'Blood Pressure': {
        light: 'border-purple-200',
        dark: 'border-purple-800'
      },
      Diabetes: { light: 'border-green-200', dark: 'border-green-800' },
      Cholesterol: { light: 'border-yellow-200', dark: 'border-yellow-800' },
      'Digestive Health': {
        light: 'border-orange-200',
        dark: 'border-orange-800'
      },
      Thyroid: { light: 'border-teal-200', dark: 'border-teal-800' }
    };

    const defaultColor = { light: 'border-gray-200', dark: 'border-gray-800' };
    const color = colorMap[category] || defaultColor;

    return isDark ? color.dark : color.light;
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <main>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {medicines?.map(medicine => (
                <Card
                  key={medicine.medicineId}
                  className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white dark:bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader className="relative p-0">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={
                          medicine.medicineImageUrl ||
                          '/medicine-placeholder.png'
                        }
                        alt={medicine.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                      />
                      {medicine.prescriptionRequired && (
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <CrossIcon className="mr-1 h-3 w-3" />
                            Prescription
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6">
                      <CardTitle className="text-xl mb-2 line-clamp-2">
                        {medicine.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mb-4">
                        {medicine.genericName}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                            {medicine.dosageForm}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                            {medicine.strength}
                          </Badge>
                        </div>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          ₱{medicine.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Available at:
                        </h3>
                        <div className="space-y-2">
                          {medicine.pharmacies.map(pharmacy => (
                            <div
                              key={pharmacy.pharmacy_id}
                              className="relative group/pharmacy bg-secondary/30 p-3 rounded-lg transition-all duration-200 hover:bg-secondary/50">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {pharmacy.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {pharmacy.address}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      <span>
                                        {pharmacy.is24Hours
                                          ? 'Open 24/7'
                                          : pharmacy.operatingHours}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-4 w-4" />
                                      <span>{pharmacy.phoneNumber}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/pharmacy:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8">
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Details Modal */}
            <AnimatePresence>
              {expandedMedicine && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  onClick={() => setExpandedMedicine(null)}>
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}>
                    {medicines.find(
                      (m: any) => m.medicineId === expandedMedicine
                    ) && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h2
                            className={`text-xl font-bold ${getCategoryTextColor(
                              medicines.find(
                                (m: any) => m.medicineId === expandedMedicine
                              )?.category,
                              isDarkMode
                            )}`}>
                            {
                              medicines.find(
                                (m: any) => m.medicineId === expandedMedicine
                              )?.name
                            }
                          </h2>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => setExpandedMedicine(null)}>
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {
                            medicines.find(
                              (m: any) => m.medicineId === expandedMedicine
                            )?.description
                          }
                        </p>
                        <div className="space-y-2">
                          <h3 className="font-semibold">Details:</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Category:{' '}
                            {
                              medicines.find(
                                (m: any) => m.medicineId === expandedMedicine
                              )?.category
                            }
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Price: ₱
                            {
                              medicines.find(
                                (m: any) => m.medicineId === expandedMedicine
                              )?.unitPrice
                            }
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Stock:{' '}
                            {
                              medicines.find(
                                (m: any) => m.medicineId === expandedMedicine
                              )?.stockQuantity
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        );
      case 'Transaction History':
        return <TransactionHistoryPage />;
      case 'help':
        return <HelpPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return null;
    }
  };

  const bottomNavItems = [
    {
      icon: <Home className="h-5 w-5 sm:h-6 sm:w-6" />,
      label: 'Home',
      tab: 'home'
    },
    {
      icon: <Pill className="h-5 w-5 sm:h-6 sm:w-6" />,
      label: 'History',
      tab: 'Transaction History'
    },
    {
      icon: <User className="h-5 w-5 sm:h-6 sm:w-6" />,
      label: 'Profile',
      tab: 'profile'
    },
    {
      icon: <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />,
      label: 'Help',
      tab: 'help'
    }
  ];

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Show header only for home tab */}
        {activeTab === 'home' && (
          <>
            {/* Header */}
            <header className="mb-6">
              <div className="flex justify-end items-center mb-4">
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10"
                    onClick={() => setShowHelp(!showHelp)}
                    aria-label="Show help">
                    <HelpCircle className="h-5 w-5" />
                  </Button>

                  {/* Logout Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    onClick={logout}
                    aria-label="Logout">
                    <LogOut className="h-5 w-5" />
                  </Button>

                  <UserNav />
                </div>
              </div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
                  <Input
                    type="text" // <-- change from "search" to "text"
                    placeholder="Search for medicines..."
                    className={`pl-14 pr-14  h-16 text-lg rounded-full border-2 border-primary/20 focus:border-primary dark:bg-slate-800 dark:border-blue-900/50 dark:focus:border-blue-500`}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search">
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                  <Label htmlFor="search" className="sr-only">
                    Search for medicines
                  </Label>
                </div>

                {/* Filter Toggle */}
                <div className="flex justify-center mt-3">
                  {/* <Button
                    variant="outline"
                    className={`rounded-full px-4 flex items-center gap-2`}
                    onClick={() => setShowFilters(!showFilters)}>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                    {showFilters ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button> */}
                </div>
              </motion.div>
            </header>

            {/* Help Tooltip */}
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-blue-50 dark:bg-slate-800 p-4 rounded-xl mb-6 border-2 border-blue-200 dark:border-blue-900">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mt-1">
                      <Info className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div>
                      <h3
                        className={`font-semibold text-blue-800 dark:text-blue-300 mb-2`}>
                        Quick Help
                      </h3>
                      <ul
                        className={` space-y-2 text-blue-700 dark:text-blue-200`}>
                        {/* <li className="flex items-center gap-2">
                          <Check className="h-5 w-5 flex-shrink-0" /> Tap "Show
                          Filters" to see medicine categories
                        </li> */}
                        {/* <li className="flex items-center gap-2">
                          <Check className="h-5 w-5 flex-shrink-0" /> Tap a
                          medicine card to see more details
                        </li> */}
                        <li className="flex items-center gap-2">
                          <Check className="h-5 w-5 flex-shrink-0" /> Use the
                          red logout button to sign out
                        </li>
                        {/* <li className="flex items-center gap-2">
                          <Check className="h-5 w-5 flex-shrink-0" /> Use the A
                          buttons to change text size
                        </li> */}
                      </ul>
                      <Button
                        variant="outline"
                        className={`mt-3 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300`}
                        onClick={() => setShowHelp(false)}>
                        Close Help
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex-1">
                        <Button
                          variant="outline"
                          className={`w-full h-auto py-3 px-4 rounded-xl transition-all duration-300 ${
                            selectedCategory === category
                              ? `${getCategoryColor(
                                  category,
                                  isDarkMode
                                )} ${getCategoryTextColor(
                                  category,
                                  isDarkMode
                                )} ${getCategoryBorderColor(
                                  category,
                                  isDarkMode
                                )} border-2`
                              : 'bg-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                          }`}
                          onClick={() => {
                            setSelectedCategory(category);
                            // Optionally close filters after selection on mobile
                            if (window.innerWidth < 768) {
                              setShowFilters(false);
                            }
                          }}>
                          {category}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Dynamic Content */}
        {renderContent()}

        {/* Bottom Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 shadow-lg">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-4 gap-1">
              {bottomNavItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`flex flex-col items-center justify-center h-auto py-2 sm:py-3 px-1 ${
                    activeTab === item.tab
                      ? 'bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-400'
                      : 'dark:text-slate-300'
                  }`}
                  onClick={() => setActiveTab(item.tab)}>
                  {item.icon}
                  <span
                    className={`${
                      fontSizeClasses[fontSize === 'small' ? 'small' : 'medium']
                    } mt-1 text-xs sm:text-sm truncate w-full text-center`}>
                    {item.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Logout Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={cancelLogout}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to logout from your account?
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-4">
              <LogOut className="h-16 w-16 text-red-500" />
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2">
              <Button
                variant="outline"
                onClick={cancelLogout}
                disabled={isLoggingOut}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-red-500 hover:bg-red-600"
                onClick={confirmLogout}
                disabled={isLoggingOut}>
                {isLoggingOut ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Logging out...
                  </>
                ) : (
                  'Yes, Logout'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Spacer to prevent content from being hidden behind the fixed footer */}
        <div className="h-24"></div>
      </div>
    </div>
  );
}
