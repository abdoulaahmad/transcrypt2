import type { RoleState } from "../hooks/useRoles";

const labels: Array<{ key: keyof RoleState["roles"]; label: string; className: string }> = [
  { key: "isUniversity", label: "🎓 University", className: "badge-primary" },
  { key: "isRegistrar", label: "✓ Registrar", className: "badge-success" },
  { key: "isMinistry", label: "🏛️ Ministry", className: "badge-info" },
  { key: "isAdmin", label: "⚡ Admin", className: "badge-warning" }
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
        <span className="badge badge-info">👤 Viewer</span>
      )}
    </div>
  );
}
