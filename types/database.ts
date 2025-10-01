export type UserType = 'customer' | 'provider' | 'admin';

export type ServiceGroup = 'home_office' | 'vehicle' | 'tender';

export type ServiceStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export type Profile = {
  id: string;
  user_type: UserType;
  full_name: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  site_name?: string;
  block?: string;
  floor_apartment: string;
  created_at: string;
  updated_at: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
  group_type: ServiceGroup;
  icon: string;
  created_at: string;
};

export type ServiceProvider = {
  id: string;
  user_id: string;
  company_name: string;
  tax_number: string;
  service_categories: string[];
  rating: number;
  total_services: number;
  is_active: boolean;
  created_at: string;
};

export type Address = {
  city: string;
  district: string;
  neighborhood: string;
  site_name?: string;
  block?: string;
  floor_apartment: string;
  full_address?: string;
};

export type ServiceRequest = {
  id: string;
  tracking_number: string;
  customer_id: string;
  provider_id?: string;
  category_id: string;
  service_group: ServiceGroup;
  description: string;
  appointment_date: string;
  status: ServiceStatus;
  address: Address;
  created_at: string;
  updated_at: string;
};

export type ServicePayment = {
  id: string;
  request_id: string;
  service_fee: number;
  labor_cost: number;
  material_cost: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
  paid_at?: string;
  created_at: string;
};

export type ServiceReview = {
  id: string;
  request_id: string;
  customer_id: string;
  quality_rating: number;
  speed_rating: number;
  comment?: string;
  created_at: string;
};
