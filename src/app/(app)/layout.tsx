import { Sidebar } from "@/components/ui/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 min-h-full overflow-y-auto md:ml-64">
        <div className="max-w-4xl mx-auto px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
