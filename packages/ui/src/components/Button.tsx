import React from "react";
import "./Button.css";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}) => {
  const baseClass = "repo-button";
  const variantClass = `repo-button--${variant}`;
  const sizeClass = `repo-button--${size}`;
  const loadingClass = loading ? "repo-button--loading" : "";

  const classes = [baseClass, variantClass, sizeClass, loadingClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className="repo-button__spinner" />}
      <span
        className={
          loading ? "repo-button__content--loading" : "repo-button__content"
        }
      >
        {children}
      </span>
    </button>
  );
};
