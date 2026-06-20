import { SignIn } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

const taglines = [
  "Secure. Instant. Seamless.",
  "Talk. Share. Connect.",
  "Your privacy, our priority.",
];

const Login = () => {
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % taglines.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.wrapper}>
      <style>{`
        @media (max-width: 900px) {
          .login-container { flex-direction: column !important; gap: 32px !important; text-align: center !important; }
          .login-hero { max-width: 480px !important; }
          .login-title { font-size: 32px !important; }
          .login-subtitle { font-size: 15px !important; }
          .login-features { align-items: center !important; }
          .login-review { justify-content: center !important; }
          .login-form { max-width: 100% !important; }
          .login-form-inner { padding: 24px !important; }
          .login-badge { margin-left: auto !important; margin-right: auto !important; }
          .login-logo { display: flex !important; justify-content: center !important; }
          .login-mockup { display: none !important; }
          .orb-1 { width: 300px !important; height: 300px !important; top: -10% !important; }
          .orb-2 { width: 250px !important; height: 250px !important; }
          .orb-3 { width: 200px !important; height: 200px !important; }
        }
        @media (max-width: 480px) {
          .login-title { font-size: 26px !important; }
          .login-form-inner { padding: 20px 16px !important; }
          .login-hero { margin-bottom: 0 !important; }
          .login-float1 { display: none !important; }
          .login-float2 { display: none !important; }
          .login-float3 { display: none !important; }
        }
      `}</style>

      {/* Animated gradient background */}
      <div style={styles.bgGlow} />

      {/* Animated gradient orbs */}
      <div style={styles.orb} className="orb-1" />
      <div style={styles.orb2} className="orb-2" />
      <div style={styles.orb3} className="orb-3" />

      {/* Grid overlay */}
      <div style={styles.gridOverlay} />

      {/* Floating icons */}
      <div className="login-float1" style={styles.floatingBubble1}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div className="login-float2" style={styles.floatingBubble2}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
      </div>
      <div className="login-float3" style={styles.floatingBubble3}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>

      <div className="login-container" style={styles.container}>
        {/* Left: Hero */}
        <div className="login-hero" style={styles.content}>
          <div className="login-badge" style={styles.badge}>✨ Real-time messaging</div>

          <div className="login-logo" style={styles.logoWrapper}>
            <div style={styles.logoIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
          </div>

          <h1 className="login-title" style={styles.title}>
            Where conversations{" "}
            <span style={styles.gradientText}>come alive</span>
          </h1>

          <p className="login-subtitle" style={styles.subtitle} key={taglineIndex}>
            {taglines[taglineIndex]}
            <span style={styles.typingCursor}>|</span>
          </p>

          <div className="login-features" style={styles.features}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span>End-to-end encrypted</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </div>
              <span>Voice & video calls</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <span>File sharing</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span>Lightning fast</span>
            </div>
          </div>

          <div className="login-review" style={styles.reviewBar}>
            <div style={styles.avatars}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={styles.miniAvatar}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              ))}
            </div>
            <span style={styles.reviewText}>
              <strong>1,200+</strong> users love ChatHub
            </span>
          </div>

          {/* Mock Chat Preview */}
          <div className="login-mockup" style={styles.mockup}>
            <div style={styles.mockupHeader}>
              <div style={styles.mockupDots}>
                <span style={{ ...styles.mockupDot, background: "#ef4444" }} />
                <span style={{ ...styles.mockupDot, background: "#f59e0b" }} />
                <span style={{ ...styles.mockupDot, background: "#22c55e" }} />
              </div>
              <div style={styles.mockupTitle}>ChatHub</div>
              <div style={{ width: 40 }} />
            </div>
            <div style={styles.mockupBody}>
              <div style={styles.mockupMsgLeft}>
                <div style={styles.mockupAvatar} />
                <div>
                  <div style={styles.mockupMsgBubbleLeft}>Hey! How are you?</div>
                  <div style={{ ...styles.mockupMsgBubbleLeft, marginTop: 4, width: "60%" }}>Want to catch up?</div>
                </div>
              </div>
              <div style={styles.mockupMsgRight}>
                <div>
                  <div style={styles.mockupMsgBubbleRight}>Hey! I'm great!</div>
                  <div style={{ ...styles.mockupMsgBubbleRight, marginTop: 4, width: "50%" }}>Sure, let's do it</div>
                </div>
              </div>
              <div style={styles.mockupInput}>
                <div style={styles.mockupInputText}>Type a message...</div>
                <div style={styles.mockupSendBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sign-in */}
        <div className="login-form" style={styles.formContainer}>
          <div className="login-form-inner" style={styles.formCard}>
            <div style={styles.formHeader}>
              <div style={styles.formEyebrow}>Secure access</div>
              <h2 style={styles.formTitle}>Sign in to ChatHub</h2>
              <p style={styles.formSubtitle}>One place for chat, calls, and file sharing.</p>
            </div>
            <SignIn
              appearance={{
                variables: {
                  colorPrimary: "#818cf8",
                  colorText: "#e2e8f0",
                  colorBackground: "transparent",
                  colorInputBackground: "rgba(15, 23, 42, 0.55)",
                  colorInputText: "#f8fafc",
                  colorInputBorder: "rgba(148, 163, 184, 0.24)",
                  borderRadius: "14px",
                },
                elements: {
                  rootBox: {
                    margin: "0 auto",
                    width: "100%",
                  },
                  card: {
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",
                    borderRadius: "0",
                    color: "#f8fafc",
                    padding: 0,
                    width: "100%",
                  },
                  headerTitle: {
                    color: "#f8fafc",
                    fontWeight: 700,
                    fontSize: "22px",
                    display: "none",
                  },
                  headerSubtitle: { color: "#94a3b8", fontSize: "14px", display: "none" },
                  socialButtonsBlockButton: {
                    borderRadius: "14px",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    fontWeight: 700,
                    padding: "14px 16px",
                    background: "linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(226, 232, 240, 0.96) 100%)",
                    color: "#0f172a",
                    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.18)",
                  },
                  socialButtonsBlockButtonText: {
                    color: "#0f172a",
                    fontWeight: 700,
                  },
                  socialButtonsBlockButtonArrow: {
                    color: "#334155",
                  },
                  formFieldLabel: {
                    color: "#cbd5e1",
                    fontWeight: 600,
                    fontSize: "13px",
                  },
                  formFieldInput: {
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.22)",
                    backgroundColor: "rgba(15, 23, 42, 0.55)",
                    color: "#f8fafc",
                    boxShadow: "none",
                  },
                  formFieldInputShowPasswordButton: {
                    color: "#cbd5e1",
                  },
                  formFieldAction: {
                    color: "#a5b4fc",
                  },
                  formButtonPrimary: {
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
                    borderRadius: "12px",
                    fontWeight: 600,
                    padding: "12px",
                    boxShadow: "0 12px 30px rgba(99, 102, 241, 0.28)",
                  },
                  footerAction: { color: "#94a3b8" },
                  footerActionLink: { color: "#a5b4fc", fontWeight: 700 },
                  dividerLine: {
                    background: "rgba(148, 163, 184, 0.18)",
                  },
                  dividerText: {
                    color: "#94a3b8",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(-45deg, #0b1120, #1a1f36, #0f1923, #0b1120)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  bgGlow: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(ellipse at 20% 50%, rgba(79,70,229,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(236,72,153,0.06) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  orb: {
    position: "absolute",
    top: "-15%",
    right: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)",
    animation: "float 8s ease-in-out infinite",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute",
    bottom: "-20%",
    left: "-5%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(236, 72, 153, 0.03) 40%, transparent 70%)",
    animation: "float 10s ease-in-out infinite reverse",
    pointerEvents: "none",
  },
  orb3: {
    position: "absolute",
    top: "40%",
    left: "50%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 60%)",
    animation: "float 12s ease-in-out infinite 2s",
    pointerEvents: "none",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  floatingBubble1: {
    position: "absolute",
    top: "12%",
    left: "8%",
    color: "rgba(99, 102, 241, 0.3)",
    animation: "float 7s ease-in-out infinite",
    pointerEvents: "none",
  },
  floatingBubble2: {
    position: "absolute",
    bottom: "18%",
    right: "12%",
    color: "rgba(236, 72, 153, 0.25)",
    animation: "float 9s ease-in-out infinite reverse",
    pointerEvents: "none",
  },
  floatingBubble3: {
    position: "absolute",
    top: "55%",
    left: "5%",
    color: "rgba(59, 130, 246, 0.2)",
    animation: "float 11s ease-in-out infinite 3s",
    pointerEvents: "none",
  },
  container: {
    display: "flex",
    gap: "48px",
    alignItems: "center",
    maxWidth: "1100px",
    width: "100%",
    position: "relative",
    zIndex: 1,
  },
  badge: {
    display: "inline-flex",
    padding: "6px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(99, 102, 241, 0.25)",
    background: "rgba(99, 102, 241, 0.08)",
    color: "#a5b4fc",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.3px",
    marginBottom: "24px",
    backdropFilter: "blur(8px)",
  },
  content: {
    flex: 1,
    color: "#ffffff",
    animation: "slideUp 0.5s ease-out",
  },
  logoWrapper: {
    marginBottom: "20px",
  },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(79, 70, 229, 0.35), 0 0 40px rgba(79, 70, 229, 0.15)",
  },
  title: {
    fontSize: "44px",
    fontWeight: "800",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
    lineHeight: 1.2,
  },
  gradientText: {
    background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #f472b6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "18px",
    fontWeight: "400",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "36px",
    minHeight: "28px",
  },
  typingCursor: {
    display: "inline-block",
    marginLeft: 2,
    animation: "pulse 1s step-end infinite",
    fontWeight: 100,
    color: "rgba(255,255,255,0.3)",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "36px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "rgba(99, 102, 241, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#818cf8",
    flexShrink: 0,
  },
  reviewBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
  },
  avatars: {
    display: "flex",
    alignItems: "center",
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.25)",
    marginRight: -8,
  },
  reviewText: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.45)",
  },
  mockup: {
    background: "rgba(15, 23, 42, 0.5)",
    borderRadius: "16px",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    overflow: "hidden",
    backdropFilter: "blur(12px)",
    maxWidth: 360,
  },
  mockupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
  },
  mockupDots: {
    display: "flex",
    gap: 6,
  },
  mockupDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    opacity: 0.7,
  },
  mockupTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.3px",
  },
  mockupBody: {
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  mockupMsgLeft: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
  },
  mockupAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    flexShrink: 0,
  },
  mockupMsgBubbleLeft: {
    background: "rgba(99, 102, 241, 0.15)",
    borderRadius: "0 14px 14px 14px",
    padding: "10px 14px",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.4,
    maxWidth: "80%",
  },
  mockupMsgRight: {
    display: "flex",
    justifyContent: "flex-end",
  },
  mockupMsgBubbleRight: {
    background: "rgba(99, 102, 241, 0.25)",
    borderRadius: "14px 0 14px 14px",
    padding: "10px 14px",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.4,
    maxWidth: "80%",
  },
  mockupInput: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    padding: "8px 12px",
    borderRadius: 10,
    background: "rgba(148, 163, 184, 0.06)",
    border: "1px solid rgba(148, 163, 184, 0.08)",
  },
  mockupInputText: {
    flex: 1,
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
  },
  mockupSendBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "rgba(99, 102, 241, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.4)",
  },
  formContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    animation: "slideUp 0.5s ease-out 0.1s both",
  },
  formCard: {
    background: "linear-gradient(180deg, rgba(15, 23, 42, 0.84) 0%, rgba(15, 23, 42, 0.72) 100%)",
    borderRadius: "24px",
    padding: "28px",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    boxShadow: "0 24px 70px -18px rgba(2, 6, 23, 0.75), 0 0 0 1px rgba(255,255,255,0.04)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
  },
  formHeader: {
    marginBottom: "18px",
    textAlign: "left",
  },
  formEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#a5b4fc",
    marginBottom: "10px",
  },
  formTitle: {
    color: "#f8fafc",
    fontSize: "28px",
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    fontWeight: 800,
    marginBottom: "8px",
  },
  formSubtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.6,
  },
};

export default Login;
