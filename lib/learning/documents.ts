export function documentType(fileUrl: string, type?: string): 'ppt' | 'pdf' | 'doc' | null {
  const extension = fileUrl.split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  if (['ppt', 'pptx'].includes(extension || '') || type === 'ppt') return 'ppt';
  if (['doc', 'docx'].includes(extension || '') || ['doc', 'word'].includes(type || '')) return 'doc';
  return extension === 'pdf' || type === 'pdf' ? 'pdf' : null;
}
export function documentViewerUrl(fileUrl: string, type?: string): string | null {
  try {
    const url = new URL(fileUrl);
    if (url.protocol !== 'https:') return null;
    const kind = documentType(fileUrl, type);
    if (kind === 'pdf') return url.toString();
    if (kind) return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url.toString())}`;
  } catch { /* Local development downloads remain available without an external viewer. */ }
  return null;
}
