import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, User, Lock, ArrowRight, Hash, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const [email, setEmail] = useState("");
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
      await signUp(email, password, { username, full_name: fullName, roll_number: rollNumber });
      toast.success("Account created! You can now sign in.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-blue-100">
        <CardContent className="pt-10 pb-10 px-10">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Create Account</h1>
            <p className="text-slate-600 mt-2 text-center">Join CSE-C Girls Seat Reservation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-bold text-slate-700">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <Input id="username" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-11 h-11 border-2 border-slate-200 focus:border-blue-500" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-slate-700">Email</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11 h-11 border-2 border-slate-200 focus:border-blue-500" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-bold text-slate-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <Input id="fullName" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-11 h-11 border-2 border-slate-200 focus:border-blue-500" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="font-bold text-slate-700">Roll Number</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <Input id="rollNumber" placeholder="Your roll number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="pl-11 h-11 border-2 border-slate-200 focus:border-blue-500" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <Input id="password" type="password" placeholder="Enter password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11 h-11 border-2 border-slate-200 focus:border-blue-500" required minLength={6} />
              </div>
            </div>

            <Button type="submit" className="w-full h-13 text-base font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg mt-6" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">Sign In</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
