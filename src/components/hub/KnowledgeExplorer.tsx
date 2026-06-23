'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Bot, ChevronRight, Clock, Download, FileText,
  FolderOpen, MessageSquare, Search, Trash2, X, ChevronDown,
} from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { getFirebaseDb } from '../../lib/firebase';
import {
  downloadAgentReport,
  deleteAgentReportFromDb,
  type AgentReportHistoryEntry,
} from '../../lib/agent-report-history';
import { getChatSessions, deleteChatSession, type ChatSession } from '../../lib/chat-history';
import { useAuth } from '../../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type ExplorerSection = 'agentes' | 'chats';

type SelectedItem =
  | { kind: 'report'; entry: AgentReportHistoryEntry }
  | { kind: 'chat'; session: ChatSession };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDateShort(ms: number): string {
  return new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyPane({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
      <FolderOpen className="w-10 h-10 text-white/10" />
      <p className="text-[13px] text-[#4a6280]">{label}</p>
    </div>
  );
}

function ReportViewer({
  entry,
  onClose,
  onDelete,
}: {
  entry: AgentReportHistoryEntry;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!user || deleting) return;
    if (!window.confirm('Excluir este relatório permanentemente?')) return;
    setDeleting(true);
    await deleteAgentReportFromDb(user.uid, entry.id);
    onDelete(entry.id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Viewer header */}
      <div className="flex items-start justify-between gap-4 p-5 border-b border-white/[0.06]">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF6A00] mb-1">{entry.agentTitle}</p>
          <h3 className="text-[15px] font-black text-white leading-tight truncate">{entry.reportTitle}</h3>
          <p className="text-[11px] text-[#8fa0b5] mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {fmtDate(entry.createdAtMs)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => downloadAgentReport(entry)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[12px] font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#FF4D4D]/60 hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="prose prose-invert prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-[#c8d8e8]">
            {entry.reportContent}
          </pre>
        </div>
      </div>
    </div>
  );
}

function ChatViewer({
  session,
  onClose,
  onDelete,
}: {
  session: ChatSession;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!user || deleting) return;
    if (!window.confirm('Excluir esta conversa permanentemente?')) return;
    setDeleting(true);
    await deleteChatSession(user.uid, session.id);
    onDelete(session.id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-4 p-5 border-b border-white/[0.06]">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF6A00] mb-1">Chat com Lucca</p>
          <h3 className="text-[15px] font-black text-white leading-tight truncate">{session.title}</h3>
          <p className="text-[11px] text-[#8fa0b5] mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {fmtDate(session.updatedAtMs)}
            <span className="ml-2">· {session.messages.length} mensagens</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#FF4D4D]/60 hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {session.messages.filter((m) => m.role !== 'assistant' || m.text !== session.messages[0]?.text).map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#FF6A00]/20 border border-[#FF6A00]/30 text-white'
                : 'bg-white/[0.04] border border-white/[0.08] text-[#c8d8e8]'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KnowledgeExplorer() {
  const { user } = useAuth();

  const [section, setSection] = useState<ExplorerSection>('agentes');
  const [reports, setReports] = useState<AgentReportHistoryEntry[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const db = getFirebaseDb();
      const reportsRef = collection(db, 'users', user.uid, 'agent_reports');
      const q = query(reportsRef, orderBy('createdAtMs', 'desc'));
      const snap = await getDocs(q);
      const loaded: AgentReportHistoryEntry[] = snap.docs.map((d) => {
        const data = d.data() as Omit<AgentReportHistoryEntry, 'id'>;
        return { id: d.id, ...data };
      });
      setReports(loaded);

      const sessions = await getChatSessions(user.uid);
      setChatSessions(sessions);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Group reports by agentTitle
  const groupedReports = reports.reduce<Record<string, AgentReportHistoryEntry[]>>((acc, r) => {
    const key = r.agentTitle;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const filteredAgentKeys = Object.keys(groupedReports).filter((k) =>
    k.toLowerCase().includes(search.toLowerCase()) ||
    groupedReports[k].some((r) => r.reportTitle.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredChats = chatSessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAgent = (key: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setSelected(null);
  };

  const handleDeleteChat = (id: string) => {
    setChatSessions((prev) => prev.filter((s) => s.id !== id));
    setSelected(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-0 h-[600px] rounded-2xl overflow-hidden border border-[rgba(255,106,0,0.15)] bg-[#08101e]">

      {/* ── Left sidebar ── */}
      <div className="w-64 shrink-0 flex flex-col border-r border-white/[0.06]">

        {/* Search */}
        <div className="p-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-[#4a6280] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar…"
              className="flex-1 bg-transparent text-[12px] text-white placeholder:text-[#4a6280] outline-none"
            />
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-white/[0.06]">
          <button
            onClick={() => setSection('agentes')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-colors ${
              section === 'agentes' ? 'text-[#FF6A00] border-b-2 border-[#FF6A00]' : 'text-[#4a6280] hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Agentes
            {reports.length > 0 && (
              <span className="bg-[#FF6A00]/20 text-[#FF6A00] text-[9px] px-1.5 py-0.5 rounded-full">{reports.length}</span>
            )}
          </button>
          <button
            onClick={() => setSection('chats')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-colors ${
              section === 'chats' ? 'text-[#FF6A00] border-b-2 border-[#FF6A00]' : 'text-[#4a6280] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chats
            {chatSessions.length > 0 && (
              <span className="bg-[#FF6A00]/20 text-[#FF6A00] text-[9px] px-1.5 py-0.5 rounded-full">{chatSessions.length}</span>
            )}
          </button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 rounded-full border-2 border-[#FF6A00]/30 border-t-[#FF6A00] animate-spin" />
            </div>
          ) : section === 'agentes' ? (
            filteredAgentKeys.length === 0 ? (
              <EmptyPane label="Nenhum relatório de agente encontrado." />
            ) : (
              filteredAgentKeys.map((agentKey) => {
                const agentReports = groupedReports[agentKey];
                const isExpanded = expandedAgents.has(agentKey);
                return (
                  <div key={agentKey}>
                    <button
                      onClick={() => toggleAgent(agentKey)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.03] transition-colors group"
                    >
                      {isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-[#4a6280] group-hover:text-[#FF6A00] shrink-0" />
                      }
                      <Bot className="w-3.5 h-3.5 text-[#FF6A00]/70 shrink-0" />
                      <span className="text-[12px] font-bold text-white/80 truncate flex-1">{agentKey}</span>
                      <span className="text-[10px] text-[#4a6280]">{agentReports.length}</span>
                    </button>

                    {isExpanded && agentReports.map((r) => {
                      const isSelected = selected?.kind === 'report' && selected.entry.id === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setSelected({ kind: 'report', entry: r })}
                          className={`w-full flex items-start gap-2 pl-9 pr-3 py-2 text-left transition-colors ${
                            isSelected ? 'bg-[#FF6A00]/10 border-l-2 border-[#FF6A00]' : 'hover:bg-white/[0.03] border-l-2 border-transparent'
                          }`}
                        >
                          <FileText className={`w-3 h-3 mt-0.5 shrink-0 ${isSelected ? 'text-[#FF6A00]' : 'text-[#4a6280]'}`} />
                          <div className="min-w-0">
                            <p className={`text-[11px] font-semibold truncate ${isSelected ? 'text-white' : 'text-white/60'}`}>
                              {r.reportTitle}
                            </p>
                            <p className="text-[10px] text-[#4a6280]">{fmtDateShort(r.createdAtMs)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )
          ) : (
            filteredChats.length === 0 ? (
              <EmptyPane label="Nenhuma conversa salva ainda. As próximas conversas com o Lucca serão registradas aqui." />
            ) : (
              filteredChats.map((s) => {
                const isSelected = selected?.kind === 'chat' && selected.session.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelected({ kind: 'chat', session: s })}
                    className={`w-full flex items-start gap-2 px-3 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-[#FF6A00]/10 border-l-2 border-[#FF6A00]' : 'hover:bg-white/[0.03] border-l-2 border-transparent'
                    }`}
                  >
                    <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? 'text-[#FF6A00]' : 'text-[#4a6280]'}`} />
                    <div className="min-w-0">
                      <p className={`text-[12px] font-semibold truncate ${isSelected ? 'text-white' : 'text-white/70'}`}>{s.title}</p>
                      <p className="text-[10px] text-[#4a6280]">{fmtDateShort(s.updatedAtMs)} · {s.messages.length} msgs</p>
                    </div>
                  </button>
                );
              })
            )
          )}
        </div>
      </div>

      {/* ── Right viewer panel ── */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <FolderOpen className="w-7 h-7 text-[#FF6A00]/40" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-white/50">Selecione um item</p>
              <p className="text-[12px] text-[#4a6280] mt-1">Escolha um relatório ou conversa na lista ao lado.</p>
            </div>
          </div>
        ) : selected.kind === 'report' ? (
          <ReportViewer
            entry={selected.entry}
            onClose={() => setSelected(null)}
            onDelete={handleDeleteReport}
          />
        ) : (
          <ChatViewer
            session={selected.session}
            onClose={() => setSelected(null)}
            onDelete={handleDeleteChat}
          />
        )}
      </div>
    </div>
  );
}
