import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveAssetUrl(assetPath: string) {
  if (!assetPath) return assetPath;
  if (assetPath.startsWith('http') || assetPath.startsWith('data:')) return assetPath;
  if (import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:5175${assetPath}`;
  }
  if (assetPath.startsWith('/assets/')) {
    return (window as any).wpApiSettings?.pluginUrl + 'public/dist' + assetPath;
  }
  return assetPath;
}
