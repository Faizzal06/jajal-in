import { supabase } from '../lib/supabase';
import { uploadBase64ToStorage } from './storageService';

const logAdminAction = async (
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>
) => {
  await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details: details || null,
  });
};

export const getDashboardStats = async () => {
  const [
    usersResult,
    pendingPlacesResult,
    approvedPlacesResult,
    rejectedPlacesResult,
    reviewsResult,
    merchantsResult,
    pendingPaymentsResult,
    recentLogResult,
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('type', 'merchant'),
    supabase.from('ad_payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('admin_audit_log')
      .select('*, users!admin_audit_log_admin_id_fkey(name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return {
    totalUsers: usersResult.count || 0,
    places: {
      pending: pendingPlacesResult.count || 0,
      approved: approvedPlacesResult.count || 0,
      rejected: rejectedPlacesResult.count || 0,
    },
    totalReviews: reviewsResult.count || 0,
    totalMerchants: merchantsResult.count || 0,
    pendingPayments: pendingPaymentsResult.count || 0,
    recentActivity: recentLogResult.data || [],
  };
};

export const getAdminPlaces = async (filters: {
  status?: string;
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('places')
    .select('*, regions(name, slug), categories(name, icon)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.type) query = query.eq('type', filters.type);
  if (filters.search) query = query.ilike('name', `%${filters.search}%`);

  const { data, count, error } = await query;

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  return { data: data || [], total: count || 0 };
};

export const getAdminPlaceById = async (id: string) => {
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      regions(name, slug),
      categories(name, icon, applicable_to),
      place_media(url, media_type, caption),
      place_highlights(id, title, description, icon),
      products(id, name, price, description, image_url),
      reviews(id, rating, text, is_tip, created_at, users(name, avatar_url))
    `)
    .eq('id', id)
    .single();

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  return data;
};

export const updatePlaceStatus = async (id: string, status: string, adminId: string) => {
  const { data: oldPlace } = await supabase.from('places').select('status').eq('id', id).single();

  const { data, error } = await supabase
    .from('places')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  const action = status === 'approved' ? 'approve_place' : 'reject_place';
  await logAdminAction(adminId, action, 'place', id, {
    old_status: oldPlace?.status,
    new_status: status,
  });

  return data;
};

export const updatePlace = async (
  id: string,
  updateData: {
    name?: string;
    description?: string;
    status?: string;
    category_id?: string;
    region_id?: string;
    lat?: number;
    lng?: number;
    media?: string[];
    highlights?: { title: string; description: string; icon?: string }[];
  },
  adminId: string
) => {
  const { name, description, status, category_id, region_id, lat, lng, media, highlights } = updateData;

  const fieldsToUpdate: Record<string, any> = {};
  if (name !== undefined) fieldsToUpdate.name = name;
  if (description !== undefined) fieldsToUpdate.description = description;
  if (status !== undefined) fieldsToUpdate.status = status;
  if (category_id !== undefined) fieldsToUpdate.category_id = category_id;
  if (region_id !== undefined) fieldsToUpdate.region_id = region_id;
  if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
    fieldsToUpdate.location = `POINT(${lng} ${lat})`;
  }

  const { data: oldPlace } = await supabase.from('places').select('*').eq('id', id).single();

  let data = oldPlace;
  if (Object.keys(fieldsToUpdate).length > 0) {
    const { data: updatedData, error } = await supabase
      .from('places')
      .update(fieldsToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const err: any = new Error(error.message);
      err.code = error.code;
      throw err;
    }
    data = updatedData;
  }

  // Handle Highlights update
  if (highlights !== undefined) {
    await supabase.from('place_highlights').delete().eq('place_id', id);
    const validHighlights = highlights
      .filter((h) => h && h.title && h.title.trim() !== '')
      .map((h) => ({
        place_id: id,
        title: h.title.trim(),
        description: h.description ? h.description.trim() : '',
        icon: h.icon || 'landscape',
      }));

    if (validHighlights.length > 0) {
      await supabase.from('place_highlights').insert(validHighlights);
    }
  }

  // Handle new media upload if base64 provided
  if (media !== undefined && media.length > 0) {
    const base64Media = media.filter((m) => m.startsWith('data:image'));
    if (base64Media.length > 0) {
      const uploadedUrls = await Promise.all(
        base64Media.map((item) => uploadBase64ToStorage(item, 'place-media', 'admin'))
      );

      const mediaRecords = uploadedUrls.map((url) => ({
        place_id: id,
        media_type: 'image',
        url,
      }));

      await supabase.from('place_media').insert(mediaRecords);
    }
  }

  await logAdminAction(adminId, 'edit_place', 'place', id, {
    old: oldPlace,
    new: updateData,
  });

  return data;
};

export const deletePlace = async (id: string, adminId: string) => {
  const { error } = await supabase
    .from('places')
    .update({ status: 'deleted' })
    .eq('id', id);

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  await logAdminAction(adminId, 'delete_place', 'place', id);
};

export const getAdminUsers = async (filters: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('users')
    .select('*, regions(name, slug), levels(number, name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.role) query = query.eq('role', filters.role);
  if (filters.search) query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);

  const { data, count, error } = await query;

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  return { data: data || [], total: count || 0 };
};

export const getAdminUserById = async (id: string) => {
  const [userResult, placesCountResult, reviewsCountResult] = await Promise.all([
    supabase
      .from('users')
      .select('*, regions(name, slug), levels(number, name)')
      .eq('id', id)
      .single(),
    supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', id)
      .eq('status', 'approved'),
    supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id),
  ]);

  if (userResult.error) {
    const err: any = new Error(userResult.error.message);
    err.code = userResult.error.code;
    throw err;
  }

  return {
    ...userResult.data,
    approved_places_count: placesCountResult.count || 0,
    reviews_count: reviewsCountResult.count || 0,
  };
};

export const updateUserRole = async (id: string, role: string, adminId: string) => {
  const { data: oldUser } = await supabase.from('users').select('role').eq('id', id).single();

  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  await logAdminAction(adminId, 'change_role', 'user', id, {
    old_role: oldUser?.role,
    new_role: role,
  });

  return data;
};

export const banUser = async (id: string, reason: string, adminId: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ banned_at: new Date().toISOString(), ban_reason: reason })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  await logAdminAction(adminId, 'ban_user', 'user', id, { reason });

  return data;
};

export const unbanUser = async (id: string, adminId: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ banned_at: null, ban_reason: null })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  await logAdminAction(adminId, 'unban_user', 'user', id);

  return data;
};

export const getAdminMerchants = async (filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('places')
    .select('*, regions(name, slug), categories(name, icon), users!places_owner_id_fkey(name, email)', { count: 'exact' })
    .eq('type', 'merchant')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.search) query = query.ilike('name', `%${filters.search}%`);

  const { data, count, error } = await query;

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  return { data: data || [], total: count || 0 };
};

export const approveMerchant = async (id: string, adminId: string) => {
  const { data, error } = await supabase
    .from('places')
    .update({ status: 'active' })
    .eq('id', id)
    .eq('type', 'merchant')
    .select()
    .single();

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  await supabase
    .from('ad_payments')
    .update({ status: 'approved' })
    .eq('place_id', id)
    .eq('status', 'pending');

  await logAdminAction(adminId, 'approve_merchant', 'merchant', id);

  return data;
};

export const rejectMerchant = async (id: string, adminId: string) => {
  const { data, error } = await supabase
    .from('places')
    .update({ status: 'rejected' })
    .eq('id', id)
    .eq('type', 'merchant')
    .select()
    .single();

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  await logAdminAction(adminId, 'reject_merchant', 'merchant', id);

  return data;
};

export const getAdminContributions = async (filters: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('reviews')
    .select('*, places(name, slug), users(name, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.search) query = query.ilike('text', `%${filters.search}%`);

  const { data, count, error } = await query;

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  return { data: data || [], total: count || 0 };
};

export const deleteContribution = async (id: string, adminId: string) => {
  const { error } = await supabase.from('reviews').delete().eq('id', id);

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  await logAdminAction(adminId, 'delete_contribution', 'contribution', id);
};

export const getAuditLog = async (filters: {
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('admin_audit_log')
    .select('*, users!admin_audit_log_admin_id_fkey(name, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  return { data: data || [], total: count || 0 };
};
