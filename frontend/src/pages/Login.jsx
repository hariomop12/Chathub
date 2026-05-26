import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div style={styles.wrapper}>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#4f46e5",
          },
          elements: {
            rootBox: {
              margin: "0 auto",
            },
            card: {
              background: "#248349",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              color: "#fff",
            },
          },
        }}
      />
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#0b0f19",
  },
};

export default Login;
