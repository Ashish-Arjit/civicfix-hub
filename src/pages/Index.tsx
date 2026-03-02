import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Radar, Zap, ArrowRight, MapPin, FileSearch } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "AI Image Verification",
    desc: "Every uploaded image is analyzed for authenticity to prevent false reports.",
  },
  {
    icon: Radar,
    title: "Real-time Tracking",
    desc: "Follow your complaint from submission to resolution with live progress updates.",
  },
  {
    icon: Zap,
    title: "Smart Escalation",
    desc: "Unresolved issues are automatically flagged for social media escalation after 48 hours.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 px-4 py-1.5 text-sm text-primary-foreground/90">
              <MapPin className="h-4 w-4" />
              Civic Issue Reporting Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-primary-foreground leading-tight">
              Fix Your City.
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-lg mx-auto">
              Report potholes, broken lights, and other civic issues. Track progress. Hold authorities accountable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link to="/complaint">
                <Button size="lg" variant="secondary" className="gap-2 font-semibold text-base px-8 shadow-lg">
                  Submit Report <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/track">
                <Button size="lg" variant="outline" className="gap-2 font-semibold text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <FileSearch className="h-4 w-4" /> Track Complaint
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 40L48 36C96 32 192 24 288 28C384 32 480 48 576 52C672 56 768 48 864 40C960 32 1056 24 1152 28C1248 32 1344 48 1392 56L1440 64V80H0V40Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">How CivicFix Works</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            A smarter way to report and track civic issues in your community.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass-card-hover rounded-xl p-6 text-center"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="inline-flex items-center justify-center rounded-xl gradient-hero p-3 mb-4">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="glass-card rounded-2xl p-10 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Ready to make a difference?</h2>
          <p className="text-muted-foreground mb-6">Your report can change your neighborhood. Start now.</p>
          <Link to="/complaint">
            <Button size="lg" className="gap-2 px-8 font-semibold">
              Report an Issue <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
