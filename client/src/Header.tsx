export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">🏠</span>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Smart Rent
        </h1>
        <span className="ml-auto text-sm text-gray-500 hidden sm:block">
          Find flats faster in Germany
        </span>
      </div>
    </header>
  );
}
