export function isDemoVideoUrl(url: string): boolean {
  return /^\/demo\/madar\/[a-z0-9-]+\.mp4$/.test(url);
}
