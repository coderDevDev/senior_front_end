import { createContext, ReactNode, useContext, useState } from 'react'

interface Medicine {
  id: string
  name: string
  unitPrice: number
  stockQuantity: number
}

interface BagContextType {
  items: Medicine[]
  addItem: (medicine: Medicine) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, newQuantity: number) => void
  clearBag: () => void
  totalAmount: number
}

const BagContext = createContext<BagContextType | undefined>(undefined)

export function BagProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Medicine[]>([])

  const addItem = (medicine: Medicine) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === medicine.id)
      if (existingItem) {
        return prev.map(item =>
          item.id === medicine.id
            ? { ...item, stockQuantity: item.stockQuantity + medicine.stockQuantity }
            : item
        )
      }
      return [...prev, medicine]
    })
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, stockQuantity: newQuantity } 
          : item
      )
    )
  }

  const clearBag = () => {
    setItems([])
  }

  const totalAmount = items.reduce((total, item) => total + (item.unitPrice * item.stockQuantity), 0)

  return (
    <BagContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearBag, totalAmount }}>
      {children}
    </BagContext.Provider>
  )
}

export const useBag = () => {
  const context = useContext(BagContext)
  if (!context) throw new Error('useBag must be used within a BagProvider')
  return context
}
