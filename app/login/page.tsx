"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorAuth, setErrorAuth] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (currentEmail = email, currentPassword = password) => {
    let emailErr = "";
    let passErr = "";

    if (!currentEmail.trim()) {
      emailErr = "Email is required";
    } else if (!EMAIL_REGEX.test(currentEmail.trim())) {
      emailErr = "Please enter a valid email address";
    }

    if (!currentPassword) {
      passErr = "Password is required";
    }

    return { emailErr, passErr };
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (hasSubmitted) {
      const { emailErr } = validate(val, password);
      setErrorEmail(emailErr);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (hasSubmitted) {
      const { passErr } = validate(email, val);
      setErrorPassword(passErr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorAuth("");

    const { emailErr, passErr } = validate(email, password);
    setErrorEmail(emailErr);
    setErrorPassword(passErr);

    if (emailErr || passErr) {
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorAuth(error.message);
      return;
    }

    if (data.user) {
      router.push("/expenses");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Sign In to SpendWise
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your spending dashboard
          </CardDescription>
        </CardHeader>

        <form
          data-testid="login-form"
          noValidate
          onSubmit={handleSubmit}
        >
          <CardContent className="space-y-4">
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
                htmlFor="login-email"
                className="text-sm font-medium leading-none"
              >
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                data-testid="login-email"
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
                htmlFor="login-password"
                className="text-sm font-medium leading-none"
              >
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                data-testid="login-password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                autoComplete="current-password"
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
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-medium hover:underline"
              >
                Register here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
