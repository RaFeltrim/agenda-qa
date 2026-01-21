import React, { useState } from "react";
import { Anexo } from "../types";
import { Edit3, Trash2, Save, X, ExternalLink } from "lucide-react";

interface EvidenceEditorProps {
  evidence: Anexo;
  onUpdate: (updatedEvidence: Anexo) => void;
  onDelete: (evidenceId: string) => void;
  onClose: () => void;
}

const EvidenceEditor: React.FC<EvidenceEditorProps> = ({ 
  evidence, 
  onUpdate, 
  onDelete, 
  onClose 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(evidence.nome);

  const handleSave = () => {
    const updatedEvidence: Anexo = {
      ...evidence,
      nome: editName
    };
    
    onUpdate(updatedEvidence);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja remover esta evidência?\n\n"${evidence.nome}"`)) {
      onDelete(evidence.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-black dark:text-white">
                Editar Evidência
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {evidence.tipo === 'evidencia' ? 'ARQUIVO ANEXADO' : 'EVIDÊNCIA'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
            {evidence.url && (
              <div className="mb-4">
                {evidence.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                  <img 
                    src={evidence.url} 
                    alt={evidence.nome}
                    className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">
                      {evidence.nome.split('.').pop()?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {evidence.nome}
                  </p>
                )}
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adicionado por {evidence.uploadadoPor} em {' '}
                  {new Date(evidence.dataUpload).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <a
                href={evidence.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                title="Abrir arquivo"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Remover
          </button>
          
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(evidence.nome);
                  }}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editName.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceEditor;