
export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
}

export interface ChartPoint {
  time: string;
  price: number;
}

export interface Order {
  price: number;
  amount: number;
  total: number;
  type: 'buy' | 'sell';
}

export enum ViewState {
  HOME = 'HOME',
  MARKETS = 'MARKETS',
  TRADE = 'TRADE',
  WALLET = 'WALLET',
  ADMIN = 'ADMIN'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Asset {
  symbol: string;
  amount: number;
  valueUsd: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'buy' | 'sell';
  symbol: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface User {
  name: string;
  email: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  assets: Asset[];
  transactions: Transaction[];
}

export interface SystemSettings {
  usdToAmdRate: number;
  isAiEnabled: boolean;
  platformFee: number;
}

export type Language = 'AM' | 'EN';
