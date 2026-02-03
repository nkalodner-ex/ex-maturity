import { FileText } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="q-empty-state">
      <FileText size={64} className="q-empty-state-icon" />
      <div className="q-empty-state-title">{title}</div>
      <div className="q-empty-state-text">{message}</div>
    </div>
  );
}
