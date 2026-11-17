import { Button } from "../components/Button";
import "../styles/enterprise.css";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password, role);
    } catch (error) {
      alert(
        'Registration failed: ' +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="eh-screen eh-auth min-h-screen flex items-center justify-center eh-bg-gray-100">
      <div className="eh-bg-white p-8 rounded-lg eh-shadow-md w-full max-w-md">
        <span className="eh-brand">Enterprise Dashboard</span>
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block eh-text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="eh-shadow appearance-none border rounded w-full py-2 px-3 eh-text-gray-700 leading-tight focus:outline-none eh-focus-shadow-outline"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block eh-text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="eh-shadow appearance-none border rounded w-full py-2 px-3 eh-text-gray-700 leading-tight focus:outline-none eh-focus-shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block eh-text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="eh-shadow appearance-none border rounded w-full py-2 px-3 eh-text-gray-700 mb-3 leading-tight focus:outline-none eh-focus-shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block eh-text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="eh-shadow appearance-none border rounded w-full py-2 px-3 eh-text-gray-700 leading-tight focus:outline-none eh-focus-shadow-outline"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Button
              type="submit"
              className="eh-bg-blue-500 eh-hover-bg-blue-700 eh-text-white font-bold py-2 px-4 rounded focus:outline-none eh-focus-shadow-outline"
            >
              Register
            </Button>
            <Link to="/login" className="inline-block align-baseline font-bold text-sm eh-text-blue-500 eh-hover-text-blue-800">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
