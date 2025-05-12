/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertCircle, ChevronRight, Menu, ShoppingBag } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import IUser from '../admin/users/user.interface';
import { CashierProfile } from './cashier-profile';
import { CheckoutCashierPage } from './checkout.cashier.page';
import useMedicines from './hooks/useMedicines';
import { MedicineCard } from './medicine-card';
import { OrderConfirmation } from './order-confirmation';
import { OrderHistoryPage } from './order-history-summary';
import { SearchBar } from './search-bar';
import useCart from './useCart';
import useCurrentUser from "@/modules/authentication/hooks/useCurrentUser";

export const CashierAppPage: React.FC = () => {
  // API Data Fetching with React Query
  const { data: medicinesData, isLoading } = useMedicines();
  const { user } = useCurrentUser();
  // Memoized medicines to prevent unnecessary re-renders
  const medicines = useMemo(() => {
    return medicinesData?.data?.data?.medicines || [];
  }, [medicinesData]);

  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("order");
  
  // Custom hook for cart management
  const {
    cart,
    quantities,
    handleQuantityChange,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    calculateTotal,
    clearCart
  } = useCart();

  // Sample order history
   
  const orderHistory: Record<string,any>[] = [
    { id: "ORD-9283", date: "Apr 14, 2025", items: 5, total: 45.25, status: "Completed" },
    { id: "ORD-9271", date: "Apr 13, 2025", items: 3, total: 28.75, status: "Completed" },
    { id: "ORD-9264", date: "Apr 12, 2025", items: 7, total: 86.50, status: "Completed" },
    { id: "ORD-9253", date: "Apr 11, 2025", items: 2, total: 17.99, status: "Completed" },
    { id: "ORD-9241", date: "Apr 10, 2025", items: 4, total: 34.50, status: "Completed" }
  ];

  // Filtered medicines based on search query - memoized for performance
  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine: any) => 
      medicine.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.brandName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [medicines, searchQuery]);

  // Complete order handler
  const completeOrder = () => {
    // In a real app, you'd send the order to a backend here
    // const orderData = {
    //   items: cart,
    //   totalAmount: calculateTotal(),
    //   notes: orderNote,
    //   cashierId: cashier.id
    // };
    // apiClient.post('/orders', orderData)
    //   .then(() => setCheckoutComplete(true))
    //   .catch(error => console.error('Order failed:', error));
    
    // For demo purposes:
    setCheckoutComplete(true);
  };

  // Reset order
  const startNewOrder = () => {
    clearCart();
    setShowCheckout(false);
    setCheckoutComplete(false);
    setOrderNote("");
  };

  // Medicine list content
  const renderMedicineList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (filteredMedicines.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No medicines found matching your search.</p>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            onClick={() => setSearchQuery("")}
          >
            Reset Search
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredMedicines.map((medicine: any) => (
          <MedicineCard
            key={medicine.medicineId}
            medicine={medicine}
            quantity={quantities[medicine.medicineId] || 0}
            onQuantityChange={handleQuantityChange}
            onAddToCart={addToCart}
          />
        ))}
      </div>
    );
  };

  // Render content based on active tab and checkout state
  const renderContent = () => {
    switch (activeTab) {
      case "order":
        return showCheckout ? (
          <CheckoutCashierPage
            cart={cart}
            calculateTotal={calculateTotal}
            orderNote={orderNote}
            setOrderNote={setOrderNote}
            updateCartQuantity={updateCartQuantity}
            removeFromCart={removeFromCart}
            setShowCheckout={setShowCheckout}
            completeOrder={completeOrder}
          />
        ) : renderMedicineList();
      case "history":
        return <OrderHistoryPage orderHistory={orderHistory} />;
      default:
        return renderMedicineList();
    }
  };

  // Order confirmation screen
  if (checkoutComplete) {
    return (
      <OrderConfirmation
        cart={cart}
        calculateTotal={calculateTotal}
        user={user?.user_metadata?.firstName || "Senior Citizen"}
        startNewOrder={startNewOrder}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800 mr-2">Pharmacy Ordering</h1>
              <CashierProfile 
                user={{
                  firstName: user?.user_metadata?.firstName || "Unknown Cashier",
                  id: user?.user_metadata?.id || "Unknown ID",
                  // seniorCitizenId: user?.user_metadata?.seniorCitizenId || "Senior Citizen ID: SC-123456"
                }}
                showNavMenu={showNavMenu}
                setShowNavMenu={setShowNavMenu}
                setActiveTab={setActiveTab}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {activeTab === "order" && !showCheckout && (
                <div className="relative">
                  <button 
                    className="relative bg-blue-50 text-blue-600 font-medium rounded-full px-3 py-1"
                    onClick={() => setShowCheckout(true)}
                    disabled={cart.length === 0}
                  >
                    <ShoppingBag className="w-4 h-4 inline mr-1" />
                    <span>{cart.length}</span>
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {cart.reduce((total, item) => total + (item.stockQuantity || 0), 0)}
                      </span>
                    )}
                  </button>
                </div>
              )}
              
              <button 
                className="md:hidden p-2 rounded-full hover:bg-gray-100"
                onClick={() => setShowNavMenu(!showNavMenu)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {activeTab === "order" && !showCheckout && (
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-grow container mx-auto p-4">
        {renderContent()}
      </main>
      
      {/* Floating cart button (only shows when items in cart and not on checkout page) */}
      {activeTab === "order" && !showCheckout && cart.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center"
            onClick={() => setShowCheckout(true)}
          >
            <ShoppingBag className="w-6 h-6 mr-2" />
            <span className="font-medium">View Order ({cart.reduce((total, item) => total + (item.stockQuantity || 0), 0)})</span>
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CashierAppPage;
