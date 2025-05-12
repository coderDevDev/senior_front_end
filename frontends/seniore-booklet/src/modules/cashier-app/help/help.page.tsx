'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserNav } from '@/components/user-header';
import {
  Book,
  Mail,
  Phone,
  ShoppingBag,
  Calculator,
  CreditCard
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
              <h2 className="text-xl font-semibold">Cashier Guide</h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="transactions">
                <AccordionTrigger className="text-lg">
                  Processing Transactions
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4">
                    <div className="flex items-start gap-3">
                      <ShoppingBag className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Managing Orders</h4>
                        <p className="text-muted-foreground">
                          Learn how to add items, apply discounts, and process
                          orders efficiently.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calculator className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Calculating Discounts</h4>
                        <p className="text-muted-foreground">
                          Understand how senior citizen discounts are
                          automatically applied to eligible items.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payments">
                <AccordionTrigger className="text-lg">
                  Payment Processing
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Payment Methods</h4>
                        <p className="text-muted-foreground">
                          Handle different payment methods including cash,
                          cards, and digital payments.
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
                      <li>Contact your supervisor</li>
                      <li>Check the training manual</li>
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
