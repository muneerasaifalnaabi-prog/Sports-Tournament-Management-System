import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/lib/session-context";
import { rubik, rushDriver } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "STMS — Sports Tournament Management System",
  description: "Create tournaments, manage teams, and track results in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${rubik.variable} ${rushDriver.variable}`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
