"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Other";

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  spent_on: string;
  note: string;
  created_at: string;
}

interface ExpenseContextType {
  user: User | null;
  loadingAuth: boolean;
  expenses: Expense[];
  loadingExpenses: boolean;
  fetchExpenses: () => Promise<void>;
  addExpense: (
    expense: Omit<Expense, "id" | "user_id" | "created_at">
  ) => Promise<{ success: boolean; error?: string; data?: Expense }>;
  deleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function sortExpensesList(items: Expense[]): Expense[] {
  return [...items].sort((a, b) => {
    if (a.spent_on !== b.spent_on) {
      return b.spent_on.localeCompare(a.spent_on); // newest date first
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // added last first
  });
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState<boolean>(false);

  const fetchExpenses = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setExpenses([]);
      return;
    }

    setLoadingExpenses(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("spent_on", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setExpenses(sortExpensesList(data as Expense[]));
    }
    setLoadingExpenses(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Check active session on mount
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (mounted) {
        setUser(currentUser);
        setLoadingAuth(false);
        if (currentUser) {
          fetchExpenses();
        } else {
          setExpenses([]);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoadingAuth(false);

      if (currentUser) {
        // Load expenses once after login
        fetchExpenses();
      } else {
        // Reset expenses completely upon logout
        setExpenses([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchExpenses]);

  const addExpense = async (
    newExp: Omit<Expense, "id" | "user_id" | "created_at">
  ) => {
    if (!user) {
      return { success: false, error: "User is not authenticated" };
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          user_id: user.id,
          amount: newExp.amount,
          category: newExp.category,
          spent_on: newExp.spent_on,
          note: newExp.note || "",
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (data) {
      setExpenses((prev) => sortExpensesList([data as Expense, ...prev]));
      return { success: true, data: data as Expense };
    }

    return { success: true };
  };

  const deleteExpense = async (id: string) => {
    if (!user) {
      return { success: false, error: "User is not authenticated" };
    }

    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    setExpenses((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setExpenses([]);
  };

  return (
    <ExpenseContext.Provider
      value={{
        user,
        loadingAuth,
        expenses,
        loadingExpenses,
        fetchExpenses,
        addExpense,
        deleteExpense,
        logout,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
}
