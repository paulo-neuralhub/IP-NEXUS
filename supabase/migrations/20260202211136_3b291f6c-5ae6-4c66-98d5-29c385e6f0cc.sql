-- Add missing columns to nice_classes for admin functionality
ALTER TABLE public.nice_classes 
ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add product_count as a generated column based on nice_class_items
-- First, create function to count items
CREATE OR REPLACE FUNCTION public.get_nice_class_item_count(p_class_number integer)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM nice_class_items WHERE class_number = p_class_number;
$$;

-- Add trigger to update updated_at on nice_classes
CREATE OR REPLACE FUNCTION public.update_nice_classes_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_nice_classes_updated_at ON public.nice_classes;
CREATE TRIGGER update_nice_classes_updated_at
  BEFORE UPDATE ON public.nice_classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_nice_classes_timestamp();

-- Seed default icon values for existing classes
UPDATE public.nice_classes SET icon = '🧪' WHERE class_number = 1 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🎨' WHERE class_number = 2 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '💄' WHERE class_number = 3 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '⛽' WHERE class_number = 4 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '💊' WHERE class_number = 5 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🔩' WHERE class_number = 6 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '⚙️' WHERE class_number = 7 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🔧' WHERE class_number = 8 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '💻' WHERE class_number = 9 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🏥' WHERE class_number = 10 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '💡' WHERE class_number = 11 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🚗' WHERE class_number = 12 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🔫' WHERE class_number = 13 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '💎' WHERE class_number = 14 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🎸' WHERE class_number = 15 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '📄' WHERE class_number = 16 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🎈' WHERE class_number = 17 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '👜' WHERE class_number = 18 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🧱' WHERE class_number = 19 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🪑' WHERE class_number = 20 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🍽️' WHERE class_number = 21 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🪢' WHERE class_number = 22 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🧵' WHERE class_number = 23 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🧶' WHERE class_number = 24 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '👕' WHERE class_number = 25 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🎀' WHERE class_number = 26 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🧹' WHERE class_number = 27 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🎮' WHERE class_number = 28 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🥩' WHERE class_number = 29 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '☕' WHERE class_number = 30 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🌾' WHERE class_number = 31 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🍺' WHERE class_number = 32 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🍷' WHERE class_number = 33 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🚬' WHERE class_number = 34 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '📢' WHERE class_number = 35 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '💰' WHERE class_number = 36 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🔨' WHERE class_number = 37 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '📡' WHERE class_number = 38 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🚚' WHERE class_number = 39 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🏭' WHERE class_number = 40 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🎓' WHERE class_number = 41 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🔬' WHERE class_number = 42 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '🍽️' WHERE class_number = 43 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '⚕️' WHERE class_number = 44 AND icon IS NULL;
UPDATE public.nice_classes SET icon = '⚖️' WHERE class_number = 45 AND icon IS NULL;