import { Link } from "react-router-dom";

export default function Header() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link to="/" className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Resume<span className="text-blue-600">AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Login
          </Link>

          <Link to="/register" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Get Started
          </Link>
        </div>

      </div>
    </nav>
  );
}
