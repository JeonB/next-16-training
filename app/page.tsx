import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <Link className="text-blue-500" href="/bff-demo">
          BFF Demo
        </Link>
        <Link className="text-blue-500" href="/pokemon">
          Pokemon
        </Link>
        <Link className="text-blue-500" href="/revaliate-refresh">
          Revaliate Refresh
        </Link>
      </main>
    </div>
  );
}
