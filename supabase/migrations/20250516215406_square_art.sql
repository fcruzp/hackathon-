/*
  # Add sample vehicles data

  1. Changes
    - Insert sample vehicles data with valid UUIDs
    - Include a variety of vehicle types and statuses
    - Use realistic data for all fields
    - Use public Pexels images for vehicle photos

  2. Data Overview
    - 5 sample vehicles added:
      - Toyota Camry (Active)
      - Honda CR-V (Maintenance)
      - Ford F-150 (Active)
      - Nissan Altima (Pending Maintenance)
      - Chevrolet Tahoe (Active)
*/

-- Insert sample vehicles
INSERT INTO vehicles (
  id,
  make,
  model,
  year,
  license_plate,
  vin,
  color,
  status,
  institution_id,
  image_url,
  insurance_policy,
  insurance_expiry,
  last_maintenance_date,
  next_maintenance_date,
  mileage,
  odometer_reading,
  purchase_date,
  fuel_type,
  notes,
  created_at,
  updated_at
) VALUES
  -- Toyota Camry - Active
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Toyota',
    'Camry',
    2023,
    'ABC-123',
    '4T1BF1FK5EU835761',
    'Silver',
    'active',
    '6aae9cf9-1532-4332-ae0d-aba69158f41a',
    'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
    'INS-2023-001',
    '2025-12-31',
    '2024-01-15',
    '2024-07-15',
    15000,
    15000,
    '2023-01-15',
    'gasoline',
    'Executive vehicle in excellent condition. Regular maintenance up to date.',
    NOW(),
    NOW()
  ),
  -- Honda CR-V - Maintenance
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Honda',
    'CR-V',
    2022,
    'XYZ-789',
    '5J6RW2H54NL003456',
    'Blue',
    'maintenance',
    '6aae9cf9-1532-4332-ae0d-aba69158f41a',
    'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg',
    'INS-2023-002',
    '2025-11-30',
    '2024-02-01',
    '2024-08-01',
    25000,
    25000,
    '2022-06-15',
    'gasoline',
    'Currently undergoing scheduled maintenance. Brake system inspection.',
    NOW(),
    NOW()
  ),
  -- Ford F-150 - Active
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Ford',
    'F-150',
    2023,
    'DEF-456',
    '1FTEW1EG5JFB12345',
    'Black',
    'active',
    '6aae9cf9-1532-4332-ae0d-aba69158f41a',
    'https://images.pexels.com/photos/2394/lights-clouds-dark-car.jpg',
    'INS-2023-003',
    '2025-10-31',
    '2024-01-30',
    '2024-07-30',
    18000,
    18000,
    '2023-03-15',
    'diesel',
    'Heavy duty vehicle for cargo transport. New tires installed.',
    NOW(),
    NOW()
  ),
  -- Nissan Altima - PendingMaintenance
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    'Nissan',
    'Altima',
    2022,
    'GHI-789',
    '1N4BL4BV8KC123456',
    'White',
    'pendingMaintenance',
    '6aae9cf9-1532-4332-ae0d-aba69158f41a',
    'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg',
    'INS-2023-004',
    '2025-09-30',
    '2023-12-15',
    '2024-06-15',
    30000,
    30000,
    '2022-08-15',
    'gasoline',
    'Due for regular maintenance. Oil change and filter replacement needed.',
    NOW(),
    NOW()
  ),
  -- Chevrolet Tahoe - Active
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    'Chevrolet',
    'Tahoe',
    2023,
    'JKL-012',
    '1GNSKCKC8LR123456',
    'Black',
    'active',
    '6aae9cf9-1532-4332-ae0d-aba69158f41a',
    'https://images.pexels.com/photos/3874337/pexels-photo-3874337.jpeg',
    'INS-2023-005',
    '2025-08-31',
    '2024-02-15',
    '2024-08-15',
    12000,
    12000,
    '2023-04-15',
    'gasoline',
    'Executive SUV with full service history. All maintenance up to date.',
    NOW(),
    NOW()
  );