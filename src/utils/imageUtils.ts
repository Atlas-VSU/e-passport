/**
 * Reads the first 12 bytes of a File/Blob to detect the HEIC/HEIF 'ftyp' box.
 * iOS sometimes provides HEIC files with no MIME type and no extension,
 * so we sniff the magic bytes as a last resort.
 */
async function hasHeicMagicBytes(file: File): Promise<boolean> {
  try {
    const slice = file.slice(0, 12);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    // HEIC/HEIF files have 'ftyp' at bytes 4-7 followed by a brand string.
    // Common brands: heic, heix, hevc, mif1, msf1
    if (bytes.length < 12) return false;
    const ftyp =
      bytes[4] === 0x66 && bytes[5] === 0x74 &&
      bytes[6] === 0x79 && bytes[7] === 0x70;
    if (!ftyp) return false;
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    return ['heic', 'heix', 'hevc', 'mif1', 'msf1', 'heim', 'heis'].includes(brand);
  } catch {
    return false;
  }
}

/**
 * Resizes an image Blob/File so its longest edge is at most maxDim pixels,
 * and encodes it as a jpeg File with quality compression.
 */
async function downscaleImageBlob(
  blob: Blob,
  fileName: string,
  maxDim = 1200,
  quality = 0.80
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (outputBlob) => {
          if (!outputBlob) return reject(new Error('Canvas encoding failed'));
          const baseName = fileName ? fileName.replace(/\.[^/.]+$/, '') : `photo-${Date.now()}`;
          resolve(new File([outputBlob], `${baseName}.jpeg`, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image format. If this is a camera RAW file (.DNG, .CR2, etc.), please convert it to JPEG, PNG, or WebP first.'));
    };
    img.src = url;
  });
}

/**
 * Converts a HEIC/HEIF file to jpeg using heic2any and downscales it
 * to at most 1200px max dimension for fast uploads and small storage footprint.
 * Returns the original file downscaled for all other formats if large.
 */
export async function normalizeImageFile(file: File): Promise<File> {
  const byMime =
    file.type === 'image/heic' ||
    file.type === 'image/heif';
  const byExt =
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  // Only do the (async) byte-sniff when the cheaper checks both miss
  const isHeic = byMime || byExt || await hasHeicMagicBytes(file);

  if (isHeic) {
    try {
      // Dynamically import heic2any to avoid bloating the initial bundle
      const heic2any = (await import('heic2any')).default;

      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.85,
      });

      // heic2any can return a Blob or Blob[] — normalise to a single Blob
      const outputBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

      // Downscale converted jpeg blob to max 1200px dimension and 0.80 quality
      return await downscaleImageBlob(outputBlob, file.name || `photo-${Date.now()}`, 1200, 0.80);
    } catch (err) {
      throw new Error(
        'Could not convert the HEIC photo. Try sharing the photo as JPEG or jpeg from your camera roll, or use a different image.'
      );
    }
  }

  // For all non-HEIC files (JPEG, PNG, jpeg, GIF, BMP, etc.),
  // convert & downscale to jpeg format unconditionally.
  try {
    return await downscaleImageBlob(file, file.name, 1200, 0.80);
  } catch {
    return file;
  }
}

