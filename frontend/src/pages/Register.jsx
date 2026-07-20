import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response =
        await registerUser(formData);

      alert(response.message);

      navigate("/");

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Registration Failed"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left Section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 text-white p-16 flex-col justify-center">

        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold mb-8">
          AI
        </div>

        <h1 className="text-6xl font-bold mb-6">
          JOIN US
        </h1>

        <h2 className="text-3xl font-semibold mb-4">
          CVAnalyzer
        </h2>

        <p className="text-lg text-blue-100 mb-8 max-w-md">
          Create your candidate account and get
          discovered by recruiters using AI-powered
          resume screening.
        </p>

        <div className="space-y-3 text-lg">
          <p>✓ Create Candidate Profile</p>
          <p>✓ Upload Resume</p>
          <p>✓ Apply To Jobs</p>
          <p>✓ Track Applications</p>
          <p>✓ Get Ranked By AI</p>
        </div>

      </div>

      {/* Right Section */}
      <div className="flex-1 bg-slate-100 flex items-center justify-center p-8">

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10"
        >
          <h2 className="text-5xl font-bold text-slate-900 mb-2">
            Register
          </h2>

          <p className="text-slate-500 mb-8">
            Create your candidate account
          </p>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          <p className="text-center text-slate-500 mt-6">
            Already have an account?
            <Link
              to="/"
              className="text-indigo-600 font-semibold ml-2 hover:underline"
            >
              Sign In
            </Link>
          </p>

        </form>

      </div>

    </div>
  );
};

export default Register;