import { Trophy } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <Link href="/tournaments" className="mb-6 flex items-center gap-2 text-xl font-bold text-brand">
        <Trophy size={26} />
        STMS
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
