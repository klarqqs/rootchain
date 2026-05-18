export interface ChatThread {
  id: number;
  name: string;
  role: string;
  farm: string;
  online: boolean;
  unread: number;
  last: string;
  time: string;
  avatar: string;
}

export const CHATS: ChatThread[] = [
  { id: 1, name: "Adeola Okonkwo", role: "Verified Farmer", farm: "Ogun Highlands", online: true, unread: 2, last: "Harvest is ahead of schedule — 78% growth confirmed.", time: "2m", avatar: "#84CC16" },
  { id: 2, name: "Kwame Adjei", role: "Verified Farmer", farm: "Ashanti Cocoa", online: true, unread: 0, last: "I uploaded the quality lab report to IPFS.", time: "14m", avatar: "#A16207" },
  { id: 3, name: "Investor Circle: Maize Q2", role: "Group · 24 members", farm: "", online: true, unread: 7, last: "Tobi: Sharing my projection model below ↓", time: "32m", avatar: "#0EA5E9" },
  { id: 4, name: "Ifeoma Bassey", role: "Verified Farmer", farm: "Lekki Aquaculture", online: false, unread: 0, last: "Thanks for the additional 12% — escrow confirmed.", time: "1h", avatar: "#38BDF8" },
  { id: 5, name: "Smart Contract: RC-0421", role: "Automated", farm: "", online: true, unread: 1, last: "Milestone 3/5 reached. 22 USDC released.", time: "3h", avatar: "#65A30D" },
  { id: 6, name: "Yusuf Bello", role: "Verified Farmer", farm: "Kaduna Poultry", online: false, unread: 0, last: "Batch 4 is ready for inspection.", time: "1d", avatar: "#F59E0B" },
];

export interface ChatMessage {
  id: number;
  from: "me" | "them";
  text: string;
  time: string;
}

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: 1, from: "them", text: "Quick update from the field — the maize is responding well to the new irrigation cycle.", time: "10:24 AM" },
  { id: 2, from: "them", text: "Growth tracker just hit 78%. We're four weeks out from harvest.", time: "10:24 AM" },
  { id: 3, from: "me", text: "That's ahead of the original projection. What's driving the acceleration?", time: "10:26 AM" },
  { id: 4, from: "them", text: "Two factors. The drip system upgrade you co-funded is delivering 18% better water efficiency. And we had a stretch of clean weather mid-season.", time: "10:28 AM" },
  { id: 5, from: "them", text: "I'll push a verified field photo to the chain shortly.", time: "10:28 AM" },
  { id: 6, from: "me", text: "Perfect. Send the milestone signature when ready — I'll counter-sign on my end.", time: "10:31 AM" },
];
