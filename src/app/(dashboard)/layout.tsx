"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  PieChart,
  Building2,
  Settings,
  Bell,
} from "lucide-react";
import { getMenuByRole } from "@/lib/permissions";
import { JwtPayload } from "@/lib/jwt";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider, useConfirm } from "@/components/shared/ConfirmModal";

const iconMap: Record<string, any> = {
  Dashboard: LayoutDashboard,
  Berkas: FileText,
  Tracking: PieChart,
  "Master Data": Building2,
  Laporan: PieChart,
  Settings: Settings,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfirmProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
      <Toaster />
    </ConfirmProvider>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [menu, setMenu] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          setUser(data.data);
          setMenu(getMenuByRole(data.data));
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      });
  }, [router]);

  async function handleLogout() {
    const ok = await confirm({
      title: "Logout",
      message: "Apakah Anda yakin ingin logout?",
      confirmText: "Ya, Logout",
      cancelText: "Batal",
      variant: "warning",
    });
    if (!ok) return;
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold" style={{ color: "#4f2861" }}>
              Dompis
            </h2>
            <p className="text-xs text-gray-500">Procurement System</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menu.map((item) => {
              const Icon = item.label && iconMap[item.label];
              return (
                <div key={item.href}>
                  {item.children ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors cursor-default">
                        {Icon && <Icon className="w-4 h-4" />}
                        {item.label}
                      </div>
                      {item.children.map((child: any) => (
                        <a
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-3 px-3 py-2 pl-10 rounded-lg text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </>
                  ) : (
                    <a
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {item.label}
                    </a>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-3 border-t border-gray-200">
            {user && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.roleName}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <LogOut className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      <div className={`flex-1 ${sidebarOpen ? "ml-64" : ""}`}>
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: "#C098D6" }}
              />
            </button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
