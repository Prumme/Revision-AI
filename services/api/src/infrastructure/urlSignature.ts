import * as crypto from 'node:crypto';
/**
 * Generates a signed URL by appending a signature to the query string.
 *
 * @param {string} path - The base path of the URL.
 * @param {number} expiresIn - The number of seconds after which the signature will expire.
 * @param {string} secret - The secret key used to generate the signature.
 * @param {Record<string, string>} [query={}] - Additional query parameters to include in the URL.
 * @returns {string} - The signed URL with an appended signature.
 *
 * @throws {Error} - Throws an error if the secret is not provided.
 */
export function generateSignature(
  path: string,
  expiresIn: number,
  secret: string,
  query: Record<string, string> = {},
): string {
  if (!secret) {
    throw new Error('SIGNATURE_SECRET is not defined');
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const expiresAt = timestamp + expiresIn;

  const queryString = new URLSearchParams({
    ...query,
    expires: expiresAt.toString(),
  }).toString();

  const dataToSign = `${path}?${queryString}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('hex');

  const finalPath = `${path}?${queryString}&s=${signature}`;
  return finalPath;
}

export function verifySignature(
  path,
  signature: string,
  secret: string,
  query: Record<string, string> = {},
): boolean {
  if (!secret) {
    throw new Error('SIGNATURE_SECRET is not defined');
  }

  if (!signature) {
    throw new Error('Signature is required');
  }

  if (!query.expires) {
    throw new Error('Expires query parameter is required');
  }

  const expiresAt = parseInt(query.expires, 10);
  if (isNaN(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    throw new Error('Signature has expired');
  }

  const { s: _, ...queryRest } = query; // Exclude the signature from the query parameters
  const queryString = new URLSearchParams({
    ...queryRest,
    expires: expiresAt.toString(),
  }).toString();

  const dataToSign = `${path}?${queryString}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('hex');

  return expectedSignature === signature;
}
