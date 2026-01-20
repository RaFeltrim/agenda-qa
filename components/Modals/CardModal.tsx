import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Comentario, Anexo, SubTask, Sprint } from '../../types';
import {
  X,
  Calendar,
  User,
  Tag,
  MessageSquare,
  History,
  Paperclip,
  Send,
  Trash2,
  Edit2,
  Save,
  Link as LinkIcon,
  Clock,
  Plus,
  CheckSquare,
  Square,
  Volume2,
  Sparkles,
  Database,
  FileText,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  Check,
} from 'lucide-react';
import { formatTimeAgo, getPrazoColor } from '../../utils/dateUtils';
import { speakText, generateTestData, generateAIReport } from '../../services/geminiService';
import { ModalTransition } from '../Transitions';
import SprintAssignment from './CardModalComponents/SprintAssignment';

interface CardModalProps {
  card: Card;
  onClose: () => void;
  onUpdate: (card: Card) => void;
  onDelete: (id: string) => void;
  userRole?: 'editor' | 'viewer' | null;
  sprints?: Sprint[];
  activeSprintId?: string | null;
}

const CardModal: React.FC<CardModalProps> = ({ 
  card, 
  onClose, 
  onUpdate, 
  onDelete, 
  userRole,
  sprints = [],
  activeSprintId = null
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'ai-help' | 'history'>(
    'details'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ text: string; sources: any[] } | null>(null);
  const [testData, setTestData] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Evidence Input State
  const [showEvidenceInput, setShowEvidenceInput] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');

  // Edit Mode State
  const [editForm, setEditForm] = useState({
    titulo: card.titulo,
    descricao: card.descricao,
    prazo: card.prazo,
    responsavel: card.responsavel,
    status: card.status,
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setEditForm({
      titulo: card.titulo,
      descricao: card.descricao,
      prazo: card.prazo,
      responsavel: card.responsavel,
      status: card.status,
    });
  }, [card]);

  const handleListenCard = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      if (!audioContextRef.current)
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const textToRead = `Tarefa: ${card.titulo}. Descrição: ${card.descricao}. Prazo: ${card.prazo}. Possui ${card.subTasks.length} subtarefas.`;
      const audioBufferData = await speakText(textToRead);
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioBufferData);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsSpeaking(false);
      source.start(0);
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  const handleGenerateData = async () => {
    setAiLoading(true);
    try {
      const data = await generateTestData(card.titulo + ' ' + card.descricao);
      setTestData(data);
      setActiveTab('ai-help');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setAiLoading(true);
    try {
      const report = await generateAIReport(card.titulo + ' ' + card.descricao);
      setAiResult(report);
      setActiveTab('ai-help');
    } finally {
      setAiLoading(false);
    }
  };

<<<<<<< Updated upstream
  const handleAddEvidence = () => {
    if (!evidenceUrl.trim()) return;
    const anexo: Anexo = {
=======
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setEvidenceFile(file);
    
    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setEvidencePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvidence = async () => {
    if (!evidenceFile) return;
    
    setIsUploading(true);
    try {
      // In a real implementation, this would upload to a storage service
      // For now, we'll create a data URL for demonstration
      let fileUrl = '';
      let fileName = evidenceFile.name;
      
      if (evidenceFile.type.startsWith('image/')) {
        const reader = new FileReader();
        fileUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(evidenceFile);
        });
      } else {
        // For other file types, create a blob URL
        fileUrl = URL.createObjectURL(evidenceFile);
        fileName = evidenceFile.name;
      }
      
      const anexo: Anexo = {
        id: Math.random().toString(36).substr(2, 9),
        nome: fileName,
        url: fileUrl,
        tipo: 'evidencia',
        uploadadoPor: 'Rafael Feltrim',
        dataUpload: new Date().toISOString(),
      };
      
      onUpdate({ 
        ...card, 
        anexos: [...card.anexos, anexo],
        historico: [
          ...card.historico,
          { acao: `Nova evidência adicionada: "${fileName}"`, por: currentUser, em: new Date().toISOString() }
        ]
      });
      
      setEvidenceFile(null);
      setEvidencePreview(null);
      setShowEvidenceInput(false);
    } catch (error) {
      console.error('Erro ao adicionar evidência:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelEvidence = () => {
    setEvidenceFile(null);
    setEvidencePreview(null);
    setShowEvidenceInput(false);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    
    const newSubtask: SubTask = {
>>>>>>> Stashed changes
      id: Math.random().toString(36).substr(2, 9),
      nome: 'Evidência de Validação',
      url: evidenceUrl,
      tipo: 'evidencia',
      uploadadoPor: 'Rafael Feltrim',
      dataUpload: new Date().toISOString(),
    };
<<<<<<< Updated upstream
    onUpdate({ ...card, anexos: [...card.anexos, anexo] });
    setEvidenceUrl('');
    setShowEvidenceInput(false);
=======
    
    onUpdate({ 
      ...card, 
      subTasks: [...card.subTasks, newSubtask],
      historico: [
        ...card.historico,
        { acao: `Nova subtarefa adicionada: "${newSubtask.texto}"`, por: 'Usuário', em: new Date().toISOString() }
      ]
    });
    
    setNewSubtaskText('');
    setShowSubtaskInput(false);
  };

  const handleCancelSubtask = () => {
    setNewSubtaskText('');
    setShowSubtaskInput(false);
  };

  // Audit logged subtask operations
  const auditLoggedAddSubtask = async () => {
    if (!newSubtaskText.trim()) return;
    
    try {
      const newSubtask: SubTask = {
        id: Math.random().toString(36).substr(2, 9),
        texto: newSubtaskText.trim(),
        concluida: false
      };
      
      // Log the subtask addition
      await AuditService.logActivity(
        'CREATE',
        'subtasks',
        newSubtask.id,
        profile?.id || 'anonymous', // Use actual user ID from auth context
        null,
        newSubtask,
        { 
          entity_type: 'subtask', 
          operation: 'add',
          parent_card_id: card.id
        }
      );
      
      // Update the card with new subtask
      onUpdate({ 
        ...card, 
        subTasks: [...card.subTasks, newSubtask],
        historico: [
          ...card.historico,
          { acao: `Nova subtarefa adicionada: "${newSubtask.texto}"`, por: currentUser, em: new Date().toISOString() }
        ]
      });
      
      setNewSubtaskText('');
      setShowSubtaskInput(false);
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Still add the subtask even if audit logging fails
      const newSubtask: SubTask = {
        id: Math.random().toString(36).substr(2, 9),
        texto: newSubtaskText.trim(),
        concluida: false
      };
      
      onUpdate({ 
        ...card, 
        subTasks: [...card.subTasks, newSubtask],
        historico: [
          ...card.historico,
          { acao: `Nova subtarefa adicionada: "${newSubtask.texto}"`, por: currentUser, em: new Date().toISOString() }
        ]
      });
      
      setNewSubtaskText('');
      setShowSubtaskInput(false);
    }
  };

  const auditLoggedToggleSubtask = async (subtaskId: string, newCompletedStatus: boolean) => {
    try {
      const subtaskToToggle = card.subTasks.find(s => s.id === subtaskId);
      if (subtaskToToggle) {
        // Log the subtask completion toggle
        await AuditService.logActivity(
          'UPDATE',
          'subtasks',
          subtaskId,
          profile?.id || 'anonymous', // Use actual user ID from auth context
          { concluida: subtaskToToggle.concluida },
          { concluida: newCompletedStatus },
          { 
            entity_type: 'subtask', 
            operation: 'toggle_completion',
            parent_card_id: card.id
          }
        );
      }
      
      // Update the subtask completion status
      const newSub = card.subTasks.map(s =>
        s.id === subtaskId ? { ...s, concluida: newCompletedStatus } : s
      );
      
      onUpdate({ ...card, subTasks: newSub });
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Still toggle the subtask even if audit logging fails
      const newSub = card.subTasks.map(s =>
        s.id === subtaskId ? { ...s, concluida: newCompletedStatus } : s
      );
      
      onUpdate({ ...card, subTasks: newSub });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      auditLoggedAddSubtask();
    } else if (e.key === 'Escape') {
      handleCancelSubtask();
    }
>>>>>>> Stashed changes
  };

  const saveChanges = () => {
    onUpdate({
      ...card,
      titulo: editForm.titulo,
      descricao: editForm.descricao,
      prazo: editForm.prazo,
      responsavel: editForm.responsavel,
      status: editForm.status,
      historico: [
        ...card.historico,
        { acao: 'Card editado manualmente', por: currentUser, em: new Date().toISOString() },
      ],
    });
    setIsEditing(false);
  };

  return (
    <ModalTransition
      isOpen={true}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
          mass: 1,
        }}
        className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[92vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10"
      >
        {/* Header Profissional */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors ${isEditing ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'bg-slate-50 dark:bg-slate-900/50'}`}
        >
          <div className="flex-1 flex items-center gap-4">
            <button
              onClick={() => {
                // Feature desabilitada temporariamente - Aguardando Sprint 3
                alert('⚠️ Feature em desenvolvimento\n\nA função de áudio descrição estará disponível na Sprint 3 do roadmap.');
              }}
              disabled={true}
              className="p-3 rounded-2xl transition-all shadow-sm flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed opacity-50"
              title="Feature desabilitada - Aguardando Sprint 3"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${card.urgente ? 'bg-red-500 text-white' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400'}`}
                >
                  {card.urgente ? 'URGENTE' : card.status.replace('-', ' ')}
                </span>
                <span className="text-[10px] font-bold text-slate-400">ID: {card.id}</span>
              </div>

              {isEditing ? (
                <input
                  value={editForm.titulo}
                  onChange={e => setEditForm({ ...editForm, titulo: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border-none rounded-xl text-xl font-black text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  autoFocus
                />
              ) : (
                <h2 className="text-xl font-black dark:text-white leading-tight truncate pr-4">
                  {card.titulo}
                </h2>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 ml-4">
            {isEditing ? (
              <button
                onClick={saveChanges}
                className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all flex items-center gap-2 px-4"
              >
                <Save className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wide hidden sm:inline">
                  Salvar
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-indigo-600 shadow-sm transition-all hover:border-indigo-200"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-500 shadow-sm transition-all hover:border-red-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="px-10 flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          {[
            { id: 'details', label: 'Detalhes', icon: Clock },
            { id: 'ai-help', label: 'Ajuda da IA', icon: Sparkles },
            { id: 'comments', label: 'Feedback', icon: MessageSquare },
            { id: 'history', label: 'Log', icon: History },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-6 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === t.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </motion.div>

        {/* Scrollable Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 overflow-y-auto p-10 space-y-8 bg-white dark:bg-slate-900"
        >
          {activeTab === 'details' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div
                className={`p-6 rounded-3xl border transition-all ${isEditing ? 'bg-white dark:bg-slate-800 border-indigo-300 ring-4 ring-indigo-500/10' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}
              >
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  Contexto e Requisitos
                  {isEditing && (
                    <span className="text-indigo-500 text-[9px] bg-indigo-50 px-2 py-0.5 rounded-full">
                      Editando
                    </span>
                  )}
                </h4>
                {isEditing ? (
                  <textarea
                    value={editForm.descricao}
                    onChange={e => setEditForm({ ...editForm, descricao: e.target.value })}
                    className="w-full bg-transparent border-none p-0 text-sm text-slate-700 dark:text-slate-300 leading-relaxed focus:ring-0 min-h-[120px] resize-none"
                  />
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {card.descricao}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Checklist Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    <span>Checklist Operacional</span>
                    <span className="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-1 rounded-lg">
                      {card.subTasks.filter(s => s.concluida).length}/{card.subTasks.length}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {card.subTasks.map(st => (
                      <div
                        key={st.id}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl group transition-all hover:border-indigo-200 hover:shadow-sm cursor-pointer"
                        onClick={() => {
                          if (isEditing) return;
                          const newSub = card.subTasks.map(s =>
                            s.id === st.id ? { ...s, concluida: !s.concluida } : s
                          );
                          onUpdate({ ...card, subTasks: newSub });
                        }}
                      >
                        {st.concluida ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                        )}
                        <span
                          className={`text-sm font-medium ${st.concluida ? 'text-slate-300 line-through' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          {st.texto}
                        </span>
                      </div>
                    ))}
                    <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Adicionar Item
                    </button>
                  </div>
                </div>

                {/* Meta Info Section */}
                <div className="space-y-6">
                  {/* Sprint Assignment */}
                  <SprintAssignment 
                    card={card}
                    sprints={sprints}
                    activeSprintId={activeSprintId}
                    isEditing={isEditing}
                    onUpdateCard={onUpdate}
                    currentUser={currentUser}
                  />
                  
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Responsável
                    </h4>
                    {isEditing ? (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          value={editForm.responsavel}
                          onChange={e => setEditForm({ ...editForm, responsavel: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-3 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${card.responsavel}`}
                          className="w-8 h-8 rounded-lg bg-white"
                          alt="Avatar"
                        />
                        <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                          {card.responsavel}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Prazo de Entrega
                    </h4>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.prazo}
                        onChange={e => setEditForm({ ...editForm, prazo: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div
                        className={`flex items-center gap-3 p-3 rounded-2xl border ${getPrazoColor(card.prazo)}`}
                      >
                        <Calendar className="w-5 h-5 opacity-70" />
                        <span className="text-sm font-black">
                          {new Date(card.prazo).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bloqueio Manual Toggle */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Status do Card
                    </h4>
                    {isEditing ? (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="blocked-toggle"
                            checked={editForm.status === 'bloqueado'}
                            onChange={(e) => setEditForm({ 
                              ...editForm, 
                              status: e.target.checked ? 'bloqueado' : 'em-progresso' 
                            })}
                            className="w-4 h-4 text-red-600 bg-white border-slate-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                          />
                          <label 
                            htmlFor="blocked-toggle" 
                            className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                          >
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Bloqueado Manualmente
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-3 p-3 rounded-2xl border ${card.status === 'bloqueado' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                        <AlertCircle className={`w-5 h-5 ${card.status === 'bloqueado' ? 'text-red-500' : 'text-slate-400'}`} />
                        <span className={`text-sm font-bold ${card.status === 'bloqueado' ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {card.status === 'bloqueado' ? 'Bloqueado Manualmente' : 'Em Progresso' }
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      Evidências
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {card.anexos
                        .filter(a => a.tipo === 'evidencia')
                        .map(a => (
                          <div
                            key={a.id}
                            className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl relative group hover:border-indigo-300 transition-all"
                          >
                            <ImageIcon className="w-4 h-4 text-slate-400 mb-1" />
                            <p className="text-[10px] font-bold truncate dark:text-white">
                              {a.nome}
                            </p>
                            <a
                              href={a.url}
                              target="_blank"
                              className="absolute inset-0 flex items-center justify-center bg-indigo-600/90 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-white backdrop-blur-sm"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </div>
                        ))}

                      {showEvidenceInput ? (
                        <div className="col-span-2 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl animate-in zoom-in">
                          <input
                            autoFocus
                            value={evidenceUrl}
                            onChange={e => setEvidenceUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 bg-transparent border-none text-xs focus:ring-0 p-1"
                          />
                          <button
                            onClick={handleAddEvidence}
                            className="p-1.5 bg-indigo-600 text-white rounded-lg"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setShowEvidenceInput(false)}
                            className="p-1.5 bg-slate-300 text-slate-600 rounded-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowEvidenceInput(true)}
                          className="p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-help' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    // Feature desabilitada temporariamente - Aguardando Sprint 3
                    alert('⚠️ Feature em desenvolvimento\n\nA geração de massa de dados estará disponível na Sprint 3 do roadmap.');
                  }}
                  disabled={true}
                  className="p-6 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 text-slate-400 dark:text-slate-500 rounded-3xl shadow-lg flex flex-col items-center text-center gap-3 opacity-50 cursor-not-allowed"
                >
                  <div className="p-3 bg-slate-200/20 dark:bg-slate-700/20 rounded-2xl">
                    <Database className="w-8 h-8" />
                  </div>
                  <span className="font-black uppercase tracking-tighter">
                    Gerar Massa de Dados
                  </span>
                  <span className="text-[10px] opacity-70">Disponível na Sprint 3</span>
                </button>

                <button
                  onClick={() => {
                    // Feature desabilitada temporariamente - Aguardando Sprint 3
                    alert('⚠️ Feature em desenvolvimento\n\nO relatório estratégico estará disponível na Sprint 3 do roadmap.');
                  }}
                  disabled={true}
                  className="p-6 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 text-slate-400 dark:text-slate-500 rounded-3xl shadow-lg flex flex-col items-center text-center gap-3 opacity-50 cursor-not-allowed"
                >
                  <div className="p-3 bg-slate-200/20 dark:bg-slate-700/20 rounded-2xl">
                    <FileText className="w-8 h-8" />
                  </div>
                  <span className="font-black uppercase tracking-tighter">
                    Relatório Estratégico
                  </span>
                  <span className="text-[10px] opacity-70">Disponível na Sprint 3</span>
                </button>
              </div>

              {aiLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-600 animate-pulse" />
                  </div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">
                    Consultando Orquestrador IA...
                  </p>
                </div>
              )}

              {!aiLoading && (testData || aiResult) && (
                <div className="bg-slate-900 text-slate-100 p-8 rounded-[2.5rem] font-mono text-xs leading-relaxed overflow-x-auto shadow-2xl border border-slate-800 relative">
                  <div className="flex justify-between mb-4 border-b border-slate-800 pb-4">
                    <span className="text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> IA Intelligence Report
                    </span>
                    <button
                      onClick={() => {
                        setTestData(null);
                        setAiResult(null);
                      }}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {testData && (
                    <pre className="whitespace-pre-wrap font-medium text-emerald-400">
                      {testData}
                    </pre>
                  )}
                  {aiResult && (
                    <div className="space-y-4">
                      <div className="prose prose-invert max-w-none text-slate-300">
                        {aiResult.text}
                      </div>
                      {aiResult.sources.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-800">
                          <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest">
                            Fontes de Pesquisa
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {aiResult.sources.map((s: any, idx: number) => (
                              <a
                                key={idx}
                                href={s.web?.uri || s.maps?.uri}
                                target="_blank"
                                className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 rounded-lg border border-slate-700 hover:border-indigo-500 text-indigo-400 hover:text-white transition-all flex items-center gap-2"
                              >
                                <LinkIcon className="w-3 h-3" />
                                {s.web?.title || 'Referência Externa'}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="relative group">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Adicionar nota técnica ou feedback..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-6 text-sm min-h-[140px] focus:ring-4 focus:ring-indigo-500/10 shadow-inner resize-none transition-all group-hover:bg-slate-100 dark:group-hover:bg-slate-800/80"
                />
                <button
                  onClick={() => {
                    if (!newComment.trim()) return;
                    const comment: Comentario = {
                      id: Date.now().toString(),
                      autor: 'Rafael Feltrim',
                      texto: newComment,
                      timestamp: new Date().toISOString(),
                    };
                    onUpdate({ ...card, comentarios: [comment, ...card.comentarios] });
                    setNewComment('');
                  }}
                  className="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-2xl hover:scale-105 transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:scale-100"
                  disabled={!newComment.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {card.comentarios.length === 0 && (
                  <div className="text-center py-10 opacity-40">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-xs font-bold uppercase tracking-widest">
                      Nenhum feedback registrado
                    </p>
                  </div>
                )}
                {card.comentarios.map(c => (
                  <div key={c.id} className="flex gap-4 animate-in slide-in-from-bottom-2">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.autor}`}
                      className="w-10 h-10 rounded-2xl border-2 border-white dark:border-slate-800 bg-slate-100 shadow-sm"
                      alt="Avatar"
                    />
                    <div className="flex-1 bg-white dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black dark:text-white">{c.autor}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {formatTimeAgo(c.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {c.texto}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {card.historico.map((h, i) => (
                <div
                  key={i}
                  className="flex gap-4 pb-6 border-l-2 border-slate-100 dark:border-slate-800 pl-6 relative last:pb-0"
                >
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 z-10"></div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {h.acao}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      por <span className="font-bold text-indigo-500">{h.por}</span> •{' '}
                      {formatTimeAgo(h.em)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="px-10 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center"
        >
          {userRole === 'editor' && (
<<<<<<< Updated upstream
            <button
              onClick={() => onDelete(card.id)}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-50 px-4 py-2 rounded-xl"
            >
              <Trash2 className="w-4 h-4" /> Deletar Card
            </button>
=======
            <div className="flex flex-col gap-2">
              {/* Verificar se é card vencido */}
              {new Date(card.prazo) < new Date() && card.status !== 'concluido' ? (
                <button
                  onClick={() => {
                    if (window.confirm(`⚠️ CARD VENCIDO ⚠️

"${card.titulo}"

Este card está vencido desde ${new Date(card.prazo).toLocaleDateString('pt-BR')}.

Você deseja:
1. ARQUIVAR (recomendado)
2. EXCLUIR PERMANENTEMENTE`)) {
                      onDelete(card.id);
                    }
                  }}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-800 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-orange-50 px-4 py-2 rounded-xl border border-orange-200"
                >
                  <AlertCircle className="w-4 h-4" /> Deletar Card Vencido
                </button>
              ) : (
                <button
                  onClick={() => onDelete(card.id)}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-50 px-4 py-2 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" /> Deletar Card
                </button>
              )}
            </div>
>>>>>>> Stashed changes
          )}
          <div className="flex gap-4">
            {isEditing && (
              <button
                onClick={saveChanges}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
              >
                Salvar Alterações
              </button>
            )}
            <button
              onClick={onClose}
              className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </ModalTransition>
  );
};

export default CardModal;
