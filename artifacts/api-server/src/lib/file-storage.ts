import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
const MAX_FILE_BYTES = 5 * 1024 * 1024;

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

export async function saveBinaryFile(
  buffer: Buffer,
  fileName: string,
  options?: { maxBytes?: number },
): Promise<{ storageKey: string; sizeBytes: number }> {
  assertFileSize(buffer.byteLength, options?.maxBytes ?? MAX_FILE_BYTES);

  const extension = path.extname(fileName) || ".bin";
  const storageKey = `${Date.now()}-${randomUUID()}${extension}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, storageKey), buffer);

  return { storageKey, sizeBytes: buffer.byteLength };
}

export async function readBinaryFile(storageKey: string): Promise<Buffer> {
  return readFile(path.join(UPLOAD_DIR, storageKey));
}
