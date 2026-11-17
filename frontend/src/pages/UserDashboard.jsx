import { Button } from "../components/Button";
import "../styles/enterprise.css";
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  Approved: 'eh-text-green-600',
  Rejected: 'eh-text-red-600',
  Pending: 'eh-text-yellow-600',
};

const EVENT_STATUS_BADGE = {
  Upcoming: 'eh-bg-blue-100 eh-text-blue-700',
  Ongoing: 'eh-bg-green-100 eh-text-green-700',
  Completed: 'eh-bg-gray-100 eh-text-gray-500',
};

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [participatingEvents, setParticipatingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [toast, setToast] = useState(null);
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events');
      setEvents(response.data);
    } catch (err) {
      setError(err);
      console.error('Error fetching all events', err);
    }
  };

  const fetchParticipations = async () => {
    try {
      const response = await axios.get('/users/dashboard');
      setParticipatingEvents(response.data.participatingEvents);
    } catch (err) {
      console.error('Error fetching my participations', err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([fetchEvents(), fetchParticipations()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleParticipate = async (eventId) => {
    try {
      await axios.post(`/events/${eventId}/register`);
      showToast('Participation request sent! Waiting for admin approval.');
      fetchEvents();
      fetchParticipations();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  const filtered = events.filter((event) => {
    const matchSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || event.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 eh-text-red-500">Error: {error.message}</p>;

  return (
    <div className="eh-screen eh-workspace container mx-auto p-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded eh-shadow-lg eh-text-white text-sm ${toast.type === 'error' ? 'eh-bg-red-500' : 'eh-bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username} 👋</h1>
      <p className="eh-text-gray-500 mb-6">Browse and register for upcoming events.</p>

      {/* My Participations */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">My Participations</h2>
        {participatingEvents.length === 0 ? (
          <p className="eh-text-gray-500">You haven't participated in any events yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participatingEvents.map((event) => (
              <div key={event._id} className="eh-bg-green-50 border eh-border-green-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="eh-text-gray-700 mb-1">{event.description}</p>
                <p className="eh-text-gray-600 text-sm">📅 {new Date(event.date).toLocaleDateString()}</p>
                <p className="eh-text-gray-600 text-sm">📍 {event.location}</p>
                <p className="mt-2 text-sm">
                  Status:{' '}
                  <span className={`font-semibold ${STATUS_COLORS[event.participantStatus] || 'eh-text-yellow-600'}`}>
                    {event.participantStatus || 'Pending'}
                    {event.participantStatus === 'Approved' && ' ✅'}
                    {event.participantStatus === 'Rejected' && ' ❌'}
                    {event.participantStatus === 'Pending' && ' ⏳'}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:w-72 focus:outline-none focus:ring-2 eh-focus-ring-blue-300"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 eh-focus-ring-blue-300"
        >
          <option value="All">All Statuses</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Available Events */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Available Events <span className="eh-text-gray-400 text-sm font-normal">({filtered.length} found)</span>
        </h2>

        {filtered.length === 0 ? (
          <p className="eh-text-gray-500">No events match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((event) => {
              const participants = event.participants || [];
              const userParticipation = participants.find((p) => p.user._id === user._id);
              const approvedCount = participants.filter(p => p.status === 'Approved').length;
              const isFull = event.maxParticipants && approvedCount >= event.maxParticipants;
              const isCompleted = event.status === 'Completed';
              const canRegister = !userParticipation && !isFull && !isCompleted;

              return (
                <div key={event._id} className="eh-bg-white eh-shadow-md rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{event.title}</h3>
                      {event.status && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${EVENT_STATUS_BADGE[event.status] || 'eh-bg-gray-100 eh-text-gray-500'}`}>
                          {event.status}
                        </span>
                      )}
                    </div>
                    <p className="eh-text-gray-600 text-sm mb-1">{event.description}</p>
                    <p className="eh-text-gray-500 text-sm">📅 {new Date(event.date).toLocaleDateString()}</p>
                    <p className="eh-text-gray-500 text-sm mb-2">📍 {event.location}</p>

                    {event.maxParticipants && (
                      <p className={`text-xs font-medium mb-3 ${isFull ? 'eh-text-red-500' : 'eh-text-gray-500'}`}>
                        {isFull ? '🔴 Event Full' : `🟢 ${approvedCount} / ${event.maxParticipants} spots filled`}
                      </p>
                    )}
                  </div>

                  <div>
                    <Button
                      onClick={() => handleParticipate(event._id)}
                      disabled={!canRegister}
                      className={`w-full font-semibold py-2 px-4 rounded eh-text-white transition ${
                        canRegister ? 'eh-bg-blue-500 eh-hover-bg-blue-600' : 'eh-bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? 'Event Ended' : isFull ? 'Event Full' : userParticipation ? 'Registered' : 'Register'}
                    </Button>

                    {userParticipation && (
                      <p className="mt-2 text-sm text-center">
                        Status:{' '}
                        <span className={`font-semibold ${STATUS_COLORS[userParticipation.status]}`}>
                          {userParticipation.status}
                          {userParticipation.status === 'Approved' && ' ✅'}
                          {userParticipation.status === 'Rejected' && ' ❌'}
                          {userParticipation.status === 'Pending' && ' ⏳'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;
