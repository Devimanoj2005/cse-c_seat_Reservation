import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SeatLayout from "@/components/SeatLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LogOut, Clock, Sun, Shield } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Seat {
  id: string;
  bench_label: string;
  side: string;
  position: number;
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
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");
  const now = new Date();
  const bookingOpen = now.getHours() >= 7;

  const fetchData = useCallback(async () => {
    const [{ data: seatsData }, { data: bookingsData }] = await Promise.all([
      supabase.from("seats").select("*"),
      supabase.from("bookings").select("*").eq("booking_date", today),
    ]);
    if (seatsData) setSeats(seatsData);
    if (bookingsData) setBookings(bookingsData);
  }, [today]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    if (user) fetchData();
  }, [user, loading, navigate, fetchData]);

  const myBooking = bookings.find((b) => b.user_id === user?.id);

  const handleSeatClick = (seat: Seat) => {
    if (myBooking && myBooking.seat_id !== seat.id) {
      toast.error("You already have a booking today. Cancel it first.");
      return;
    }
    setSelectedSeatId(selectedSeatId === seat.id ? null : seat.id);
  };

  const handleBook = async () => {
    if (!selectedSeatId || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        seat_id: selectedSeatId,
        user_id: user.id,
        booking_date: today,
      });
      if (error) throw error;
      toast.success("Seat booked successfully!");
      setSelectedSeatId(null);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!myBooking) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", myBooking.id);
      if (error) throw error;
      toast.success("Booking cancelled");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Cancel failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold">CSE-C Seat Reservation</h1>
              <p className="text-xs text-muted-foreground">Secure your spot for today's classes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <div className="font-semibold">{format(now, "h:mm a")}</div>
              <div className="text-muted-foreground">{format(now, "EEEE, MMM d")}</div>
            </div>
            {profile?.is_admin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                <Shield className="w-3 h-3 mr-1" /> Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Status bar */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {bookingOpen ? (
            <Badge className="bg-seat-available/10 text-seat-available border-seat-available">
              <Sun className="w-3 h-3 mr-1" /> BOOKING OPEN
            </Badge>
          ) : (
            <Badge variant="destructive">
              <Clock className="w-3 h-3 mr-1" /> BOOKING CLOSED
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            Date: <strong>{format(new Date(), "EEEE, MMMM d, yyyy")}</strong>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border-2 border-seat-available" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted border-2 border-muted" /> Booked</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary border-2 border-primary" /> Selected</span>
        </div>
      </div>

      {/* Seat layout */}
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <SeatLayout
          seats={seats}
          bookings={bookings}
          currentUserId={user?.id ?? null}
          selectedSeatId={selectedSeatId}
          onSeatClick={handleSeatClick}
          bookingOpen={bookingOpen}
        />

        {/* Actions */}
        <div className="mt-4 flex justify-center gap-3">
          {selectedSeatId && !myBooking && (
            <Button onClick={handleBook} disabled={submitting} className="px-8">
              {submitting ? "Booking..." : "Book Seat"}
            </Button>
          )}
          {myBooking && (
            <Button variant="destructive" onClick={handleCancel} disabled={submitting}>
              {submitting ? "Cancelling..." : "Cancel My Booking"}
            </Button>
          )}
        </div>

        {myBooking && (
          <p className="text-center mt-3 text-sm text-seat-yours font-semibold">
            ✅ You have booked seat {seats.find(s => s.id === myBooking.seat_id)?.bench_label}-{seats.find(s => s.id === myBooking.seat_id)?.position}
          </p>
        )}
      </div>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} CSE-C Classroom System. All rights reserved.
      </footer>
    </div>
  );
}
