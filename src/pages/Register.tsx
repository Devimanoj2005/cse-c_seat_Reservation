import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, User, Lock, ArrowRight, Hash } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Register() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(username, password, { full_name: fullName, roll_number: rollNumber });
      toast.success("Account created! You can now sign in.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "pl-11 h-11 bg-background/50 border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all";
  const labelClass = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-[hsl(var(--primary-glow)/0.05)]" />
      <div className="absolute top-20 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -left-32 w-96 h-96 bg-[hsl(var(--primary-glow)/.1)] rounded-full blur-3xl" />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card rounded-2xl p-8 glow-shadow">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] rounded-2xl flex items-center justify-center mb-4">
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
              <p className="text-muted-foreground text-sm mt-1">Join CSE-C Seat Reservation</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className={labelClass}>Username</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="username" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rollNumber" className={labelClass}>Roll No.</Label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="rollNumber" placeholder="Roll number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className={inputClass} required />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fullName" className={labelClass}>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="fullName" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className={labelClass}>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={6} />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-bold rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] hover:opacity-90 shadow-lg shadow-primary/25 transition-all mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
