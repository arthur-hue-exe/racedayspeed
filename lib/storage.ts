import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "product-images";
  if (!url || !key) return null;
  return { url, key, bucket };
}

export function isStorageConfigured(): boolean {
  return supabaseConfig() !== null;
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES[file.type]) {
    throw new Error("Formato não aceito. Envie JPG, PNG, WEBP ou AVIF.");
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("A imagem deve ter no máximo 8 MB.");
  }

  const extension = ALLOWED_TYPES[file.type];
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const config = supabaseConfig();

  if (config) {
    const client = createClient(config.url, config.key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const objectPath = `products/${filename}`;
    const { error } = await client.storage
      .from(config.bucket)
      .upload(objectPath, buffer, { contentType: file.type, upsert: false });
    if (error) {
      throw new Error(`Falha no upload para o Supabase Storage: ${error.message}`);
    }
    const { data } = client.storage.from(config.bucket).getPublicUrl(objectPath);
    return data.publicUrl;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Supabase Storage não está configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para enviar imagens em produção.",
    );
  }

  const directory = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), buffer);
  return `/uploads/${filename}`;
}

export function isAllowedImageUrl(url: string): boolean {
  if (url.startsWith("/")) return true;
  const supabase = supabaseConfig();
  if (!supabase) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === new URL(supabase.url).hostname &&
      parsed.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}
