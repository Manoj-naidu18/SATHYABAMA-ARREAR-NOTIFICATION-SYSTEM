import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { LogIn, ShieldCheck, Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router";
import { GlassCard, GoldButton } from "../components/ui/shared";
import logoImg from "../../assets/4b35c7bc4c6a88b42d39cda172ff55d3ddce0d64.png";
import bgImage from "../../assets/sathyabama-gate.jpg";

export function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });

  useEffect(() => {
    fetch("/api/health", { method: "GET" }).catch(() => undefined);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const readApiError = async (response: Response) => {
    try {
      const payload = await response.json();
      return payload.detail || payload.message || "Request failed";
    } catch {
      return "Request failed";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const payload = await response.json();
      if (payload.user) {
        localStorage.setItem("apnsUser", JSON.stringify(payload.user));
      }
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      setSuccessMessage("Account created successfully. Please login.");
      setErrorMessage("");
      setIsRegister(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create account",
      );
    } finally {
      setIsSubmitting(false);
    }

    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
    });
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Left Side - Branding with Background Image */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/90 via-black/80 to-black/90" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 w-full">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            src={logoImg}
            alt="Sathyabama Institute"
            className="h-40 w-auto mb-8 object-contain drop-shadow-2xl"
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Sathyabama Arrear
              <br />
              Management System
            </h1>
            <p className="text-xl text-white/90 font-light">
              Automated Parent Notification System
            </p>
            <div className="mt-8 h-1 w-32 bg-white/50 mx-auto rounded-full" />
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <img
              src={logoImg}
              alt="Sathyabama Institute"
              className="mx-auto h-24 w-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold text-[#D4AF37] tracking-tight">
              Sathyabama Arrear Notification System
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Automated Parent Notification System
            </p>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMessage("");
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  !isRegister
                    ? "bg-[#D4AF37] text-white"
                    : "bg-white/10 text-muted-foreground hover:bg-white/20"
                }`}
              >
                <LogIn className="inline h-4 w-4 mr-2" />
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setSuccessMessage("");
                  setErrorMessage("");
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  isRegister
                    ? "bg-[#D4AF37] text-white"
                    : "bg-white/10 text-muted-foreground hover:bg-white/20"
                }`}
              >
                <User className="inline h-4 w-4 mr-2" />
                Register
              </button>
            </div>
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isRegister
                ? "Register to get started"
                : "Sign in to access your dashboard"}
            </p>
          </div>

          <GlassCard className="p-8 shadow-xl" glow>
            <form
              onSubmit={isRegister ? handleRegister : handleLogin}
              className="space-y-6"
            >
              {errorMessage && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-200">
                  {successMessage}
                </div>
              )}

              {isRegister && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#D4AF37]">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D4AF37]/50" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required={isRegister}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#D4AF37]">
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D4AF37]/50" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="name@institution.edu"
                    className="w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#D4AF37]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D4AF37]/50" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {isRegister && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#D4AF37]">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D4AF37]/50" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#D4AF37]">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/20 bg-white/5 py-3 px-4 text-foreground focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                    >
                      <option value="admin">Administrator</option>
                      <option value="hr">HR Manager</option>
                      <option value="faculty">Faculty</option>
                    </select>
                  </div>
                </>
              )}

              {!isRegister && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-white/20 bg-white/5 accent-[#D4AF37]"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-sm text-[#D4AF37] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <GoldButton
                type="submit"
                icon={LogIn}
                className="w-full py-4 text-lg"
              >
                {isSubmitting
                  ? isRegister
                    ? "Creating Account..."
                    : "Signing In..."
                  : isRegister
                    ? "Create Account"
                    : "Authorize Access"}
              </GoldButton>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
              <span>Sathyabama Arrear Notification System Secure Authentication</span>
            </div>
          </GlassCard>

          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2026 Sathyabama Institute of Science and Technology. All Rights
            Reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
