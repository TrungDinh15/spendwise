"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const [errorAuth, setErrorAuth] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (
    currentEmail = email,
    currentPassword = password,
    currentConfirm = confirmPassword
  ) => {
    let emailErr = "";
    let passErr = "";
    let confirmErr = "";

    // Email validation
    if (!currentEmail.trim()) {
      emailErr = "Email is required";
    } else if (!EMAIL_REGEX.test(currentEmail.trim())) {
      emailErr = "Please enter a valid email address";
    }

    // Password validation (Register: at least 6 characters)
    if (!currentPassword) {
      passErr = "Password is required";
    } else if (currentPassword.length < 6) {
      passErr = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!currentConfirm) {
      confirmErr = "Confirm password is required";
    } else if (currentConfirm !== currentPassword) {
      confirmErr = "Passwords do not match";
    }

    return { emailErr, passErr, confirmErr };
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (hasSubmitted) {
      const { emailErr } = validate(val, password, confirmPassword);
      setErrorEmail(emailErr);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (hasSubmitted) {
      const { passErr, confirmErr } = validate(email, val, confirmPassword);
      setErrorPassword(passErr);
      setErrorConfirmPassword(confirmErr);
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (hasSubmitted) {
      const { confirmErr } = validate(email, password, val);
      setErrorConfirmPassword(confirmErr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorAuth("");
    setFormSuccess("");

    const { emailErr, passErr, confirmErr } = validate(
      email,
      password,
      confirmPassword
    );
    setErrorEmail(emailErr);
    setErrorPassword(passErr);
    setErrorConfirmPassword(confirmErr);

    if (emailErr || passErr || confirmErr) {
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorAuth(error.message);
      return;
    }

    // If Supabase returns user identities as empty or returns an existing user error:
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setErrorAuth("User already registered");
      return;
    }

    setFormSuccess("Registration successful");
    // Clear inputs after successful registration
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setHasSubmitted(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center">
            Sign up to start tracking and analyzing your expenses
          </CardDescription>
        </CardHeader>

        <form
          data-testid="register-form"
          noValidate
          onSubmit={handleSubmit}
        >
          <CardContent className="space-y-4">
            {formSuccess && (
              <div
                data-testid="form-success"
                className="p-3 text-sm rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20"
              >
                {formSuccess}
              </div>
            )}

            {errorAuth && (
              <div
                data-testid="error-auth"
                className="p-3 text-sm rounded-md bg-destructive/15 text-destructive font-medium border border-destructive/20"
              >
                {errorAuth}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="register-email"
                className="text-sm font-medium leading-none"
              >
                Email
              </label>
              <Input
                id="register-email"
                type="email"
                data-testid="register-email"
                value={email}
                onChange={handleEmailChange}
                placeholder="name@example.com"
                autoComplete="email"
              />
              {errorEmail && (
                <p
                  data-testid="error-email"
                  className="text-xs text-destructive font-medium pt-1"
                >
                  {errorEmail}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="text-sm font-medium leading-none"
              >
                Password
              </label>
              <Input
                id="register-password"
                type="password"
                data-testid="register-password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errorPassword && (
                <p
                  data-testid="error-password"
                  className="text-xs text-destructive font-medium pt-1"
                >
                  {errorPassword}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-confirm-password"
                className="text-sm font-medium leading-none"
              >
                Confirm Password
              </label>
              <Input
                id="register-confirm-password"
                type="password"
                data-testid="register-confirm-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errorConfirmPassword && (
                <p
                  data-testid="error-confirm-password"
                  className="text-xs text-destructive font-medium pt-1"
                >
                  {errorConfirmPassword}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
