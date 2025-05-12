"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserNav } from "@/components/user-header"
import { Heart, Trash } from "lucide-react"

// Sample favorite medicines
const favoriteMedicines = [
  {
    id: 1,
    name: "Aspirin",
    description: "Pain reliever and fever reducer",
    category: "Pain Relief",
    dosage: "Take 1-2 tablets every 4-6 hours",
  },
  // ...add more sample favorites
]

export function FavoritesPage() {
  return (
    <div className="container mx-auto max-w-4xl">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold dark:text-white">Favorites</h1>
          <UserNav />
        </div>
      </header>

      <main>
        <div className="space-y-4">
          {favoriteMedicines.length > 0 ? (
            favoriteMedicines.map((medicine) => (
              <Card key={medicine.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{medicine.name}</h3>
                      <p className="text-muted-foreground">{medicine.description}</p>
                      <Badge className="mt-2">{medicine.category}</Badge>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg text-slate-600">No favorites yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
