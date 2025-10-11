// src/pages/AdminEvents.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const AdminEvents = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Create
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "", description: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/admin/events", { headers: { Authorization: `Bearer ${token}` } });
        setEvents(res.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [token]);

  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(`/admin/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setEvents(events.filter(ev => ev._id !== id));
      alert("Event deleted successfully!");
    } catch (err) {
      alert("Error deleting event: " + err.message);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/admin/events/${editingEvent._id}`, editingEvent, { headers: { Authorization: `Bearer ${token}` } });
      setEvents(events.map(ev => ev._id === editingEvent._id ? res.data : ev));
      setShowEditModal(false);
      setEditingEvent(null);
      alert("Event updated successfully!");
    } catch (err) {
      alert("Error updating event: " + err.message);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/admin/events", newEvent, { headers: { Authorization: `Bearer ${token}` } });
      setEvents([...events, res.data]);
      setShowCreateModal(false);
      setNewEvent({ title: "", date: "", location: "", description: "" });
      alert("Event created successfully!");
    } catch (err) {
      alert("Error creating event: " + err.message);
    }
  };

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Manage Events</h1>

      {/* Create Event Button */}
      <button 
        onClick={() => setShowCreateModal(true)} 
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
      >
        + Create Event
      </button>

      {events.length === 0 ? <p>No events found.</p> : (
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Location</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev._id}>
                <td className="border px-4 py-2">{ev.title}</td>
                <td className="border px-4 py-2">{new Date(ev.date).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{ev.location}</td>
                <td className="border px-4 py-2">
                  <button onClick={() => handleEditEvent(ev)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Edit</button>
                  <button onClick={() => handleDeleteEvent(ev._id)} className="bg-red-500 text-white px-3 py-1 rounded mr-2">Delete</button>
                  <button onClick={() => navigate(`/admin/events/${ev._id}/participants`)} className="bg-blue-500 text-white px-3 py-1 rounded">Participants</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Event</h2>
            <form onSubmit={handleCreateEvent}>
              <input className="mb-2 border w-full p-2" placeholder="Title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              <textarea className="mb-2 border w-full p-2" placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              <input className="mb-2 border w-full p-2" type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
              <input className="mb-2 border w-full p-2" placeholder="Location" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
              <div className="flex justify-between">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Create</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Event: {editingEvent.title}</h2>
            <form onSubmit={handleUpdateEvent}>
              <input className="mb-2 border w-full p-2" value={editingEvent.title} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} />
              <textarea className="mb-2 border w-full p-2" value={editingEvent.description} onChange={e => setEditingEvent({...editingEvent, description: e.target.value})} />
              <input className="mb-2 border w-full p-2" type="date" value={editingEvent.date.split("T")[0]} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} />
              <input className="mb-2 border w-full p-2" value={editingEvent.location} onChange={e => setEditingEvent({...editingEvent, location: e.target.value})} />
              <div className="flex justify-between">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
