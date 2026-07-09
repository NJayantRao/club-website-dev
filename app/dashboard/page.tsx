"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Trophy,
  LogOut,
  Hexagon,
  MessageSquare,
  User,
  Menu,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminMembers from "../../components/dashboard/AdminMembers";
import AdminEvents from "../../components/dashboard/AdminEvents";
import AdminSankalpEvents from "../../components/dashboard/AdminSankalpEvents";
import AdminEventRegistrations from "../../components/dashboard/AdminEventRegistrations";
import AdminSankalpRegistrations from "../../components/dashboard/AdminSankalpRegistrations";
import AdminQueries from "../../components/dashboard/AdminQueries";
import AdminRecruitment from "../../components/dashboard/AdminRecruitment";
import AdminAchievements from "../../components/dashboard/AdminAchievements";
import AdminGallery from "../../components/dashboard/AdminGallery";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "events", label: "Events", icon: Calendar },
  { id: "event-regs", label: "Event Registrations", icon: User },
  { id: "sankalp", label: "Sankalp Events", icon: Trophy },
  { id: "sankalp-regs", label: "Sankalp Registrations", icon: User },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "queries", label: "Queries", icon: MessageSquare },
  { id: "recruitment", label: "Recruitment", icon: User },
];

interface SidebarContentProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  setIsSidebarOpen: (open: boolean) => void;
  session: any;
  handleLogout: () => void;
}

const SidebarContent = ({
  activeTab,
  setActiveTab,
  setIsSidebarOpen,
  session,
  handleLogout,
}: SidebarContentProps) => (
  <>
    <div className="flex items-center justify-between mb-10 px-2">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => (window.location.href = "/")}
      >
        <Hexagon className="w-6 h-6 fill-white" />
        <span className="font-bold tracking-tight text-lg">ADMIN</span>
      </div>
      <button
        onClick={() => setIsSidebarOpen(false)}
        className="lg:hidden text-neutral-400"
      >
        <X className="w-6 h-6" />
      </button>
    </div>

    <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsSidebarOpen(false);
            }}
            className={`w-full group flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[11px] uppercase tracking-[0.2em] font-black transition-all duration-300 relative overflow-hidden ${
              isActive
                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                : "text-neutral-500 hover:text-white hover:bg-white/5"
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-0 w-1 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]" />
            )}
            <Icon
              className={`w-4 h-4 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
            />
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}
    </nav>

    <div className="mt-6 pt-4 border-t border-white/10">
      <div className="px-4 py-2 mb-2">
        <p className="text-xs text-neutral-500 truncate">
          {session?.user?.name}
        </p>
        <p className="text-[10px] text-neutral-600 truncate">
          {session?.user?.email}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all w-full text-left"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  </>
);

const fetchStats = async () => {
  const [mRes, eRes, qRes, rRes] = await Promise.all([
    fetch("/api/members?limit=1"),
    fetch("/api/event?limit=1"),
    fetch("/api/recruitment?type=contact&limit=1"),
    fetch("/api/recruitment?type=recruitment&limit=1"),
  ]);
  const [m, e, q, r] = await Promise.all([
    mRes.json(),
    eRes.json(),
    qRes.json(),
    rRes.json(),
  ]);
  return {
    members: m.pagination?.total ?? 0,
    events: e.pagination?.total ?? 0,
    queries: q.pagination?.total ?? 0,
    recruits: r.pagination?.total ?? 0,
  };
};

const AdminDashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/sign-in");
    },
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    queries: 0,
    recruits: 0,
  });

  React.useEffect(() => {
    let mounted = true;
    if (status === "authenticated") {
      fetchStats()
        .then((s) => {
          if (mounted) setStats(s);
        })
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [status]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const sidebarProps = {
    activeTab,
    setActiveTab,
    setIsSidebarOpen,
    session,
    handleLogout,
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Hexagon className="w-6 h-6 fill-white" />
          <span className="font-bold tracking-tight text-lg">ADMIN</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-white/5 rounded-lg border border-white/10"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-white/10 bg-white/5 backdrop-blur-xl p-6 flex-col sticky top-0 h-screen">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0A0A0A] border-r border-white/10 p-6 flex flex-col z-50 lg:hidden"
            >
              <SidebarContent {...sidebarProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
              {activeTab === "dashboard"
                ? `Welcome back, ${session?.user?.name}`
                : navItems.find((i) => i.id === activeTab)?.label}
            </h1>
            <p className="text-neutral-500 text-sm lg:text-base">
              {activeTab === "dashboard"
                ? "Here's what's happening in Club Excel today."
                : `Manage your ${activeTab} content here.`}
            </p>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  label: "Total Members",
                  value: stats.members,
                  tab: "members",
                  color: "blue",
                },
                {
                  label: "All Events",
                  value: stats.events,
                  tab: "events",
                  color: "indigo",
                },
                {
                  label: "User Queries",
                  value: stats.queries,
                  tab: "queries",
                  color: "green",
                },
                {
                  label: "Total Recruits",
                  value: stats.recruits,
                  tab: "recruitment",
                  color: "purple",
                },
              ].map(({ label, value, tab, color }) => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`group relative bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:border-${color}-500/30 hover:bg-white/[0.05] transition-all duration-500 cursor-pointer overflow-hidden`}
                >
                  <p className="text-neutral-400 text-[10px] mb-2 uppercase tracking-[0.2em] font-black">
                    {label}
                  </p>
                  <h3 className="text-4xl lg:text-5xl font-bold mb-4">
                    {value}
                  </h3>
                  <div
                    className={`flex items-center text-[10px] text-${color}-400 gap-2 font-black uppercase tracking-widest`}
                  >
                    Manage {label} →
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 lg:p-10">
              <h2 className="text-lg lg:text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-2 h-6 bg-blue-500 rounded-full" />
                System Infrastructure
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Status", value: "Live & Active" },
                  { label: "Auth", value: "NextAuth v5" },
                  { label: "Database", value: "PostgreSQL" },
                  {
                    label: "Last Updated",
                    value: new Date().toLocaleDateString("en-GB"),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <p className="text-neutral-500 text-[10px] uppercase font-black tracking-[0.2em]">
                      {label}
                    </p>
                    <p className="text-xs font-black uppercase tracking-widest text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          {activeTab === "members" && <AdminMembers />}
          {activeTab === "events" && <AdminEvents />}
          {activeTab === "event-regs" && <AdminEventRegistrations />}
          {activeTab === "sankalp" && <AdminSankalpEvents />}
          {activeTab === "sankalp-regs" && <AdminSankalpRegistrations />}
          {activeTab === "queries" && <AdminQueries />}
          {activeTab === "recruitment" && <AdminRecruitment />}
          {activeTab === "achievements" && <AdminAchievements />}
          {activeTab === "gallery" && <AdminGallery />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
