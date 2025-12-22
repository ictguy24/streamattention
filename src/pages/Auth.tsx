import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

type AuthMode = "login" | "register" | "forgot";

// Validation schemas
const emailSchema = z.string().trim().email("Invalid email address").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);
const usernameSchema = z.string().trim().min(2, "Username must be at least 2 characters").max(30);

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, resetPassword, isLoading: authLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Registration steps
  const [registerStep, setRegisterStep] = useState(1);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(email, password);

    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Please confirm your email before signing in");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Welcome back!");
    navigate("/");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerStep === 1) {
      // Validate email
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        toast.error(emailResult.error.errors[0].message);
        return;
      }

      // Validate password
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        toast.error(passwordResult.error.errors[0].message);
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }
      setRegisterStep(2);
      return;
    }

    if (registerStep === 2) {
      // Validate username
      const usernameResult = usernameSchema.safeParse(username);
      if (!usernameResult.success) {
        toast.error(usernameResult.error.errors[0].message);
        return;
      }

      setIsLoading(true);

      const { error } = await signUp(email, password, username);

      setIsLoading(false);

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Account created successfully!");
      navigate("/");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    const { error } = await resetPassword(email);

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password reset email sent!");
    setMode("login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 p-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-muted/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">
          {mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Reset Password"}
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        <AnimatePresence mode="wait">
          {mode === "login" && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">Sign in to continue earning AC</p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 py-5 bg-muted/20 border-border/50"
                    autoComplete="email"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 py-5 bg-muted/20 border-border/50"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>

              <Button
                type="submit"
                className="w-full py-5 bg-foreground text-background hover:bg-foreground/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-primary font-medium hover:underline"
                >
                  Create one
                </button>
              </p>
            </motion.form>
          )}

          {mode === "register" && (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {registerStep === 1 ? "Create Account" : "Set Up Profile"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {registerStep === 1 ? "Start earning AC today" : "Almost there!"}
                </p>
                {/* Progress indicator */}
                <div className="flex justify-center gap-2 mt-4">
                  <div className={`w-8 h-1 rounded-full ${registerStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                  <div className={`w-8 h-1 rounded-full ${registerStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {registerStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 py-5 bg-muted/20 border-border/50"
                        autoComplete="email"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 py-5 bg-muted/20 border-border/50"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 py-5 bg-muted/20 border-border/50"
                        autoComplete="new-password"
                      />
                    </div>
                  </motion.div>
                )}

                {registerStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 py-5 bg-muted/20 border-border/50"
                        autoComplete="username"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This will be your public display name
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 pt-4">
                {registerStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 py-5"
                    onClick={() => setRegisterStep(registerStep - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 py-5 bg-foreground text-background hover:bg-foreground/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : registerStep === 2 ? "Create Account" : "Continue"}
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setRegisterStep(1);
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </motion.form>
          )}

          {mode === "forgot" && (
            <motion.form
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleForgotPassword}
              className="space-y-4"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Reset Password</h2>
                <p className="text-sm text-muted-foreground">We'll send you a reset link</p>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-5 bg-muted/20 border-border/50"
                  autoComplete="email"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-5 bg-foreground text-background hover:bg-foreground/90"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full text-center text-sm text-primary hover:underline"
              >
                Back to sign in
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;
