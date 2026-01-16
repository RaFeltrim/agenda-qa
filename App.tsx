
import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { Card, CardStatus, FilterState, Notification, Sprint, Meeting } from './types';
import { useStorage } from './hooks/useStorage';
import { useDarkMode } from './hooks/useDarkMode';
import { MOCK_CARDS, MOCK_SPRINTS } from './constants';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/Kanban/KanbanBoard';
import Toast from './components/Toast';
import { Plus, Key, ExternalLink, ShieldAlert } from 'lucide-react';

const CardModal = React.lazy(() => import('./components/Modals/CardModal'));
const ImportATA = React.lazy(() => import('./components/Modals/ImportATA'));
const CreateCardModal = React.lazy(() => import('./components/Modals/CreateCardModal'));
const SprintListModal = React.lazy(() => import('./components/Modals/SprintListModal'));
const CreateSprintModal = React.lazy(() => import('./components/Modals/CreateSprintModal'));
const FinishSprintModal = React.lazy(() => import('./components/Modals/FinishSprintModal'));
const PerformanceModal = React.lazy(() => import('./components/Modals/PerformanceModal'));
const AuditLogDrawer = React.lazy(() => import('./components/Modals/AuditLogDrawer'));
const ScheduleMeetingModal = React.lazy(() => import('./components/Modals/ScheduleMeetingModal'));

const MOCK_MEETINGS: Meeting[] = [
  { id: 'm1', titulo: 'Daily BAU Orquestrador', horario: '09:00', pauta: 'Alinhamento de bugs críticos', participantes: ['Rafael', 'Wagner', 'Danyla'], local: 'Google Meet' },
  { id: 'm2', titulo: 'Refinement Sprint 04', horario: '14:30', pauta: 'Escopo de novas APIs', participantes: ['Equipe QA', 'Product Owner'], local: 'Teams' }
];

const App: React.FC = () => {
  const [cards, setCards] = useStorage<Card[]>('kanban_cards_v3', MOCK_CARDS);
  const [sprints, setSprints] = useStorage<Sprint[]>('kanban_sprints_v3', MOCK_SPRINTS);
  const [activeSprintId, setActiveSprintId] = useStorage<string | null>('active_sprint_v3', 'sprint-2');
  const [meetings, setMeetings] = useStorage<Meeting[]>('kanban_meetings_v3', MOCK_MEETINGS);
  
  const [isDark, setIsDark] = useDarkMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterState['type']>('todas');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false);
  const [isFinishSprintModalOpen, setIsFinishSprintModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    // Rely on window.aistudio via any to avoid declaration conflicts.
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        const has = await aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        // Fallback for environments without the selector (assume env var is valid)
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      await aistudio.openSelectKey();
      // Assume success as per instructions to avoid race condition
      setHasApiKey(true);
    }
  };

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleExportMarkdown = () => {
    const date = new Date().toLocaleDateString('pt-BR');
    let mdContent = `# Relatório de Status - Agenda Kanban (${date})\n\n`;
    
    // Group by status
    ['backlog', 'em-progresso', 'bloqueado', 'concluido'].forEach(status => {
       const statusCards = cards.filter(c => c.status === status);
       mdContent += `## ${status.toUpperCase().replace('-', ' ')} (${statusCards.length})\n\n`;
       
       if (statusCards.length === 0) {
         mdContent += `*Nenhum item neste status.*\n\n`;
       } else {
         statusCards.forEach(card => {
           mdContent += `### [${card.id}] ${card.titulo}\n`;
           mdContent += `**Responsável:** ${card.responsavel}  |  **Prazo:** ${card.prazo}\n`;
           mdContent += `**Tags:** ${card.tags.join(', ')}\n\n`;
           mdContent += `> ${card.descricao}\n\n`;
           if (card.subTasks.length > 0) {
             mdContent += `**Checklist:**\n`;
             card.subTasks.forEach(st => {
               mdContent += `- [${st.concluida ? 'x' : ' '}] ${st.texto}\n`;
             });
             mdContent += `\n`;
           }
           mdContent += `---\n\n`;
         });
       }
    });

    // Create download
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-export-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addNotification("Relatório Markdown gerado com sucesso!", "success");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); (document.querySelector('input') as any)?.focus(); }
      if (e.key === 'n' && !['INPUT', 'TEXTAREA'].includes((document.activeElement as any).tagName)) setIsCreateModalOpen(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const urgents = cards.filter(c => c.urgente && c.status !== 'concluido').length;
    if (urgents > 0) addNotification(`${urgents} tarefas críticas pendentes no board.`, 'warning');
  }, [cards, addNotification]);

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (activeSprintId && card.sprintId !== activeSprintId) return false;
      const matchSearch = card.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || card.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (filterType === 'minhas') return card.responsavel.includes('Rafael');
      if (filterType === 'vencidas') return new Date(card.prazo) < new Date() && card.status !== 'concluido';
      if (filterType === 'em-progresso') return card.status === 'em-progresso';
      return true;
    });
  }, [cards, searchTerm, filterType, activeSprintId]);

  const selectedCard = useMemo(() => cards.find(c => c.id === selectedCardId), [cards, selectedCardId]);

  // Key Selection Landing Page
  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 rounded-[2.5rem] p-10 shadow-2xl border border-slate-700 text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg mx-auto mb-8">
            <Key className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Workspace Setup</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Para utilizar os recursos de inteligência avançada (Gemini Pro) e Pesquisa Web, você precisa selecionar uma 
            <span className="text-indigo-400 font-bold"> chave de API de um projeto com faturamento ativo</span>.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={handleSelectKey}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
            >
              Selecionar Chave de API
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
            >
              Saiba mais sobre faturamento <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <div className="mt-12 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-start gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 font-medium">
              O erro 403 Permission Denied ocorre geralmente quando a chave utilizada não possui permissão para os modelos Pro ou quando o projeto excedeu limites de cota.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-200">
      <Header 
        isDark={isDark} 
        toggleDark={setIsDark} 
        onImportClick={() => setIsImportModalOpen(true)}
        onExportClick={handleExportMarkdown}
        onAuditLogClick={() => setIsAuditLogOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <main className="pb-10">
        <Dashboard 
          cards={cards} 
          sprints={sprints}
          meetings={meetings}
          onFilterChange={setFilterType} 
          activeFilter={filterType} 
          activeSprintId={activeSprintId}
          onOpenSprintList={() => setIsSprintModalOpen(true)}
          onFinishSprint={() => setIsFinishSprintModalOpen(true)}
          onOpenPerformance={() => setIsPerformanceModalOpen(true)}
          onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
          onDeleteMeeting={(id) => {
            setMeetings(prev => prev.filter(m => m.id !== id));
            addNotification("Reunião removida.", "info");
          }}
        />

        <KanbanBoard 
          cards={filteredCards} 
          onCardClick={(card) => setSelectedCardId(card.id)}
          onStatusChange={(id, status) => setCards(prev => prev.map(c => c.id === id ? {...c, status} : c))}
          onAddNewToColumn={() => setIsCreateModalOpen(true)}
        />
      </main>

      <div className="fixed top-20 right-4 z-[100] flex flex-col pointer-events-none">
        <div className="pointer-events-auto">
          {notifications.map(n => <Toast key={n.id} notification={n} onClose={removeNotification} />)}
        </div>
      </div>

      <Suspense fallback={null}>
        {selectedCard && (
          <CardModal 
            card={selectedCard} 
            onClose={() => setSelectedCardId(null)}
            onUpdate={(updated) => setCards(prev => prev.map(c => c.id === updated.id ? updated : c))}
            onDelete={(id) => { setCards(prev => prev.filter(c => c.id !== id)); setSelectedCardId(null); }}
          />
        )}
        {isImportModalOpen && <ImportATA onClose={() => setIsImportModalOpen(false)} onImport={(nc) => { setCards(prev => [...nc, ...prev]); setIsImportModalOpen(false); }} />}
        {isCreateModalOpen && <CreateCardModal onClose={() => setIsCreateModalOpen(false)} onCreate={(c) => { setCards(prev => [c, ...prev]); setIsCreateModalOpen(false); }} />}
        {isSprintModalOpen && <SprintListModal sprints={sprints} cards={cards} activeSprintId={activeSprintId} onClose={() => setIsSprintModalOpen(false)} onSelectSprint={setActiveSprintId} onAddNewSprint={() => setIsCreateSprintModalOpen(true)} />}
        {isCreateSprintModalOpen && <CreateSprintModal onClose={() => setIsCreateSprintModalOpen(false)} onCreate={(s) => { setSprints(prev => [...prev, s]); setIsCreateSprintModalOpen(false); setActiveSprintId(s.id); }} />}
        {isPerformanceModalOpen && sprints.find(s => s.id === activeSprintId) && <PerformanceModal sprint={sprints.find(s => s.id === activeSprintId)!} cards={cards} onClose={() => setIsPerformanceModalOpen(false)} />}
        {isAuditLogOpen && <AuditLogDrawer cards={cards} onClose={() => setIsAuditLogOpen(false)} />}
        {isScheduleModalOpen && <ScheduleMeetingModal onClose={() => setIsScheduleModalOpen(false)} onSchedule={(m) => { setMeetings(prev => [...prev, m]); setIsScheduleModalOpen(false); addNotification("Reunião agendada!", "success"); }} />}
      </Suspense>

      <div className="fixed bottom-10 right-10 z-40">
         <button onClick={() => setIsCreateModalOpen(true)} className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
            <Plus className="w-8 h-8" />
         </button>
      </div>
    </div>
  );
};

export default App;
