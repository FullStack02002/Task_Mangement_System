import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES } from "../../routes/routePaths";
import { registerThunk } from "../../features/auth/authThunks";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import GoogleButton from "../../components/shared/GoogleButton";


interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector((state) => state.auth.registerLoading);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;


    const result = await (dispatch as any)(registerThunk({
      name: data.name,
      email: data.email,
      password: data.password,
      timezone,
    }));



    if (result.meta.requestStatus === "fulfilled" && result.payload !== null) {
      localStorage.setItem("pendingEmail", data.email);
      setTimeout(() => navigate(ROUTES.VERIFY_EMAIL), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* ── Brand ── */}
        <div className="text-center mb-8">
          <Link to="/">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-600/40 mb-5">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="2" rx="1" fill="#a78bfa" />
                <rect x="2" y="7" width="8" height="2" rx="1" fill="#a78bfa" opacity="0.7" />
                <rect x="2" y="11" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.4" />
              </svg>
            </div></Link>
          <h1 className="text-2xl font-light text-white tracking-tight mb-2">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm font-light">
            Start managing your day with TaskFlow
          </p>
        </div>

        {/* ── Card ── */}
        <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-8">
          <div className="flex flex-col gap-5">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

              {/* ── Name ── */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-400 tracking-[0.08em] uppercase">
                  Full name
                </label>
                <input
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border text-white text-sm outline-none transition-all duration-200 placeholder-gray-700 font-light
                                ${errors.name
                      ? "border-red-500/60 focus:border-red-400"
                      : "border-purple-900/50 focus:border-purple-600/80 focus:ring-1 focus:ring-purple-600/20"
                    }`}
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                    maxLength: { value: 50, message: "Name too long" },
                    setValueAs: (v) => v.trim(),
                  })}
                />
                {errors.name && (
                  <span className="text-xs text-red-400 font-light">
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* ── Email ── */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-400 tracking-[0.08em] uppercase">
                  Email address
                </label>
                <input
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border text-white text-sm outline-none transition-all duration-200 placeholder-gray-700 font-light
                                ${errors.email
                      ? "border-red-500/60 focus:border-red-400"
                      : "border-purple-900/50 focus:border-purple-600/80 focus:ring-1 focus:ring-purple-600/20"
                    }`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format",
                    },
                    setValueAs: (v) => v.trim().toLowerCase(),
                  })}
                />
                {errors.email && (
                  <span className="text-xs text-red-400 font-light">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* ── Password ── */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-400 tracking-[0.08em] uppercase">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  className={`w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border text-white text-sm outline-none transition-all duration-200 placeholder-gray-700 font-light
                                ${errors.password
                      ? "border-red-500/60 focus:border-red-400"
                      : "border-purple-900/50 focus:border-purple-600/80 focus:ring-1 focus:ring-purple-600/20"
                    }`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                    maxLength: { value: 32, message: "Password must be at most 32 characters" },
                    validate: {
                      hasUppercase: (v) => /[A-Z]/.test(v) || "Must contain at least one uppercase letter",
                      hasLowercase: (v) => /[a-z]/.test(v) || "Must contain at least one lowercase letter",
                      hasNumber: (v) => /[0-9]/.test(v) || "Must contain at least one number",
                      hasSpecialChar: (v) => /[@$!%*?&#^]/.test(v) || "Must contain at least one special character (@$!%*?&#^)",
                    },
                  })}
                />
                {errors.password && (
                  <span className="text-xs text-red-400 font-light">
                    {errors.password.message}
                  </span>
                )}

                {/* ── Strength Indicator ── */}
                {watch("password") && (
                  <div className="mt-1 flex flex-col gap-1.5">
                    <div className="w-full h-1 bg-purple-900/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300
                                            ${(() => {
                            const v = watch("password");
                            let s = 0;
                            if (v.length >= 8) s++;
                            if (/[A-Z]/.test(v)) s++;
                            if (/[a-z]/.test(v)) s++;
                            if (/[0-9]/.test(v)) s++;
                            if (/[@$!%*?&#^]/.test(v)) s++;
                            return [
                              "w-0",
                              "w-1/5 bg-red-500",
                              "w-2/5 bg-orange-500",
                              "w-3/5 bg-yellow-500",
                              "w-4/5 bg-blue-400",
                              "w-full bg-purple-400",
                            ][s];
                          })()}`}
                      />
                    </div>
                    <p className={`text-xs font-light
                                    ${(() => {
                        const v = watch("password");
                        let s = 0;
                        if (v.length >= 8) s++;
                        if (/[A-Z]/.test(v)) s++;
                        if (/[a-z]/.test(v)) s++;
                        if (/[0-9]/.test(v)) s++;
                        if (/[@$!%*?&#^]/.test(v)) s++;
                        return [
                          "",
                          "text-red-400",
                          "text-orange-400",
                          "text-yellow-400",
                          "text-blue-400",
                          "text-purple-400",
                        ][s];
                      })()}`}
                    >
                      {(() => {
                        const v = watch("password");
                        let s = 0;
                        if (v.length >= 8) s++;
                        if (/[A-Z]/.test(v)) s++;
                        if (/[a-z]/.test(v)) s++;
                        if (/[0-9]/.test(v)) s++;
                        if (/[@$!%*?&#^]/.test(v)) s++;
                        return ["", "Very weak", "Weak", "Fair", "Strong", "Very strong"][s];
                      })()}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Confirm Password ── */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-400 tracking-[0.08em] uppercase">
                  Confirm password
                </label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  className={`w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border text-white text-sm outline-none transition-all duration-200 placeholder-gray-700 font-light
                                ${errors.confirmPassword
                      ? "border-red-500/60 focus:border-red-400"
                      : "border-purple-900/50 focus:border-purple-600/80 focus:ring-1 focus:ring-purple-600/20"
                    }`}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <span className="text-xs text-red-400 font-light">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={loading}
                className={`mt-1 w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                            ${loading
                    ? "bg-purple-900/40 cursor-not-allowed text-purple-400/60"
                    : "bg-purple-600 hover:bg-purple-500 cursor-pointer text-white shadow-lg shadow-purple-900/40"
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account →"
                )}
              </button>
            </form>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-purple-900/40" />
              <span className="text-xs text-gray-600 font-light">or</span>
              <div className="flex-1 h-px bg-purple-900/40" />
            </div>

            <GoogleButton label="Sign up with Google" />
          </div>
        </div>

        {/* ── Login link ── */}
        <p className="text-center text-sm text-gray-600 mt-6 font-light">
          Already have an account?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;