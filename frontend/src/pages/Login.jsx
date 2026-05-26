import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>ChatHub</h1>
          <p style={styles.subtitle}>Connect instantly. Chat seamlessly.</p>
        </div>
        
        <div style={styles.formContainer}>
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#3b82f6",
                colorBackground: "#ffffff",
                colorInputBackground: "#f9fafb",
                colorInputBorder: "#e5e7eb",
              },
              elements: {
                rootBox: {
                  margin: "0 auto",
                },
                card: {
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)",
                  borderRadius: "12px",
                  color: "#1a1a1a",
                },
              },
            }}
          />
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  container: {
    display: "flex",
    gap: "60px",
    alignItems: "center",
    maxWidth: "1000px",
    width: "100%",
  },
  content: {
    flex: 1,
    color: "#ffffff",
  },
  title: {
    fontSize: "48px",
    fontWeight: "700",
    marginBottom: "16px",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  subtitle: {
    fontSize: "20px",
    fontWeight: "400",
    opacity: "0.9",
    lineHeight: "1.6",
  },
  formContainer: {
    flex: 1,
    width: "100%",
  },
};

export default Login;
