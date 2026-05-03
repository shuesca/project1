const base = (import.meta.env.NEXT_PUBLIC_MEDIA_BASE_URL || "").replace(/\/+$/, "");

export function mediaUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
