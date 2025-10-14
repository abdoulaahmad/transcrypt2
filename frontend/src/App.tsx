import { useEffect, useMemo } from "react";
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useDisconnect } from "wagmi";

import { RoleBadges } from "./components/RoleBadges";
import { useRoles } from "./hooks/useRoles";
import { useTranscripts, useAccessibleTranscripts } from "./hooks/useTranscripts";
import { LandingPage } from "./pages/LandingPage";
import { MinistryDashboard } from "./pages/MinistryDashboard";
import { RegistrarDashboard } from "./pages/RegistrarDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { UniversityDashboard } from "./pages/UniversityDashboard";
import { EmployerDashboard } from "./pages/EmployerDashboard";

interface NavItem {
  path: string;
  label: string;
}

export default function App() {
  const roleState = useRoles();
  const ownerAddress = roleState.address ?? "";
  const transcriptsQuery = useTranscripts(ownerAddress);
  const accessibleTranscriptsQuery = useAccessibleTranscripts(ownerAddress);
  const { disconnect } = useDisconnect();
  const location = useLocation();
  const navigate = useNavigate();

  const { isUniversity, isRegistrar, isMinistry } = roleState.roles;

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      { path: "/student", label: "Student view" },
      { path: "/employer", label: "Employer console" }
    ];
    if (isUniversity) {
      items.push({ path: "/university", label: "University tools" });
    }
    if (isRegistrar) {
      items.push({ path: "/registrar", label: "Registrar workspace" });
    }
    if (isMinistry) {
      items.push({ path: "/ministry", label: "Ministry oversight" });
    }
    return items;
  }, [isUniversity, isRegistrar, isMinistry]);

  const defaultRoute = navItems[0]?.path ?? "/student";

  useEffect(() => {
    if (!roleState.isConnected) {
      return;
    }

    const isKnownRoute = navItems.some((item) => item.path === location.pathname);
    if (!isKnownRoute) {
      navigate(defaultRoute, { replace: true });
    }
  }, [roleState.isConnected, navItems, location.pathname, defaultRoute, navigate]);

  if (!roleState.isConnected) {
    return <LandingPage />;
  }

  const truncatedAddress = ownerAddress
    ? `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(ownerAddress.length - 4)}`
    : "";

  return (
    <div className="container slide-up">
      <header className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: "0.5rem", background: "linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              TransCrypt
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "0.9375rem" }}>
              Secure transcript verification powered by blockchain
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Connected as</span>
              <code className="wallet-address" style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}>
                {truncatedAddress}
              </code>
            </div>
            <RoleBadges roles={roleState.roles} />
            {roleState.error && (
              <div className="status-message status-error" style={{ marginTop: "1rem" }}>
                {roleState.error}
              </div>
            )}
          </div>
          <button className="button button-secondary" onClick={() => disconnect()} type="button">
            Disconnect
          </button>
        </div>
      </header>

      <nav className="nav">
        {navItems.map((item) => (
          <NavLink key={item.path} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to={item.path}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {(transcriptsQuery.isError || accessibleTranscriptsQuery.isError) && (
        <div className="status-message status-error">
          <strong>⚠ Failed to load transcripts</strong>
          {transcriptsQuery.isError ? (
            <p style={{ marginTop: "0.5rem", marginBottom: 0 }}>{(transcriptsQuery.error as Error).message}</p>
          ) : null}
          {accessibleTranscriptsQuery.isError ? (
            <p style={{ marginTop: "0.5rem", marginBottom: 0 }}>{(accessibleTranscriptsQuery.error as Error).message}</p>
          ) : null}
        </div>
      )}

      <Routes>
        <Route
          path="/student"
          element={<StudentDashboard isLoading={transcriptsQuery.isLoading} transcripts={transcriptsQuery.transcripts} />}
        />
        <Route
          path="/employer"
          element={
            <EmployerDashboard
              isLoading={accessibleTranscriptsQuery.isLoading}
              transcripts={accessibleTranscriptsQuery.transcripts}
            />
          }
        />
        <Route
          path="/university"
          element={
            isUniversity ? (
              <UniversityDashboard
                isLoading={transcriptsQuery.isLoading}
                owner={ownerAddress}
                transcripts={transcriptsQuery.transcripts}
              />
            ) : (
              <Navigate replace to={defaultRoute} />
            )
          }
        />
        <Route
          path="/registrar"
          element={
            isRegistrar ? (
              <RegistrarDashboard
                isLoading={transcriptsQuery.isLoading}
                owner={ownerAddress}
                transcripts={transcriptsQuery.transcripts}
              />
            ) : (
              <Navigate replace to={defaultRoute} />
            )
          }
        />
        <Route
          path="/ministry"
          element={
            isMinistry ? (
              <MinistryDashboard isLoading={transcriptsQuery.isLoading} transcripts={transcriptsQuery.transcripts} />
            ) : (
              <Navigate replace to={defaultRoute} />
            )
          }
        />
        <Route path="/" element={<Navigate replace to={defaultRoute} />} />
        <Route path="*" element={<Navigate replace to={defaultRoute} />} />
      </Routes>
    </div>
  );
}
