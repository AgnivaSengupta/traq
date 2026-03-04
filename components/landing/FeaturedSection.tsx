import { Briefcase, FileText, Bell } from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Application Tracking",
    description: "Track every application from wishlist to offer with a visual kanban board.",
  },
  {
    icon: FileText,
    title: "Resume Builder — Coming Soon",
    description: "Create tailored resumes in minutes with smart templates and AI suggestions.",
  },
  {
    icon: Bell,
    title: "Reminders",
    description: "Never miss a deadline with smart notifications for follow-ups and interviews.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="border-t border-border py-20 md:py-28">
      <div className="container">
        <h2 className="mb-4 text-center text-3xl font-serif tracking-wide text-foreground md:text-4xl">
          Everything You Need for a Successful Job Search
        </h2>
        <p className="mx-auto mb-14 max-w-xl text-center text-muted-foreground">
          Powerful tools designed to simplify every step of your job hunt.
        </p>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
