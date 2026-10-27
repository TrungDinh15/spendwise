"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useExpense } from "@/context/ExpenseContext";
import { Button, buttonVariants } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useExpense();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="border-b bg-card text-card-foreground shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          SpendWise
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span
                data-testid="user-email"
                className="text-sm text-muted-foreground font-medium"
              >
                {user.email}
              </span>
              <Link
                href="/expenses"
                data-testid="link-expenses"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Expenses
              </Link>
              <Button
                variant="outline"
                size="sm"
                data-testid="btn-logout"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                data-testid="btn-login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Login
              </Link>
              <Link
                href="/register"
                data-testid="btn-register"
                className={buttonVariants({ size: "sm" })}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
