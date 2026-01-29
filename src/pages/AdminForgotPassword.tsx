import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, KeyRound, Phone, Smartphone, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authApi } from "@/api/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const AdminForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Reset
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [adminId, setAdminId] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(phoneNumber);
      setStep(2);
      toast.success("OTP sent successfully to your mobile");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please check your phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authApi.verifyOtp(phoneNumber, otp);
      setAdminId(response.data.adminId);
      setResetToken(response.data.resetToken);
      setStep(3);
      toast.success("OTP verified! You can now reset your password.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, newPassword);
      toast.success("Password updated successfully!");
      navigate("/admin/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <Card variant="elevated" className="w-full max-w-md relative z-10 animate-scale-in">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            {step === 1 && <Phone className="w-8 h-8 text-primary" />}
            {step === 2 && <Smartphone className="w-8 h-8 text-primary" />}
            {step === 3 && <KeyRound className="w-8 h-8 text-primary" />}
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "Reset Password"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Enter your registered phone number to receive a 6-digit OTP"}
            {step === 2 && `We've sent a 6-digit code to ${phoneNumber}`}
            {step === 3 && "Securely reset your password and recover your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <Input
                label="Phone Number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="e.g. +91XXXXXXXXXX"
              />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <Input
                label="6-Digit OTP"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="XXXXXX"
                className="text-center tracking-widest text-xl font-bold"
              />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                Change Phone Number
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-up">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 mb-2">
                <div className="flex items-center gap-3 text-primary">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider opacity-60">Your Admin ID</p>
                    <p className="text-lg font-bold">{adminId}</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminForgotPassword;
