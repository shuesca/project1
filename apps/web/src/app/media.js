const DEFAULT_MEDIA_BASE_URL =
  "https://media.githubusercontent.com/media/shuesca/project1-media/main";

const base = (
  import.meta.env.NEXT_PUBLIC_MEDIA_BASE_URL || DEFAULT_MEDIA_BASE_URL
).replace(/\/+$/, "");

export function mediaUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
