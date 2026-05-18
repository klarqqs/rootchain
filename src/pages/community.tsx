import { motion } from "framer-motion";
import {
  BadgeCheck,
  Cpu,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { CHATS, CHAT_MESSAGES, type ChatMessage } from "@/data/community";
import { tokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import { useInvestorPresenceStore } from "@/store/investor-presence.store";

export function CommunityPage() {
  const [activeChat, setActiveChat] = useState(CHATS[0]);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES);
  const investor = useInvestorPresenceStore();

  const send = () => {
    if (!msg.trim()) return;
    setMessages([...messages, { id: Date.now(), from: "me", text: msg, time: "Now" }]);
    setMsg("");
  };

  return (
    <div className="pb-16 space-y-4">
      <Glass className="p-5 flex flex-wrap gap-4 items-start">
        <div className="flex-1 min-w-[12rem]">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">Investor persona (local-first)</div>
          <input
            value={investor.displayName}
            placeholder="Atlas Impact LP"
            onChange={(e) => investor.setDisplayName(e.target.value.slice(0, 80))}
            className="mt-2 w-full bg-black/30 border border-line rounded-xl px-3 py-2 text-sm text-white outline-none focus-ring"
          />
        </div>
        <div className="flex-1 min-w-[10rem]">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">Region focus</div>
          <input
            value={investor.regionSlug}
            placeholder="VOLTA_BEAN_BELT"
            onChange={(e) =>
              investor.setRegionSlug(e.target.value.replace(/[^\w_-]/g, "").slice(0, 48).toUpperCase())
            }
            className="mt-2 w-full bg-black/30 border border-line rounded-xl px-3 py-2 text-sm text-white outline-none focus-ring font-mono"
          />
        </div>
        <div className="flex flex-col gap-2 max-w-[16rem]">
          <Btn variant="ghost" icon={BadgeCheck} size="sm" onClick={() => investor.bumpTrust()}>
            Reputation pacing · {(investor.trustScore ?? 3).toFixed(2)} / 5
          </Btn>
          <span className="text-[11px] text-slate-500 leading-snug">
            Synthetic coop trust seed — hydrate from Supabase co-signers when partner APIs land.
          </span>
        </div>
      </Glass>
      <Glass className="overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: 500 }}>
        <div className="grid lg:grid-cols-12 h-full">
          {/* Chat list */}
          <div className="lg:col-span-4 border-r border-line flex flex-col">
            <div className="p-4 border-b border-line flex items-center justify-between">
              <h3 className="font-black text-white">Messages</h3>
              <Pill color="lime" dot>
                4 online
              </Pill>
            </div>
            <div className="p-3 border-b border-line">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                  placeholder="Search conversations…"
                  className="bg-transparent outline-none text-xs text-white placeholder:text-slate-600 flex-1 min-w-0"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {CHATS.map((c) => {
                const active = activeChat.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveChat(c)}
                    className={cn(
                      "w-full p-3 flex items-center gap-3 border-b border-line transition text-left",
                      active ? "bg-lime-500/[0.06]" : "hover:bg-white/[0.02]",
                    )}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-black text-sm"
                        style={{ background: `linear-gradient(135deg, ${c.avatar}, ${tokens.forest})` }}
                      >
                        {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      {c.online && (
                        <span
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-lime-400 border-2"
                          style={{ borderColor: tokens.bg, boxShadow: "0 0 6px rgba(132,204,22,0.8)" }}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-sm text-white truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-500 shrink-0">{c.time}</div>
                      </div>
                      <div className="text-[10px] text-lime-400/70 font-bold uppercase tracking-wider mb-0.5 truncate">
                        {c.role}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{c.last}</div>
                    </div>
                    {c.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-lime-400 text-black text-[10px] font-black flex items-center justify-center shrink-0">
                        {c.unread}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat window */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="p-4 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-black"
                    style={{ background: `linear-gradient(135deg, ${activeChat.avatar}, ${tokens.forest})` }}
                  >
                    {activeChat.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  {activeChat.online && (
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-lime-400 border-2"
                      style={{ borderColor: tokens.bg }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span className="truncate">{activeChat.name}</span>
                    <BadgeCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {activeChat.farm || activeChat.role}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-2 rounded-lg hover:bg-white/5">
                  <Phone className="w-4 h-4 text-slate-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5">
                  <Video className="w-4 h-4 text-slate-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {/* Contract card */}
              <div className="flex justify-center mb-2">
                <Glass className="px-4 py-3 max-w-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-lime-500/10 border border-lime-500/30 flex items-center justify-center shrink-0">
                      <Cpu className="w-4 h-4 text-lime-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                        Smart Contract Negotiation
                      </div>
                      <div className="font-bold text-white text-sm">RC-0421 · Yellow Maize</div>
                      <div className="text-[10px] text-slate-400">12 shares · 2,400 USDC · 18.4% ROI</div>
                    </div>
                    <Btn variant="primary" size="sm">
                      Sign
                    </Btn>
                  </div>
                </Glass>
              </div>

              {messages.map((m, i) => {
                const isMe = m.from === "me";
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn("flex", isMe ? "justify-end" : "justify-start")}
                  >
                    <div className={cn("max-w-[75%]", isMe ? "items-end" : "items-start")}>
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm",
                          isMe
                            ? "bg-lime-400 text-black rounded-br-md font-bold"
                            : "bg-white/[0.04] border border-white/10 text-white rounded-bl-md",
                        )}
                      >
                        {m.text}
                      </div>
                      <div
                        className={cn(
                          "text-[10px] text-slate-600 mt-1",
                          isMe ? "text-right" : "text-left",
                        )}
                      >
                        {m.time}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-4 border-t border-line">
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl hover:bg-white/5 shrink-0">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                </button>
                <div
                  className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line min-w-0"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                >
                  <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Type a message…"
                    className="bg-transparent outline-none text-sm text-white placeholder:text-slate-600 flex-1 min-w-0"
                  />
                  <Smile className="w-4 h-4 text-slate-500 shrink-0" />
                </div>
                <button
                  onClick={send}
                  className="w-10 h-10 rounded-xl bg-lime-400 hover:bg-lime-300 flex items-center justify-center text-black transition active:scale-95 shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Glass>
    </div>
  );
}
