"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { generateCodename } from "@/lib/codename";
import styles from "./AuthForm.module.css";

interface AuthFormProps {
  type: "login" | "signup";
}

const config = {
  login: {
    heading: "Log in to Your Account",
    button: "Login",
    loadingText: "Logging in…",
    linkHref: "/signup",
    linkText: "Don't have an account?",
  },
  signup: {
    heading: "Signup for an Account",
    button: "Sign Up",
    loadingText: "Signing up…",
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
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();
  const { heading, button, loadingText, linkHref, linkText } = config[type];

  async function handleSubmit(e: FormEvent) {
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

    if (type === "signup") {
      setLoading(true);
      setAuthError(null);
      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const codename = generateCodename();
        try {
          await updateProfile(credential.user, { displayName: codename });
        } catch (err) {
          console.error("Failed to update profile:", err);
        }
        await setDoc(doc(db, "users", credential.user.uid), {
          id: credential.user.uid,
          codename,
        });
        router.push("/heists");
      } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        if (code === "auth/email-already-in-use") {
          setAuthError("An account with this email already exists.");
        } else if (code === "auth/weak-password") {
          setAuthError("Password must be at least 6 characters.");
        } else {
          setAuthError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      setAuthError(null);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage("Login successful.");
        setEmail("");
        setPassword("");
      } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        if (
          code === "auth/wrong-password" ||
          code === "auth/user-not-found" ||
          code === "auth/invalid-credential"
        ) {
          setAuthError("Invalid email or password.");
        } else {
          setAuthError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
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

      {authError && (
        <p role="alert" className={styles.error}>
          {authError}
        </p>
      )}

      {successMessage && (
        <p role="status" className={styles.success}>
          {successMessage}
        </p>
      )}

      <button type="submit" className="btn" disabled={loading}>
        {loading ? loadingText : button}
      </button>

      <div className={styles.switchLink}>
        <Link href={linkHref} className="btn">
          {linkText}
        </Link>
      </div>
    </form>
  );
}
