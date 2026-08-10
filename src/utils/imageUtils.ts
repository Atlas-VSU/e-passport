/**
 * Converts a HEIC/HEIF file to a JPEG data URL using heic2any.
 * Returns the original file unchanged if it's not HEIC/HEIF.
 */
export async function normalizeImageFile(file: File): Promise<File> {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  if (!isHeic) return file;

  // Dynamically import heic2any to avoid bloating the initial bundle
  const heic2any = (await import('heic2any')).default;

  const convertedBlob = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.92,
  });

  // heic2any can return a Blob or Blob[] — normalise to a single Blob
  const outputBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

  return new File([outputBlob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), {
    type: 'image/jpeg',
  });
}
