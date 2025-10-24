// FIX: Define and export types used across the application.
export type Tab = 'home' | 'products' | 'sales' | 'events';

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellPrice: number;
}

export interface EventProduct extends Product {
  quantityTaken: number | string; // Can be string from input
  quantitySold: number;
}

export interface EventData {
  id:string;
  name: string;
  date: string;
  location: string;
  eventAddress: string;
  products: EventProduct[];
  
  // Costs
  helpers: number | string;
  helperPayment: number | string;
  extraCosts: number | string;
  
  // Fuel
  startAddress: string;
  distance: number | string;
  consumption: number | string;
  fuelPrice: number | string;
  
  // Calculated on save
  totalSales?: number;
  totalCosts?: number;
  profit?: number;
}