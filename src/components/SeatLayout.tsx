import { Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface SeatLayoutProps {
  seats: Seat[];
  bookings: Booking[];
  currentUserId: string | null;
  selectedSeatId: string | null;
  onSeatClick: (seat: Seat) => void;
  bookingOpen: boolean;
}

export default function SeatLayout({ seats, bookings, currentUserId, selectedSeatId, onSeatClick, bookingOpen }: SeatLayoutProps) {
  const leftSeats = seats.filter((s) => s.side === "left");
  const rightSeats = seats.filter((s) => s.side === "right");

  const benches = (sideSeats: Seat[]) => {
    const grouped: Record<string, Seat[]> = {};
    sideSeats.forEach((s) => {
      if (!grouped[s.bench_label]) grouped[s.bench_label] = [];
      grouped[s.bench_label].push(s);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const getSeatStatus = (seat: Seat) => {
    const booking = bookings.find((b) => b.seat_id === seat.id);
    if (selectedSeatId === seat.id) return "selected";
    if (booking && booking.user_id === currentUserId) return "yours";
    if (booking) return "booked";
    return "available";
  };

  const seatStyles: Record<string, string> = {
    available: "bg-card border-2 border-seat-available text-seat-available cursor-pointer hover:bg-accent",
    booked: "bg-muted border-2 border-muted text-muted-foreground cursor-not-allowed opacity-60",
    selected: "bg-primary border-2 border-primary text-primary-foreground cursor-pointer animate-pulse-seat",
    yours: "bg-seat-yours/10 border-2 border-seat-yours text-seat-yours cursor-pointer",
  };

  const renderSeat = (seat: Seat) => {
    const status = getSeatStatus(seat);
    const isClickable = bookingOpen && (status === "available" || status === "selected" || status === "yours");

    return (
      <button
        key={seat.id}
        onClick={() => isClickable && onSeatClick(seat)}
        disabled={!isClickable}
        className={cn(
          "w-10 h-10 rounded-md flex items-center justify-center transition-all",
          seatStyles[status]
        )}
        title={`${seat.bench_label}-${seat.position}`}
      >
        {status === "booked" ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
      </button>
    );
  };

  const renderBenches = (benchList: [string, Seat[]][]) =>
    benchList.map(([label, seats]) => (
      <div key={label} className="flex flex-col items-center gap-1">
        <span className="text-xs font-semibold text-primary">{label}</span>
        <div className="flex gap-1 p-2 bg-muted/50 rounded-lg border border-border">
          {seats.sort((a, b) => a.position - b.position).map(renderSeat)}
        </div>
      </div>
    ));

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Left Side</span>
          {renderBenches(benches(leftSeats))}
        </div>
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Right Side</span>
          {renderBenches(benches(rightSeats))}
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <div className="bg-foreground text-background px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
          📺 Teacher's Desk / Whiteboard
        </div>
      </div>
    </div>
  );
}
