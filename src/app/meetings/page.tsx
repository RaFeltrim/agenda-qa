import { Plus } from 'lucide-react';

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Meetings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Schedule and manage meetings
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <p className="text-slate-600 dark:text-slate-400">
          Meetings management coming soon...
        </p>
      </div>
    </div>
  );
}
