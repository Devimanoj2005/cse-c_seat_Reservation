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

  const seatStyles: Record<string, string> = {
    available: "bg-green-500 border-2 border-green-600 text-white cursor-pointer hover:bg-green-600 shadow-sm hover:shadow-md transition-all",
    booked: "bg-red-500 border-2 border-red-600 text-white cursor-not-allowed opacity-90",
    selected: "bg-blue-500 border-2 border-blue-600 text-white cursor-pointer animate-pulse-seat shadow-lg",
    yours: "bg-blue-500 border-2 border-blue-600 text-white cursor-pointer shadow-md",
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
          "w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-all font-bold text-xs",
          seatStyles[status]
        )}
        title={`${seat.bench_label}-${seat.position} - ${status === "available" ? "Available" : status === "booked" ? "Booked" : "Your Seat"}`}
      >
        <span className="text-[10px] leading-tight">{seat.bench_label}</span>
        <span className="text-sm leading-tight">{seat.position}</span>
      </button>
    );
  };

  const renderBenches = (benchList: [string, Seat[]][]) =>
    benchList.map(([label, seats]) => (
      <div key={label} className="flex flex-col items-center gap-2 mb-3">
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-1.5 rounded-full border border-slate-300">
          <span className="text-xs font-bold text-slate-700">Bench {label}</span>
        </div>
        <div className="flex gap-2 p-3 bg-slate-50 rounded-xl border-2 border-slate-200 shadow-sm">
          {seats.sort((a, b) => a.position - b.position).map(renderSeat)}
        </div>
      </div>
    ));

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
      <div className="mb-6 text-center">
        <div className="inline-block bg-slate-800 text-white px-8 py-3 rounded-xl text-base font-bold shadow-md">
          Classroom Layout - CSE-C Girls
        </div>
      </div>

      <div className="flex gap-8 justify-center">
        {/* Left Side - 7 benches for girls */}
        <div className="flex flex-col items-center">
          <div className="mb-4 bg-pink-100 px-6 py-2 rounded-full border-2 border-pink-300">
            <span className="text-sm font-bold tracking-wide text-pink-800">LEFT SIDE (Girls)</span>
          </div>
          {renderBenches(benches(leftSeats))}
        </div>

        {/* Right Side - 7 benches for girls */}
        <div className="flex flex-col items-center">
          <div className="mb-4 bg-pink-100 px-6 py-2 rounded-full border-2 border-pink-300">
            <span className="text-sm font-bold tracking-wide text-pink-800">RIGHT SIDE (Girls)</span>
          </div>
          {renderBenches(benches(rightSeats))}
        </div>

        {/* Far Right - 1 bench for girls, rest for boys */}
        {farRightSeats.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="mb-4 bg-pink-100 px-6 py-2 rounded-full border-2 border-pink-300">
              <span className="text-sm font-bold tracking-wide text-pink-800">FAR RIGHT (Girls)</span>
            </div>
            {renderBenches(benches(farRightSeats))}
            <div className="mt-4 bg-slate-200 px-4 py-2 rounded-lg border border-slate-300 text-center">
              <span className="text-xs font-semibold text-slate-600">Remaining benches<br/>allotted for Boys</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg border-2 border-slate-600">
          Teacher's Desk / Whiteboard
        </div>
      </div>
    </div>
  );
}
