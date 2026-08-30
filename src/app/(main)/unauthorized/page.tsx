import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
        <ShieldAlert size={26} />
      </div>
      <h1 className="text-lg font-semibold text-foreground">Access denied</h1>
      <p className="max-w-sm text-sm text-muted">
        You don&apos;t have permission to view this page. Contact an administrator if you believe this is a mistake.
      </p>
      <Button href="/dashboard" className="mt-2">
        Back to dashboard
      </Button>
    </div>
  );
}
