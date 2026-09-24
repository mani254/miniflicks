/**
 * Resolves a stored image path (e.g. "/uploads/banners/xyz.jpg") to a full URL
 * by prepending the backend base URL from the environment.
 *
 * Usage:
 *   <img src={getImageUrl(banner.image)} />
 *
 * If the value is already a full URL (http/https) it is returned as-is
 * so that legacy data still works.
 */
const BACKEND_URI = import.meta.env.VITE_APP_BACKENDURI || '';

/**
 * @param {string | null | undefined} imagePath
 * @returns {string}
 */
export function getImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return '';
  const trimmed = imagePath.trim();
  // Already a full URL (e.g. Cloudinary HTTPS or external) — return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Relative path — prepend backend origin
  return `${BACKEND_URI}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}
