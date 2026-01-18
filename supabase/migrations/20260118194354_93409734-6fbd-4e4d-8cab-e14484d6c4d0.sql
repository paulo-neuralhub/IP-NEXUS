-- Add current user as superadmin
INSERT INTO public.superadmins (user_id)
VALUES ('0090b656-5c9a-445c-91be-34228afb2b0f')
ON CONFLICT (user_id) DO NOTHING;