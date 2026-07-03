import { v2 as cloudinary } from 'cloudinary';

import { cloudinaryUrl } from './config.js';

// Activa Cloudinary solo si existe CLOUDINARY_URL en el entorno.
if (cloudinaryUrl) {
  cloudinary.config({ secure: true });
}

// Genera una URL optimizada, manteniendo la original cuando no es Cloudinary.
export function getCloudinaryImageUrl(
  imageUrl,
  { width, height, crop = 'limit' },
) {
  if (!cloudinaryUrl || !imageUrl.includes('/image/upload/')) {
    return imageUrl;
  }

  const cloudinaryCrop = crop === 'cover' ? 'fill' : crop;
  // fill usa recorte inteligente; pad rellena el fondo cuando la imagen no encaja.
  const gravity = cloudinaryCrop === 'fill' ? ',g_auto' : '';
  const background = cloudinaryCrop === 'pad' ? ',b_gen_fill' : '';
  const transformation = `f_auto,q_auto,c_${cloudinaryCrop}${gravity}${background},w_${width},h_${height}`;

  return imageUrl.replace('/image/upload/', `/image/upload/${transformation}/`);
}
