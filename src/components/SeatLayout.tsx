import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

interface Profile {
  user_id: string;
  username: string;
  full_name: string;
}

interface SeatLayoutProps {
  seats: Seat[];
  bookings: Booking[];
  profiles: Profile[];
  currentUserId: string | null;
  selectedSeatId: string | null;
  onSeatClick: (seat: Seat) => void;
  bookingOpen: boolean;
}

export default function SeatLayout({ seats, bookings, profiles, currentUserId, selectedSeatId, onSeatClick, bookingOpen }: SeatLayoutProps) {
  const leftSeats = seats.filter((s) => s.side === "left");
  const rightSeats = seats.filter((s) => s.side === "right");
  const farRightSeats = seats.filter((s) => s.side === "far-right");

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

  const getBookerName = (seat: Seat): string | null => {
    const booking = bookings.find((b) => b.seat_id === seat.id);
    if (!booking) return null;
    const profile = profiles.find((p) => p.user_id === booking.user_id);
    return profile?.username || profile?.full_name || null;
  };

  const seatStyles: Record<string, string> = {
    available: "bg-seat-available text-white cursor-pointer hover:brightness-110 shadow-sm hover:shadow-md",
    booked: "bg-seat-booked text-white cursor-not-allowed opacity-85",
    selected: "bg-seat-selected text-white cursor-pointer ring-2 ring-primary ring-offset-2 shadow-lg scale-105",
    yours: "bg-seat-yours text-white cursor-pointer shadow-md ring-1 ring-primary/30",
  };

  const renderSeat = (seat: Seat, index: number) => {
    const status = getSeatStatus(seat);
    const isClickable = bookingOpen && (status === "available" || status === "selected" || status === "yours");
    const bookerName = getBookerName(seat);

    return (
      <motion.div
        key={seat.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.02, duration: 0.3 }}
        className="flex flex-col items-center gap-1"
      >
        <button
          onClick={() => isClickable && onSeatClick(seat)}
          disabled={!isClickable}
          className={cn(
            "w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 font-bold text-xs relative",
            seatStyles[status]
          )}
          title={`${seat.bench_label}-${seat.position} - ${status === "available" ? "Available" : status === "booked" ? `Booked by ${bookerName}` : "Your Seat"}`}
        >
          <span className="text-[9px] leading-tight opacity-80">{seat.bench_label}</span>
          <span className="text-sm leading-tight font-bold">{seat.position}</span>
        </button>
        {bookerName && (
          <span className="text-[8px] font-medium text-muted-foreground max-w-12 truncate text-center" title={bookerName}>
            {bookerName}
          </span>
        )}
      </motion.div>
    );
  };

  const renderBenches = (benchList: [string, Seat[]][]) =>
    benchList.map(([label, benchSeats]) => (
      <div key={label} className="flex flex-col items-center gap-1.5 mb-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </span>
        <div className="flex gap-1.5 p-2 bg-muted/50 rounded-xl border border-border/50">
          {benchSeats.sort((a, b) => a.position - b.position).map((seat, i) => renderSeat(seat, i))}
        </div>
      </div>
    ));

  return (
    <div className="glass-card rounded-2xl p-6 glow-shadow">
      <div className="mb-5 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
          <span>🏫</span>
          Classroom Layout — CSE-C Girls
        </div>
      </div>

      <div className="flex gap-6 justify-center flex-wrap">
        <div className="flex flex-col items-center">
          <div className="mb-3 px-4 py-1.5 rounded-full bg-accent border border-border/50">
            <span className="text-xs font-bold tracking-wide text-accent-foreground">LEFT SIDE</span>
          </div>
          {renderBenches(benches(leftSeats))}
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-3 px-4 py-1.5 rounded-full bg-accent border border-border/50">
            <span className="text-xs font-bold tracking-wide text-accent-foreground">RIGHT SIDE</span>
          </div>
          {renderBenches(benches(rightSeats))}
        </div>

        {farRightSeats.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="mb-3 px-4 py-1.5 rounded-full bg-accent border border-border/50">
              <span className="text-xs font-bold tracking-wide text-accent-foreground">FAR RIGHT</span>
            </div>
            {renderBenches(benches(farRightSeats))}
            <div className="mt-3 bg-muted px-3 py-1.5 rounded-lg text-center">
              <span className="text-[10px] font-medium text-muted-foreground">Remaining benches for Boys</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <div className="bg-foreground/90 text-background px-8 py-2.5 rounded-xl text-xs font-bold tracking-wide shadow-lg">
          📋 Teacher's Desk / Whiteboard
        </div>
      </div>
    </div>
  );
}
