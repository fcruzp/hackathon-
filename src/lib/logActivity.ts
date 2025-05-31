import { supabase } from './supabase';

interface LogActivityParams {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
}

export async function logActivity({ userId, action, entity, entityId, description }: LogActivityParams) {
  await supabase.from('activity_logs').insert([
    {
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      description,
    },
  ]);
} 