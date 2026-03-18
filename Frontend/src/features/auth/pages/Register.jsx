import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration data:", formData);
    // Handle registration logic here
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-(--bg) flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute w-150 h-150 rounded-full bg-linear-to-br from-(--brand-start) to-(--brand-end) opacity-[0.06] blur-[80px]" />
        <div
          className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"
          style={{ maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 100%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-105 rounded-2xl border border-(--border) bg-(--card) p-8 shadow-(--shadow-glow) backdrop-blur-md animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-(--text) title-font">
            Register
          </h1>
          <p className="mt-2 text-sm text-(--text-secondary)">
            Create your Askly account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--text)">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              required
              className="w-full rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-(--text) outline-none transition-all placeholder:text-(--text-secondary) placeholder:opacity-50 hover:border-(--border) focus:border-(--brand-start) focus:ring-1 focus:ring-(--brand-start)"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--text)">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className="w-full rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-(--text) outline-none transition-all placeholder:text-(--text-secondary) placeholder:opacity-50 hover:border-(--border) focus:border-(--brand-start) focus:ring-1 focus:ring-(--brand-start)"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-(--text)">
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
                className="w-full rounded-lg border border-(--border) bg-(--input) pl-4 pr-10 py-2.5 text-(--text) outline-none transition-all placeholder:text-(--text-secondary) placeholder:opacity-50 hover:border-(--border) focus:border-(--brand-start) focus:ring-1 focus:ring-(--brand-start)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary) transition-colors hover:text-(--text) focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-linear-to-r from-(--brand-start) to-(--brand-end) py-2.5 text-sm font-medium text-white shadow-[0_2px_10px_rgba(229,9,20,0.2)] transition-all hover:brightness-110 hover:shadow-[0_4px_15px_rgba(229,9,20,0.3)] focus:outline-none focus:ring-2 focus:ring-(--brand-start)"
          >
            Create account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-(--text-secondary)">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-(--brand-start) transition-colors hover:text-(--brand-end)"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
