export function safeParseDate(dateString: string | null | undefined): string {
  if (!dateString) {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    return formatDateForInput(defaultDate);
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      return formatDateForInput(defaultDate);
    }
    return formatDateForInput(date);
  } catch {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    return formatDateForInput(defaultDate);
  }
}

// Helper function to format date for input without timezone issues
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to parse date from input preserving local date
export function parseDateFromInput(dateString: string): Date {
  const parts = dateString.split('-').map(Number);
  const year = parts[0] || 0;
  const month = parts[1] || 1;
  const day = parts[2] || 1;
  return new Date(year, month - 1, day); // Month is 0-indexed in JS Date
}

export function getPrazoColor(prazo: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(prazo);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'bg-red-100 text-red-800 border-red-200';
  if (diffDays < 3) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (diffDays < 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
}

export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora mesmo';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  return date.toLocaleDateString('pt-BR');
}
