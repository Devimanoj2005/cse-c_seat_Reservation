
-- Fix RLS policies to be PERMISSIVE (default) instead of RESTRICTIVE
-- Drop and recreate all policies

-- Bookings
DROP POLICY IF EXISTS "Bookings viewable by authenticated" ON public.bookings;
DROP POLICY IF EXISTS "Users can book for themselves" ON public.bookings;
DROP POLICY IF EXISTS "Users can cancel own booking" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete any booking" ON public.bookings;

CREATE POLICY "Bookings viewable by authenticated" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can book for themselves" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own booking" ON public.bookings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any booking" ON public.bookings FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
);

-- Seats
DROP POLICY IF EXISTS "Seats viewable by all authenticated" ON public.seats;
CREATE POLICY "Seats viewable by all authenticated" ON public.seats FOR SELECT TO authenticated USING (true);

-- Profiles
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
