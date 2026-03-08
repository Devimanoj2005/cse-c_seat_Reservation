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
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");
  const now = new Date();
  const currentHour = now.getHours();
  const bookingOpen = currentHour >= 7 && currentHour < 9;

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
    if (!bookingOpen) {
      toast.error("Booking is only available between 7:00 AM and 9:00 AM");
      return;
    }
    if (myBooking && myBooking.seat_id !== seat.id) {
      toast.error("You already have a booking today. Cancel it first.");
      return;
    }
    setSelectedSeatId(selectedSeatId === seat.id ? null : seat.id);
  };

  const handleBook = async () => {
    if (!bookingOpen) {
      toast.error("Booking is only available between 7:00 AM and 9:00 AM");
      return;
    }
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
              <div className="font-semibold">{profile?.full_name || profile?.username}</div>
              <div className="text-muted-foreground">{profile?.roll_number}</div>
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
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {bookingOpen ? (
                <Badge className="bg-green-50 text-green-700 border border-green-300 hover:bg-green-50">
                  <Sun className="w-3 h-3 mr-1" /> BOOKING OPEN (7:00 AM - 9:00 AM)
                </Badge>
              ) : (
                <Badge className="bg-red-50 text-red-700 border border-red-300 hover:bg-red-50">
                  <Clock className="w-3 h-3 mr-1" /> BOOKING CLOSED
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                <strong>{format(new Date(), "EEEE, MMMM d, yyyy")}</strong>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-green-500 border-2 border-green-600" />
                Available
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-red-500 border-2 border-red-600" />
                Booked
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-blue-500 border-2 border-blue-600" />
                Your Seat
              </span>
            </div>
          </div>
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

        {/* My Booking Section */}
        {myBooking && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Your Booking</h3>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold text-xl">
                {seats.find(s => s.id === myBooking.seat_id)?.bench_label}-{seats.find(s => s.id === myBooking.seat_id)?.position}
              </div>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              Side: <strong className="capitalize">{seats.find(s => s.id === myBooking.seat_id)?.side}</strong>
            </p>
            <Button variant="destructive" onClick={handleCancel} disabled={submitting} size="lg">
              {submitting ? "Cancelling..." : "Cancel My Booking"}
            </Button>
          </div>
        )}

        {/* Book Seat Button */}
        {!myBooking && selectedSeatId && (
          <div className="mt-6 text-center">
            <Button
              onClick={handleBook}
              disabled={submitting || !bookingOpen}
              size="lg"
              className="px-12 py-6 text-lg font-semibold"
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        )}

        {!bookingOpen && !myBooking && (
          <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-amber-600" />
            <h3 className="text-lg font-bold text-amber-900 mb-2">Booking Currently Closed</h3>
            <p className="text-sm text-amber-700">
              Seat booking is available every day between <strong>7:00 AM and 9:00 AM</strong>.
              Please come back during this time to reserve your seat.
            </p>
          </div>
        )}
      </div>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} CSE-C Classroom System. All rights reserved.
      </footer>
    </div>
  );
}
