import { Gauge, House, ListTodo, Settings2, UserCircle, Layers3 } from "lucide-react";

const ROLE_NAV = {
  student: [
    { id: "dashboard", label: "Home", icon: House },
    { id: "profile", label: "Profile", icon: UserCircle },
  ],
  faculty: [
    { id: "dashboard", label: "Home", icon: House },
    { id: "tasks", label: "Tasks", icon: ListTodo },
    { id: "profile", label: "Profile", icon: UserCircle },
  ],
  employee: [
    { id: "dashboard", label: "Workspace", icon: Gauge },
    { id: "tasks", label: "My Work", icon: ListTodo },
    { id: "profile", label: "Profile", icon: UserCircle },
  ],
  hod: [
    { id: "dashboard", label: "Workspace", icon: Gauge },
    { id: "profile", label: "Profile", icon: UserCircle },
  ],
  admin: [
    { id: "dashboard", label: "Workspace", icon: Gauge },
    { id: "users", label: "Users", icon: UserCircle },
    { id: "profile", label: "Profile", icon: UserCircle },
  ],
  superadmin: [
    { id: "overview", label: "Workspace", icon: Gauge },
    { id: "operations", label: "Ops", icon: Settings2 },
    { id: "profile", label: "Profile", icon: UserCircle },
  ],
};

function resolveRole(role) {
  const value = String(role || "student").toLowerCase();
  if (value === "super_admin" || value === "super-admin" || value === "superadmin") return "superadmin";
  return ROLE_NAV[value] ? value : "student";
}

export default function MobileBottomNav({
  role = "student",
  activeTab,
  setActiveTab,
  unreadCount = 0,
}) {
  const items = ROLE_NAV[resolveRole(role)];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-cv-border bg-cv-surface/95 shadow-cv-lg backdrop-blur-xl"
    >
      <div className="mx-auto grid h-16 max-w-xl px-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-cv-sm text-[10px] font-semibold transition-all ${
                active ? "text-cv-primary" : "text-cv-text-muted"
              }`}
            >
              <span
                className={`flex h-7 w-10 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-cv-primary-soft" : ""
                }`}
              >
                <Icon
                  className="h-[19px] w-[19px]"
                  strokeWidth={active ? 2.35 : 1.9}
                />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
