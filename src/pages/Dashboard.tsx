import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SeatLayout from "@/components/SeatLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LogOut, Clock, Zap, Shield, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Seat {
  id: string;
  bench_label: string;
  side: string;
  position: number;
}

interface Profile {
  user_id: string;
  username: string;
  full_name: string;
}

interface Booking {
  id: string;
  seat_id: string;
  user_id: string;
  booking_date: string;
}

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");
  const bookingOpen = true;

  const fetchData = useCallback(async () => {
    const [{ data: seatsData }, { data: bookingsData }, { data: profilesData }] = await Promise.all([
      supabase.from("seats").select("*"),
      supabase.from("bookings").select("*").eq("booking_date", today),
      supabase.from("profiles").select("user_id, username, full_name"),
    ]);
    if (seatsData) setSeats(seatsData);
    if (bookingsData) setBookings(bookingsData);
    if (profilesData) setProfiles(profilesData);
  }, [today]);

  useEffect(() => {
    if (!loading && !user) { navigate("/login"); return; }
    if (user) fetchData();
  }, [user, loading, navigate, fetchData]);

  const myBooking = bookings.find((b) => b.user_id === user?.id);

  const handleSeatClick = (seat: Seat) => {
    if (!bookingOpen) { toast.error("Booking is only available between 7:00 AM and 9:00 AM"); return; }
    if (myBooking && myBooking.seat_id !== seat.id) { toast.error("You already have a booking today. Cancel it first."); return; }
    setSelectedSeatId(selectedSeatId === seat.id ? null : seat.id);
  };

  const handleBook = async () => {
    if (!bookingOpen) { toast.error("Booking is only available between 7:00 AM and 9:00 AM"); return; }
    if (!selectedSeatId || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({ seat_id: selectedSeatId, user_id: user.id, booking_date: today });
      if (error) throw error;
      toast.success("Seat booked successfully!");
      setSelectedSeatId(null);
      await fetchData();
    } catch (err: any) { toast.error(err.message || "Booking failed"); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async () => {
    if (!myBooking) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", myBooking.id);
      if (error) throw error;
      toast.success("Booking cancelled");
      await fetchData();
    } catch (err: any) { toast.error(err.message || "Cancel failed"); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const bookedSeat = myBooking ? seats.find(s => s.id === myBooking.seat_id) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/50 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">CSE-C Seat Reserve</h1>
              <p className="text-[10px] text-muted-foreground">Secure your spot today</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right text-xs mr-2 hidden sm:block">
              <div className="font-semibold">{profile?.full_name || profile?.username}</div>
              <div className="text-muted-foreground text-[10px]">{profile?.roll_number}</div>
            </div>
            {profile?.is_admin && (
              <Button variant="outline" size="sm" className="rounded-xl text-xs h-8" onClick={() => navigate("/admin")}>
                <Shield className="w-3 h-3 mr-1" /> Admin
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Status bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {bookingOpen ? (
                <Badge className="bg-seat-available/10 text-seat-available border border-seat-available/30 hover:bg-seat-available/10 rounded-lg px-3 py-1">
                  <Zap className="w-3 h-3 mr-1" /> BOOKING OPEN
                </Badge>
              ) : (
                <Badge className="bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/10 rounded-lg px-3 py-1">
                  <Clock className="w-3 h-3 mr-1" /> CLOSED
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {format(new Date(), "EEE, MMM d")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-seat-available" /> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-seat-booked" /> Booked</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-seat-yours" /> Yours</span>
            </div>
          </div>
        </motion.div>

        {/* Seat layout */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SeatLayout
            seats={seats}
            bookings={bookings}
            profiles={profiles}
            currentUserId={user?.id ?? null}
            selectedSeatId={selectedSeatId}
            onSeatClick={handleSeatClick}
            bookingOpen={bookingOpen}
          />
        </motion.div>

        {/* Your booking */}
        {myBooking && bookedSeat && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 text-center border-primary/20">
            <h3 className="text-base font-bold mb-3">Your Booking</h3>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground px-8 py-3 rounded-xl font-bold text-xl shadow-lg shadow-primary/20 mb-3">
              {bookedSeat.bench_label}-{bookedSeat.position}
            </div>
            <p className="text-xs text-muted-foreground mb-4 capitalize">Side: {bookedSeat.side}</p>
            <Button variant="destructive" onClick={handleCancel} disabled={submitting} className="rounded-xl">
              {submitting ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </motion.div>
        )}

        {/* Book button */}
        {!myBooking && selectedSeatId && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Button
              onClick={handleBook}
              disabled={submitting || !bookingOpen}
              className="px-10 py-6 text-base font-bold rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] hover:opacity-90 shadow-xl shadow-primary/25"
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </motion.div>
        )}

        {!bookingOpen && !myBooking && (
          <div className="glass-card rounded-2xl p-6 text-center">
            <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-base font-bold mb-2">Booking Closed</h3>
            <p className="text-sm text-muted-foreground">Come back between <strong>7:00 AM – 9:00 AM</strong></p>
          </div>
        )}
      </div>

      <footer className="text-center py-4 text-[10px] text-muted-foreground">
        © {new Date().getFullYear()} CSE-C Classroom System
      </footer>
    </div>
  );
}
