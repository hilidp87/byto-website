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
