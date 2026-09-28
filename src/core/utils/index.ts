/**
 * Date utilities
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateLong(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysPassed(startDate: string): number {
  const now = new Date();
  const start = new Date(startDate);
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getDaysRemaining(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * String utilities
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * URL utilities
 */
export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function getInstagramUrl(username: string): string {
  return `https://instagram.com/${username}`;
}

/**
 * Category utilities
 */
export const CATEGORY_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  attraction: '🏛️',
  hotel: '🏨',
  activity: '🎯',
  other: '📍',
};

export const CATEGORY_COLORS: Record<string, string> = {
  restaurant: '#ef4444',
  attraction: '#8b5cf6',
  hotel: '#f59e0b',
  activity: '#10b981',
  other: '#6b7280',
};

export const CATEGORY_LABELS: Record<string, string> = {
  restaurant: 'Ristorante',
  attraction: 'Attrazione',
  hotel: 'Hotel',
  activity: 'Attività',
  other: 'Altro',
};
