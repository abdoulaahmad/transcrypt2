import type { RoleState } from "../hooks/useRoles";

const labels: Array<{ key: keyof RoleState["roles"]; label: string; className: string }> = [
  { key: "isUniversity", label: "📜 Document Issuer", className: "badge-primary" },
  { key: "isIssuer", label: "📜 Issuer", className: "badge-primary" },
  { key: "isRegistrar", label: "✅ Compliance Officer", className: "badge-success" },
  { key: "isMinistry", label: "⚖️ Regulatory Authority", className: "badge-info" },
  { key: "isAdmin", label: "🔐 System Admin", className: "badge-warning" }
];

export function RoleBadges({ roles }: { roles: RoleState["roles"] }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {labels
        .filter(({ key }) => roles[key])
        .map(({ key, label, className }) => (
          <span className={`badge ${className}`} key={key}>
            {label}
          </span>
        ))}
      {labels.every(({ key }) => !roles[key]) && (
        <span className="badge badge-info">👥 Authorized Viewer</span>
      )}
    </div>
  );
}