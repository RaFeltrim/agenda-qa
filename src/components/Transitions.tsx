import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Check for reduced motion preference
const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getReducedMotionTransition = () => ({
  duration: 0,
  ease: 'linear',
});

const getDefaultTransition = (duration: number = 0.4) => ({
  duration: prefersReducedMotion ? 0 : duration,
  ease: [0.22, 1, 0.36, 1],
});

// Shared animation variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 20,
    scale: prefersReducedMotion ? 1 : 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: getDefaultTransition(0.4),
  },
  out: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -20,
    scale: prefersReducedMotion ? 1 : 0.98,
    transition: getReducedMotionTransition(),
  },
};

export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.8,
    y: prefersReducedMotion ? 0 : 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: prefersReducedMotion
      ? getReducedMotionTransition()
      : {
          type: 'spring',
          damping: 25,
          stiffness: 300,
          mass: 1,
        },
  },
  exit: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.8,
    y: prefersReducedMotion ? 0 : 20,
    transition: getReducedMotionTransition(),
  },
};

export const cardVariants = {
  hidden: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 30,
    scale: prefersReducedMotion ? 1 : 0.95,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: prefersReducedMotion ? 0 : index * 0.05,
      duration: prefersReducedMotion ? 0 : 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  exit: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -20,
    scale: prefersReducedMotion ? 1 : 0.95,
    transition: getReducedMotionTransition(),
  },
};

export const fadeInUp = {
  hidden: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: prefersReducedMotion
      ? getReducedMotionTransition()
      : {
          duration: 0.3,
          ease: 'easeOut',
        },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.1,
    },
  },
};

// Reusable Transition Components
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    className={className}
  >
    {children}
  </motion.div>
);

interface ModalTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

export const ModalTransition: React.FC<ModalTransitionProps> = ({
  children,
  isOpen,
  className = '',
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        className={className}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({ children, className = '' }) => (
  <motion.div variants={staggerContainer} initial="hidden" animate="show" className={className}>
    {children}
  </motion.div>
);

interface FadeInItemProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const FadeInItem: React.FC<FadeInItemProps> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{
      opacity: 0,
      y: prefersReducedMotion ? 0 : 20,
    }}
    animate={{
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.4,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Loading spinner with smooth entrance
export const SmoothSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-center"
    >
      <motion.div
        className={`${sizeClasses[size]} border-2 border-indigo-600 border-t-transparent rounded-full`}
        animate={{ rotate: prefersReducedMotion ? 0 : 360 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }
        }
      />
    </motion.div>
  );
};

// Fade transition wrapper
export const FadeTransition: React.FC<{
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}> = ({ children, isVisible, className = '' }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);
