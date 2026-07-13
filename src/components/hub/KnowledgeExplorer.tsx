'use client';

import { useEffect, useState, useCallback, ReactNode } from 'react';
import {
  ChevronRight, Clock, Download, Search, Trash2, X, ChevronDown,
} from 'lucide-react';
import { IconBot3D, IconChatBubble3D, IconFolder3D, IconFileDoc3D } from './HubUiIcons3D';
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
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_6px_#dfe5ee,_-3px_-3px_6px_#ffffff] flex items-center justify-center">
        <IconFolder3D size={26} />
      </div>
      <p className="text-[13px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const tokenRegex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const matches = [...text.matchAll(tokenRegex)];
  
  if (matches.length === 0) {
    return text;
  }
  
  let lastIndex = 0;
  matches.forEach((match, idx) => {
    const matchText = match[0];
    const matchIndex = match.index!;
    
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    
    if (matchText.startsWith('**') && matchText.endsWith('**')) {
      const content = matchText.slice(2, -2);
      parts.push(<strong key={idx} className="font-extrabold text-slate-800">{content}</strong>);
    } else if (matchText.startsWith('[') && matchText.includes('](')) {
      const closeBracket = matchText.indexOf('](');
      const label = matchText.substring(1, closeBracket);
      const url = matchText.substring(closeBracket + 2, matchText.length - 1);
      parts.push(
        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline font-bold break-all">
          {label}
        </a>
      );
    }
    
    lastIndex = matchIndex + matchText.length;
  });
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return <>{parts}</>;
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const nodes: ReactNode[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];
  
  // Find the first paragraph to render as a callout intro (only if it doesn't start with heading/list/code)
  const introLines: string[] = [];
  const restLines: string[] = [];
  let foundFirstBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!foundFirstBlock) {
      if (!trimmed) continue;
      if (trimmed.startsWith('#') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('```')) {
        foundFirstBlock = true;
        restLines.push(lines[i]);
      } else {
        introLines.push(lines[i]);
      }
    } else {
      restLines.push(lines[i]);
    }
  }
  
  // If we collected some intro lines, let's treat them as the premium callout box!
  const introText = introLines.join('\n').trim();
  if (introText) {
    nodes.push(
      <div key="intro-callout" className="mb-6 p-4 rounded-2xl border border-slate-200/50 bg-[#f8fafc]/90 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.01),_3px_3px_8px_rgba(0,0,0,0.01)] text-[13px] leading-relaxed text-slate-600 font-semibold border-l-4 border-l-[#FF6B00]">
        {renderInline(introText)}
      </div>
    );
  }
  
  const targetLines = introText ? restLines : lines;
  
  targetLines.forEach((line, index) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
      } else {
        inCode = false;
        nodes.push(
          <pre key={`code-${index}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 bg-[#0f172a] p-4 text-[11px] leading-relaxed text-slate-100 font-mono">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
      }
      return;
    }
    
    if (inCode) {
      codeBuffer.push(line);
      return;
    }
    
    if (!trimmed) {
      nodes.push(<div key={`spacer-${index}`} className="h-3" />);
      return;
    }
    
    if (trimmed.startsWith('# ')) {
      nodes.push(
        <h2 key={`h1-${index}`} className="text-[17px] font-black text-slate-900 mt-6 mb-3 pb-1.5 border-b border-slate-200/60 leading-tight">
          {renderInline(trimmed.substring(2))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      nodes.push(
        <h3 key={`h2-${index}`} className="text-[15px] font-black text-slate-800 mt-5 mb-2.5 leading-tight">
          {renderInline(trimmed.substring(3))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      nodes.push(
        <h4 key={`h3-${index}`} className="text-[13.5px] font-bold text-slate-800 mt-4 mb-2 leading-tight">
          {renderInline(trimmed.substring(4))}
        </h4>
      );
      return;
    }
    
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      nodes.push(
        <div key={`li-${index}`} className="flex items-start gap-2.5 py-1 pl-1">
          <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6B00]" />
          <p className="text-[13px] leading-relaxed text-slate-600 font-medium">
            {renderInline(trimmed.substring(2))}
          </p>
        </div>
      );
      return;
    }
    
    nodes.push(
      <p key={`p-${index}`} className="text-[13px] leading-relaxed text-slate-600 font-medium my-1.5">
        {renderInline(line)}
      </p>
    );
  });
  
  return <div className="space-y-1 font-sans">{nodes}</div>;
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
      <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] mb-1">{entry.agentTitle}</p>
          <h3 className="text-[15px] font-black text-[#0f172a] leading-tight truncate">{entry.reportTitle}</h3>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3" />
            {fmtDate(entry.createdAtMs)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => downloadAgentReport(entry)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-[12px] font-bold text-slate-600 hover:text-slate-800 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-red-400 hover:text-red-600 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-400 hover:text-slate-700 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="rounded-3xl border border-white/60 bg-[#eef2f7] p-5 shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] max-h-full">
          <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm">
            <MarkdownRenderer content={entry.reportContent} />
          </div>
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
      <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] mb-1">Chat com Lucca</p>
          <h3 className="text-[15px] font-black text-[#0f172a] leading-tight truncate">{session.title}</h3>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3" />
            {fmtDate(session.updatedAtMs)}
            <span className="ml-2">· {session.messages.length} mensagens</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-red-400 hover:text-red-600 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-400 hover:text-slate-700 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {session.messages.filter((m) => m.role !== 'assistant' || m.text !== session.messages[0]?.text).map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed font-medium ${
              msg.role === 'user'
                ? 'bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#0f172a] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]'
                : 'bg-[#eef2f7] border border-white/50 text-slate-700 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
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
    <div className="flex gap-0 h-[600px] rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-[8px_8px_20px_#dfe5ee,_-8px_-8px_20px_#ffffff]">

      {/* ── Left sidebar ── */}
      <div className="w-64 shrink-0 flex flex-col border-r border-slate-200 bg-white">

        {/* Search */}
        <div className="p-3 border-b border-slate-200">
          <div className="flex items-center gap-2 bg-[#eef2f7] border border-white/30 rounded-xl px-3 py-2 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar…"
              className="flex-1 bg-transparent text-[12px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setSection('agentes')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-all ${
              section === 'agentes'
                ? 'text-[#FF6B00] shadow-[inset_0_-2px_0_0_#FF6B00]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <IconBot3D size={16} />
            Agentes
            {reports.length > 0 && (
              <span className="bg-[#FF6B00]/10 text-[#FF6B00] text-[9px] font-black px-1.5 py-0.5 rounded-full border border-[#FF6B00]/20">{reports.length}</span>
            )}
          </button>
          <button
            onClick={() => setSection('chats')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-all ${
              section === 'chats'
                ? 'text-[#FF6B00] shadow-[inset_0_-2px_0_0_#FF6B00]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <IconChatBubble3D size={16} />
            Chats
            {chatSessions.length > 0 && (
              <span className="bg-[#FF6B00]/10 text-[#FF6B00] text-[9px] font-black px-1.5 py-0.5 rounded-full border border-[#FF6B00]/20">{chatSessions.length}</span>
            )}
          </button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 rounded-full border-2 border-[#FF6B00]/30 border-t-[#FF6B00] animate-spin" />
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
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-200/50 transition-colors group"
                    >
                      {isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF6B00] shrink-0" />
                      }
                      <IconBot3D size={15} />
                      <span className="text-[12px] font-bold text-slate-700 truncate flex-1">{agentKey}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-[#eef2f7] px-1.5 py-0.5 rounded-full shadow-[1px_1px_2px_#d1d9e6,_-1px_-1px_2px_#ffffff]">{agentReports.length}</span>
                    </button>

                    {isExpanded && agentReports.map((r) => {
                      const isSelected = selected?.kind === 'report' && selected.entry.id === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setSelected({ kind: 'report', entry: r })}
                          className={`w-full flex items-start gap-2 pl-9 pr-3 py-2 text-left transition-all ${
                            isSelected ? 'bg-[#FF6B00]/10 border-l-2 border-[#FF6B00] shadow-[inset_1px_0_3px_rgba(255,107,0,0.1)]' : 'hover:bg-slate-200/40 border-l-2 border-transparent'
                          }`}
                        >
                          <span className="mt-0.5 shrink-0"><IconFileDoc3D size={13} /></span>
                          <div className="min-w-0">
                            <p className={`text-[11px] font-semibold truncate ${isSelected ? 'text-[#0f172a]' : 'text-slate-600'}`}>
                              {r.reportTitle}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold">{fmtDateShort(r.createdAtMs)}</p>
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
                    className={`w-full flex items-start gap-2 px-3 py-2.5 text-left transition-all ${
                      isSelected ? 'bg-[#FF6B00]/10 border-l-2 border-[#FF6B00] shadow-[inset_1px_0_3px_rgba(255,107,0,0.1)]' : 'hover:bg-slate-200/40 border-l-2 border-transparent'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0"><IconChatBubble3D size={15} /></span>
                    <div className="min-w-0">
                      <p className={`text-[12px] font-semibold truncate ${isSelected ? 'text-[#0f172a]' : 'text-slate-600'}`}>{s.title}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{fmtDateShort(s.updatedAtMs)} · {s.messages.length} msgs</p>
                    </div>
                  </button>
                );
              })
            )
          )}
        </div>
      </div>

      {/* ── Right viewer panel ── */}
      <div className="flex-1 min-w-0 bg-white">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-[5px_5px_10px_#dfe5ee,_-5px_-5px_10px_#ffffff] flex items-center justify-center">
              <IconFolder3D size={36} />
            </div>
            <div>
              <p className="text-[14px] font-black text-slate-600">Selecione um item</p>
              <p className="text-[12px] text-slate-400 mt-1 font-semibold">Escolha um relatório ou conversa na lista ao lado.</p>
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
