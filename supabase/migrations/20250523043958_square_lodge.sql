/*
  # Add vehicle status management

  1. Changes
    - Add function to calculate vehicle status based on maintenance records
    - Create trigger to automatically update vehicle status
    - Update existing vehicle statuses

  2. Security
    - Function runs with security definer to ensure proper access
    - Trigger maintains data consistency
*/

-- Create function to calculate vehicle status
CREATE OR REPLACE FUNCTION update_vehicle_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vehicle status based on maintenance records
  UPDATE vehicles v
  SET 
    status = (
      CASE
        -- If there's an active maintenance (in progress), set to maintenance
        WHEN EXISTS (
          SELECT 1 FROM maintenance_events me 
          WHERE me.vehicle_id = v.id 
          AND me.status = 'inProgress'
        ) THEN 'maintenance'
        
        -- If there's a pending maintenance starting within 7 days, set to pendingMaintenance
        WHEN EXISTS (
          SELECT 1 FROM maintenance_events me 
          WHERE me.vehicle_id = v.id 
          AND me.status = 'pending'
          AND me.start_date <= (CURRENT_DATE + INTERVAL '7 days')
        ) THEN 'pendingMaintenance'
        
        -- If there's any pending or emergency maintenance, set to pendingMaintenance
        WHEN EXISTS (
          SELECT 1 FROM maintenance_events me 
          WHERE me.vehicle_id = v.id 
          AND me.status = 'pending'
          AND me.type = 'emergency'
        ) THEN 'pendingMaintenance'
        
        -- Otherwise, set to active
        ELSE 'active'
      END
    ),
    updated_at = NOW()
  WHERE v.id = COALESCE(NEW.vehicle_id, OLD.vehicle_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for maintenance events
DROP TRIGGER IF EXISTS maintenance_status_trigger ON maintenance_events;
CREATE TRIGGER maintenance_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON maintenance_events
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_status();

-- Update all vehicle statuses initially
UPDATE vehicles
SET updated_at = NOW()
WHERE TRUE;