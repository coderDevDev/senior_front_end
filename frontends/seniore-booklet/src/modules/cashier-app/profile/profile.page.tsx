 
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, User } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function ProfilePage() {
  // const [_, setIsRegistering] = useState(false)
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  // const [step, setStep] = useState(1)
  // const totalSteps = 4
  const [isWebsiteLoaded, setIsWebsiteLoaded] = useState<boolean>(false)
  const fingerprintWebsiteUrl = "https://fingerprint-iota.vercel.app/"

  interface VerificationMessage {
    status: "success" | "error";
    message: string;
    timestamp: string;
  }

  // const handleFingerprintRegistration = async () => {
  //   setIsRegistering(true)
  //   try {
  //     if (step < totalSteps) {
  //       await new Promise(resolve => setTimeout(resolve, 1500))
  //       setStep(prev => prev + 1)
  //       if (step === totalSteps - 1) {
  //         await new Promise(resolve => setTimeout(resolve, 1500))
  //         setFingerprint("fingerprint_data")
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Fingerprint registration failed:", error)
  //   } finally {
  //     setIsRegistering(false)
  //   }
  // }

  // Function to handle messages from the iframe
  const handleMessage = (event: MessageEvent) => {
    if (event.origin === "https://fingerprint-iota.vercel.app") {
      const data = event.data as VerificationMessage;
      
      if (data.status === "success") {
        toast.success("Fingerprint verification successful!")
        setFingerprint("fingerprint_data")
      } else if (data.status === "error") {
        toast.error("Fingerprint verification failed. Please try again.")
      }
    }
  }

  const handleIframeLoad = () => {
    setIsWebsiteLoaded(true)
  }

  useEffect(() => {
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  return (
    <div className="container mx-auto max-w-4xl">
      <header className="mb-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-primary">
              <User className="h-16 w-16 text-primary" />
            </div>
            <Button 
              size="sm" 
              className="absolute bottom-0 right-0 rounded-full"
            >
              Change
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold dark:text-blue mb-1">Juan Dela Cruz</h1>
            <p className="text-lg text-muted-foreground">Senior Citizen ID: SC-123456</p>
          </div>
        </div>
      </header>

      <main className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Juan Dela Cruz" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="juan.delacruz@email.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+63 912 345 6789" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Main Street, Barangay Sample, City" />
              </div>

              <Button size="lg">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Fingerprint Registration</h2>
            {!fingerprint ? (
              <div className="space-y-6">
                <div className="relative w-full bg-gray-50 rounded mb-6">
                  {!isWebsiteLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  <iframe 
                    src={fingerprintWebsiteUrl}
                    className="w-full h-96 border-0 rounded"
                    title="Fingerprint Verification"
                    onLoad={handleIframeLoad}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  />
                </div>
                <p className="text-center text-slate-600">
                  Please complete the fingerprint verification process above
                </p>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <p className="text-green-600 dark:text-green-400">
                  Fingerprint registered successfully!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
