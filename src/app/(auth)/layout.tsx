import { Trophy } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero-stadium relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="hero-ray pointer-events-none" />
      <div
        className="hero-floodlight pointer-events-none h-56 w-56"
        style={{ top: "-4rem", left: "10%" }}
      />
      <Link
        href="/"
        className="relative z-10 mb-6 flex items-center gap-2 text-xl font-bold text-white"
      >
        <Trophy size={26} className="text-brand" />
        <span className="font-brand text-2xl">STMS</span>
      </Link>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
