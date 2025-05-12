/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from "@/shared/supabase";
import IMedicine from "../admin/medicines/medicine.interface";

// Order types
export interface OrderItem {
  id?: string;
  order_id?: string;
  medicine_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_applied?: boolean;
  created_at?: string;
  medicine?: IMedicine;
}

export interface Order {
  id?: string;
  senior_id?: string | null;
  total_amount: number;
  discounted_amount?: number | null;
  discount_percentage?: number | null;
  discount_type?: string | null;
  has_discount: boolean;
  note?: string | null;
  status?: string;
  cashier_id?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

// Input for creating an order
export interface CreateOrderInput {
  items: Array<{
    medicineId: string;
    stockQuantity: number;
    unitPrice: number | string;
  }>;
  totalAmount: string | number;
  note?: string;
  seniorId?: string | null;
}

// Philippine senior citizen discount constants
const SENIOR_DISCOUNT_PERCENTAGE = 20; // 20% discount
// const SENIOR_VAT_EXEMPTION = 12; // 12% VAT exemption

export class OrderService {

   /**
   * Convert any value to a number with validation
   */
   private toNumber(value: any, defaultValue: number = 0): number {
    if (value === null || value === undefined) return defaultValue;
    
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) ? defaultValue : num;
  }


  /**
   * Create a new order
   */
   async createOrder(orderDataPayload: any): Promise<Order> {
    try {
      const { items, totalAmount, note, seniorId } = orderDataPayload;
      
      // Validate input
      if (!items || items.length === 0) {
        throw new Error('Order must have at least one item');
      }
      
      // Get the user ID (cashier)
      const { data: { user } } = await supabase.auth.getUser();
      const cashierId = user?.id;
      
      // Calculate senior citizen discount if applicable
      const hasDiscount = !!seniorId;
      const discountPercentage = hasDiscount ? SENIOR_DISCOUNT_PERCENTAGE : 0;
      const baseAmount = this.toNumber(totalAmount);
      
      // Get the discount amount and final price
      const discountAmount = hasDiscount ? (baseAmount * discountPercentage / 100) : 0;
      const discountedAmount = hasDiscount ? baseAmount - discountAmount : baseAmount;
      
      // Create the order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          senior_id: seniorId,
          total_amount: baseAmount,
          discounted_amount: discountedAmount,
          discount_percentage: discountPercentage,
          discount_type: hasDiscount ? 'Senior Citizen' : null,
          has_discount: hasDiscount,
          note: note || null,
          cashier_id: cashierId,
          status: 'completed'
        })
        .select()
        .single();
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }
      
      if (!orderData) {
        throw new Error('Failed to create order: No data returned');
      }
      
      // Process order items with proper number conversion
      const orderItems = items.map((item: any) => {
        const quantity = this.toNumber(item.stockQuantity, 1);
        const unitPrice = this.toNumber(item.unitPrice);
        
        return {
          order_id: orderData.id,
          medicine_id: item.medicineId,
          quantity: quantity,
          unit_price: unitPrice,
          total_price: unitPrice * quantity,
          discount_applied: hasDiscount
        };
      });
      
      // Insert order items
      const { data: orderItemsData, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();
      
      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }
      
      // Update medicine stock quantities with proper validation and error handling
      for (const item of items) {
        try {
          // First, fetch the current medicine to get current stock
          const { data: medicine, error: fetchError } = await supabase
            .from('medicine')
            .select('stockQuantity, medicineId')
            .eq('medicineId', item.medicineId)
            .single();
          
          if (fetchError) {
            throw new Error(`Error fetching medicine: ${fetchError.message}`);
          }
          
          if (!medicine) {
            throw new Error(`Medicine with ID ${item.medicineId} not found`);
          }
          
          // Convert quantities to numbers with validation
          const currentStock = this.toNumber(medicine.stockQuantity, 0);
          const orderQuantity = this.toNumber(item.stockQuantity, 0);
          
          // Calculate new stock with validation
          const newStock = Math.max(0, currentStock - orderQuantity); // Prevent negative stock
          
          // Update with the calculated value
          const { error: updateError } = await supabase
            .from('medicine')
            .update({ stockQuantity: newStock })
            .eq('medicineId', item.medicineId);
          
          if (updateError) {
            throw new Error(`Error updating stock: ${updateError.message}`);
          }
          
          console.log(`Updated stock for medicine ${item.medicineId}: ${currentStock} -> ${newStock}`);
        } catch (error) {
          console.error(`Error updating stock for medicine ${item.medicineId}:`, error);
          // Continue processing other items even if one fails
        }
      }
      
      // Return combined order with items
      return {
        ...orderData,
        items: orderItemsData as OrderItem[]
      };
    } catch (error) {
      console.error('OrderService createOrder error:', error);
      throw error;
    }
  }
  
  
  /**
   * Get orders with optional filtering and pagination
   */
  async getOrders(options: {
    limit?: number;
    offset?: number;
    seniorId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{ data: Order[]; count: number }> {
    try {
      const { limit = 10, offset = 0, seniorId, startDate, endDate } = options;
      
      // Build query
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            medicine:medicine(
              medicineId, 
              genericName, 
              brandName, 
              strength, 
              dosageForm, 
              unitPrice
            )
          )
        `, { count: 'exact' });
      
      // Apply filters
      if (seniorId) {
        query = query.eq('senior_id', seniorId);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }
      
      return {
        data: data || [],
        count: count || 0
      };
    } catch (error) {
      console.error('OrderService getOrders error:', error);
      throw error;
    }
  }
  
  /**
   * Get a single order by ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            medicine:medicine(
              medicineId, 
              genericName, 
              brandName, 
              strength, 
              dosageForm, 
              unitPrice,
              description,
              medicineImage
            )
          ),
          senior:senior_citizens(*)
        `)
        .eq('id', orderId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Order not found
        }
        throw new Error(`Failed to fetch order: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('OrderService getOrderById error:', error);
      throw error;
    }
  }
  
  /**
   * Calculate senior citizen discount for a given amount
   */
  calculateSeniorDiscount(amount: number): {
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    discountPercentage: number;
  } {
    const discountAmount = amount * (SENIOR_DISCOUNT_PERCENTAGE / 100);
    const finalAmount = amount - discountAmount;
    
    return {
      originalAmount: amount,
      discountAmount,
      finalAmount,
      discountPercentage: SENIOR_DISCOUNT_PERCENTAGE
    };
  }
}

export default new OrderService();
