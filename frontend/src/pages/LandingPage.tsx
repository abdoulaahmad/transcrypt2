import { ConnectButton } from "../components/ConnectButton";

export function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Hero Section */}
      <div className="container fade-in" style={{ maxWidth: "1200px", paddingTop: "3rem", paddingBottom: "4rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ 
            display: "inline-block",
            padding: "0.5rem 1.25rem",
            background: "rgba(79, 70, 229, 0.1)",
            borderRadius: "9999px",
            marginBottom: "1.5rem"
          }}>
            <span style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: 500 }}>
              🔐 Blockchain-Powered Academic Credentials
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: "clamp(2.5rem, 5vw, 4rem)", 
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            lineHeight: 1.1
          }}>
            TransCrypt
          </h1>
          
          <p style={{ 
            fontSize: "clamp(1.125rem, 2vw, 1.5rem)", 
            color: "var(--text-secondary)", 
            marginBottom: "2.5rem",
            lineHeight: 1.6,
            maxWidth: "700px",
            margin: "0 auto 2.5rem"
          }}>
            The future of academic transcript verification. Secure, verifiable, and completely private.
          </p>
          
          <div className="card" style={{ 
            padding: "2.5rem", 
            marginBottom: "4rem",
            maxWidth: "600px",
            margin: "0 auto 4rem",
            background: "linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.08) 100%)",
            border: "1.5px solid var(--border)",
            boxShadow: "0 20px 60px rgba(79, 70, 229, 0.12)"
          }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Connect Your Wallet</h3>
            <p style={{ 
              color: "var(--text-secondary)", 
              marginBottom: "2rem",
              fontSize: "0.9375rem",
              lineHeight: 1.6
            }}>
              Join universities, students, and employers using TransCrypt to issue, verify, and share academic credentials securely on the blockchain.
            </p>
            <ConnectButton />
          </div>
        </div>

        {/* Features Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: "2rem",
          marginBottom: "4rem"
        }}>
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <div style={{ 
              width: "3.5rem",
              height: "3.5rem",
              background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              margin: "0 auto 1.25rem"
            }}>
              🔐
            </div>
            <h4 style={{ fontSize: "1.125rem", marginBottom: "0.75rem", fontWeight: 600 }}>Military-Grade Encryption</h4>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              Your transcripts are encrypted with AES-256-GCM before leaving your device. Only you and authorized parties can decrypt them using MetaMask.
            </p>
          </div>
          
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <div style={{ 
              width: "3.5rem",
              height: "3.5rem",
              background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              margin: "0 auto 1.25rem"
            }}>
              ⛓️
            </div>
            <h4 style={{ fontSize: "1.125rem", marginBottom: "0.75rem", fontWeight: 600 }}>Blockchain Verified</h4>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              Every transcript is anchored on the Aptos blockchain, creating an immutable, tamper-proof record that can be verified instantly.
            </p>
          </div>
          
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <div style={{ 
              width: "3.5rem",
              height: "3.5rem",
              background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              margin: "0 auto 1.25rem"
            }}>
              👥
            </div>
            <h4 style={{ fontSize: "1.125rem", marginBottom: "0.75rem", fontWeight: 600 }}>Granular Access Control</h4>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              Students control who can view their transcripts. Grant access to employers or institutions, and revoke it anytime with a single click.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div style={{ marginBottom: "4rem" }}>
          <h2 style={{ 
            textAlign: "center", 
            fontSize: "2rem", 
            marginBottom: "3rem",
            fontWeight: 600
          }}>
            How It Works
          </h2>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "2rem"
          }}>
            <div style={{ position: "relative" }}>
              <div className="card" style={{ padding: "1.75rem", height: "100%" }}>
                <div style={{ 
                  width: "2.5rem",
                  height: "2.5rem",
                  background: "var(--primary)",
                  color: "white",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "1rem"
                }}>
                  1
                </div>
                <h4 style={{ fontSize: "1rem", marginBottom: "0.75rem", fontWeight: 600 }}>🎓 Universities Issue</h4>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  Educational institutions upload and encrypt student transcripts, creating a permanent blockchain record.
                </p>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div className="card" style={{ padding: "1.75rem", height: "100%" }}>
                <div style={{ 
                  width: "2.5rem",
                  height: "2.5rem",
                  background: "var(--accent)",
                  color: "white",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "1rem"
                }}>
                  2
                </div>
                <h4 style={{ fontSize: "1rem", marginBottom: "0.75rem", fontWeight: 600 }}>🔑 Students Control</h4>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  Students own their data and grant encrypted access to employers, using their MetaMask wallet as the master key.
                </p>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div className="card" style={{ padding: "1.75rem", height: "100%" }}>
                <div style={{ 
                  width: "2.5rem",
                  height: "2.5rem",
                  background: "var(--info)",
                  color: "white",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "1rem"
                }}>
                  3
                </div>
                <h4 style={{ fontSize: "1rem", marginBottom: "0.75rem", fontWeight: 600 }}>✓ Employers Verify</h4>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  Authorized parties decrypt and verify credentials instantly, with confidence in their authenticity and integrity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="card" style={{ 
          padding: "3rem 2.5rem",
          background: "linear-gradient(135deg, rgba(79, 70, 229, 0.03) 0%, rgba(99, 102, 241, 0.05) 100%)",
          border: "1.5px solid var(--border)"
        }}>
          <h2 style={{ 
            textAlign: "center", 
            fontSize: "1.75rem", 
            marginBottom: "2.5rem",
            fontWeight: 600
          }}>
            Why Choose TransCrypt?
          </h2>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
            gap: "2rem"
          }}>
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>⚡</div>
              <h4 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem", fontWeight: 600 }}>Instant Verification</h4>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
                No more waiting days for paper transcripts. Verify credentials in seconds.
              </p>
            </div>
            
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>🛡️</div>
              <h4 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem", fontWeight: 600 }}>Fraud Prevention</h4>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
                Blockchain ensures documents can't be forged or tampered with.
              </p>
            </div>
            
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>🌍</div>
              <h4 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem", fontWeight: 600 }}>Global Access</h4>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
                Access your credentials anywhere, anytime, from any device.
              </p>
            </div>
            
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>💰</div>
              <h4 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem", fontWeight: 600 }}>Cost Effective</h4>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
                Eliminate printing, shipping, and manual verification costs.
              </p>
            </div>
            
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>🔒</div>
              <h4 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem", fontWeight: 600 }}>Privacy First</h4>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
                You control who sees your data. No third-party intermediaries.
              </p>
            </div>
            
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>📱</div>
              <h4 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem", fontWeight: 600 }}>Mobile Ready</h4>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
                Manage credentials on the go with MetaMask mobile app.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ 
          textAlign: "center", 
          marginTop: "4rem",
          padding: "3rem 1.5rem",
          background: "linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)",
          borderRadius: "1.5rem",
          color: "white"
        }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem", fontWeight: 600, color: "white" }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: "1.125rem", marginBottom: "2rem", opacity: 0.95, maxWidth: "600px", margin: "0 auto 2rem" }}>
            Connect your MetaMask wallet now and experience the future of academic credential management.
          </p>
          <div style={{ display: "inline-block" }}>
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        borderTop: "1px solid var(--border)",
        padding: "2rem 0",
        textAlign: "center",
        color: "var(--text-secondary)",
        fontSize: "0.875rem"
      }}>
        <div className="container">
          <p style={{ margin: 0 }}>
            © 2025 TransCrypt. Powered by Aptos Blockchain & MetaMask.
          </p>
        </div>
      </div>
    </div>
  );
}
