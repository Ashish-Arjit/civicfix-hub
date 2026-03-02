import { Shield } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-card/50 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold">
          <div className="gradient-hero rounded-lg p-1.5">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-foreground">CivicFix Reporter</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 CivicFix. Empowering citizens to build better cities.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
