drop policy "Anyone can submit a wish" on public.wishes;

create policy "Guests can submit valid wishes"
  on public.wishes for insert
  to anon, authenticated
  with check (
    length(trim(guest_name)) between 1 and 100
    and length(trim(message)) between 1 and 2000
    and wish_type in ('wish','advice','dua','message','remark')
  );
