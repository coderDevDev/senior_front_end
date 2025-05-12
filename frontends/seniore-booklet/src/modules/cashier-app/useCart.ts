import { useCallback, useState } from "react";
import IMedicine from "../admin/medicines/medicine.interface";

export function useCart() {
  const [cart, setCart] = useState<IMedicine[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = useCallback((medicineId: string | undefined, delta: number) => {
    if (!medicineId) return;
    
    setQuantities(prev => {
      const current = prev[medicineId] || 0;
      const newQuantity = Math.max(0, current + delta);
      return { ...prev, [medicineId]: newQuantity };
    });
  }, []);

  const addToCart = useCallback((medicine: IMedicine) => {
    if (!medicine.medicineId) return;
    
    const quantity = quantities[medicine.medicineId] || 0;
    if (quantity === 0) return;

    // Check if medicine already in cart
    const existingIndex = cart.findIndex(item => item.medicineId === medicine.medicineId);
    
    if (existingIndex >= 0) {
      // Update quantity if already in cart
      const updatedCart = [...cart];
      const currentQuantity = updatedCart[existingIndex].stockQuantity || 0;
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        stockQuantity: currentQuantity + quantity
      };
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, { ...medicine, stockQuantity: quantity }]);
    }
    
    // Reset quantity after adding to cart
    setQuantities(prev => ({ ...prev, [medicine.medicineId as string]: 0 }));
  }, [cart, quantities]);

  const removeFromCart = useCallback((medicineId: string | undefined) => {
    if (!medicineId) return;
    setCart(cart => cart.filter(item => item.medicineId !== medicineId));
  }, []);

  const updateCartQuantity = useCallback((medicineId: string | undefined, newQuantity: number) => {
    if (!medicineId) return;
    
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    
    setCart(cart => cart.map(item => 
      item.medicineId === medicineId ? { ...item, stockQuantity: newQuantity } : item
    ));
  }, [removeFromCart]);

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      return total + ((item.unitPrice || 0) * (item.stockQuantity || 0));
    }, 0).toFixed(2);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setQuantities({});
  }, []);

  return {
    cart,
    quantities,
    handleQuantityChange,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    calculateTotal,
    clearCart
  };
}

export default useCart;
