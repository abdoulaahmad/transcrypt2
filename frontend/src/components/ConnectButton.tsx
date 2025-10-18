import { useState } from "react";
import { ConnectorNotFoundError, useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { address, isConnecting } = useAccount();
  const { connectAsync, connectors, isLoading, pendingConnector, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [localError, setLocalError] = useState<string | null>(null);

  const metamaskConnector = connectors.find((connector) => connector.id === "metaMask" || connector.name === "MetaMask");
  const canConnect = Boolean(metamaskConnector?.ready);

  const resolveErrorMessage = (err: unknown): string => {
    if (typeof err === "string") {
      return err;
    }
    if (err instanceof ConnectorNotFoundError) {
      return "MetaMask extension not detected. Please install MetaMask then refresh the page.";
    }
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return "Unable to connect to MetaMask.";
  };

  const handleConnect = async () => {
    if (!metamaskConnector) return;
    if (!metamaskConnector.ready) {
      setLocalError("MetaMask extension is not available in this browser.");
      return;
    }

    setLocalError(null);
    try {
      await connectAsync({ connector: metamaskConnector });
    } catch (err) {
      setLocalError(resolveErrorMessage(err));
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (address) {
    return (
      <div className="card fade-in" style={{ padding: "1.5rem", textAlign: "center" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "0.5rem",
          marginBottom: "1rem"
        }}>
          <span style={{ fontSize: "1.25rem", color: "var(--accent)" }}>✓</span>
          <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600, color: "var(--text-primary)" }}>
            Wallet Connected
          </h3>
        </div>
        <code 
          className="wallet-address"
          style={{ 
            display: "block", 
            margin: "0.75rem 0 1.25rem",
            padding: "0.625rem",
            fontSize: "0.875rem"
          }}
        >
          {address}
        </code>
        <button 
          className="button button-secondary" 
          onClick={handleDisconnect} 
          type="button"
          style={{ 
            width: "100%",
            padding: "0.75rem",
            fontSize: "0.9375rem"
          }}
        >
          Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        className="button"
        disabled={isConnecting || isLoading || !metamaskConnector || !canConnect}
        onClick={handleConnect}
        type="button"
        style={{ 
          fontSize: "0.9375rem", 
          padding: "0.875rem 1.75rem",
          minWidth: "240px",
          justifyContent: "center",
          gap: "0.75rem"
        }}
      >
        {isConnecting || isLoading ? (
          <>
            <span className="loading-spinner" style={{ width: '1rem', height: '1rem' }} />
            Connecting {pendingConnector?.name ?? "wallet"}...
          </>
        ) : metamaskConnector ? (
          canConnect ? (
            "Connect Wallet"
          ) : (
            "Install MetaMask"
          )
        ) : (
          "Wallet Not Detected"
        )}
      </button>
      {(localError ?? error) && (
        <div className="status-error" style={{ 
          marginTop: "1rem", 
          padding: "1rem", 
          borderRadius: "0.75rem"
        }}>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            {resolveErrorMessage(localError ?? error ?? new Error("Unable to connect"))}
          </p>
        </div>
      )}
    </>
  );
}