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
  if (!imagePath) return '';
  // Already a full URL — return as-is (legacy / external)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Relative path — prepend backend origin
  return `${BACKEND_URI}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
}
