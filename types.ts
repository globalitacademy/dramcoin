
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
  ADMIN = 'ADMIN',
  AUTH = 'AUTH',
  PROFILE = 'PROFILE',
  VERIFY = 'VERIFY',
  WHITEPAPER = 'WHITEPAPER',
  EARN = 'EARN'
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
  type: 'deposit' | 'withdrawal' | 'buy' | 'sell' | 'airdrop' | 'exchange';
  symbol: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface User {
  id?: string;
  username: string;
  email: string;
  isLoggedIn: boolean;
  role: 'user' | 'admin';
  kycStatus: 'unverified' | 'pending' | 'verified';
  twoFactorEnabled: boolean;
  assets: Asset[];
  transactions: Transaction[];
  lastLogin?: string;
  apricots: number;
  totalEarnedApricots: number;
  tapLevel: number;
  energy: number;
  maxEnergy: number;
  tapBotLevel: number;
  lastMorseClaimedAt: string | null;
  completedTasks: string[];
  lastCheckInAt: string | null;
  checkInStreak: number;
  lastEnergyUpdateAt: string | null;
}

export interface SystemSettings {
  id?: string;
  usdToAmdRate: number;
  isAiEnabled: boolean;
  platformFee: number;
  secretMorseCode: string;
  morseReward: number;
}

export type Language = 'AM' | 'EN';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface LeaderboardEntry {
  username: string;
  apricots: number;
  rank: number;
}
