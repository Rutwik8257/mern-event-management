import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <ul className="flex space-x-6 items-center">
        <li>
          <Link to="/admin/analytics" className="hover:text-yellow-300">
            📊 Analytics
          </Link>
        </li>
        <li>
          <Link to="/admin/users" className="hover:text-yellow-300">
            👥 Manage Users
          </Link>
        </li>
        <li>
          <Link to="/admin/events" className="hover:text-yellow-300">
            🎉 Manage Events
          </Link>
        </li>
        <li>
          <Link to="/admin/participants" className="hover:text-yellow-300">
            ✅ Approved Participants
          </Link>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
