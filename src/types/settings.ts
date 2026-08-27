export interface AppSettings {
  currencySymbol: string; // e.g. '$', '₱', '€', '£'
  defaultLaborRate: number; // Hourly rate in currency (e.g. $15.00/hr)
  defaultOverheadCost: number; // Electricity/gas cost per batch (e.g. $3.00)
  defaultProfitMargin: number; // Target default margin % (e.g. 50%)
  businessName: string;
  ownerName: string;
  theme: 'light' | 'dark' | 'bakery-warm';
  schemaVersion: number;
}
