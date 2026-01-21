import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TransitionContextType {
  isTransitioning: boolean;
  setIsTransitioning: (isTransitioning: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
};

interface TransitionProviderProps {
  children: ReactNode;
}

export const TransitionProvider: React.FC<TransitionProviderProps> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <TransitionContext.Provider
      value={{
        isTransitioning,
        setIsTransitioning,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
};
