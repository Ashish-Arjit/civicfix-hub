import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { differenceInHours } from "date-fns";
import { LogIn, BarChart3, Users, AlertTriangle, Plus, Loader2 } from "lucide-react";

interface Complaint {
  id: string;
  full_name: string;
  category: string;
  ward: string;
  status: string;
  priority: string;
  progress: number;
  created_at: string;
  officer: string | null;
}

const AdminDashboard = () => {
  const [authed, setAuthed] = useState(() => localStorage.getItem("cpss-admin-auth") === "true");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [newOfficer, setNewOfficer] = useState({ name: "", email: "", phone: "" });
  const [newCategory, setNewCategory] = useState("");
  const [officerDialogOpen, setOfficerDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const login = () => {
    if (email === "admin@cpss.gov" && password === "admin123") {
      localStorage.setItem("cpss-admin-auth", "true");
      setAuthed(true);
      toast.success("Logged in as admin");
    } else {
      toast.error("Invalid credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem("cpss-admin-auth");
    setAuthed(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchComplaints();
  }, [authed, statusFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    let query = supabase.from("complaints").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter as any);
    }
    const { data } = await query;
    setComplaints((data as Complaint[]) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const progressMap: Record<string, number> = {
      "Pending": 0, "Assigned": 25, "In Progress": 50, "Resolved": 100, "Escalated": 75,
    };
    await supabase.from("complaints").update({ status: status as any, progress: progressMap[status] || 0 }).eq("id", id);
    toast.success(`Status updated to ${status}`);
    fetchComplaints();
  };

  const addOfficer = async () => {
    if (!newOfficer.name) return;
    await supabase.from("officers").insert(newOfficer);
    toast.success("Officer added");
    setNewOfficer({ name: "", email: "", phone: "" });
    setOfficerDialogOpen(false);
  };

  const addCategory = async () => {
    if (!newCategory) return;
    const { error } = await supabase.from("service_categories").insert({ name: newCategory });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Category added");
    setNewCategory("");
    setCategoryDialogOpen(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-sm space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-xl gradient-hero p-3 mb-3">
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@cpss.gov" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
          </div>
          <Button className="w-full" onClick={login}>Sign In</Button>
        </div>
      </div>
    );
  }

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const escalated = complaints.filter((c) => c.status !== "Resolved" && differenceInHours(new Date(), new Date(c.created_at)) > 48).length;

  const stats = [
    { label: "Total", value: total, icon: BarChart3, color: "text-primary" },
    { label: "Resolved", value: resolved, icon: BarChart3, color: "text-emerald-500" },
    { label: "Pending", value: pending, icon: BarChart3, color: "text-amber-500" },
    { label: "Escalated", value: escalated, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Dialog open={officerDialogOpen} onOpenChange={setOfficerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Officer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Officer</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Name" value={newOfficer.name} onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })} />
                  <Input placeholder="Email" value={newOfficer.email} onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })} />
                  <Input placeholder="Phone" value={newOfficer.phone} onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })} />
                  <Button className="w-full" onClick={addOfficer}>Add Officer</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Category</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                  <Button className="w-full" onClick={addCategory}>Add Category</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{loading ? "—" : s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">Reporter</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Priority</th>
                  <th className="text-left p-3 font-medium">Progress</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center p-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                ) : complaints.map((c) => {
                  const isEsc = c.status !== "Resolved" && differenceInHours(new Date(), new Date(c.created_at)) > 48;
                  return (
                    <tr key={c.id} className={`border-b hover:bg-muted/30 transition-colors ${isEsc ? "bg-destructive/5" : ""}`}>
                      <td className="p-3 font-mono text-xs">{c.id.slice(0, 8)}</td>
                      <td className="p-3">{c.full_name}</td>
                      <td className="p-3">{c.category}</td>
                      <td className="p-3"><StatusBadge status={c.status} /></td>
                      <td className="p-3"><PriorityBadge status={c.priority} /></td>
                      <td className="p-3 min-w-[100px]">
                        <Progress value={c.progress} className="h-1.5" />
                      </td>
                      <td className="p-3">
                        <Select onValueChange={(v) => updateStatus(c.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-32">
                            <SelectValue placeholder="Update" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Pending", "Assigned", "In Progress", "Resolved", "Escalated"].map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
