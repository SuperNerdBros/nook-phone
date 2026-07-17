export const wallpaperImports = import.meta.glob('../assets/wallpapers/*.{png,webp,jpg}', { eager: true, query: '?url', import: 'default' });

export function resolveAssetUrl(assetPath: string) {
  if (!assetPath) return assetPath;
  if (assetPath.startsWith('http')) return assetPath;
  if (import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:5175${assetPath}`;
  }
  if (assetPath.startsWith('/assets/')) {
    return (window as any).wpApiSettings?.pluginUrl + 'public/dist' + assetPath;
  }
  return assetPath;
}

export const loadedWallpapers = Object.entries(wallpaperImports).map(([path, url]) => {
  const filename = path.split('/').pop()?.split('.')[0] || 'Unknown';
  const lcase = filename.toLowerCase();
  const isDark = lcase.includes('dark') || lcase.includes('sunset') || lcase.includes('starry') || lcase.includes('night') || lcase.includes('campsite') || lcase.includes('blueprint') || lcase.includes('records') || lcase.includes('museum') || lcase.includes('brewster');
  
  return {
    id: lcase.replace(/[^a-z0-9]+/g, '-'),
    name: filename,
    url: resolveAssetUrl(url as string),
    isDark
  };
});

export const ALL_WALLPAPERS = [
  { id: 'classic', name: 'Classic', isDefault: true, bg: 'bg-[#fdfcf2]', pattern: 'fill="none"', patternClass: 'bg-transparent', isDark: false },
  { id: 'default', name: 'Nook Inc.', isDefault: true, bg: 'bg-[#fdfcf2]', pattern: 'fill="%235c8e43"', patternClass: 'bg-[#5c8e43]', isDark: false },
  ...loadedWallpapers
];
