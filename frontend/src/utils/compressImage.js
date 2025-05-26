// utils/compressImage.js

/**
 * Compress an image file to fit within maxWidth×maxHeight
 * and an (approximate) maxSizeKB file‐size by adjusting JPEG quality.
 *
 * @param {File} file                – the original image File
 * @param {number} maxWidth          – maximum width in px
 * @param {number} maxHeight         – maximum height in px
 * @param {number} maxSizeKB         – target maximum size in kilobytes
 * @param {number} [iterations=6]    – binary‐search steps (quality precision)
 * @returns {Promise<string>}        – Data URL of the compressed JPEG
 */
export async function compressImage(
  file,
  maxWidth = 200,
  maxHeight = 200,
  maxSizeKB = 100,
  iterations = 6
) {
  // load original into an Image
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = URL.createObjectURL(file);
  });

  // resize canvas to fit within constraints, preserving aspect
  let { width, height } = img;
  const aspect = width / height;
  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspect);
  }
  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspect);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  // helper to get Blob at given quality
  const blobAtQuality = (q) =>
    new Promise((res) =>
      canvas.toBlob((b) => res(b), 'image/jpeg', q)
    );

  const targetBytes = maxSizeKB * 1024;
  let minQ = 0.1,
      maxQ = 0.9,
      q = maxQ,
      blob;

  for (let i = 0; i < iterations; i++) {
    blob = await blobAtQuality(q);
    if (!blob) break;
    if (blob.size > targetBytes) {
      // too big → lower quality
      maxQ = q;
      q = (minQ + q) / 2;
    } else {
      // under target → try raising quality
      minQ = q;
      q = (q + maxQ) / 2;
    }
  }

  // final blob (best attempt)
  blob = blob || (await blobAtQuality(q));

  // convert to Data URL
  return await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(blob);
  });
}
