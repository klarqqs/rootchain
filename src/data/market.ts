export interface TickerEntry {
  sym: string;
  price: number;
  chg: number;
}

export const TICKER: TickerEntry[] = [
  { sym: "MAIZE", price: 4.82, chg: 2.4 },
  { sym: "COCOA", price: 11.40, chg: 5.1 },
  { sym: "RICE", price: 6.18, chg: -0.8 },
  { sym: "CASSAVA", price: 2.94, chg: 1.2 },
  { sym: "USDC/NGN", price: 1648.20, chg: 0.1 },
  { sym: "TILAPIA", price: 8.30, chg: 3.7 },
  { sym: "POULTRY", price: 5.66, chg: -1.4 },
  { sym: "CATTLE", price: 24.10, chg: 4.2 },
  { sym: "XLM/USDC", price: 0.118, chg: 1.9 },
  { sym: "BTC/USDC", price: 92410.5, chg: 0.6 },
];

export const ALLOCATION = [
  { name: "Maize", value: 32, color: "#84CC16" },
  { name: "Cocoa", value: 24, color: "#A16207" },
  { name: "Rice", value: 18, color: "#F1F5F4" },
  { name: "Cattle", value: 14, color: "#DC2626" },
  { name: "Fish", value: 8, color: "#0EA5E9" },
  { name: "Other", value: 4, color: "#64748B" },
];

export const HARVEST_PERF = [
  { name: "RC-0421", yield: 94 },
  { name: "RC-0388", yield: 88 },
  { name: "RC-0476", yield: 76 },
  { name: "RC-0301", yield: 91 },
  { name: "RC-0628", yield: 67 },
  { name: "RC-0512", yield: 83 },
];

export const PORTFOLIO_CHART = [
  { m: "Oct", v: 12400, p: 11800 },
  { m: "Nov", v: 14200, p: 12900 },
  { m: "Dec", v: 13800, p: 13400 },
  { m: "Jan", v: 16100, p: 14600 },
  { m: "Feb", v: 18800, p: 16200 },
  { m: "Mar", v: 21400, p: 18100 },
  { m: "Apr", v: 24700, p: 19800 },
  { m: "May", v: 28200, p: 21900 },
];

export interface CommodityStat {
  symbol: string;
  name: string;
  price: number;
  chg24h: number;
  volume7d: number;
  trend: number[];
}

export const COMMODITY_STATS: CommodityStat[] = [
  { symbol: "MAIZE", name: "Yellow Maize", price: 4.82, chg24h: 2.4, volume7d: 1820000, trend: [4.6, 4.65, 4.71, 4.68, 4.74, 4.78, 4.82] },
  { symbol: "COCOA", name: "Cocoa Beans", price: 11.40, chg24h: 5.1, volume7d: 2940000, trend: [10.2, 10.5, 10.8, 11.0, 11.2, 11.3, 11.4] },
  { symbol: "RICE", name: "Long Grain", price: 6.18, chg24h: -0.8, volume7d: 1240000, trend: [6.32, 6.30, 6.28, 6.22, 6.20, 6.19, 6.18] },
  { symbol: "CATTLE", name: "Live Cattle", price: 24.10, chg24h: 4.2, volume7d: 3620000, trend: [22.8, 23.1, 23.4, 23.7, 23.9, 24.0, 24.1] },
];

export interface MarketInsight {
  region: string;
  title: string;
  detail: string;
  impact: "Bullish" | "Neutral" | "Bearish";
}

export const MARKET_INSIGHTS: MarketInsight[] = [
  { region: "West Africa", title: "Cocoa premium widens", detail: "Ashanti & Cross River cooperatives report grade-A yields up 12% YoY. Driving price ceiling above $11.50/kg.", impact: "Bullish" },
  { region: "East Africa", title: "Rice surplus easing", detail: "Kebbi mills cleared inventory backlog. Spot demand from Ethiopia steady through Q3.", impact: "Neutral" },
  { region: "Macro", title: "USDC flows hit $48M", detail: "Stellar settlement volume on ROOTCHAIN +37% week-over-week. Cross-chain USDC inflows leading.", impact: "Bullish" },
];
