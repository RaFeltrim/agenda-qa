import React from 'react';
import { getUserInitials } from '../utils/userUtils';

interface UserAvatarProps {
    name?: string | null | undefined;
    role?: 'editor' | 'viewer' | 'admin' | null | undefined;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showStatus?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    name,
    role,
    size = 'md',
    className = '',
    showStatus = false
}) => {
    const initials = getUserInitials(name || undefined, role);

    // Size classes
    const sizeClasses = {
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-10 h-10 text-xs',
        lg: 'w-12 h-12 text-sm',
        xl: 'w-16 h-16 text-lg'
    };

    // Generate a consistent gradient based on the name length/char to keep it "stable" for the same user
    // or just use a nice premium gradient for everyone as requested
    const gradients = [
        'from-indigo-500 to-violet-600',
        'from-emerald-500 to-teal-600',
        'from-blue-500 to-cyan-600',
        'from-rose-500 to-pink-600',
        'from-amber-500 to-orange-600',
        'from-purple-500 to-fuchsia-600'
    ];

    // Simple hash function to pick a gradient
    const getGradientIndex = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash) % gradients.length;
    };

    const gradientClass = name ? gradients[getGradientIndex(name)] : 'from-slate-500 to-slate-600';

    return (
        <div className={`relative inline-block ${className}`}>
            <div
                className={`
          ${sizeClasses[size]} 
          rounded-xl 
          bg-gradient-to-br ${gradientClass} 
          text-white 
          flex items-center justify-center 
          font-black 
          shadow-lg 
          shadow-indigo-500/20 
          border-2 border-white dark:border-slate-800
          transition-transform hover:scale-105 select-none
        `}
                title={name || 'Usuário'}
            >
                {initials}
            </div>

            {showStatus && (
                <div className={`
          absolute -bottom-1 -right-1 
          w-3.5 h-3.5 
          rounded-full 
          border-2 border-white dark:border-slate-800
          ${role === 'editor' ? 'bg-emerald-500' : 'bg-slate-400'}
        `} />
            )}
        </div>
    );
};

export default UserAvatar;
