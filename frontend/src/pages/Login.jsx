import { Button } from "../components/Button";
import "../styles/enterprise.css";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="eh-screen eh-auth min-h-screen flex items-center justify-center eh-bg---242424- eh-text-white">
      <div className="eh-bg-gray-900 p-8 rounded-2xl eh-shadow-xl w-full max-w-md">
        <span className="eh-brand">Enterprise Dashboard</span>
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 rounded-lg eh-bg-gray-800 border eh-border-gray-700 focus:ring-2 eh-focus-ring-indigo-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            

            <input
              type="password"
              id="password"
              className="w-full p-3 rounded-lg eh-bg-gray-800 border eh-border-gray-700 focus:ring-2 eh-focus-ring-indigo-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-3 rounded-lg eh-bg-indigo-600 eh-hover-bg-indigo-500 transition font-semibold"
          >
            Sign In
          </Button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-sm text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="eh-text-indigo-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
