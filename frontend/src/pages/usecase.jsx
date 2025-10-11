// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

// Recharts
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Event Editing State
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // User Editing State
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Participants modal state
const [showParticipantsModal, setShowParticipantsModal] = useState(false);
const [selectedEventId, setSelectedEventId] = useState(null);
const [participants, setParticipants] = useState([]);
const token = localStorage.getItem("token"); // <-- This is the JWT you got on login



  // Analytics state
  const [kpis, setKpis] = useState({});
  const [eventPopularity, setEventPopularity] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);

  // Approved participants (dedicated section)
  const [approvedParticipants, setApprovedParticipants] = useState([]);

  // Fetch users, events & analytics
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get("/admin/users");
        setUsers(usersResponse.data || []);

        const eventsResponse = await axios.get("/events");
        setEvents(eventsResponse.data || []);

        // Analytics
        const kpiRes = await axios.get("/analytics/kpis");
        setKpis(kpiRes.data);

        const popRes = await axios.get("/analytics/event-popularity");
        setEventPopularity(popRes.data);

        const growthRes = await axios.get("/analytics/user-growth");
        setUserGrowth(growthRes.data);


      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
useEffect(() => {
  if (!selectedEventId) return;

  const fetchParticipants = async () => {
    try {
      const res = await axios.get(`/events/${selectedEventId}/participants`);
      setParticipants(res.data); // Only approved participants
    } catch (err) {
      console.error("Error fetching participants", err);
    }
  };

  fetchParticipants();
}, [selectedEventId]);
useEffect(() => {
  if (!selectedEventId) return;

  const fetchApprovedParticipants = async () => {
    try {
      const res = await axios.get(
        `/events/${selectedEventId}/participants/approved`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParticipants(res.data);
    } catch (err) {
      console.error("Error fetching approved participants", err);
    }
  };

  fetchApprovedParticipants();
}, [selectedEventId, token]);

useEffect(() => {
  const fetchAllApprovedParticipants = async () => {
    try {
      const res = await axios.get('/events/participants/approved', {
  headers: { Authorization: `Bearer ${token}` },
});


      setApprovedParticipants(res.data || []);
    } catch (err) {
      console.error('Error fetching approved participants', err);
    }
  };

  fetchAllApprovedParticipants();
}, [token]);




  if (loading) return <p>Loading admin dashboard...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // ---------------- User Management ----------------
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/admin/users/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      alert("User deleted successfully!");
    } catch (err) {
      setError(err);
      alert("Failed to delete user.");
    }
  };

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `/admin/users/${editingUser._id}`,
        editingUser
      );
      setUsers(
        users.map((user) =>
          user._id === editingUser._id ? response.data : user
        )
      );
      setShowEditUserModal(false);
      setEditingUser(null);
      alert("User updated successfully!");
    } catch (err) {
      setError(err);
      alert("Failed to update user.");
    }
  };

  // ---------------- Event Management ----------------
  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`/events/${eventId}`);
      setEvents(events.filter((event) => event._id !== eventId));
      alert("Event deleted successfully!");
    } catch (err) {
      setError(err);
      alert("Failed to delete event.");
    }
  };

  const handleEditEventClick = (event) => {
    setEditingEvent(event);
    setShowEditEventModal(true);
  };

  const handleUpdateEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `/admin/events/${editingEvent._id}`,
        editingEvent
      );
      setEvents(
        events.map((event) =>
          event._id === editingEvent._id ? response.data : event
        )
      );
      setShowEditEventModal(false);
      setEditingEvent(null);
      alert("Event updated successfully!");
    } catch (err) {
      setError(err);
      alert("Failed to update event.");
    }
  };

  // ---------------- Participants ----------------
const handleViewParticipants = async (eventId) => {
  try {
    const res = await axios.get(`/api/events/${eventId}/participants/approved`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setParticipants(res.data || []); // ✅ this is what the modal uses
    setSelectedEventId(eventId);
    setShowParticipantsModal(true);
  } catch (err) {
    console.error("Failed to fetch participants:", err);
  }
};



  const handleApproveParticipant = async (eventId, participantId) => {
    try {
      await axios.put(
        `/events/${eventId}/participants/${participantId}/approve`
      );
      setCurrentEventParticipants((prev) =>
        prev.map((p) =>
          p._id === participantId ? { ...p, status: "Approved" } : p
        )
      );
      alert("Participant approved successfully!");
    } catch (err) {
      alert(
        "Failed to approve participant: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleRejectParticipant = async (eventId, participantId) => {
    try {
      await axios.delete(
        `/events/${eventId}/participants/${participantId}/reject`
      );
      setCurrentEventParticipants((prev) =>
        prev.filter((p) => p._id !== participantId)
      );
      alert("Participant rejected successfully!");
    } catch (err) {
      alert(
        "Failed to reject participant: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* ----------- Analytics Section ----------- */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Analytics Overview</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500 text-white p-4 rounded shadow">
            <h3 className="text-lg">Total Users</h3>
            <p className="text-2xl font-bold">{kpis.totalUsers || 0}</p>
          </div>
          <div className="bg-green-500 text-white p-4 rounded shadow">
            <h3 className="text-lg">Total Events</h3>
            <p className="text-2xl font-bold">{kpis.totalEvents || 0}</p>
          </div>
          <div className="bg-yellow-500 text-white p-4 rounded shadow">
            <h3 className="text-lg">Participations</h3>
            <ul>
              {kpis.participationCounts?.map((p) => (
                <li key={p._id}>
                  {p._id}: {p.count}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Event Popularity */}
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-bold mb-2">Event Popularity</h3>
            <PieChart width={300} height={300}>
              <Pie
                data={eventPopularity}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
              >
                {eventPopularity.map((_, index) => (
                  <Cell
                    key={index}
                    fill={["#8884d8", "#82ca9d", "#ffc658"][index % 3]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          {/* User Growth */}
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-bold mb-2">User Growth</h3>
            <LineChart width={400} height={300} data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id.month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
          </div>
        </div>
      </section>

      {/* ----------- Approved Participants Section ----------- */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Approved Participants (All Events)
        </h2>
        <div className="bg-white shadow-md rounded-lg p-4">
          {approvedParticipants.length === 0 ? (
            <p>No approved participants yet.</p>
          ) : (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Event</th>
                  <th className="py-2 px-4 border-b">Participant</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
  {approvedParticipants.map((p) => (
    <tr key={p._id}>
      <td className="py-2 px-4 border-b">{p.eventId?.title}</td>
      <td className="py-2 px-4 border-b">{p.user?.username}</td>
      <td className="py-2 px-4 border-b">{p.user?.email}</td>
      <td className="py-2 px-4 border-b">{p.status}</td>
    </tr>
  ))}
</tbody>

            </table>
          )}
        </div>
      </section>

      {/* ----------- Manage Users Section ----------- */}
<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
  <div className="bg-white shadow-md rounded-lg p-4">
    {users.length === 0 ? (
      <p>No users found.</p>
    ) : (
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Username</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="py-2 px-4 border-b">{user.username || 'N/A'}</td>
              <td className="py-2 px-4 border-b">{user.email || 'N/A'}</td>
              <td className="py-2 px-4 border-b">{user.role || 'N/A'}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleEditUserClick(user)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</section>


{/* Edit User Modal */}
{showEditUserModal && editingUser && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto">
      <h3 className="text-2xl font-bold mb-4">Edit User: {editingUser.username}</h3>
      <form onSubmit={handleUpdateUserSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username</label>
          <input
            id="username"
            type="text"
            value={editingUser.username || ''}
            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            id="email"
            type="email"
            value={editingUser.email || ''}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Role</label>
          <select
            id="role"
            value={editingUser.role || 'user'}
            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update User
          </button>
          <button
            type="button"
            onClick={() => { setShowEditUserModal(false); setEditingUser(null); }}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* ----------- Manage Events Section ----------- */}
<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-4">Manage Events</h2>
  <button
    onClick={() => navigate('/admin/create-event')}
    className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
  >
    Create Event
  </button>
  <div className="bg-white shadow-md rounded-lg p-4">
    {events.length === 0 ? (
      <p>No events found.</p>
    ) : (
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Title</th>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Location</th>
            <th className="py-2 px-4 border-b">Created By</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          
          {events.map((event) => (
            <tr key={event._id}>
              <td className="py-2 px-4 border-b">{event.title || 'N/A'}</td>
              <td className="py-2 px-4 border-b">{event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</td>
              <td className="py-2 px-4 border-b">{event.location || 'N/A'}</td>
              <td className="py-2 px-4 border-b">{event.createdBy?.username || 'N/A'}</td>
              <td className="py-2 px-4 border-b">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => handleEditEventClick(event)}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteEvent(event._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded mr-2"
                >
                  Delete
                </button>
                <button
    onClick={() => {
      setSelectedEventId(event._id);
      setShowParticipantsModal(true);
    }}
    className="bg-green-500 text-white px-3 py-1 rounded"
  >
    Participants
  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</section>

{/* Participants Modal */}
{showParticipantsModal && (
  <div className="participants-modal fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">Participants for {editingEvent?.title}</h3>
      <ul>
        {participants
          .filter((p) => p.user)
          .map((participant) => (
            <li key={participant._id} className="py-4 border-b flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{participant.user?.username || 'Unknown'}</p>
                <p className="text-sm text-gray-600">{participant.user?.email || 'Unknown'}</p>
                <p className={`text-sm font-medium ${participant.status === 'Approved' ? 'text-green-600' : participant.status === 'Pending' ? 'text-yellow-600' : 'text-gray-500'}`}>Status: {participant.status || 'N/A'}</p>
              </div>
              <div>
                {participant.status === 'Pending' && editingEvent && (
                  <>
                    <button
                      onClick={() => handleApproveParticipant(editingEvent._id, participant._id)}
                      className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectParticipant(editingEvent._id, participant._id)}
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
      </ul>
      <button
        onClick={() => setShowParticipantsModal(false)}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}

{/* Edit Event Modal */}
{showEditEventModal && editingEvent && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto">
      <h3 className="text-2xl font-bold mb-4">Edit Event: {editingEvent.title}</h3>
      <form onSubmit={handleUpdateEventSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <input
            id="title"
            type="text"
            value={editingEvent.title || ''}
            onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">Location</label>
          <input
            id="location"
            type="text"
            value={editingEvent.location || ''}
            onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Date</label>
          <input
            id="date"
            type="date"
            value={editingEvent.date ? new Date(editingEvent.date).toISOString().substring(0, 10) : ''}
            onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea
            id="description"
            value={editingEvent.description || ''}
            onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Event
          </button>
          <button
            type="button"
            onClick={() => { setShowEditEventModal(false); setEditingEvent(null); }}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default AdminDashboard;
