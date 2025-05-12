'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserNav } from '@/components/user-header';
import {
  Book,
  Mail,
  Phone,
  ShoppingBag,
  User,
  Search,
  Home
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

export function HelpPage() {
  const handleCallSupport = () => {
    window.location.href = 'tel:+639123456789'; // Replace with actual support number
  };

  const handleEmailSupport = () => {
    window.location.href = 'mailto:support@seniore.com'; // Replace with actual support email
  };

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
            <p className="text-lg mb-4">
              Need help? Our support team is available 24/7:
            </p>
            <div className="space-y-3">
              <Button
                className="w-full flex items-center justify-center gap-2"
                onClick={handleCallSupport}>
                <Phone className="h-4 w-4" />
                Call Support (+63 912 345 6789)
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleEmailSupport}>
                <Mail className="h-4 w-4" />
                Send Email (support@seniore.com)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Book className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold">User Guide</h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="getting-started">
                <AccordionTrigger className="text-lg">
                  Getting Started
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4">
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Home Screen</h4>
                        <p className="text-muted-foreground">
                          Browse available medicines and check their details.
                          Use the search bar to find specific medicines.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Profile Management</h4>
                        <p className="text-muted-foreground">
                          Update your personal information and manage your
                          health status in the Profile section.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="searching">
                <AccordionTrigger className="text-lg">
                  Searching for Medicines
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4">
                    <div className="flex items-start gap-3">
                      <Search className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Using Search</h4>
                        <p className="text-muted-foreground">
                          Type medicine names or categories in the search bar.
                          Use filters to narrow down results.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ShoppingBag className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Medicine Details</h4>
                        <p className="text-muted-foreground">
                          Click on any medicine to view detailed information
                          including price, availability, and usage instructions.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="support">
                <AccordionTrigger className="text-lg">
                  Getting Support
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4">
                    <p className="mb-3">If you need assistance, you can:</p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Call our support team 24/7</li>
                      <li>Send us an email</li>
                      <li>Visit our help center</li>
                      <li>Chat with our support team</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
