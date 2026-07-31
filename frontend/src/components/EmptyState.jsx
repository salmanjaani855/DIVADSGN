import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'Check back soon for new content.',
  icon: Icon = Inbox,
  action = null,
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
        <Icon className="h-7 w-7 text-white/40" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/50">{message}</p>
      {action}
    </div>
  );
}
