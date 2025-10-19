import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const labels = [
    { key: "isUniversity", label: "📜 Document Issuer", color: "#1d4ed8" },
    { key: "isRegistrar", label: "✅ Compliance Officer", color: "#047857" },
    { key: "isMinistry", label: "⚖️ Regulatory Authority", color: "#7c3aed" },
    { key: "isAdmin", label: "🔐 System Admin", color: "#f97316" }
];
export function RoleBadges({ roles }) {
    return (_jsxs("div", {
        style: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
        children: [labels
            .filter(({ key }) => roles[key])
            .map(({ key, label, color }) => (_jsx("span", {
                className: "badge",
                style: {
                    background: color,
                    color: "white"
                },
                children: label
            }, key))), labels.every(({ key }) => !roles[key]) && _jsx("span", { className: "badge", children: "Viewer" })
        ]
    }));
}
export * from "./RoleBadges.tsx";