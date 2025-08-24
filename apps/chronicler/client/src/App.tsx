import { useState, useEffect } from "react";
import { authClient } from "./lib/auth";
import LoginForm from "./components/LoginForm";
import SignUpForm from "./components/SignUpForm";
import Dashboard from "./components/Dashboard";
import "./App.css";

interface User {
  id: string;
  email: string;
  name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setUser(session.data.user as User);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="App">
        <Dashboard user={user} />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="auth-container">
        <h1>Chronicler</h1>
        {isSignUp ? (
          <SignUpForm onToggleForm={() => setIsSignUp(false)} />
        ) : (
          <LoginForm onToggleForm={() => setIsSignUp(true)} />
        )}
      </div>
    </div>
  );
}

export default App;
