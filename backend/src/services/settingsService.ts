import { supabase } from '../lib/supabase';
import { uploadBase64ToStorage } from './storageService';

export interface HeroSettings {
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
}

const DEFAULT_HERO_SETTINGS: HeroSettings = {
  hero_badge: 'Vivid Explorer Mode',
  hero_title: 'Radar UMKM',
  hero_subtitle: 'Temukan permata tersembunyi dan produk lokal terbaik di sekitarmu dengan presisi tinggi.',
  hero_image_url: '',
};

export const getHeroSettings = async (): Promise<HeroSettings> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['hero_badge', 'hero_title', 'hero_subtitle', 'hero_image_url']);

  if (error || !data || data.length === 0) {
    return { ...DEFAULT_HERO_SETTINGS };
  }

  const settingsMap: Record<string, string> = {};
  data.forEach((row) => {
    settingsMap[row.key] = row.value;
  });

  return {
    hero_badge: settingsMap.hero_badge ?? DEFAULT_HERO_SETTINGS.hero_badge,
    hero_title: settingsMap.hero_title ?? DEFAULT_HERO_SETTINGS.hero_title,
    hero_subtitle: settingsMap.hero_subtitle ?? DEFAULT_HERO_SETTINGS.hero_subtitle,
    hero_image_url: settingsMap.hero_image_url ?? DEFAULT_HERO_SETTINGS.hero_image_url,
  };
};

export const updateHeroSettings = async (
  adminId: string,
  payload: Partial<HeroSettings>
): Promise<HeroSettings> => {
  let imageUrl = payload.hero_image_url;
  if (imageUrl && imageUrl.startsWith('data:')) {
    imageUrl = await uploadBase64ToStorage(imageUrl, 'place-media', 'hero');
  }

  const updates: Array<{ key: string; value: string; updated_by: string; updated_at: string }> = [];
  const now = new Date().toISOString();

  if (payload.hero_badge !== undefined) {
    updates.push({ key: 'hero_badge', value: payload.hero_badge, updated_by: adminId, updated_at: now });
  }
  if (payload.hero_title !== undefined) {
    updates.push({ key: 'hero_title', value: payload.hero_title, updated_by: adminId, updated_at: now });
  }
  if (payload.hero_subtitle !== undefined) {
    updates.push({ key: 'hero_subtitle', value: payload.hero_subtitle, updated_by: adminId, updated_at: now });
  }
  if (imageUrl !== undefined) {
    updates.push({ key: 'hero_image_url', value: imageUrl, updated_by: adminId, updated_at: now });
  }

  if (updates.length > 0) {
    const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' });
    if (error) {
      throw new Error(`Failed to update hero settings: ${error.message}`);
    }

    await supabase.from('admin_audit_log').insert({
      admin_id: adminId,
      action: 'update_hero_settings',
      target_type: 'settings',
      target_id: 'hero',
      details: {
        hero_badge: payload.hero_badge,
        hero_title: payload.hero_title,
        hero_subtitle: payload.hero_subtitle,
        hero_image_url: imageUrl,
      },
    });
  }

  return getHeroSettings();
};
