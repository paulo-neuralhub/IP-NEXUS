-- Create demo documents bucket (public for easy preview)
insert into storage.buckets (id, name, public)
values ('demo-documents', 'demo-documents', true)
on conflict (id) do update set public = excluded.public;

-- Policies for reading demo documents
-- Note: storage.objects already has RLS enabled in Supabase.

do $$
begin
  -- Public read access for demo bucket
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read demo-documents'
  ) then
    create policy "Public read demo-documents"
    on storage.objects
    for select
    using (bucket_id = 'demo-documents');
  end if;
end $$;
