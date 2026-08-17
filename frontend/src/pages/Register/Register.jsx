import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-2xl font-bold text-gray-900"
          >
            ResumeAI
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Create Account
          </h1>

          <p className="mt-2 text-gray-600">
            Start analyzing your resume with ResumeAI.
          </p>
        </div>

        {/* Register Form */}
        <form className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Your name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
            />
          </div>

          {/* Create Account */}
          <button
            type="submit"
            className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Create Account
          </button>

        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-gray-900 hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;