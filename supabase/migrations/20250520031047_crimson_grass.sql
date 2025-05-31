/*
  # Add sample service providers data

  1. Changes
    - Insert sample service providers with valid UUIDs
    - Include realistic service provider data
    - Add specialties and ratings

  2. Data Overview
    - 2 sample service providers:
      - Quick Service Center (General)
      - Premium Auto Care (Mechanic)
*/

-- Insert sample service providers
INSERT INTO service_providers (
  id,
  name,
  type,
  address,
  city,
  state,
  zip_code,
  contact_person,
  contact_email,
  contact_phone,
  specialties,
  rating,
  is_active,
  created_at,
  updated_at
) VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d484',
    'Quick Service Center',
    'general',
    '123 Main St',
    'Springfield',
    'IL',
    '62701',
    'John Smith',
    'john@quickservice.com',
    '(555) 123-4567',
    ARRAY['Oil Change', 'Brake Service', 'Tire Rotation'],
    4.5,
    true,
    NOW(),
    NOW()
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d485',
    'Premium Auto Care',
    'mechanic',
    '456 Oak Ave',
    'Springfield',
    'IL',
    '62702',
    'Jane Doe',
    'jane@premiumauto.com',
    '(555) 987-6543',
    ARRAY['Engine Repair', 'Transmission', 'Diagnostics'],
    4.8,
    true,
    NOW(),
    NOW()
  );