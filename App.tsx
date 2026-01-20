import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { Card, CardStatus, FilterState, Notification, Sprint, Meeting } from './types';
import { useStorage } from './hooks/useStorage';
import { useDarkMode } from './hooks/useDarkMode';
import { useAuth } from './hooks/useAuth';
import { MOCK_CARDS, MOCK_SPRINTS } from './constants';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/Kanban/KanbanBoard';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import { Plus } from 'lucide-react';

const CardModal = React.lazy(() => import('./components/Modals/CardModal'));
const ImportATA = React.lazy(() => import('./components/Modals/ImportATA'));
const CreateCardModal = React.lazy(() => import('./components/Modals/CreateCardModal'));
const SprintListModal = React.lazy(() => import('./components/Modals/SprintListModal'));
const CreateSprintModal = React.lazy(() => import('./components/Modals/CreateSprintModal'));
const FinishSprintModal = React.lazy(() => import('./components/Modals/FinishSprintModal'));
const PerformanceModal = React.lazy(() => import('./components/Modals/PerformanceModal'));
const AuditLogDrawer = React.lazy(() => import('./components/Modals/AuditLogDrawer'));
const ScheduleMeetingModal = React.lazy(() => import('./components/Modals/ScheduleMeetingModal'));
<<<<<<< Updated upstream
=======
const EnhancedScheduleMeetingModal = React.lazy(() => import('./components/Modals/EnhancedScheduleMeetingModal'));
const EnhancedAnalyticsDashboard = React.lazy(() => import('./components/EnhancedAnalyticsDashboard'));
const EditSprintModal = React.lazy(() => import('./components/Modals/EditSprintModal'));
const MeetingsDashboard = React.lazy(() => import('./components/Meeting/MeetingsDashboard'));
const ArchiveSprintModal = React.lazy(() => import('./components/Modals/ArchiveSprintModal'));
const ArchivedSprintsView = React.lazy(() => import('./components/ArchivedSprintsView'));
const ProjectsTab = React.lazy(() => import('./components/ProjectsTab'));
const ProjectSprintsView = React.lazy(() => import('./components/ProjectSprintsView'));
const ConfirmationModal = React.lazy(() => import('./components/Modals/ConfirmationModal'));
const AdminSettings = React.lazy(() => import('./components/AdminSettings'));

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    nome: 'Projeto Principal',
    descricao: 'Desenvolvimento do sistema principal da empresa',
    cor: '#3b82f6',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    nome: 'Dashboard Analytics',
    descricao: 'Sistema de análise e métricas de performance',
    cor: '#10b981',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj-3',
    nome: 'Mobile App',
    descricao: 'Aplicativo mobile para clientes',
    cor: '#f59e0b',
    createdAt: new Date().toISOString()
  }
];
>>>>>>> Stashed changes

const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    titulo: 'Daily BAU Orquestrador',
    horario: '09:00',
    pauta: 'Alinhamento de bugs críticos',
    participantes: ['Rafael', 'Wagner', 'Danyla'],
    local: 'Google Meet',
  },
  {
    id: 'm2',
    titulo: 'Refinement Sprint 04',
    horario: '14:30',
    pauta: 'Escopo de novas APIs',
    participantes: ['Equipe QA', 'Product Owner'],
    local: 'Teams',
  },
];

const App: React.FC = () => {
  const { role, logout } = useAuth();

  const [cards, setCards] = useStorage<Card[]>('kanban_cards_v3', MOCK_CARDS);
  const [sprints, setSprints] = useStorage<Sprint[]>('kanban_sprints_v3', MOCK_SPRINTS);
  const [activeSprintId, setActiveSprintId] = useStorage<string | null>(
    'active_sprint_v3',
    'sprint-2'
  );
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
<<<<<<< Updated upstream
=======
  const [isEnhancedAnalyticsOpen, setIsEnhancedAnalyticsOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [sprintToArchive, setSprintToArchive] = useState<Sprint | null>(null);
  const [isArchiveSprintModalOpen, setIsArchiveSprintModalOpen] = useState(false);
  const [isArchivedSprintsViewOpen, setIsArchivedSprintsViewOpen] = useState(false);
  const [isProjectsViewOpen, setIsProjectsViewOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);
  
  // Admin Panel State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
>>>>>>> Stashed changes

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        (document.querySelector('input') as any)?.focus();
      }
      if (e.key === 'n' && !['INPUT', 'TEXTAREA'].includes((document.activeElement as any).tagName))
        setIsCreateModalOpen(true);
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
      const matchSearch =
        card.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (filterType === 'minhas') return card.responsavel.includes('Rafael');
      if (filterType === 'vencidas')
        return new Date(card.prazo) < new Date() && card.status !== 'concluido';
      if (filterType === 'em-progresso') return card.status === 'em-progresso';
      return true;
    });
  }, [cards, searchTerm, filterType, activeSprintId]);

  const selectedCard = useMemo(
    () => cards.find(c => c.id === selectedCardId),
    [cards, selectedCardId]
  );

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

    addNotification('Relatório Markdown gerado com sucesso!', 'success');
  };

  return (
    <ProtectedRoute addNotification={addNotification}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-200">
        <Header
          isDark={isDark}
          toggleDark={setIsDark}
          onImportClick={() => setIsImportModalOpen(true)}
          onExportClick={handleExportMarkdown}
          onAuditLogClick={() => setIsAuditLogOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          userRole={role}
          onLogout={logout}
          onAdminClick={() => setIsAdminPanelOpen(true)}
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
            onDeleteMeeting={id => {
              setMeetings(prev => prev.filter(m => m.id !== id));
              addNotification('Reunião removida.', 'info');
            }}
          />

          <KanbanBoard
            cards={filteredCards}
            onCardClick={card => setSelectedCardId(card.id)}
            onStatusChange={(id, status) =>
              setCards(prev => prev.map(c => (c.id === id ? { ...c, status } : c)))
            }
            onAddNewToColumn={status => {
              console.log('Creating card for status:', status);
              setIsCreateModalOpen(true);
              // Store the target status for the modal
              (window as any).createCardStatus = status;
            }}
            userRole={role}
          />
        </main>

        <div className="fixed top-20 right-4 z-[90] flex flex-col pointer-events-none">
          <div className="pointer-events-auto">
            {notifications.map(n => (
              <Toast key={n.id} notification={n} onClose={removeNotification} />
            ))}
          </div>
        </div>

        <Suspense fallback={null}>
          {selectedCard && (
            <CardModal
              card={selectedCard}
              onClose={() => setSelectedCardId(null)}
              onUpdate={updated =>
                setCards(prev => prev.map(c => (c.id === updated.id ? updated : c)))
              }
              onDelete={id => {
                setCards(prev => prev.filter(c => c.id !== id));
                setSelectedCardId(null);
              }}
              userRole={role}
              sprints={sprints}
              activeSprintId={activeSprintId}
            />
          )}
          {isImportModalOpen && (
            <ImportATA
              onClose={() => setIsImportModalOpen(false)}
              onImport={nc => {
                setCards(prev => [...nc, ...prev]);
                setIsImportModalOpen(false);
              }}
            />
          )}
          {isCreateModalOpen && (
            <CreateCardModal
              initialStatus={(window as any).createCardStatus || 'backlog'}
              activeSprintId={activeSprintId}
              onClose={() => {
                setIsCreateModalOpen(false);
                delete (window as any).createCardStatus;
              }}
              onCreate={c => {
                setCards(prev => [c, ...prev]);
                setIsCreateModalOpen(false);
                delete (window as any).createCardStatus;
              }}
            />
          )}
          {isSprintModalOpen && (
            <SprintListModal
              sprints={sprints}
              cards={cards}
              activeSprintId={activeSprintId}
              onClose={() => setIsSprintModalOpen(false)}
              onSelectSprint={setActiveSprintId}
              onAddNewSprint={() => setIsCreateSprintModalOpen(true)}
<<<<<<< Updated upstream
=======
              onEditSprint={auditLoggedEditSprint}
              onArchiveSprint={(sprintId) => {
                const sprintToArchive = sprints.find(s => s.id === sprintId);
                if (sprintToArchive) {
                  setSprintToArchive(sprintToArchive);
                  setIsArchiveSprintModalOpen(true);
                }
              }}
              onSetEditingSprint={setEditingSprint}
              userRole={role}
>>>>>>> Stashed changes
            />
          )}
          {isCreateSprintModalOpen && (
            <CreateSprintModal
              onClose={() => setIsCreateSprintModalOpen(false)}
              onCreate={s => {
                setSprints(prev => [...prev, s]);
                setIsCreateSprintModalOpen(false);
                setActiveSprintId(s.id);
              }}
            />
          )}
          {isPerformanceModalOpen && sprints.find(s => s.id === activeSprintId) && (
            <PerformanceModal
              sprint={sprints.find(s => s.id === activeSprintId)!}
              cards={cards}
              onClose={() => setIsPerformanceModalOpen(false)}
            />
          )}
          {isAuditLogOpen && (
            <AuditLogDrawer cards={cards} onClose={() => setIsAuditLogOpen(false)} />
          )}
          {isScheduleModalOpen && (
            <ScheduleMeetingModal
              onClose={() => setIsScheduleModalOpen(false)}
              onSchedule={m => {
                setMeetings(prev => [...prev, m]);
                setIsScheduleModalOpen(false);
                addNotification('Reunião agendada!', 'success');
              }}
            />
          )}
<<<<<<< Updated upstream
=======
          {isEnhancedAnalyticsOpen && (
            <EnhancedAnalyticsDashboard
              onClose={() => setIsEnhancedAnalyticsOpen(false)}
              activeSprintId={activeSprintId}
              sprints={sprints}
              cards={cards}
            />
          )}
          {editingSprint && (
            <EditSprintModal
              sprint={editingSprint}
              onClose={() => setEditingSprint(null)}
              onSave={async (updatedSprint) => {
                await auditLoggedEditSprint(updatedSprint);
                setEditingSprint(null);
              }}
              onArchive={(sprintId) => {
                const sprintToArchive = sprints.find(s => s.id === sprintId);
                if (sprintToArchive) {
                  setSprintToArchive(sprintToArchive);
                  setIsArchiveSprintModalOpen(true);
                  setEditingSprint(null);
                }
              }}
              userRole={role}
            />
          )}
          
          {/* Archive Sprint Modal */}
          {isArchiveSprintModalOpen && sprintToArchive && (
            <ArchiveSprintModal
              sprint={sprintToArchive}
              cards={cards}
              onClose={() => {
                setIsArchiveSprintModalOpen(false);
                setSprintToArchive(null);
              }}
              onConfirm={async (moveToBacklog) => {
                await auditLoggedArchiveSprint(sprintToArchive.id);
              }}
            />
          )}
          
          {/* Archived Sprints View */}
          {isArchivedSprintsViewOpen && (
            <ArchivedSprintsView
              sprints={sprints}
              cards={cards}
              onClose={() => setIsArchivedSprintsViewOpen(false)}
              onUnarchiveSprint={auditLoggedUnarchiveSprint}
              onSelectSprint={(sprintId) => {
                setActiveSprintId(sprintId);
                setIsArchivedSprintsViewOpen(false);
                addNotification('Sprint selecionada para visualização', 'info');
              }}
            />
          )}
          
          {/* Confirmation Modal */}
          <Suspense fallback={null}>
            {isConfirmationModalOpen && confirmationConfig && (
              <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                onConfirm={confirmationConfig.onConfirm}
                title={confirmationConfig.title}
                message={confirmationConfig.message}
                type={confirmationConfig.type || 'warning'}
                confirmText="Deletar"
                cancelText="Cancelar"
              />
            )}
          </Suspense>

          {/* Projects View */}
          {/* Admin Settings Panel */}
          <Suspense fallback={null}>
            {isAdminPanelOpen && (
              <AdminSettings
                onClose={() => setIsAdminPanelOpen(false)}
                userRole={role || 'viewer'}
              />
            )}
          </Suspense>

          {isProjectsViewOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 w-full h-full sm:w-[95vw] sm:max-w-6xl sm:rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 sm:h-[95vh] md:h-[90vh]">
                <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                    <div className="md:col-span-1">
                      <Suspense fallback={<div className="text-center py-4 sm:py-8">Carregando projetos...</div>}>
                        <ProjectsTab
                          projects={projects}
                          selectedProjectId={activeProjectId}
                          onSelectProject={handleSelectProject}
                          onCreateProject={handleCreateProject}
                          onUpdateProject={handleUpdateProject}
                          onDeleteProject={handleDeleteProject}
                          userRole={role}
                        />
                      </Suspense>
                    </div>
                    <div className="md:col-span-2">
                      <Suspense fallback={<div className="text-center py-4 sm:py-8">Carregando sprints...</div>}>
                        <ProjectSprintsView
                          project={activeProjectId ? projects.find(p => p.id === activeProjectId) || null : null}
                          sprints={sprints}
                          cards={cards}
                          onCreateSprint={async (sprintData) => {
                            const newSprint: Sprint = {
                              ...sprintData,
                              id: `sprint-${Date.now()}`,
                              updatedAt: new Date().toISOString()
                            };
                            await auditLoggedCreateSprint(newSprint);
                          }}
                          onEditSprint={auditLoggedEditSprint}
                          onArchiveSprint={(sprintId) => {
                            const sprintToArchive = sprints.find(s => s.id === sprintId);
                            if (sprintToArchive) {
                              setSprintToArchive(sprintToArchive);
                              setIsArchiveSprintModalOpen(true);
                            }
                          }}
                          onSelectSprint={(sprintId) => {
                            setActiveSprintId(sprintId);
                            setIsProjectsViewOpen(false);
                            addNotification('Sprint selecionada para visualização', 'info');
                          }}
                          userRole={role}
                        />
                      </Suspense>
                    </div>
                  </div>
                </div>
                <div className="p-2 sm:p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <button
                    onClick={() => setIsProjectsViewOpen(false)}
                    className="w-full py-3 sm:py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all min-h-[44px]"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
>>>>>>> Stashed changes
        </Suspense>

        {/* Floating Action Button - Only show for editors */}
        {role === 'editor' && (
          <div className="fixed bottom-10 right-10 z-40">
            <button
              onClick={() => {
                (window as any).createCardStatus = 'backlog';
                setIsCreateModalOpen(true);
              }}
              className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default App;
