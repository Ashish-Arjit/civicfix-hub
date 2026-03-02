import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Search, AlertTriangle, Clock, User, MapPin, FileText } from "lucide-react";
import { differenceInHours } from "date-fns";

interface Complaint {
  id: string;
  full_name: string;
  email: string;
  ward: string;
  category: string;
  location: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  officer: string | null;
  officer_designation: string | null;
  created_at: string;
  image_urls: string[];
}

const TrackComplaint = () => {
  const [searchId, setSearchId] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("complaints")
      .select("*")
      .ilike("id", `%${searchId.trim()}%`)
      .limit(5);
    setComplaints((data as Complaint[]) || []);
    setLoading(false);
  };

  const isEscalated = (c: Complaint) =>
    c.status !== "Resolved" && differenceInHours(new Date(), new Date(c.created_at)) > 48;

  const statusTimeline = ["Pending", "Assigned", "In Progress", "Resolved"];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Track Your Complaint</h1>
          <p className="text-muted-foreground">Enter your complaint ID to check progress</p>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter complaint ID (first 8 chars)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="font-mono"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {searched && complaints.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-12">
            No complaints found matching that ID.
          </div>
        )}

        {complaints.map((c) => (
          <div key={c.id} className="glass-card rounded-2xl p-6 space-y-5 mb-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground font-mono">ID: {c.id.slice(0, 8)}</p>
                <h2 className="text-lg font-bold">{c.category}</h2>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={c.status} />
                <PriorityBadge status={c.priority} />
              </div>
            </div>

            {/* Escalation Warning */}
            {isEscalated(c) && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="font-medium">Social Media Escalation Active — Issue unresolved for 48+ hours</span>
              </div>
            )}

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{c.progress}%</span>
              </div>
              <Progress value={c.progress} className="h-2" />
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-0">
              {statusTimeline.map((step, i) => {
                const currentIdx = statusTimeline.indexOf(c.status);
                const active = i <= currentIdx;
                return (
                  <div key={step} className="flex-1 flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${active ? "bg-primary" : "bg-muted"}`} />
                    <span className={`text-[10px] mt-1 ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Details */}
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Reporter</p>
                  <p className="font-medium">{c.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{c.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {c.officer && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Assigned Officer</p>
                    <p className="font-medium">{c.officer}{c.officer_designation && ` — ${c.officer_designation}`}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="text-sm border-t pt-3">
              <p className="text-muted-foreground mb-1">Description</p>
              <p>{c.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackComplaint;
