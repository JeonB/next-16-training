import CounterComparison from "@/components/CounterComparison";

export default function ComparisonPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-6xl flex-col items-center justify-between py-8 px-4 bg-white dark:bg-black">
        <CounterComparison />
      </main>
    </div>
  );
}
