'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-header';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Receipt, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';
import useCurrentUser from '@/modules/authentication/hooks/useCurrentUser';
import { Spinner } from '@/components/spinner';

export function TransactionHistoryPage() {
  const { user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(
    null
  );

  console.log({ user });
  // Fetch orders for the current senior citizen user
  const { data: orders, isLoading } = useQuery({
    queryKey: ['senior-orders', user?.id],
    queryFn: async () => {
      // query from senior_citizens table
      const { data: seniorData, error: seniorError } = await supabase
        .from('senior_citizens')
        .select('*')
        .eq('user_uid', user?.id || '')
        .single();

      console.log({ seniorData, user });

      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            *,
            medicine (
              *,
              pharmacy (
                name
              )
            )
          )
        `
        )
        .eq('senior_id', seniorData?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id // Only run query when user ID is available
  });

  // Filter orders based on search query
  const filteredOrders = orders?.filter(order => {
    if (!searchQuery) return true;

    // Search by order ID
    if (order.id.toLowerCase().includes(searchQuery.toLowerCase())) return true;

    // Search by medicine names
    if (
      order.order_items?.some(
        item =>
          item.medicine?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.medicine?.genericName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    )
      return true;

    // Search by pharmacy name
    if (order.pharmacy?.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return true;

    return false;
  });

  const toggleTransactionDetails = (id: number) => {
    setExpandedTransaction(expandedTransaction === id ? null : id);
  };

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

  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold dark:text-white">
            Transaction History
          </h1>
          <UserNav />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery('')}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      <main>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}>
                    <Card
                      className="overflow-hidden dark:bg-slate-800 dark:border-slate-700"
                      onClick={() => toggleTransactionDetails(order.id)}>
                      <CardContent className="p-4">
                        <div className="space-y-3 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold dark:text-white">
                                Order #{order.id}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  order.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${
                                statusColors[
                                  order.status === 'completed'
                                    ? 'Completed'
                                    : 'Processing'
                                ].bg
                              } 
                                ${
                                  statusColors[
                                    order.status === 'completed'
                                      ? 'Completed'
                                      : 'Processing'
                                  ].text
                                }
                                ${
                                  statusColors[
                                    order.status === 'completed'
                                      ? 'Completed'
                                      : 'Processing'
                                  ].border
                                }`}>
                              {order.status === 'completed'
                                ? 'Completed'
                                : 'Processing'}
                            </Badge>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-5 w-5 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {order.order_items?.length || 0} items
                              </span>
                            </div>
                            <span className="font-bold dark:text-white">
                              ₱{order.discounted_amount.toFixed(2)}
                            </span>
                          </div>

                          {expandedTransaction === order.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t dark:border-slate-700">
                              <h4 className="font-semibold mb-2 dark:text-white">
                                Medicines:
                              </h4>
                              <ul className="space-y-2">
                                {order.order_items?.map(item => (
                                  <li
                                    key={item.id}
                                    className="text-muted-foreground">
                                    • {item.medicine?.name} ({item.quantity} x ₱
                                    {item.unit_price.toFixed(2)})
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-4 grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Subtotal:
                                  </p>
                                  <p className="font-medium dark:text-white">
                                    ₱{order.total_amount.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Discount:
                                  </p>
                                  <p className="font-medium text-green-600">
                                    ₱
                                    {(
                                      order.total_amount -
                                      order.discounted_amount
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <p className="mt-4 text-muted-foreground">
                                Pharmacy:{' '}
                                {order.order_items?.[0]?.medicine?.pharmacy
                                  ?.name || 'Unknown Pharmacy'}
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
                    No transactions found
                  </p>
                  {searchQuery && (
                    <Button className="mt-4" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Spacer for bottom navigation */}
      <div className="h-24"></div>
    </div>
  );
}
