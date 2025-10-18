import { ConnectButton } from "../components/ConnectButton";
import "../styles/landingpage.css";

export function LandingPage() {
  return (
    // ✅ Single root element
    <div className="landing-container">
      {/* Animated Background Orbs */}
      <div className="landing-bg-orbs">
        <div className="orb-1"></div>
        <div className="orb-2"></div>
        <div className="orb-3"></div>
        <div className="orb-4"></div>
        <div className="orb-5"></div>
        <div className="particle"></div>
      </div>

      {/* ✅ Now all content is INSIDE landing-container */}
      <div className="hero fade-in">
        <div className="hero-badge">
          🔐 Enterprise-Grade Document Security
        </div>
        
        <h1 className="hero-title">SafeDAG</h1> {/* Fixed name */}
        
        <p className="hero-subtitle">
          Securely exchange, verify, and audit sensitive business documents — with zero trust required.
        </p>
        
        <div className="hero-cta-card card">
          <h3>Connect Your Wallet</h3>
          <p>
            Join legal teams, compliance officers, and enterprises using SafeShare to share NDAs, contracts, and sensitive records — securely and verifiably.
          </p>
          <ConnectButton />
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="animated-card card">
            <div className="feature-icon">📜</div>
            <h4>Tamper-Proof Integrity</h4>
            <p>
              Every document is hashed to the blockchain, creating an immutable, cryptographically verifiable record.
            </p>
          </div>
          
          <div className="animated-card card">
            <div className="feature-icon success">🔒</div>
            <h4>Zero-Knowledge Access</h4>
            <p>
              Documents are encrypted end-to-end. Only authorized parties with wallet access can decrypt — no data stored on servers.
            </p>
          </div>
          
          <div className="animated-card card">
            <div className="feature-icon info">🕵️‍♂️</div>
            <h4>Full Audit Trail</h4>
            <p>
              Every access, download, and view is logged on-chain. Know exactly who saw your document and when.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <h2 className="section-header">Secure Document Exchange, Simplified</h2>
        <div className="how-it-works-grid">
          <div className="animated-card">
            <div className="step-card card">
              <div className="step-number">1</div>
              <h4>⚖️ Legal Teams Upload</h4>
              <p>
                Upload NDAs, contracts, or compliance docs. SafeShare encrypts and anchors them to the blockchain instantly.
              </p>
            </div>
          </div>

          <div className="animated-card">
            <div className="step-card card">
              <div className="step-number success">2</div>
              <h4>⏳ Set Permissions</h4>
              <p>
                Choose who can access, set expiry (24h, 7d, custom), and disable forwarding — all with one click.
              </p>
            </div>
          </div>

          <div className="animated-card">
            <div className="step-card card">
              <div className="step-number info">3</div>
              <h4>✅ Partners Verify & Access</h4>
              <p>
                Recipients authenticate via wallet, view the document, and gain cryptographic proof of its authenticity.
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise Benefits */}
        <div className="enterprise-benefits-section">
          <div className="enterprise-benefits-card card">
            <h2 className="section-subheader">Built for Business, Trusted by Legal</h2>
            <div className="benefits-grid">
              <div className="animated-card">
                <div className="benefit-card">
                  <div className="benefit-icon">⏱️</div>
                  <h4>Accelerate Deals</h4>
                  <p>Share NDAs in seconds, not days. Speed up onboarding and partnerships.</p>
                </div>
              </div>
              
              <div className="animated-card">
                <div className="benefit-card">
                  <div className="benefit-icon">🛡️</div>
                  <h4>Compliance Ready</h4>
                  <p>Meet GDPR, CCPA, and SOC 2 requirements with immutable audit logs.</p>
                </div>
              </div>
              
              <div className="animated-card">
                <div className="benefit-card">
                  <div className="benefit-icon">🔐</div>
                  <h4>No Data Retention</h4>
                  <p>We never store your documents. Zero liability, zero risk.</p>
                </div>
              </div>
              
              <div className="animated-card">
                <div className="benefit-card">
                  <div className="benefit-icon">🔄</div>
                  <h4>Revoke Anytime</h4>
                  <p>Change your mind? Revoke access instantly — even after sharing.</p>
                </div>
              </div>
              
              <div className="animated-card">
                <div className="benefit-card">
                  <div className="benefit-icon">🌐</div>
                  <h4>Interoperable</h4>
                  <p>Works with MetaMask, WalletConnect, and enterprise wallet solutions.</p>
                </div>
              </div>
              
              <div className="animated-card">
                <div className="benefit-card">
                  <div className="benefit-icon">📊</div>
                  <h4>Audit On-Demand</h4>
                  <p>Export a full access log for internal reviews or regulatory audits.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <h2>Secure Your Next Document Exchange</h2>
          <p>
            Connect your wallet and share your first NDA, contract, or compliance record — with cryptographic trust.
          </p>
          <ConnectButton />
        </div>

      </div> {/* closes .hero fade-in */}

      {/* Footer */}
      <div className="landing-footer">
        <div className="container">
          <p>© 2025 SafeShare. Blockchain-powered document integrity for enterprise.</p>
          <p className="trust-badges">
            🔐 End-to-end encrypted • ⛓️ Immutable audit trail • 🌐 Zero data retention
          </p>
        </div>
      </div>

    </div> // ✅ closes .landing-container — single root!
  );
}