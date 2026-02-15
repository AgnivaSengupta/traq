// app/(platform)/layout.tsx
import Sidebar from "@/components/dashboard/Sidebar"; // Adjust path to your Sidebar component

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar /> 
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}