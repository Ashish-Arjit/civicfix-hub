export interface VerificationResult {
  passed: boolean;
  score: number;
  details: {
    label: string;
    status: "pass" | "warn" | "fail";
  }[];
}

export const verifyImage = (): Promise<VerificationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const score = Math.random() * 40 + 60; // 60-100 range
      const passed = score >= 70;

      const checks = [
        { label: "Metadata integrity check", threshold: 0.3 },
        { label: "Pixel anomaly detection", threshold: 0.5 },
        { label: "Compression analysis", threshold: 0.4 },
        { label: "EXIF data validation", threshold: 0.35 },
      ];

      const details = checks.map((c) => {
        const r = Math.random();
        return {
          label: c.label,
          status: (r > c.threshold ? "pass" : r > c.threshold * 0.5 ? "warn" : "fail") as "pass" | "warn" | "fail",
        };
      });

      // If overall failed, ensure at least one detail fails
      if (!passed && !details.some((d) => d.status === "fail")) {
        details[1].status = "fail";
      }

      resolve({ passed, score: Math.round(score), details });
    }, 3000);
  });
};
