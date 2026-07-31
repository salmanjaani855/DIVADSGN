import { AlertTriangle } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = "We couldn't load this content. Please try again.",
  onRetry = null,
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/50">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-pill-outline mt-2">
          Try again
        </button>
      )}
    </div>
  );
}
