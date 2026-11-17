import { Button } from "../components/Button";
import "../styles/enterprise.css";
// src/pages/AdminAnalytics.jsx
import { useEffect, useState } from "react";
import { ResponsiveContainer, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import axios from "../api/axios";

const AdminAnalytics = () => {
  const token = localStorage.getItem("token");
  const [kpis, setKpis] = useState({});
  const [eventPopularity, setEventPopularity] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const kpiRes = await axios.get("/analytics/kpis", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKpis(kpiRes.data);

        const popRes = await axios.get("/analytics/event-popularity", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEventPopularity(popRes.data);

        const growthRes = await axios.get("/analytics/user-growth", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserGrowth(growthRes.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="eh-screen eh-workspace container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Analytics Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="eh-bg-blue-500 eh-text-white p-4 rounded eh-shadow">
          <h3 className="text-lg">Total Users</h3>
          <p className="text-2xl font-bold">{kpis.totalUsers || 0}</p>
        </div>
        <div className="eh-bg-green-500 eh-text-white p-4 rounded eh-shadow">
          <h3 className="text-lg">Total Events</h3>
          <p className="text-2xl font-bold">{kpis.totalEvents || 0}</p>
        </div>
        <div className="eh-bg-yellow-500 eh-text-white p-4 rounded eh-shadow">
          <h3 className="text-lg">Participations</h3>
          <ul>
            {kpis.participationCounts?.map((p) => (
              <li key={p._id}>{p._id}: {p.count}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="eh-bg-white eh-shadow rounded p-4">
          <h3 className="text-lg font-bold mb-2">Event Popularity</h3>
          <ResponsiveContainer width="100%" height={300}><PieChart>
            <Pie data={eventPopularity} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} fill="var(--eh-primary)">
              {eventPopularity.map((_, index) => (
                <Cell key={index} fill={["var(--eh-primary)", "var(--eh-success)", "var(--eh-warning)"][index % 3]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart></ResponsiveContainer>
        </div>
        <div className="eh-bg-white eh-shadow rounded p-4">
          <h3 className="text-lg font-bold mb-2">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}><LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id.month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="var(--eh-primary)" />
          </LineChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
