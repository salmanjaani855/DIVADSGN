export default function LoadingSpinner({ label = 'Loading...', fullScreen = false }) {
  return (
    <div
      className={
        fullScreen
          ? 'flex min-h-[60vh] w-full flex-col items-center justify-center gap-4'
          : 'flex w-full flex-col items-center justify-center gap-4 py-16'
      }
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-fuchsia-400" />
        <div className="absolute inset-1 animate-spin rounded-full border-2 border-white/5 border-b-violet-400 [animation-duration:1.5s]" />
      </div>
      {label && <p className="text-sm text-white/50">{label}</p>}
    </div>
  );
}
