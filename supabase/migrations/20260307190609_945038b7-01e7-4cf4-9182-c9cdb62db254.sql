
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  roll_number TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create seats table
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bench_label TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('left', 'right')),
  position INTEGER NOT NULL CHECK (position IN (1, 2)),
  UNIQUE(bench_label, position)
);

ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seats viewable by all authenticated" ON public.seats FOR SELECT TO authenticated USING (true);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id UUID REFERENCES public.seats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seat_id, booking_date),
  UNIQUE(user_id, booking_date)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bookings viewable by authenticated" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can book for themselves" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own booking" ON public.bookings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any booking" ON public.bookings FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, roll_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'roll_number', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed seats data
INSERT INTO public.seats (bench_label, side, position) VALUES
  ('L1', 'left', 1), ('L1', 'left', 2),
  ('L2', 'left', 1), ('L2', 'left', 2),
  ('L3', 'left', 1), ('L3', 'left', 2),
  ('L4', 'left', 1), ('L4', 'left', 2),
  ('L5', 'left', 1), ('L5', 'left', 2),
  ('L6', 'left', 1), ('L6', 'left', 2),
  ('R1', 'right', 1), ('R1', 'right', 2),
  ('R2', 'right', 1), ('R2', 'right', 2),
  ('R3', 'right', 1), ('R3', 'right', 2),
  ('R4', 'right', 1), ('R4', 'right', 2),
  ('R5', 'right', 1), ('R5', 'right', 2),
  ('R6', 'right', 1), ('R6', 'right', 2);
