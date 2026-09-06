-- ViraVeste: politicas dos buckets listing-images e luxury-documents.
drop policy if exists "listing_images_insert_own" on storage.objects;
create policy "listing_images_insert_own" on storage.objects for insert to authenticated with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid()::text));
drop policy if exists "listing_images_update_own" on storage.objects;
create policy "listing_images_update_own" on storage.objects for update to authenticated using (bucket_id = 'listing-images' and owner_id = (select auth.uid()::text)) with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid()::text));
drop policy if exists "listing_images_delete_own" on storage.objects;
create policy "listing_images_delete_own" on storage.objects for delete to authenticated using (bucket_id = 'listing-images' and owner_id = (select auth.uid()::text));
drop policy if exists "luxury_documents_select_own" on storage.objects;
create policy "luxury_documents_select_own" on storage.objects for select to authenticated using (bucket_id = 'luxury-documents' and owner_id = (select auth.uid()::text));
drop policy if exists "luxury_documents_insert_own" on storage.objects;
create policy "luxury_documents_insert_own" on storage.objects for insert to authenticated with check (bucket_id = 'luxury-documents' and (storage.foldername(name))[1] = (select auth.uid()::text));
drop policy if exists "luxury_documents_update_own" on storage.objects;
create policy "luxury_documents_update_own" on storage.objects for update to authenticated using (bucket_id = 'luxury-documents' and owner_id = (select auth.uid()::text)) with check (bucket_id = 'luxury-documents' and (storage.foldername(name))[1] = (select auth.uid()::text));
drop policy if exists "luxury_documents_delete_own" on storage.objects;
create policy "luxury_documents_delete_own" on storage.objects for delete to authenticated using (bucket_id = 'luxury-documents' and owner_id = (select auth.uid()::text));
