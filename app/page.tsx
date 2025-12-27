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
        <Link className="text-blue-500" href="/react-query-demo">
          React Query Demo
        </Link>
        <Link className="text-blue-500" href="/react-query-basics">
          React Query Basics (핵심 기본기)
        </Link>
        <Link className="text-blue-500" href="/react-19-demo">
          React 19 Demo (주요 변경사항)
        </Link>
        <Link className="text-blue-500" href="/react-19-advanced">
          React 19 Advanced (고급 패턴)
        </Link>
        <Link className="text-blue-500" href="/react-query-basics">
          React Query Basics (핵심 기본기)
        </Link>
        <Link className="text-blue-500" href="/react-query-advanced">
          React Query Advanced (고급 패턴)
        </Link>
        <Link className="text-blue-500" href="/react-query-patterns">
          React Query 실전 패턴
        </Link>
        <Link className="text-blue-500" href="/nextjs-react-query">
          Next.js & React Query 통합
        </Link>
        <Link className="text-blue-500" href="/comparison">
          Comparison
        </Link>
      </main>
    </div>
  );
}
