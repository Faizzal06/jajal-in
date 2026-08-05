import cron from 'node-cron';
import { supabase } from '../lib/supabase';

export const checkAdExpiration = async () => {
  console.log('[CRON] Menjalankan pengecekan ads kadaluwarsa...');
  const { error } = await supabase
    .from('places')
    .update({ is_sponsored: false, sponsored_until: null })
    .eq('is_sponsored', true)
    .lt('sponsored_until', new Date().toISOString());

  if (error) {
    console.error('[CRON] Gagal update ads:', error.message);
  } else {
    console.log('[CRON] Pengecekan selesai.');
  }
};

export const initAdExpirationCron = () => {
  // Jalan setiap jam 00:00 (Midnight)
  cron.schedule('0 0 * * *', checkAdExpiration);
};
