import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { verifyImage, VerificationResult } from "@/lib/imageVerification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, CheckCircle2, XCircle, AlertTriangle, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(20).optional(),
  ward: z.string().min(1, "Select a ward"),
  category: z.string().min(1, "Select a category"),
  location: z.string().trim().min(2, "Location is required").max(500),
  description: z.string().trim().min(10, "Describe the issue (min 10 chars)").max(2000),
});

type FormData = z.infer<typeof schema>;

const wards = [
  { value: "ward-1", label: "Ward 1 — Downtown" },
  { value: "ward-2", label: "Ward 2 — Uptown" },
  { value: "ward-3", label: "Ward 3 — Suburbs" },
  { value: "ward-4", label: "Ward 4 — Industrial" },
];

interface ImageState {
  file: File;
  preview: string;
  verifying: boolean;
  result?: VerificationResult;
}

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [images, setImages] = useState<ImageState[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    supabase.from("service_categories").select("id, name").order("name").then(({ data }) => {
      setCategories(data || []);
      setLoadingCats(false);
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newImages: ImageState[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      verifying: true,
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Verify each image
    for (let i = 0; i < newImages.length; i++) {
      const result = await verifyImage();
      setImages((prev) => {
        const updated = [...prev];
        const idx = prev.length - newImages.length + i;
        updated[idx] = { ...updated[idx], verifying: false, result };
        return updated;
      });
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const allVerified = images.length === 0 || images.every((img) => !img.verifying && img.result?.passed);
  const anyFailed = images.some((img) => img.result && !img.result.passed);
  const anyVerifying = images.some((img) => img.verifying);

  const onSubmit = async (data: FormData) => {
    if (anyFailed) {
      toast.error("Remove failed images before submitting");
      return;
    }
    if (anyVerifying) {
      toast.error("Wait for image verification to complete");
      return;
    }

    setSubmitting(true);
    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const img of images) {
        const ext = img.file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("complaints").upload(path, img.file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("complaints").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      const { data: complaint, error } = await supabase.from("complaints").insert([{
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        ward: data.ward,
        category: data.category,
        location: data.location,
        description: data.description,
        image_urls: imageUrls,
        has_image: imageUrls.length > 0,
        image_verified: imageUrls.length > 0,
      }]).select("id").single();

      if (error) throw error;

      toast.success(`Complaint submitted! ID: ${complaint.id.slice(0, 8)}`, {
        description: "Track your complaint using this ID",
        duration: 8000,
      });
      navigate("/track");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center rounded-xl gradient-hero p-3 mb-4">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Report a Civic Issue</h1>
          <p className="text-muted-foreground mt-2">Help improve your community by reporting problems</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
          {/* Name & Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input {...register("full_name")} placeholder="Your full name" />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input {...register("email")} type="email" placeholder="email@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          {/* Phone & Ward */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register("phone")} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Ward *</Label>
              <Select onValueChange={(v) => setValue("ward", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((w) => (
                    <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ward && <p className="text-xs text-destructive">{errors.ward.message}</p>}
            </div>
          </div>

          {/* Category & Location */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCats ? "Loading..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input {...register("location")} placeholder="Street, landmark, etc." />
              {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea {...register("description")} placeholder="Describe the issue in detail..." rows={4} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label>Evidence Images (max 5)</Label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-xl p-6 cursor-pointer hover:border-primary/60 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload images</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </label>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border">
                    <img src={img.preview} alt="" className="w-full h-28 object-cover" />
                    {img.verifying && (
                      <div className="absolute inset-0 bg-foreground/60 flex flex-col items-center justify-center text-primary-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mb-1" />
                        <span className="text-xs font-medium">Verifying...</span>
                      </div>
                    )}
                    {img.result && (
                      <div className={`absolute inset-0 ${img.result.passed ? "bg-emerald-900/70" : "bg-red-900/70"} flex flex-col items-center justify-center p-2`}>
                        {img.result.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-300 mb-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-300 mb-1" />
                        )}
                        <span className="text-xs font-bold text-primary-foreground">
                          {img.result.score}% {img.result.passed ? "✓ Verified" : "✗ Failed"}
                        </span>
                        <div className="mt-1 space-y-0.5 w-full">
                          {img.result.details.map((d, j) => (
                            <div key={j} className="flex items-center gap-1 text-[10px] text-primary-foreground/80">
                              {d.status === "pass" ? <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" /> :
                               d.status === "warn" ? <AlertTriangle className="h-2.5 w-2.5 text-amber-400" /> :
                               <XCircle className="h-2.5 w-2.5 text-red-400" />}
                              {d.label}
                            </div>
                          ))}
                        </div>
                        {!img.result.passed && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="mt-2 h-6 text-xs"
                            onClick={() => removeImage(i)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {anyFailed && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Remove failed images to proceed with submission.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full font-semibold" size="lg" disabled={submitting || anyFailed || anyVerifying}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : "Submit Complaint"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
