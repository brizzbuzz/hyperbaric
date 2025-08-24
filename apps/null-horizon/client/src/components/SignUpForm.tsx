import { useState } from "react";
import { authClient } from "../lib/auth";
import { Button } from "@repo/ui";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface SignUpFormProps {
  onToggleForm: () => void;
}

export default function SignUpForm({ onToggleForm }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "Signup failed");
        setLoading(false);
      } else {
        // Keep loading state until page reloads
        window.location.reload();
      }
    } catch (err) {
      setError("An error occurred during signup");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            placeholder="Enter your full name"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="Enter your email address"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <div className="password-input-container">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="Create a secure password"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading}
            >
              {showPassword ? (
                <EyeSlashIcon className="password-toggle-icon" />
              ) : (
                <EyeIcon className="password-toggle-icon" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          variant="primary"
          size="medium"
          className="auth-form__submit-button"
        >
          Sign Up
        </Button>
      </form>

      <p>
        Already have an account?{" "}
        <Button type="button" variant="ghost" onClick={onToggleForm}>
          Sign in
        </Button>
      </p>
    </div>
  );
}
