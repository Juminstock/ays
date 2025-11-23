import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] relative z-10 overflow-hidden">

      <div className="absolute inset-0 bg-mockup" />

      <div className="w-full flex justify-center mt-10">
        <Image
          src="/ays-logo-complete.png"
          alt="Ays logo"
          width={150}
          height={100}
          style={{ width: "auto", height: "auto" }}
          loading="eager"
        />
      </div>

      <section className="flex flex-col items-center text-center mt-50 px-4 max-w-[430px] mx-auto z-10">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Track Your Expenses, Save in USDC, and Invest Easily.
        </h1>

        <p className="text-lg text-white/90 mt-4 max-w-xl">
          Access to a borderless and frictionless financial system open to everyone.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-30 w-full">
          <button className="w-full px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-lg">
            Create Account
          </button>

          <button className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold text-lg border">
            Login
          </button>
        </div>
      </section>

    </main>
  );
}