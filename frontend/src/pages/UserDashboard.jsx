import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [participatingEvents, setParticipatingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events');
      setEvents(response.data);
    } catch (err) {
      setError(err);
    }
  };

  // Fetch events the user has participated in
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

  // Handle participate button
  const handleParticipate = async (eventId) => {
    try {
      await axios.post(`/events/${eventId}/register`);
      alert('Participation request sent!');
      fetchEvents();
      fetchParticipations();
    } catch (err) {
      alert('Failed to participate: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p>Loading user dashboard...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      {/* My Participations */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">My Participations</h2>
        {participatingEvents.length === 0 ? (
          <p className="text-gray-500">You haven’t participated in any events yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participatingEvents.map((event) => (
              <div key={event._id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-700 mb-1">{event.description}</p>
                <p className="text-gray-600 text-sm">
                  Date: {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600 text-sm">
                  Location: {event.location}
                </p>
                <p className="mt-2 text-sm">
                  Status:{' '}
                  <span
                    className={`${
                      event.participantStatus === 'Approved'
                        ? 'text-green-600'
                        : event.participantStatus === 'Rejected'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    } font-semibold`}
                  >
                    {event.participantStatus}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available Events */}
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
              const alreadyParticipating = !!userParticipation;

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
