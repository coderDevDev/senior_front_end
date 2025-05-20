'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-header';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Filter, Receipt, Search, X } from 'lucide-react';
import { useState } from 'react';

// Update the transactions type and sample data
interface Transaction {
  id: number;
  date: string;
  medicines: string[];
  total: string;
  status: 'Completed' | 'Processing';
  referenceNumber: string;
  pharmacy: string;
}

// Sample data for demonstration
const transactions: Transaction[] = [
  {
    id: 1,
    date: '2024-01-15',
    medicines: ['Aspirin', 'Lisinopril'],
    total: '₱180.50',
    status: 'Completed',
    referenceNumber: 'TRX-001',
    pharmacy: 'Mercury Drug Store'
  },
  {
    id: 2,
    date: '2024-01-14',
    medicines: ['Metformin'],
    total: '₱95.75',
    status: 'Processing',
    referenceNumber: 'TRX-002',
    pharmacy: 'South Star Drug'
  },
  {
    id: 3,
    date: '2024-01-13',
    medicines: ['Omeprazole', 'Simvastatin', 'Levothyroxine'],
    total: '₱275.25',
    status: 'Completed',
    referenceNumber: 'TRX-003',
    pharmacy: 'Mercury Drug Store'
  }
];

const statusColors = {
  Completed: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800'
  },
  Processing: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800'
  }
};

export function TransactionHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  // const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "processing">("all")

  // Filter transactions based on search query and status
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      searchQuery
        .toLowerCase()
        .includes(transaction.referenceNumber.toLowerCase()) ||
      transaction.medicines.some(med =>
        med.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      transaction.pharmacy.toLowerCase().includes(searchQuery.toLowerCase());

    // const matchesStatus = statusFilter === "all" ||
    //   transaction.status.toLowerCase() === statusFilter

    return matchesSearch;
  });

  const toggleTransactionDetails = (id: number) => {
    setExpandedTransaction(expandedTransaction === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold dark:text-white">
              Transaction History
            </h1>
            <UserNav />
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
                type="search"
                placeholder="Search transactions..."
                className="pl-14 pr-14 h-16 text-lg rounded-full border-2 border-primary/20 focus:border-primary dark:bg-slate-800 dark:border-blue-900/50 dark:focus:border-blue-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full"
                  onClick={() => setSearchQuery('')}>
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-center mt-3">
              <Button
                variant="outline"
                className="rounded-full px-4 flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </motion.div>
        </header>

        {/* Main Content */}
        <main>
          {/* Transactions List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}>
                    <Card className="overflow-hidden border-2 dark:border-slate-700 dark:bg-slate-800">
                      <CardContent className="p-0">
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() =>
                            toggleTransactionDetails(transaction.id)
                          }
                          role="button"
                          tabIndex={0}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-bold dark:text-white">
                                {transaction.referenceNumber}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  transaction.date
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${
                                statusColors[
                                  transaction.status as keyof typeof statusColors
                                ].bg
                              } 
                                ${
                                  statusColors[
                                    transaction.status as keyof typeof statusColors
                                  ].text
                                }
                                ${
                                  statusColors[
                                    transaction.status as keyof typeof statusColors
                                  ].border
                                }`}>
                              {transaction.status}
                            </Badge>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-5 w-5 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {transaction.medicines.length} items
                              </span>
                            </div>
                            <span className="font-bold dark:text-white">
                              {transaction.total}
                            </span>
                          </div>

                          {expandedTransaction === transaction.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t dark:border-slate-700">
                              <h4 className="font-semibold mb-2 dark:text-white">
                                Medicines:
                              </h4>
                              <ul className="space-y-2">
                                {transaction.medicines.map((medicine, idx) => (
                                  <li
                                    key={idx}
                                    className="text-muted-foreground">
                                    • {medicine}
                                  </li>
                                ))}
                              </ul>
                              <p className="mt-4 text-muted-foreground">
                                Pharmacy: {transaction.pharmacy}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    No transactions foundss
                  </p>
                  {searchQuery && (
                    <Button className="mt-4" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Spacer for bottom navigation */}
        <div className="h-24"></div>
      </div>
    </div>
  );
}
