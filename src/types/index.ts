export interface Category {
  id: number;
  name: string;
  icon?: string; // Tornar opcional, pois será substituído por image_url
  image_url?: string; // Novo campo
  order: number;
  created_at?: string;
}

export interface Brand {
  id: number;
  name: string;
  category_id: number;
  image_url?: string; // Novo campo
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  brand_id: number;
  category_id: number;
  stock_quantity: number;
  is_available: boolean;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_method?: string;
  payment_type?: string;
  payment_status?: string;
  change_needed?: number;
  created_at: string;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  logo_url: string;
  whatsapp_number: string;
  address: string;
  pix_key: string;
  created_at?: string;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'super_admin';
  created_at?: string;
}