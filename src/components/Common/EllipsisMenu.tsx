// Reusable Ellipsis Menu Component
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ellipsis } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}

interface EllipsisMenuProps {
  items: MenuItem[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid' | 'outline';
  className?: string;
  menuClassName?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

const EllipsisMenu: React.FC<EllipsisMenuProps> = ({
  items,
  position = 'bottom-right',
  size = 'md',
  variant = 'ghost',
  className = '',
  menuClassName = '',
  onOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      onOpen?.();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpen, onClose]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'right-0 top-full mt-2';
      case 'bottom-left':
        return 'left-0 top-full mt-2';
      case 'top-right':
        return 'right-0 bottom-full mb-2';
      case 'top-left':
        return 'left-0 bottom-full mb-2';
      default:
        return 'right-0 top-full mt-2';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-1.5';
      case 'md':
        return 'p-2';
      case 'lg':
        return 'p-3';
      default:
        return 'p-2';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'ghost':
        return 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200';
      case 'solid':
        return 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300';
      case 'outline':
        return 'border border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200';
      default:
        return 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200';
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
      onClose?.();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          rounded-lg transition-all duration-200 flex items-center justify-center
          ${getSizeClasses()}
          ${getVariantClasses()}
          ${className}
          ${isOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}
        `}
        aria-label="More options"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Ellipsis className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 min-w-[180px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl
              border border-slate-200 dark:border-slate-700 py-2
              ${getPositionClasses()}
              ${menuClassName}
            `}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`
                  w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3
                  transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl
                  ${item.disabled 
                    ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                    : item.danger
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  }
                  ${item.disabled ? '' : 'cursor-pointer'}
                `}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EllipsisMenu;