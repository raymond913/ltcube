import { Sidebar } from "@/components/ui/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col min-h-full"
      style={{
        background: `
          radial-gradient(ellipse 90% 50% at 5% 0%, rgba(37,99,235,0.055) 0%, transparent 65%),
          radial-gradient(ellipse 60% 45% at 95% 100%, rgba(124,58,237,0.04) 0%, transparent 65%),
          var(--color-background)
        `,
      }}
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
