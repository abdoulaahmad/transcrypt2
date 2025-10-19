import { ConnectButton } from "../components/ConnectButton";
import Logo from '../assest/image/logo.png'
import "../styles/landingpage.css";

export function LandingPage() {
  return (
    <div className="landing-container">
      {/* Enhanced Animated Background */}
      <div className="landing-bg-orbs">
        <div className="orb-1"></div>
        <div className="orb-2"></div>
        <div className="orb-3"></div>
        <div className="orb-4"></div>
        <div className="orb-5"></div>
        <div className="orb-6"></div>
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
      </div>

      {/* Gradient Mesh Overlay */}
      <div className="gradient-mesh"></div>    

      <div className="hero fade-in">        
        {/* Enhanced Hero Badge with Glow */}
        <div className='logo'>
        <img src={Logo} alt='logo' />
      </div>
        <div className="hero-badge">
          <span className="badge-icon">🔐</span>
          <span className="badge-text">Enterprise-Grade Document Security</span>
        </div>
        
        {/* Animated Title */}
        <div className="title-wrapper">
          <h1 className="hero-title">SafeDAG</h1>
        </div>
        
        <p className="hero-subtitle">
          Securely exchange, verify, and audit sensitive business documents  with <span className="highlight-text">zero trust required</span>.
        </p>
        
        {/* Glassmorphic Hero CTA Card */}
        <div className="hero-cta-card card glass-card">
          <h3><span className="gradient-text">Connect Your Wallet</span></h3>
          <p>
            Join legal teams, compliance officers, and enterprises using SafeDAG to share NDAs, contracts, and sensitive records — securely and verifiably.
          </p>
          <ConnectButton />
          <br /> <br />
          <div className="trust-indicators">
            <span className="trust-badge">
              <span className="pulse-dot"></span>
              256-bit Encryption
            </span>
            <span className="trust-badge">
              <span className="pulse-dot"></span>
              SOC 2 Compliant
            </span>
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div className="features-grid">
          <div className="animated-card card feature-card">
            <div className="feature-icon primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <h4>Tamper-Proof Integrity</h4>
            <p>
              Every document is hashed to the blockchain, creating an immutable, cryptographically verifiable record.
            </p>
            <div className="feature-badge">Blockchain Verified</div>
          </div>
          
          <div className="animated-card card feature-card">
            <div className="feature-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h4>Zero-Knowledge Access</h4>
            <p>
              Documents are encrypted end-to-end. Only authorized parties with wallet access can decrypt — no data stored on servers.
            </p>
            <div className="feature-badge success">End-to-End Encrypted</div>
          </div>
          
          <div className="animated-card card feature-card">
            <div className="feature-icon info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h4>Full Audit Trail</h4>
            <p>
              Every access, download, and view is logged on-chain. Know exactly who saw your document and when.
            </p>
            <div className="feature-badge info">Complete Transparency</div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-icon">⚡</div>
          <div className="divider-line"></div>
        </div>

        <h2 className="section-header">
          <span className="section-number">01</span>
          Secure Document Exchange, Simplified
        </h2>

        <div className="how-it-works-grid">
          <div className="animated-card">
            <div className="step-card card">
              <div className="step-number">1</div>
              <div className="step-icon">⚖️</div>
              <h4>Legal Teams Upload</h4>
              <p>
                Upload NDAs, contracts, or compliance docs. SafeDAG encrypts and anchors them to the blockchain instantly.
              </p>
              <div className="step-stats">
                <span className="stat-item">
                  {/* ✅ FIXED: Properly escaped < symbol */}
                  <span className="stat-value">{''} 3s</span>
                  <span className="stat-label">Upload Time</span>
                </span>
              </div>
            </div>
          </div>

          <div className="animated-card">
            <div className="step-card card">
              <div className="step-number success">2</div>
              <div className="step-icon">⏳</div>
              <h4>Set Permissions</h4>
              <p>
                Choose who can access, set expiry (24h, 7d, custom), and disable forwarding — all with one click.
              </p>
              <div className="step-stats">
                <span className="stat-item">
                  <span className="stat-value">Granular</span>
                  <span className="stat-label">Control</span>
                </span>
              </div>
            </div>
          </div>

          <div className="animated-card">
            <div className="step-card card">
              <div className="step-number info">3</div>
              <div className="step-icon">✅</div>
              <h4>Partners Verify & Access</h4>
              <p>
                Recipients authenticate via wallet, view the document, and gain cryptographic proof of its authenticity.
              </p>
              <div className="step-stats">
                <span className="stat-item">
                  <span className="stat-value">100%</span>
                  <span className="stat-label">Verified</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Benefits Section */}
        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-icon">🚀</div>
          <div className="divider-line"></div>
        </div>

        <div className="enterprise-benefits-section">
          <div className="enterprise-benefits-card card glass-card">
            <h2 className="section-subheader">
              <span className="section-number">02</span>
              Built for Business, Trusted by Legal
            </h2>
            
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

        {/* Enhanced CTA Section */}
        <div className="cta-section">
          <div className="cta-content">
            <div className="cta-badge">🎯 Get Started Today</div>
            <h2>Secure Your Next Document Exchange</h2>
            <p>
              Connect your wallet and share your first NDA, contract, or compliance record — with cryptographic trust.
            </p>
            <ConnectButton />
            <div className="cta-features">
              <span className="cta-feature">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </span>
              <span className="cta-feature">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free for first 10 documents
              </span>
              <span className="cta-feature">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Enterprise support available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="landing-footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <h3>SafeDAG</h3>
              <p>Blockchain-powered document integrity for enterprise.</p>
            </div>
            <div className="footer-badges">
              <div className="trust-badge-footer">
                <span className="badge-icon-footer">🔐</span>
                <span>End-to-end encrypted</span>
              </div>
              <div className="trust-badge-footer">
                <span className="badge-icon-footer">⛓️</span>
                <span>Immutable audit trail</span>
              </div>
              <div className="trust-badge-footer">
                <span className="badge-icon-footer">🌐</span>
                <span>Zero data retention</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 SafeDAG. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}