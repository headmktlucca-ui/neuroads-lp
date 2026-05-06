export default function LoadingInterativo() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-white/20 border-t-[#ff8c00]" />
        <p className="mt-4 text-sm uppercase tracking-[0.2em] text-white/70">Inicializando operacao neural...</p>
      </div>
    </div>
  );
}
