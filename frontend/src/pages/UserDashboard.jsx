import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch events from server
  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events');
      setEvents(response.data); // now includes participants with status
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Participate in event
  const handleParticipate = async (eventId) => {
    try {
      await axios.post(`/events/${eventId}/register`);
      alert('Participation request sent!');
      fetchEvents(); // Refresh events to show status
    } catch (err) {
      alert('Failed to participate: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p>Loading user dashboard...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Available Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.length === 0 ? (
            <p>No events found.</p>
          ) : (
            events.map((event) => {
              const participants = event.participants || [];
              const userParticipation = participants.find(
                (p) => p.user._id === user._id
              );
              const alreadyParticipating = userParticipation !== undefined;

              return (
                <div key={event._id} className="bg-white shadow-md rounded-lg p-4">
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-700 mb-2">{event.description}</p>
                  <p className="text-gray-600 text-sm mb-1">
                    Date: {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">Location: {event.location}</p>

                  <button
                    onClick={() => handleParticipate(event._id)}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                      alreadyParticipating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={alreadyParticipating}
                  >
                    {alreadyParticipating ? 'Participating' : 'Participate'}
                  </button>

                  {userParticipation && (
                    <p className="mt-2 text-sm">
                      Status:{' '}
                      <span
                        className={`${
                          userParticipation.status === 'Approved'
                            ? 'text-green-600'
                            : userParticipation.status === 'Rejected'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        } font-semibold`}
                      >
                        {userParticipation.status}
                      </span>
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
