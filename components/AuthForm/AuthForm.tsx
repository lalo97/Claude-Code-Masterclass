"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import styles from "./AuthForm.module.css";

interface AuthFormProps {
  type: "login" | "signup";
}

const config = {
  login: {
    heading: "Log in to Your Account",
    button: "Login",
    linkHref: "/signup",
    linkText: "Don't have an account?",
  },
  signup: {
    heading: "Signup for an Account",
    button: "Sign Up",
    linkHref: "/login",
    linkText: "Already have an account?",
  },
} as const;

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const { heading, button, linkHref, linkText } = config[type];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    console.log({ email, password });
  }

  const HeadingTag = type === "login" ? "h1" : "h2";

  return (
    <form noValidate onSubmit={handleSubmit} className={styles.form}>
      <HeadingTag className="form-title">{heading}</HeadingTag>

      <div className={styles.fieldGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        {errors.email && (
          <p role="alert" className={styles.error}>
            {errors.email}
          </p>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p role="alert" className={styles.error}>
            {errors.password}
          </p>
        )}
      </div>

      <button type="submit" className="btn">
        {button}
      </button>

      <div className={styles.switchLink}>
        <Link href={linkHref} className="btn">
          {linkText}
        </Link>
      </div>
    </form>
  );
}
