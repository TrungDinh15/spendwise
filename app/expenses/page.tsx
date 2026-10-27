"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useExpense,
  ExpenseCategory,
} from "@/context/ExpenseContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Other",
];

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ExpensesPage() {
  const router = useRouter();
  const { user, loadingAuth, expenses, addExpense, deleteExpense } =
    useExpense();

  // Form states
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorAmount, setErrorAmount] = useState("");
  const [errorCategory, setErrorCategory] = useState("");
  const [errorDate, setErrorDate] = useState("");
  const [errorNote, setErrorNote] = useState("");
  const [errorExpense, setErrorExpense] = useState("");
  const [expenseSuccess, setExpenseSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter states
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  // Route protection
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.replace("/login");
    }
  }, [loadingAuth, user, router]);

  // Validation function
  const validateForm = (
    curAmount = amount,
    curCategory = category,
    curDate = date,
    curNote = note
  ) => {
    let amtErr = "";
    let catErr = "";
    let dateErr = "";
    let noteErr = "";

    // Amount validation
    if (!curAmount.trim()) {
      amtErr = "Amount is required";
    } else {
      const num = Number(curAmount);
      if (isNaN(num) || num <= 0) {
        amtErr = "Amount must be greater than 0";
      }
    }

    // Category validation
    if (!curCategory) {
      catErr = "Please choose a category";
    }

    // Date validation
    if (!curDate) {
      dateErr = "Date is required";
    } else {
      const today = getTodayString();
      if (curDate > today) {
        dateErr = "Date cannot be in the future";
      }
    }

    // Note validation
    if (curNote && curNote.length > 100) {
      noteErr = "Note must be at most 100 characters";
    }

    return { amtErr, catErr, dateErr, noteErr };
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmount(val);
    if (hasSubmitted) {
      const { amtErr } = validateForm(val, category, date, note);
      setErrorAmount(amtErr);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    if (hasSubmitted) {
      const { catErr } = validateForm(amount, val, date, note);
      setErrorCategory(catErr);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDate(val);
    if (hasSubmitted) {
      const { dateErr } = validateForm(amount, category, val, note);
      setErrorDate(dateErr);
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNote(val);
    if (hasSubmitted) {
      const { noteErr } = validateForm(amount, category, date, val);
      setErrorNote(noteErr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorExpense("");
    setExpenseSuccess("");

    const { amtErr, catErr, dateErr, noteErr } = validateForm(
      amount,
      category,
      date,
      note
    );

    setErrorAmount(amtErr);
    setErrorCategory(catErr);
    setErrorDate(dateErr);
    setErrorNote(noteErr);

    if (amtErr || catErr || dateErr || noteErr) {
      return;
    }

    setSubmitting(true);
    const result = await addExpense({
      amount: Number(amount),
      category: category as ExpenseCategory,
      spent_on: date,
      note: note.trim(),
    });
    setSubmitting(false);

    if (!result.success) {
      setErrorExpense(result.error || "Failed to add expense");
      return;
    }

    // Success
    setExpenseSuccess("Expense added");
    setAmount("");
    setCategory("");
    setDate("");
    setNote("");
    setHasSubmitted(false);
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
  };

  const handleClearFilters = () => {
    setFilterCategory("");
    setFilterMonth("");
  };

  // Filtered expenses: combine both filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchCat = !filterCategory || item.category === filterCategory;
      const matchMon = !filterMonth || item.spent_on.startsWith(filterMonth);
      return matchCat && matchMon;
    });
  }, [expenses, filterCategory, filterMonth]);

  // Summary calculations
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [filteredExpenses]);

  // Breakdown: one row per category that appears, highest total first
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of filteredExpenses) {
      const current = map.get(item.category) || 0;
      map.set(item.category, current + Number(item.amount));
    }

    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  // Prevent flash of content or incorrect redirect while auth is resolving
  if (loadingAuth || !user) {
    return null;
  }

  return (
    <div
      data-testid="expenses-page"
      className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Summary */}
        <div className="xl:col-span-5 space-y-6">
          {/* Add Expense Form */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Add an Expense</CardTitle>
              <CardDescription>
                Record your expense details with category and date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                data-testid="expense-form"
                noValidate
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {expenseSuccess && (
                  <div
                    data-testid="expense-success"
                    className="p-3 text-sm rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20"
                  >
                    {expenseSuccess}
                  </div>
                )}

                {errorExpense && (
                  <div
                    data-testid="error-expense"
                    className="p-3 text-sm rounded-md bg-destructive/15 text-destructive font-medium border border-destructive/20"
                  >
                    {errorExpense}
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="input-amount"
                    className="text-sm font-medium leading-none"
                  >
                    Amount ($)
                  </label>
                  <Input
                    id="input-amount"
                    data-testid="input-amount"
                    type="number"
                    step="any"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                  />
                  {errorAmount && (
                    <p
                      data-testid="error-amount"
                      className="text-xs text-destructive font-medium pt-1"
                    >
                      {errorAmount}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="select-category"
                    className="text-sm font-medium leading-none"
                  >
                    Category
                  </label>
                  <select
                    id="select-category"
                    data-testid="select-category"
                    value={category}
                    onChange={handleCategoryChange}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Choose category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errorCategory && (
                    <p
                      data-testid="error-category"
                      className="text-xs text-destructive font-medium pt-1"
                    >
                      {errorCategory}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="input-date"
                    className="text-sm font-medium leading-none"
                  >
                    Date
                  </label>
                  <Input
                    id="input-date"
                    data-testid="input-date"
                    type="date"
                    value={date}
                    onChange={handleDateChange}
                  />
                  {errorDate && (
                    <p
                      data-testid="error-date"
                      className="text-xs text-destructive font-medium pt-1"
                    >
                      {errorDate}
                    </p>
                  )}
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="input-note"
                    className="text-sm font-medium leading-none"
                  >
                    Note (optional)
                  </label>
                  <Input
                    id="input-note"
                    data-testid="input-note"
                    type="text"
                    value={note}
                    onChange={handleNoteChange}
                    placeholder="Short note (max 100 characters)"
                  />
                  {errorNote && (
                    <p
                      data-testid="error-note"
                      className="text-xs text-destructive font-medium pt-1"
                    >
                      {errorNote}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  data-testid="btn-add-expense"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Summary</CardTitle>
              <CardDescription>
                Overview of currently filtered spending
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-2">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <span className="text-xs text-muted-foreground block font-medium">
                    Total Amount
                  </span>
                  <span
                    data-testid="total-amount"
                    className="text-2xl font-bold tracking-tight text-foreground"
                  >
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <span className="text-xs text-muted-foreground block font-medium">
                    Total Expenses
                  </span>
                  <span
                    data-testid="expense-count"
                    className="text-2xl font-bold tracking-tight text-foreground"
                  >
                    {filteredExpenses.length}
                  </span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Category Breakdown
                </h3>
                <div data-testid="category-breakdown" className="space-y-1.5">
                  {categoryBreakdown.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-1">
                      No categories to display
                    </p>
                  ) : (
                    categoryBreakdown.map((item) => (
                      <div
                        key={item.name}
                        data-testid="breakdown-row"
                        className="flex items-center justify-between p-2 rounded-md bg-muted/30 text-sm border border-muted"
                      >
                        <span
                          data-testid="breakdown-name"
                          className="font-medium text-foreground"
                        >
                          {item.name}
                        </span>
                        <span
                          data-testid="breakdown-amount"
                          className="font-semibold text-primary"
                        >
                          ${item.total.toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Filters & Expense List */}
        <div className="xl:col-span-7 space-y-6">
          {/* Filters Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5 space-y-1">
                  <label
                    htmlFor="filter-category"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Filter by Category
                  </label>
                  <select
                    id="filter-category"
                    data-testid="filter-category"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">All</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label
                    htmlFor="filter-month"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Filter by Month
                  </label>
                  <input
                    id="filter-month"
                    type="month"
                    data-testid="filter-month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="sm:col-span-3">
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="btn-clear-filters"
                    onClick={handleClearFilters}
                    className="w-full h-8"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses List */}
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-bold">Your Expenses</CardTitle>
              <CardDescription>
                Chronological list of expenses, newest date first
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {filteredExpenses.length === 0 ? (
                <div
                  data-testid="expenses-empty"
                  className="py-12 text-center text-muted-foreground font-medium"
                >
                  No expenses found
                </div>
              ) : (
                <div data-testid="expense-list" className="space-y-3">
                  {filteredExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      data-testid="expense-item"
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            data-testid="expense-category"
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-secondary text-secondary-foreground"
                          >
                            {exp.category}
                          </span>
                          <span
                            data-testid="expense-date"
                            className="text-xs text-muted-foreground"
                          >
                            {exp.spent_on}
                          </span>
                        </div>
                        <p
                          data-testid="expense-note"
                          className="text-sm text-foreground break-words"
                        >
                          {exp.note}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span
                          data-testid="expense-amount"
                          className="text-lg font-bold text-foreground"
                        >
                          ${Number(exp.amount).toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          data-testid="btn-delete-expense"
                          onClick={() => handleDelete(exp.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
