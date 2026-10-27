-- Tạo bảng expenses
drop table if exists expenses cascade;

create table expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  amount numeric not null check (amount > 0),
  category text not null check (category in ('Food', 'Transport', 'Shopping', 'Bills', 'Other')),
  spent_on date not null,
  note text check (char_length(note) <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bật Row Level Security (RLS)
alter table expenses enable row level security;

-- Viết Policy: Chỉ người đăng nhập mới được thao tác trên dòng của chính mình
create policy "User can view their own expenses" 
on expenses for select 
using (auth.uid() = user_id);

create policy "User can insert their own expenses" 
on expenses for insert 
with check (auth.uid() = user_id);

create policy "User can delete their own expenses" 
on expenses for delete 
using (auth.uid() = user_id);
