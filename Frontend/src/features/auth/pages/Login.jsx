import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { handleLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  await handleLogin(formData);
  navigate("/");
  console.log("Login data:", formData);
};

  return (
    <div className="relative min-h-screen overflow-hidden bg-app-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute w-150 h-150 rounded-full bg-linear-to-br from-brand-start to-brand-end opacity-[0.06] blur-[80px]" />
        <div
          className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"
          style={{
            maskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-105 rounded-2xl border border-app-border bg-app-card p-8 shadow-(--shadow-glow) backdrop-blur-md animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-app-text title-font">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-app-muted">Welcome back to Askly</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-app-text">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className="w-full rounded-lg border border-app-border bg-app-input px-4 py-2.5 text-app-text outline-none transition-all placeholder:text-app-muted/50 hover:border-app-border/80 focus:border-brand-start focus:ring-1 focus:ring-brand-start"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-app-text">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-app-border bg-app-input pl-4 pr-10 py-2.5 text-app-text outline-none transition-all placeholder:text-app-muted/50 hover:border-app-border/80 focus:border-brand-start focus:ring-1 focus:ring-brand-start"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted transition-colors hover:text-app-text focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-linear-to-r from-brand-start to-brand-end py-2.5 text-sm font-medium text-white shadow-[0_2px_10px_rgba(99,102,241,0.2)] transition-all hover:brightness-110 hover:shadow-[0_4px_15px_rgba(99,102,241,0.3)] focus:outline-none focus:ring-2 focus:ring-brand-start/50"
          >
            Sign in
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-app-muted">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-brand-start transition-colors hover:text-brand-end"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
