-- SpendWise expenses table schema and RLS policies

DROP TABLE IF EXISTS expenses CASCADE;

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL CHECK (category IN ('Food', 'Transport', 'Shopping', 'Bills', 'Other')),
  spent_on DATE NOT NULL,
  note TEXT DEFAULT '' CHECK (char_length(note) <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_spent_on ON expenses(spent_on DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can view only their own expenses
CREATE POLICY "Users can select own expenses"
ON expenses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can insert rows only for themselves
CREATE POLICY "Users can insert own expenses"
ON expenses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Authenticated users can delete only their own expenses
CREATE POLICY "Users can delete own expenses"
ON expenses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy 4: Authenticated users can update only their own expenses
CREATE POLICY "Users can update own expenses"
ON expenses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
