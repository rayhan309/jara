export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans">
      <header className="border-b-2 border-zinc-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-zinc-900 text-sm font-bold text-white">
              N
            </div>
            <span className="text-lg font-bold text-zinc-900">Nexa Commerce</span>
          </div>
          <p className="text-sm text-zinc-500">Online Store</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-xs font-semibold tracking-[0.25em] text-zinc-400 uppercase">
          Coming Soon
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Your next favorite place to shop
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-600">
          Nexa E-Commerce storefront is being built. Customer accounts and checkout
          will be available here later.
        </p>
      </main>
    </div>
  );
}
