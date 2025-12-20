import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date au format JJ/MM/AAAA
 * @param date - Date à formater (string, Date ou timestamp)
 * @returns La date formatée en JJ/MM/AAAA
 */
export function formatDate(date: string | Date | number | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Date invalide';
  
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formate un montant en euros
 * @param amount - Montant à formater (nombre ou chaîne représentant un nombre)
 * @returns Le montant formaté avec le symbole FCFA et 2 décimales
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return 'N/A';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return 'Montant invalide';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}
