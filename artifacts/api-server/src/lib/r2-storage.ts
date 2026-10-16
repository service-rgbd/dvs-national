import { createHash, createHmac } from "node:crypto";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string | null;
};

function requiredEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function getR2Config(): R2Config | null {
  const accountId = requiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");
  const bucket = requiredEnv("R2_BUCKET_NAME");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;

  const rawPublic = requiredEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
  const publicBaseUrl = rawPublic
    ? (/^https?:\/\//i.test(rawPublic) ? rawPublic : `https://${rawPublic}`)
    : null;

  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string): Buffer {
  return createHmac("sha256", key).update(value).digest();
}

function encodeKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

async function r2Request(
  config: R2Config,
  method: "PUT" | "GET" | "DELETE" | "HEAD",
  key: string,
  body?: Buffer,
  contentType?: string,
): Promise<Response> {
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${encodeKey(config.bucket)}/${encodeKey(key)}`;
  const payload = body ?? Buffer.alloc(0);
  const payloadHash = sha256(payload);
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const contentTypeHeader = contentType ? `content-type:${contentType}\n` : "";
  const signedHeaderNames = contentType
    ? "content-type;host;x-amz-content-sha256;x-amz-date"
    : "host;x-amz-content-sha256;x-amz-date";
  const canonicalHeaders =
    `${contentTypeHeader}host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaderNames,
    payloadHash,
  ].join("\n");
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${config.secretAccessKey}`, dateStamp), "auto"), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const headers: Record<string, string> = {
    Authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaderNames}, Signature=${signature}`,
    "x-amz-date": amzDate,
    "x-amz-content-sha256": payloadHash,
  };
  if (contentType) headers["content-type"] = contentType;

  return fetch(`https://${host}${canonicalUri}`, {
    method,
    headers,
    body: method === "PUT" ? new Uint8Array(payload) : undefined,
  });
}

function r2Error(responseStatus: number, xml: string): Error {
  const code = xml.match(/<Code>([^<]+)<\/Code>/)?.[1] ?? `HTTP ${responseStatus}`;
  return new Error(`Enregistrement R2 impossible (${code}).`);
}

export async function putR2Object(key: string, body: Buffer, contentType: string): Promise<void> {
  const config = getR2Config();
  if (!config) throw new Error("Stockage R2 non configuré.");
  const response = await r2Request(config, "PUT", key, body, contentType);
  if (!response.ok) {
    throw r2Error(response.status, await response.text());
  }
}

export async function getR2Object(key: string): Promise<Buffer> {
  const config = getR2Config();
  if (!config) throw new Error("Stockage R2 non configuré.");
  const response = await r2Request(config, "GET", key);
  if (response.status === 404) {
    throw new Error("Fichier introuvable dans le stockage.");
  }
  if (!response.ok) {
    throw r2Error(response.status, await response.text());
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function deleteR2Object(key: string): Promise<void> {
  const config = getR2Config();
  if (!config) return;
  const response = await r2Request(config, "DELETE", key);
  if (!response.ok && response.status !== 404) {
    throw r2Error(response.status, await response.text());
  }
}
