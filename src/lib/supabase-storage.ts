import { createClient } from "@supabase/supabase-js";

const BUCKET = "lokyo-images";

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function uploadToSupabase(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const supabase = getClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`uploads/${filename}`, buffer, { contentType, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(`uploads/${filename}`);

  return data.publicUrl;
}

/** Upload to a specific path (upsert — overwrites if exists). Used for outfit crops. */
export async function uploadToSupabasePath(
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const supabase = getClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
