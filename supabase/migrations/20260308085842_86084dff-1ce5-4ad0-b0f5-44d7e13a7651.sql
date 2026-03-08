
ALTER TABLE seats DROP CONSTRAINT seats_side_check;
ALTER TABLE seats ADD CONSTRAINT seats_side_check CHECK (side = ANY (ARRAY['left'::text, 'right'::text, 'far-right'::text]));
