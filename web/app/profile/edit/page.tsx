"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const BIO_MAX = 160;

const inputBase =
  "h-10 w-full rounded border border-border bg-white px-3 text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-[15px]";

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[13px] font-medium text-text-1">
        {label}
      </label>
      <div className="flex h-10 w-full items-center justify-between gap-2 rounded border border-border bg-white px-3 text-text-1 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-text-3 focus:outline-none"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="shrink-0 text-text-3 hover:text-text-2 transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {show ? (
            <EyeOff className="w-5 h-5" aria-hidden />
          ) : (
            <Eye className="w-5 h-5" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get("/api/profile");
        const { user } = res.data;
        setName(user.name ?? "");
        setUsername(user.username ?? "");
        setBio(user.bio ?? "");
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push("/login?redirect=/profile/edit");
          return;
        }
        setProfileError("Failed to load profile");
      } finally {
        setIsLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [router]);

  async function handleSaveProfile() {
    setProfileError(null);
    setProfileSuccess(false);
    if (!name.trim()) {
      setProfileError("Name is required");
      return;
    }
    setIsSavingProfile(true);
    try {
      await axios.patch("/api/profile", {
        name: name.trim(),
        username: username.trim() || undefined,
        bio: bio.trim(),
      });
      setProfileSuccess(true);
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setProfileError(err.response.data.error);
      } else {
        setProfileError("Failed to update profile");
      }
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleUpdatePassword() {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await axios.patch("/api/profile/password", {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setPasswordError(err.response.data.error);
      } else {
        setPasswordError("Failed to update password");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  const bioCount = bio.length;
  const bioOverLimit = bioCount > BIO_MAX;

  if (isLoadingProfile) {
    return (
      <div className="w-full max-w-[500px] mx-auto pt-8 sm:pt-12 pb-12 flex justify-center">
        <p className="text-text-2">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[500px] mx-auto pt-8 sm:pt-12 pb-12 flex flex-col gap-6">
      {/* Profile card — matches epProfileCard */}
      <section
        className="rounded-lg border border-border bg-white px-10 py-12 flex flex-col gap-6"
        aria-labelledby="edit-profile-title"
      >
        <h1
          id="edit-profile-title"
          className="font-logo text-2xl font-semibold text-text-1"
        >
          Edit profile
        </h1>

        {profileError && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded" role="alert">
            {profileError}
          </p>
        )}
        {profileSuccess && (
          <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded" role="status">
            Profile updated successfully.
          </p>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center sm:items-start gap-3">
          <div
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[28px] shrink-0"
            aria-hidden
          >
            {getInitials(name)}
          </div>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="edit-name" className="text-[13px] font-medium text-text-1">
            Name
          </label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputBase}
            placeholder="Your name"
          />
        </div>

        {/* Username — with @ prefix like design */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="edit-username"
            className="text-[13px] font-medium text-text-1"
          >
            Username
          </label>
          <div className="flex h-10 w-full items-center gap-0.5 rounded border border-border bg-white px-3 text-text-1 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
            <span className="text-[15px] text-text-3 shrink-0">@</span>
            <input
              id="edit-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-text-3 focus:outline-none"
              placeholder="username"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1">
          <label htmlFor="edit-bio" className="text-[13px] font-medium text-text-1">
            Bio
          </label>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={BIO_MAX}
            rows={4}
            className="min-h-[80px] w-full rounded border border-border bg-white px-3 py-2 text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y text-[14px]"
            placeholder="Tell readers about yourself"
          />
          <p
            className={`text-xs ${bioOverLimit ? "text-like" : "text-text-3"}`}
          >
            {bioCount} / {BIO_MAX}
          </p>
        </div>

        {/* Buttons — gap-3, h-11 → h-[44px] to match design */}
        <div className="flex flex-row gap-3">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="h-[44px] rounded-full bg-primary px-6 text-white font-medium text-[15px] hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSavingProfile ? "Saving…" : "Save changes"}
          </button>
          <Link
            href="/profile"
            className="h-[44px] rounded-full flex items-center justify-center px-6 text-text-2 text-[15px] hover:text-text-1 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </section>

      {/* Password card — matches epPasswordCard */}
      <section
        className="rounded-lg border border-border bg-white px-10 py-12 flex flex-col gap-6"
        aria-labelledby="change-password-title"
      >
        <h2
          id="change-password-title"
          className="text-sm font-semibold text-text-1"
        >
          Change password
        </h2>

        {passwordError && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded" role="alert">
            {passwordError}
          </p>
        )}
        {passwordSuccess && (
          <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded" role="status">
            Password updated successfully.
          </p>
        )}

        <div className="flex flex-col gap-6">
          <PasswordInput
            id="edit-current-password"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <PasswordInput
            id="edit-new-password"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordInput
            id="edit-confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </div>

        <button
          type="button"
          onClick={handleUpdatePassword}
          disabled={isUpdatingPassword}
          className="h-[44px] w-fit rounded-full bg-primary px-6 text-white font-semibold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUpdatingPassword ? "Updating…" : "Update password"}
        </button>
      </section>
    </div>
  );
}