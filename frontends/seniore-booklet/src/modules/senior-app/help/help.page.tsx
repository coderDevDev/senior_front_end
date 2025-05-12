"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserNav } from "@/components/user-header"
import { Book, Phone } from "lucide-react"

export function HelpPage() {
  return (
    <div className="container mx-auto max-w-4xl">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold dark:text-white">Help & Support</h1>
          <UserNav />
        </div>
      </header>

      <main className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Contact Support</h2>
            </div>
            <p className="text-lg mb-4">Need help? Contact our support team:</p>
            <Button className="w-full mb-2">Call Support</Button>
            <Button variant="outline" className="w-full">Send Email</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Book className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold">User Guide</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold mb-2">How to Use the App</h3>
                <p className="text-slate-600">Step-by-step guide on using the application...</p>
              </div>
              {/* Add more help sections */}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
