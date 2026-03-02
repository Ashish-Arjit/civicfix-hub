interface StatusBadgeProps {
  status: string;
}

const statusClasses: Record<string, string> = {
  "Pending": "status-badge status-pending",
  "Assigned": "status-badge status-assigned",
  "In Progress": "status-badge status-in-progress",
  "Resolved": "status-badge status-resolved",
  "Escalated": "status-badge status-escalated",
};

const priorityClasses: Record<string, string> = {
  "Low": "status-badge priority-low",
  "Medium": "status-badge priority-medium",
  "High": "status-badge priority-high",
  "Critical": "status-badge priority-critical",
};

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={statusClasses[status] || "status-badge bg-muted text-muted-foreground"}>
    {status}
  </span>
);

export const PriorityBadge = ({ status }: StatusBadgeProps) => (
  <span className={priorityClasses[status] || "status-badge bg-muted text-muted-foreground"}>
    {status}
  </span>
);
