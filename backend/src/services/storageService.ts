import { supabase } from '../lib/supabase';

/**
 * Uploads a Base64 data URL to a Supabase Storage Bucket, or returns the input URL unchanged if it's already an HTTP/HTTPS link or empty.
 *
 * @param input Base64 data URL, HTTP/HTTPS URL, or empty string
 * @param bucketName Supabase storage bucket name (e.g. 'contributions', 'merchants', 'avatars')
 * @param pathPrefix Folder prefix inside the bucket (defaults to 'general')
 * @returns Public URL of the uploaded object or the original URL
 */
export async function uploadBase64ToStorage(
  input: string,
  bucketName: string,
  pathPrefix: string = 'general'
): Promise<string> {
  if (!input || typeof input !== 'string') {
    return input;
  }

  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input;
  }

  if (!input.startsWith('data:')) {
    return input;
  }

  const matches = input.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    return input;
  }

  const contentType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  const extParts = contentType ? contentType.split('/') : [];
  const ext = extParts[1] ? extParts[1].toLowerCase() : 'jpg';

  const randomStr = Math.random().toString(36).substring(2, 8);
  const filename = `${Date.now()}-${randomStr}.${ext}`;
  const filePath = `${pathPrefix}/${filename}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload image to storage bucket: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}
