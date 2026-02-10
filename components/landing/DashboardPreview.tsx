import { LayoutDashboard, FileText, Building2, Settings, Briefcase } from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Briefcase, label: "Applications" },
  { icon: FileText, label: "Resumes" },
  { icon: Building2, label: "Companies" },
  { icon: Settings, label: "Settings" },
];

interface JobCard {
  company: string;
  role: string;
  color: string;
}

const kanbanColumns: { title: string; count: number; cards: JobCard[] }[] = [
  {
    title: "Wishlist",
    count: 3,
    cards: [
      { company: "Stripe", role: "Frontend Engineer", color: "bg-purple-400" },
      { company: "Notion", role: "Product Designer", color: "bg-blue-400" },
    ],
  },
  {
    title: "Applied",
    count: 4,
    cards: [
      { company: "Vercel", role: "Software Engineer", color: "bg-emerald-400" },
      { company: "Linear", role: "Full Stack Dev", color: "bg-indigo-400" },
    ],
  },
  {
    title: "Interview",
    count: 2,
    cards: [
      { company: "Figma", role: "Design Engineer", color: "bg-amber-400" },
    ],
  },
  {
    title: "Offer",
    count: 1,
    cards: [
      { company: "Raycast", role: "React Developer", color: "bg-rose-400" },
    ],
  },
];

const DashboardPreview = () => {
  return (
    <section className="py-5 md:py-5 container mx-auto">
      <div className="container">
        <p className="mb-12 text-center text-lg font-medium text-muted-foreground md:text-xl">
          Life's too short for endless job applications.{" "}
          <span className="text-foreground">Let's get you hired.</span>
        </p>

        {/* Dashboard mockup */}
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex">
            {/* Sidebar */}
            <div className="hidden w-48 shrink-0 border-r border-border bg-secondary/30 p-4 md:block">
              <p className="mb-6 text-sm font-bold tracking-tight text-foreground">traq</p>
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </div>
                ))}
              </nav>
            </div>

            {/* Main content — Kanban board */}
            <div className="flex-1 p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Applications</h3>
                <span className="text-xs text-muted-foreground">10 total</span>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {kanbanColumns.map((col) => (
                  <div key={col.title} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{col.title}</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-muted-foreground">
                        {col.count}
                      </span>
                    </div>

                    {col.cards.map((card) => (
                      <div
                        key={card.company + card.role}
                        className="rounded-lg border border-border bg-background p-3 shadow-sm"
                      >
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${card.color}`} />
                          <span className="text-[11px] font-semibold text-foreground">
                            {card.company}
                          </span>
                        </div>
                        <p className="text-[10px] leading-snug text-muted-foreground">
                          {card.role}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
