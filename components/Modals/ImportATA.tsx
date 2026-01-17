import React, { useState } from 'react';
import {
  X,
  FileUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  File,
  UploadCloud,
} from 'lucide-react';
import { extractTasksFromDocument } from '../../services/geminiService';
import { ExtractedTasks, Card } from '../../types';
import { safeParseDate } from '../../utils/dateUtils';

interface ImportATAModalProps {
  onClose: () => void;
  onImport: (newCards: Card[]) => void;
}

const ImportATAModal: React.FC<ImportATAModalProps> = ({ onClose, onImport }) => {
  const [file, setFile] = useState<{ name: string; content: string; type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<ExtractedTasks | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setError(null);
    if (rawFile.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFile({ name: rawFile.name, content: base64, type: rawFile.type });
      };
      reader.readAsDataURL(rawFile);
    } else {
      const text = await rawFile.text();
      setFile({ name: rawFile.name, content: text, type: rawFile.type });
    }
  };

  const processATA = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const extracted = await extractTasksFromDocument(file.content, file.type);
      setPreview(extracted);
    } catch (err) {
      setError('Falha na extração. Certifique-se de que o documento é uma ATA legível.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmImport = () => {
    if (!preview) return;
    const newCards: Card[] = preview.tasks.map((t, idx) => ({
      id: Math.random().toString(36).substr(2, 9),
      titulo: t.titulo,
      descricao: t.descricao,
      responsavel: t.responsavel,
      prazo: safeParseDate(t.prazo),
      status: 'backlog',
      tags: t.tags,
      urgente: t.urgente,
      dataCriacao: new Date().toISOString(),
      dataCriacaoPor: 'Gemini Orquestrador',
      comentarios: [],
      anexos: [],
      subTasks: [],
      historico: [
        { acao: 'Card orquestrado via IA (ATA)', por: 'System', em: new Date().toISOString() },
      ],
    }));
    onImport(newCards);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-white/10">
        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-3">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <FileUp className="w-6 h-6" />
              </span>
              Importar Documento
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">
              Processamento via Gemini 2.0
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-10 space-y-8">
          {!preview ? (
            <>
              <label className="group relative border-4 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-16 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/10 transition-all overflow-hidden">
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.pdf"
                  onChange={handleFileChange}
                />

                {/* Decorative Background Element */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10 w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300">
                  <UploadCloud className="w-12 h-12" />
                </div>
                <p className="relative z-10 text-lg font-black dark:text-white uppercase tracking-widest">
                  {file ? file.name : 'Arraste ou Clique'}
                </p>
                <p className="relative z-10 text-xs text-slate-400 font-bold mt-2 tracking-widest uppercase bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
                  PDF, Markdown ou TXT
                </p>
              </label>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-200 rounded-2xl text-xs font-bold flex items-center gap-3 animate-pulse border border-red-100 dark:border-red-900/30">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
              )}

              <button
                onClick={processATA}
                disabled={!file || isLoading}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 dark:shadow-none hover:opacity-90 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processando Inteligência...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-5 h-5" /> Extrair Tarefas com IA
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Análise Concluída
                </h3>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide border border-green-200 dark:border-green-800">
                  {preview.tasks.length} Itens Detectados
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {preview.tasks.map((t, i) => (
                  <div
                    key={i}
                    className="p-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {t.titulo}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${t.urgente ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}
                      >
                        {t.responsavel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {t.descricao}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setPreview(null)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-wider hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmImport}
                  className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-green-700 shadow-xl shadow-green-600/20 active:scale-95 transition-all"
                >
                  <FileText className="w-4 h-4" /> Importar para o Board
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportATAModal;
