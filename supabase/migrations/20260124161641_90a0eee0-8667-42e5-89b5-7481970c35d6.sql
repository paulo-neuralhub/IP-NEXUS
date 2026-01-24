-- Allow public access to view active portals (for portal index page)
CREATE POLICY "Public can view active portals for login"
ON public.client_portals
FOR SELECT
USING (is_active = true);