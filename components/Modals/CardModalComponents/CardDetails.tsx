import React from 'react';
import { Card } from '../../../types';
import { User, Calendar, Plus, CheckSquare, Square, ImageIcon, ExternalLink, Check, X } from 'lucide-react';
import { getPrazoColor } from '../../../utils/dateUtils';

interface CardDetailsProps {
  card: Card;
  isEditing: boolean;
  editForm: {
    titulo: string;
    descricao: string;
    prazo: string;
    responsavel: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    titulo: string;
    descricao: string;
    prazo: string;
    responsavel: string;
  }>>;
  showEvidenceInput: boolean;
  setShowEvidenceInput: React.Dispatch<React.SetStateAction<boolean>>;
  evidenceUrl: string;
  setEvidenceUrl: React.Dispatch<React.SetStateAction<string>>;
  handleAddEvidence: () => void;
}

const CardDetails: React.FC<CardDetailsProps> = ({
  card,
  isEditing,
  editForm,
  setEditForm,
  showEvidenceInput,
  setShowEvidenceInput,
  evidenceUrl,
  setEvidenceUrl,
  handleAddEvidence
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className={`p-6 rounded-3xl border transition-all ${isEditing ? 'bg-white dark:bg-slate-800 border-indigo-300 ring-4 ring-indigo-500/10' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          Contexto e Requisitos
          {isEditing && <span className="text-indigo-500 text-[9px] bg-indigo-50 px-2 py-0.5 rounded-full">Editando</span>}
        </h4>
        {isEditing ? (
          <textarea 
            value={editForm.descricao}
            onChange={e => setEditForm({...editForm, descricao: e.target.value})}
            className="w-full bg-transparent border-none p-0 text-sm text-slate-700 dark:text-slate-300 leading-relaxed focus:ring-0 min-h-[120px] resize-none"
          />
        ) : (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{card.descricao}</p>
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
                  if(isEditing) return;
                  // This would need to be handled by parent component
                }}
              >
                {st.concluida ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />}
                <span className={`text-sm font-medium ${st.concluida ? 'text-slate-300 line-through' : 'text-slate-600 dark:text-slate-300'}`}>{st.texto}</span>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar Item
            </button>
          </div>
        </div>

        {/* Meta Info Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Responsável</h4>
            {isEditing ? (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  value={editForm.responsavel}
                  onChange={e => setEditForm({...editForm, responsavel: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-3 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${card.responsavel}`} className="w-8 h-8 rounded-lg bg-white" alt="Avatar" />
                <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">{card.responsavel}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prazo de Entrega</h4>
            {isEditing ? (
              <input 
                type="date"
                value={editForm.prazo}
                onChange={e => setEditForm({...editForm, prazo: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <div className={`flex items-center gap-3 p-3 rounded-2xl border ${getPrazoColor(card.prazo)}`}>
                <Calendar className="w-5 h-5 opacity-70" />
                <span className="text-sm font-black">{new Date(card.prazo).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Evidências</h4>
            <div className="grid grid-cols-2 gap-2">
              {card.anexos.filter(a => a.tipo === 'evidencia').map(a => (
                <div key={a.id} className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl relative group hover:border-indigo-300 transition-all">
                  <ImageIcon className="w-4 h-4 text-slate-400 mb-1" />
                  <p className="text-[10px] font-bold truncate dark:text-white">{a.nome}</p>
                  <a href={a.url} target="_blank" className="absolute inset-0 flex items-center justify-center bg-indigo-600/90 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-white backdrop-blur-sm">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              ))}
              
              {showEvidenceInput ? (
                <div className="col-span-2 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl animate-in zoom-in">
                  <input 
                    autoFocus
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-transparent border-none text-xs focus:ring-0 p-1"
                  />
                  <button onClick={handleAddEvidence} className="p-1.5 bg-indigo-600 text-white rounded-lg"><Check className="w-3 h-3" /></button>
                  <button onClick={() => setShowEvidenceInput(false)} className="p-1.5 bg-slate-300 text-slate-600 rounded-lg"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <button onClick={() => setShowEvidenceInput(true)} className="p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetails;