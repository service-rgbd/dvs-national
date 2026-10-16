import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { deleteR2Object, getR2Config, getR2Object, putR2Object } from "./r2-storage";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const R2_PREFIX = "uploads";

export function getUploadDir(): string {
  return UPLOAD_DIR;
}

export function assertFileSize(sizeBytes: number, maxBytes = MAX_FILE_BYTES): void {
  if (sizeBytes <= 0) {
    throw new Error("Le fichier est vide.");
  }
  if (sizeBytes > maxBytes) {
    const maxMo = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`Le fichier dépasse la taille maximale autorisée (${maxMo} Mo).`);
  }
}

function safeExtension(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();
  if (!/^\.[a-z0-9]{1,8}$/.test(extension)) return ".bin";
  return extension;
}

function assertStorageKey(storageKey: string): void {
  if (!storageKey || storageKey.includes("..") || storageKey.startsWith("/") || storageKey.includes("\\")) {
    throw new Error("Clé de fichier invalide.");
  }
}

function contentTypeFor(extension: string): string {
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    case ".pdf":
      return "application/pdf";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

export async function saveBinaryFile(
  buffer: Buffer,
  fileName: string,
  options?: { maxBytes?: number },
): Promise<{ storageKey: string; sizeBytes: number }> {
  assertFileSize(buffer.byteLength, options?.maxBytes ?? MAX_FILE_BYTES);

  const extension = safeExtension(fileName);
  const storageKey = `${R2_PREFIX}/${Date.now()}-${randomUUID()}${extension}`;

  if (getR2Config()) {
    await putR2Object(storageKey, buffer, contentTypeFor(extension));
    return { storageKey, sizeBytes: buffer.byteLength };
  }

  const localName = path.basename(storageKey);
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, localName), buffer);
  return { storageKey: localName, sizeBytes: buffer.byteLength };
}

export async function readBinaryFile(storageKey: string): Promise<Buffer> {
  assertStorageKey(storageKey);

  if (getR2Config() && storageKey.startsWith(`${R2_PREFIX}/`)) {
    return getR2Object(storageKey);
  }

  return readFile(path.join(UPLOAD_DIR, path.basename(storageKey)));
}

export async function removeBinaryFile(storageKey: string): Promise<void> {
  assertStorageKey(storageKey);
  if (getR2Config() && storageKey.startsWith(`${R2_PREFIX}/`)) {
    await deleteR2Object(storageKey);
  }
}
