import { Header } from "@/components/Header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 min-h-screen">{children}</main>

      <footer className="border-t bg-white/50 dark:bg-slate-950/50 backdrop-blur flex justify-center items-center p-5 text-sm text-muted-foreground">
        <span>© 2025 Flash Card App. All rights reserved. (DCT123C1)</span>
      </footer>
    </div>
  );
}
