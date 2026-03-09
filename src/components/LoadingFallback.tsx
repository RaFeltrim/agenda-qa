import { Spin, Typography } from 'antd';

const { Text } = Typography;

/**
 * Premium loading fallback for React.lazy() Suspense boundaries.
 * Shows a centered spinner with animated skeleton appearance.
 */
export default function LoadingFallback() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fadeIn">
            {/* Pulsing brand logo */}
            <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-premium animate-pulse">
                QA
            </div>

            {/* Spinner */}
            <Spin size="large" />

            {/* Skeleton bars */}
            <div className="flex flex-col items-center gap-2 w-64">
                <div className="h-3 bg-slate-200 rounded-full w-full animate-pulse" />
                <div className="h-3 bg-slate-200 rounded-full w-3/4 animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="h-3 bg-slate-200 rounded-full w-1/2 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>

            <Text type="secondary" className="text-sm mt-2">Carregando módulo...</Text>
        </div>
    );
}
