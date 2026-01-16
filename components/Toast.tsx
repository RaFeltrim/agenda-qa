
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X, AlertTriangle } from 'lucide-react';
import { Notification } from '../types';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(notification.id), 5000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const styles = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      bg: 'bg-emerald-50/90 dark:bg-emerald-900/40',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      text: 'text-emerald-900 dark:text-emerald-100'
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-rose-500" />,
      bg: 'bg-rose-50/90 dark:bg-rose-900/40',
      border: 'border-rose-200 dark:border-rose-500/30',
      text: 'text-rose-900 dark:text-rose-100'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      bg: 'bg-amber-50/90 dark:bg-amber-900/40',
      border: 'border-amber-200 dark:border-amber-500/30',
      text: 'text-amber-900 dark:text-amber-100'
    },
    info: {
      icon: <Info className="w-5 h-5 text-indigo-500" />,
      bg: 'bg-white/90 dark:bg-slate-800/90',
      border: 'border-indigo-100 dark:border-indigo-500/30',
      text: 'text-slate-700 dark:text-slate-200'
    }
  };

  const style = styles[notification.type];

  return (
    <div className={`
      relative flex items-start gap-4 p-5 rounded-2xl border backdrop-blur-md shadow-xl 
      animate-in slide-in-from-right-10 fade-in duration-300 mb-3 min-w-[320px] max-w-sm
      ${style.bg} ${style.border}
    `}>
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1">
        <p className={`text-sm font-bold leading-tight ${style.text}`}>
          {notification.message}
        </p>
      </div>
      <button 
        onClick={() => onClose(notification.id)} 
        className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors -mr-2 -mt-2"
      >
        <X className="w-4 h-4 opacity-50" />
      </button>
      
      {/* Progress Bar Animation */}
      <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full animate-[shrink_5s_linear_forwards] origin-left rounded-b-2xl overflow-hidden" />
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
