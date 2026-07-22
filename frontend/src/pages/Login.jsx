import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
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
    setErrorMessage("");

    try {
      setLoading(true);

      const response = await loginUser(formData);

      console.log("Login Response:", response);

      const { token, user } = response;

      // Save token
      localStorage.setItem("token", token);

      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      // Save user
      localStorage.setItem("user", JSON.stringify(userData));

      // Update global auth context
      login(userData);

      // Redirect to role-specific dashboard after successful login
      const dashboardRoutes = {
        candidate: "/candidate-dashboard",
        employer: "/employer-dashboard",
        admin: "/admin-dashboard",
      };
      navigate(dashboardRoutes[userData.role] || "/");
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data);
      setErrorMessage(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 bg-linear-to-br from-indigo-700 via-blue-600 to-cyan-500 text-white p-16 flex-col justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold mb-8">
          AI
        </div>

        <h1 className="text-6xl font-bold mb-6">WELCOME</h1>

        <h2 className="text-3xl font-semibold mb-4">CVAnalyzer</h2>

        <p className="text-lg text-blue-100 mb-8 max-w-md">
          AI-powered Resume Screening & Candidate Ranking Platform.
        </p>

        <div className="space-y-3 text-lg">
          <p>✓ Resume Parsing</p>
          <p>✓ Candidate Ranking</p>
          <p>✓ Hiring Analytics</p>
          <p>✓ Bias Detection</p>
          <p>✓ Smart Recruitment</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-slate-100 flex items-center justify-center p-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10"
        >
          <h2 className="text-5xl font-bold text-slate-900 mb-2">Sign In</h2>

          <p className="text-slate-500 mb-8">Access your CVAnalyzer account</p>

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
            className="w-full p-4 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition disabled:bg-indigo-400 flex items-center justify-center gap-2"
          >
            {loading ? <LoadingSpinner size="sm" text="" /> : "Sign In"}
          </button>

          <p className="text-center text-slate-500 mt-6">
            Don't have an account?
            <Link
              to="/register"
              className="text-indigo-600 font-semibold ml-2 hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
