-- Drop the duplicate approve_lead function (keep the simpler one)
DROP FUNCTION IF EXISTS public.approve_lead(uuid, uuid, text, numeric);