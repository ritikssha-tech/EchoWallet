import { v4 as uuidv4 } from 'uuid';

export function generateRoomId(): string {
  return uuidv4();
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
