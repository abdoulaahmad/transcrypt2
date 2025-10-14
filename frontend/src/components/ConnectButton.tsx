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
      <div className="card fade-in">
        <h2>✓ Connected</h2>
        <code className="wallet-address" style={{ display: "block", marginTop: "1rem", marginBottom: "1.5rem" }}>
          {address}
        </code>
        <button className="button button-secondary" onClick={handleDisconnect} type="button">
          Disconnect
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
          fontSize: "1rem", 
          padding: "1rem 2.5rem",
          minWidth: "280px"
        }}
      >
        {isConnecting || isLoading ? (
          <>
            <span className="loading-spinner" />
            Connecting {pendingConnector?.name ?? "wallet"}...
          </>
        ) : metamaskConnector ? (
          canConnect ? (
            `Connect ${metamaskConnector.name}`
          ) : (
            "Install or enable MetaMask to continue"
          )
        ) : (
          "No MetaMask connector configured"
        )}
      </button>
      {(localError ?? error) && (
        <div className="status-message status-error" style={{ marginTop: "1.5rem" }}>
          {resolveErrorMessage(localError ?? error ?? new Error("Unable to connect"))}
        </div>
      )}
    </>
  );
}
