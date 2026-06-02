/**
 * Image Enhancement Utility (Bingo/High-End Style)
 * Uses the backend Sharp API to provide a glossy, high-quality finish.
 */

interface EnhanceImageProps {
  url: string;
  width?: number;
  height?: number;
  quality?: number;
}

export function generateEnhancedImageUrl({ url, width, height, quality = 90 }: EnhanceImageProps) {
  // If no URL or it's already an enhanced URL, return as is
  if (!url || url.includes('/api/process-image')) return url;

  const params = new URLSearchParams({
    url,
    quality: quality.toString()
  });

  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());

  return `/api/process-image?${params.toString()}`;
}
