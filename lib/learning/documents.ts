export function documentType(fileUrl: string, type?: string): 'ppt' | 'pdf' | 'doc' | null {
  const extension = fileUrl.split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  if (['ppt', 'pptx'].includes(extension || '') || type === 'ppt') return 'ppt';
  if (['doc', 'docx'].includes(extension || '') || ['doc', 'word'].includes(type || '')) return 'doc';
  return extension === 'pdf' || type === 'pdf' ? 'pdf' : null;
}
export function documentViewerUrl(fileUrl: string, _type?: string): string | null {
  if (!/^\/demo\/madar\/[a-z0-9-]+\.(pdf|docx|pptx)$/.test(fileUrl)) return null;
  return fileUrl.replace(/\.(docx|pptx)$/, '.pdf');
}
