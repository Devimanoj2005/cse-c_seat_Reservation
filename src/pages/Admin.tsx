import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface BookingWithDetails {
  id: string;
  seat_id: string;
  user_id: string;
  booking_date: string;
  created_at: string;
  seats: { bench_label: string; side: string; position: number };
  profiles: { username: string; full_name: string; roll_number: string };
}

export default function Admin() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [resetting, setResetting] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  const fetchBookings = useCallback(async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, seats(*), profiles!bookings_user_id_fkey(*)")
      .eq("booking_date", today)
      .order("created_at", { ascending: true });
    if (data) setBookings(data as unknown as BookingWithDetails[]);
  }, [today]);

  useEffect(() => {
    if (!loading && (!profile || !profile.is_admin)) {
      navigate("/dashboard");
      return;
    }
    if (profile?.is_admin) fetchBookings();
  }, [profile, loading, navigate, fetchBookings]);

  const handleDelete = async (bookingId: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", bookingId);
    if (error) {
      toast.error("Failed to delete booking");
    } else {
      toast.success("Booking removed");
      fetchBookings();
    }
  };

  const handleResetAll = async () => {
    setResetting(true);
    const { error } = await supabase.from("bookings").delete().eq("booking_date", today);
    if (error) {
      toast.error("Failed to reset");
    } else {
      toast.success("All bookings reset for today");
      fetchBookings();
    }
    setResetting(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-bold">Admin Panel</h1>
          </div>
          <Button variant="destructive" size="sm" onClick={handleResetAll} disabled={resetting}>
            <RefreshCw className="w-3 h-3 mr-1" /> {resetting ? "Resetting..." : "Reset All Today"}
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Bookings — {format(new Date(), "MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No bookings for today</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Booked At</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b, i) => (
                    <TableRow key={b.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">{b.profiles?.full_name || b.profiles?.username}</TableCell>
                      <TableCell>{b.profiles?.roll_number}</TableCell>
                      <TableCell>{b.seats?.bench_label}-{b.seats?.position}</TableCell>
                      <TableCell className="capitalize">{b.seats?.side}</TableCell>
                      <TableCell>{format(new Date(b.created_at), "h:mm a")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
