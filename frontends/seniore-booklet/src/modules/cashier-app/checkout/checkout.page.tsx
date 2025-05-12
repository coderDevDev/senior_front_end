import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useBag } from "@/context/bag-context"
import { cn } from "@/lib/utils"
import IMedicine from "@/modules/admin/medicines/medicine.interface"
import { MinusCircle, PlusCircle, ShoppingBag } from "lucide-react"
import { useState } from "react"
import useMedicines from "../hooks/useMedicines"

export function CheckoutPage() {
  const { items, totalAmount,  removeItem } = useBag()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isWebsiteLoaded, setIsWebsiteLoaded] = useState(false)
  const fingerprintWebsiteUrl = "https://fingerprint-iota.vercel.app/"
  const { data: medicinesData } = useMedicines()
  
  const medicines = medicinesData?.data?.data?.medicines || []

  // Find full medicine details for each bag item
  const itemsWithDetails = items.map(item => ({
    ...item,
    details: medicines.find((m: IMedicine) => m.medicineId === item.id)
  }))

  // const handleVerificationSuccess = () => {
  //   // Add to transaction history
  //   const newTransaction = {
  //     id: Date.now(),
  //     date: new Date().toISOString(),
  //     medicines: items.map(item => item.name),
  //     total: `₱${totalAmount.toFixed(2)}`,
  //     status: "Completed",
  //     referenceNumber: `TRX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  //     pharmacy: "Sample Pharmacy"
  //   }

  //   console.log(newTransaction)
    
  //   // Save to transaction history (you'll need to implement this)
  //   // saveTransaction(newTransaction)
    
  //   clearBag()
  //   toast.success("Payment successful!")
  //   navigate("/transactions")
  // }

  const handleQuantityChange = (id: string, delta: number) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    if (item.stockQuantity + delta <= 0) {
      removeItem(id)
      return
    }

    // Update stockQuantity logic here
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Shopping Bag</h1>

      {itemsWithDetails.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img
                  src={item.details?.medicineImageUrl || "/placeholder.svg"}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>
              
              <div className="flex-grow space-y-2">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.details?.description}
                    </p>
                  </div>
                  <p className="font-semibold">₱{item.unitPrice * item.stockQuantity}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-full p-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      <MinusCircle className="h-5 w-5" />
                    </Button>
                    <span className="w-8 text-center">{item.stockQuantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </div>

                  {item.details && (
                    <Badge variant="outline" className={cn(
                      "px-3 py-1",
                      item.details.stockQuantity < 10 
                        ? "bg-orange-50 text-orange-700 border-orange-200" 
                        : "bg-green-50 text-green-700 border-green-200"
                    )}>
                      {item.details.stockQuantity} in stock
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Brand: {item.details?.brandName}</p>
                  <p>Generic: {item.details?.genericName}</p>
                  <p>Strength: {item.details?.strength}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Amount</h3>
            <p className="text-lg font-bold">₱{totalAmount.toFixed(2)}</p>
          </div>

          {!isVerifying ? (
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setIsVerifying(true)}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Proceed to Payment
            </Button>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Verify Payment</h3>
              <div className="relative w-full bg-gray-50 rounded">
                {!isWebsiteLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                  </div>
                )}
                <iframe 
                  src={fingerprintWebsiteUrl}
                  className="w-full h-96 border-0 rounded"
                  title="Fingerprint Verification"
                  onLoad={() => setIsWebsiteLoaded(true)}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
