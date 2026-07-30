import { logger } from '../config/logger.js';

/**
 * Fetches a remote image and encodes it as a Base64 Data URI.
 * Falls back to a 1x1 transparent PNG if the fetch fails or times out.
 */
export async function fetchBase64Image(url: string): Promise<string> {
  const fallback = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  if (!url) {
    return fallback;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.warn({ url, status: response.status }, 'Failed to fetch avatar image, using fallback');
      return fallback;
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    logger.error({ url, error }, 'Error fetching remote image for base64 encoding, using fallback');
    return fallback;
  }
}
