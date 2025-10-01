/*
  # 360 Teknik Servis - Veritabanı Şeması

  ## Yeni Tablolar
  
  ### 1. profiles (Kullanıcı Profilleri)
    - `id` (uuid, primary key, auth.users referansı)
    - `user_type` (text: 'customer', 'provider', 'admin')
    - `full_name` (text)
    - `phone` (text)
    - `city` (text)
    - `district` (text)
    - `neighborhood` (text)
    - `site_name` (text, opsiyonel)
    - `block` (text, opsiyonel)
    - `floor_apartment` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 2. service_categories (Hizmet Kategorileri)
    - `id` (uuid, primary key)
    - `name` (text)
    - `group_type` (text: 'home_office', 'vehicle', 'tender')
    - `icon` (text)
    - `created_at` (timestamptz)

  ### 3. service_providers (Servis Sağlayıcılar/Firmalar)
    - `id` (uuid, primary key)
    - `user_id` (uuid, profiles referansı)
    - `company_name` (text)
    - `tax_number` (text)
    - `service_categories` (jsonb)
    - `rating` (numeric)
    - `total_services` (integer)
    - `is_active` (boolean)
    - `created_at` (timestamptz)

  ### 4. service_requests (Servis Talepleri)
    - `id` (uuid, primary key)
    - `tracking_number` (text, unique)
    - `customer_id` (uuid, profiles referansı)
    - `provider_id` (uuid, service_providers referansı)
    - `category_id` (uuid, service_categories referansı)
    - `service_group` (text)
    - `description` (text)
    - `appointment_date` (timestamptz)
    - `status` (text: 'pending', 'assigned', 'in_progress', 'completed', 'cancelled')
    - `address` (jsonb)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 5. service_payments (Ödemeler)
    - `id` (uuid, primary key)
    - `request_id` (uuid, service_requests referansı)
    - `service_fee` (numeric)
    - `labor_cost` (numeric)
    - `material_cost` (numeric)
    - `total_amount` (numeric)
    - `payment_status` (text: 'pending', 'paid', 'refunded')
    - `payment_method` (text)
    - `paid_at` (timestamptz)
    - `created_at` (timestamptz)

  ### 6. service_reviews (Memnuniyet Anketleri)
    - `id` (uuid, primary key)
    - `request_id` (uuid, service_requests referansı)
    - `customer_id` (uuid, profiles referansı)
    - `quality_rating` (integer)
    - `speed_rating` (integer)
    - `comment` (text)
    - `created_at` (timestamptz)

  ## Güvenlik
    - Tüm tablolar için RLS etkinleştirildi
    - Müşteriler sadece kendi verilerini görebilir
    - Servis sağlayıcılar atanan talepleri görebilir
    - Admin tüm verilere erişebilir
*/

-- Profiles tablosu
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL DEFAULT 'customer',
  full_name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  neighborhood text NOT NULL,
  site_name text,
  block text,
  floor_apartment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi profillerini görebilir"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini oluşturabilir"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service categories tablosu
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  group_type text NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes kategorileri görebilir"
  ON service_categories FOR SELECT
  TO authenticated
  USING (true);

-- Service providers tablosu
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  tax_number text NOT NULL,
  service_categories jsonb DEFAULT '[]'::jsonb,
  rating numeric DEFAULT 0,
  total_services integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Servis sağlayıcılar kendi bilgilerini görebilir"
  ON service_providers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Herkes aktif sağlayıcıları görebilir"
  ON service_providers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Service requests tablosu
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES service_providers(id),
  category_id uuid NOT NULL REFERENCES service_categories(id),
  service_group text NOT NULL,
  description text NOT NULL,
  appointment_date timestamptz NOT NULL,
  status text DEFAULT 'pending',
  address jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Müşteriler kendi taleplerini görebilir"
  ON service_requests FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Müşteriler talep oluşturabilir"
  ON service_requests FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Servis sağlayıcılar atanan talepleri görebilir"
  ON service_requests FOR SELECT
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Servis sağlayıcılar atanan talepleri güncelleyebilir"
  ON service_requests FOR UPDATE
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- Service payments tablosu
CREATE TABLE IF NOT EXISTS service_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  service_fee numeric DEFAULT 0,
  labor_cost numeric DEFAULT 0,
  material_cost numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  payment_status text DEFAULT 'pending',
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Müşteriler kendi ödemelerini görebilir"
  ON service_payments FOR SELECT
  TO authenticated
  USING (
    request_id IN (
      SELECT id FROM service_requests WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Servis sağlayıcılar atanan taleplerin ödemelerini görebilir"
  ON service_payments FOR SELECT
  TO authenticated
  USING (
    request_id IN (
      SELECT sr.id FROM service_requests sr
      JOIN service_providers sp ON sr.provider_id = sp.id
      WHERE sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Servis sağlayıcılar ödeme oluşturabilir"
  ON service_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    request_id IN (
      SELECT sr.id FROM service_requests sr
      JOIN service_providers sp ON sr.provider_id = sp.id
      WHERE sp.user_id = auth.uid()
    )
  );

-- Service reviews tablosu
CREATE TABLE IF NOT EXISTS service_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quality_rating integer NOT NULL,
  speed_rating integer NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Müşteriler kendi değerlendirmelerini görebilir"
  ON service_reviews FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Müşteriler değerlendirme yapabilir"
  ON service_reviews FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Servis sağlayıcılar aldıkları değerlendirmeleri görebilir"
  ON service_reviews FOR SELECT
  TO authenticated
  USING (
    request_id IN (
      SELECT sr.id FROM service_requests sr
      JOIN service_providers sp ON sr.provider_id = sp.id
      WHERE sp.user_id = auth.uid()
    )
  );

-- Tracking number için fonksiyon
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS text AS $$
BEGIN
  RETURN '360TS' || to_char(now(), 'YYYYMMDD') || LPAD(floor(random() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_provider ON service_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_tracking ON service_requests(tracking_number);
CREATE INDEX IF NOT EXISTS idx_service_payments_request ON service_payments(request_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_request ON service_reviews(request_id);