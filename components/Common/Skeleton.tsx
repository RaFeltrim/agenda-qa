import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '',
  width,
  height,
  borderRadius = '0.5rem',
  animated = true 
}) => {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius,
    backgroundColor: '#e5e7eb', // slate-200
  };

  return (
    <div
      className={`bg-slate-200 dark:bg-slate-700 rounded-lg ${
        animated ? 'animate-pulse' : ''
      } ${className}`}
      style={style}
    />
  );
};

// Predefined skeleton components
export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm">
    {/* Header skeleton */}
    <div className="flex items-start justify-between mb-3">
      <Skeleton width="60px" height="20px" borderRadius="0.75rem" />
    </div>
    
    {/* Title skeleton */}
    <div className="space-y-2 mb-3">
      <Skeleton width="80%" height="20px" />
      <Skeleton width="60%" height="20px" />
    </div>
    
    {/* Description skeleton */}
    <div className="space-y-2 mb-6">
      <Skeleton width="100%" height="16px" />
      <Skeleton width="90%" height="16px" />
    </div>
    
    {/* Progress bar skeleton */}
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton width="80px" height="14px" />
        <Skeleton width="30px" height="14px" />
      </div>
      <Skeleton width="100%" height="8px" borderRadius="9999px" />
    </div>
    
    {/* Footer skeleton */}
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
      <Skeleton width="40px" height="16px" />
      <div className="flex items-center gap-2">
        <Skeleton width="80px" height="24px" borderRadius="0.75rem" />
        <Skeleton width="32px" height="32px" borderRadius="0.75rem" />
      </div>
    </div>
  </div>
);

export const KanbanBoardSkeleton: React.FC = () => (
  <div className="max-w-[1400px] mx-auto px-6 pb-20">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mobile:gap-4">
      {[1, 2, 3, 4].map((col) => (
        <div 
          key={col} 
          className="flex flex-col h-full min-h-[600px] rounded-[2.5rem] p-4 bg-slate-100/30 dark:bg-slate-900/20"
        >
          {/* Column header skeleton */}
          <div className="flex items-center justify-between mb-6 px-3">
            <div className="flex items-center gap-3">
              <Skeleton width="10px" height="10px" borderRadius="9999px" />
              <Skeleton width="80px" height="16px" />
              <Skeleton width="24px" height="20px" borderRadius="1rem" />
            </div>
            <Skeleton width="24px" height="24px" borderRadius="0.75rem" />
          </div>
          
          {/* Cards skeletons */}
          <div className="flex flex-col gap-5 flex-1">
            {[1, 2, 3].map((card) => (
              <CardSkeleton key={card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;