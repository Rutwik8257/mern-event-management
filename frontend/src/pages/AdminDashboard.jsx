// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios"; // your axios instance

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({
    totalUsers: 0,
    totalEvents: 0,
    participationCounts: [],
  });

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const token =
    localStorage.getItem("token") ||
    (localStorage.getItem("user") &&
      JSON.parse(localStorage.getItem("user")).token);

  // ✅ FIXED: Removed extra "/api"
  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const res = await axios.get("/analytics/kpis", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKpis(res.data);
      } catch (err) {
        console.error("Error fetching KPIs", err);
      }
    };
    fetchKpis();
  }, [token]);

  // ✅ FIXED: Removed extra "/api"
  useEffect(() => {
    if (!token) return;
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    fetchNotifications();
    const id = setInterval(fetchNotifications, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [token]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(
        "/admin/notifications/mark-read",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // locally mark read
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error("Error marking notifications read", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    window.location.href = "/login";
  }
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <div className="flex items-center space-x-4">
          {/* Notification button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications((s) => !s)}
              className="relative bg-gray-100 p-2 rounded-full hover:bg-gray-200"
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1 text-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded z-50">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <strong>Notifications</strong>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <ul className="max-h-64 overflow-auto">
                  {notifications.length === 0 && (
                    <li className="p-3 text-gray-600">No notifications</li>
                  )}
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      className={`p-3 border-b ${
                        n.read ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <div className="text-sm">{n.message}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-gray-600">Total Users</h2>
          <p className="text-2xl font-bold">{kpis.totalUsers}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-gray-600">Total Events</h2>
          <p className="text-2xl font-bold">{kpis.totalEvents}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-gray-600">Participation</h2>
          <p className="text-2xl font-bold">
            {Array.isArray(kpis.participationCounts)
              ? kpis.participationCounts.reduce(
                  (a, b) => a + (b.count || 0),
                  0
                )
              : 0}
          </p>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div
          onClick={() => navigate("/admin/analytics")}
          className="cursor-pointer p-6 bg-blue-100 rounded-xl shadow hover:bg-blue-200 transition"
        >
          📊 View Analytics
        </div>
        <div
          onClick={() => navigate("/admin/users")}
          className="cursor-pointer p-6 bg-green-100 rounded-xl shadow hover:bg-green-200 transition"
        >
          👥 Manage Users
        </div>
        <div
          onClick={() => navigate("/admin/events")}
          className="cursor-pointer p-6 bg-purple-100 rounded-xl shadow hover:bg-purple-200 transition"
        >
          🎉 Manage Events
        </div>
        <div
          onClick={() => navigate("/admin/participants")}
          className="cursor-pointer p-6 bg-orange-100 rounded-xl shadow hover:bg-orange-200 transition"
        >
          ✅ Approved Participants
        </div>
      </div>
    </div>
  );
}
