import React from 'react';
import { X, AlertTriangle, Check, X as XIcon } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          borderColor: 'border-red-200 dark:border-red-800',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          buttonClass: 'bg-red-600 hover:bg-red-700'
        };
      case 'info':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-blue-500" />,
          borderColor: 'border-blue-200 dark:border-blue-800',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          buttonClass: 'bg-blue-600 hover:bg-blue-700'
        };
      default: // warning
        return {
          icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
          borderColor: 'border-amber-200 dark:border-amber-800',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          buttonClass: 'bg-amber-600 hover:bg-amber-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-2 ${styles.borderColor} ${styles.bgColor}`}>
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {styles.icon}
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 px-4 ${styles.buttonClass} text-white font-black uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2`}
          >
            <Check className="w-4 h-4" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;