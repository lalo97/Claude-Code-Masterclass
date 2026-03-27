"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";
import { COLLECTIONS, CreateHeistInput, UserProfile } from "@/types/firestore";
import styles from "./CreateHeistForm.module.css";

export default function CreateHeistForm() {
  const { user } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [assignedToCodename, setAssignedToCodename] = useState("");
  const [comboboxQuery, setComboboxQuery] = useState("");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    getDocs(collection(db, COLLECTIONS.USERS))
      .then((snapshot) => {
        setUsers(
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as UserProfile,
          ),
        );
      })
      .catch(() => {
        setSubmitError("Failed to load users.");
      })
      .finally(() => {
        setUsersLoading(false);
      });
  }, []);

  const filteredUsers = users.filter((u) =>
    u.codename.toLowerCase().includes(comboboxQuery.toLowerCase()),
  );

  async function handleSubmit(status: "active" | "draft") {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!assignedToId) newErrors.assignedTo = "Please select an assignee.";
    if (!deadline) newErrors.deadline = "Deadline is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user) return;

    setSubmitting(true);
    setSubmitError(null);

    const heistData: CreateHeistInput = {
      createdAt: serverTimestamp(),
      title,
      description,
      createdBy: user.uid,
      createdByCodename: user.displayName ?? "",
      assignedTo: assignedToId,
      assignedToCodename,
      deadline: new Date(deadline),
      finalStatus: null,
      status,
    };

    try {
      await addDoc(collection(db, COLLECTIONS.HEISTS), heistData);
      router.push("/heists");
    } catch {
      setSubmitError("Failed to create heist. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.form}>
      <div className={styles.fieldGroup}>
        <label htmlFor="title" className={styles.label}>
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
        />
        {errors.title && (
          <p role="alert" className={styles.error}>
            {errors.title}
          </p>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
        />
        {errors.description && (
          <p role="alert" className={styles.error}>
            {errors.description}
          </p>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="assignee" className={styles.label}>
          Assigned To
        </label>
        <div className={styles.comboboxWrapper}>
          <input
            id="assignee"
            type="text"
            value={comboboxQuery}
            placeholder="Search agents…"
            className={styles.input}
            onFocus={() => setIsComboboxOpen(true)}
            onChange={(e) => {
              setComboboxQuery(e.target.value);
              setIsComboboxOpen(true);
              setAssignedToId("");
              setAssignedToCodename("");
            }}
            onBlur={() => {
              setTimeout(() => setIsComboboxOpen(false), 150);
              setComboboxQuery(assignedToCodename);
            }}
          />
          {isComboboxOpen && (
            <ul role="listbox" className={styles.comboboxList}>
              {usersLoading ? (
                <li className={styles.comboboxOption}>Loading users…</li>
              ) : filteredUsers.length === 0 ? (
                <li className={styles.comboboxOption}>
                  No matching agents found.
                </li>
              ) : (
                filteredUsers.map((u) => (
                  <li
                    key={u.id}
                    role="option"
                    aria-selected={assignedToId === u.id}
                    className={styles.comboboxOption}
                    onMouseDown={() => {
                      setAssignedToId(u.id);
                      setAssignedToCodename(u.codename);
                      setComboboxQuery(u.codename);
                      setIsComboboxOpen(false);
                    }}
                  >
                    {u.codename}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        {errors.assignedTo && (
          <p role="alert" className={styles.error}>
            {errors.assignedTo}
          </p>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="deadline" className={styles.label}>
          Deadline
        </label>
        <input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={styles.input}
        />
        {errors.deadline && (
          <p role="alert" className={styles.error}>
            {errors.deadline}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className={styles.error}>
          {submitError}
        </p>
      )}

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.btnDraft}
          onClick={() => handleSubmit("draft")}
          disabled={submitting}
        >
          Save as Draft
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => handleSubmit("active")}
          disabled={submitting}
        >
          {submitting ? "Creating…" : "Create Heist"}
        </button>
      </div>
    </div>
  );
}
