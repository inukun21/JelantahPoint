import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge class names using tailwind-merge and clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to format currency in Indonesian Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Function to format date to Indonesian format
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Function to get time ago in Indonesian
export function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' tahun yang lalu';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' bulan yang lalu';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' hari yang lalu';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' jam yang lalu';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' menit yang lalu';
  }
  return 'Beberapa detik yang lalu';
}

// Function to validate Indonesian phone number format
export function validatePhone(phone: string): boolean {
  const regex = /^(\+62|62|0)[2-9]\d{6,10}$/;
  return regex.test(phone);
}

// Function to validate email format
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Function to calculate distance between two coordinates (in km)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Function to truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

// Function to generate random id
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}