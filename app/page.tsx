import React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1
            data-testid="home-title"
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground"
          >
            SpendWise
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            A small web app where each person records their own spending and
            sees how much they spent with instant breakdowns and filters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary">
                Add expenses
              </CardTitle>
              <CardDescription>
                Record your daily transactions quickly with categories, notes,
                and validation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep every purchase categorized and organized with custom notes
                and timestamps.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary">
                Filter by month
              </CardTitle>
              <CardDescription>
                Narrow down your spending by category or specific monthly time
                ranges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Easily spot trends across months and see exactly what changed over
                time.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary">
                See where money goes
              </CardTitle>
              <CardDescription>
                Real-time totals, expense counts, and automated highest-spending
                breakdowns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Instant analytics let you understand your spending habits
                effortlessly.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8 flex justify-center gap-4">
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Get Started
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
