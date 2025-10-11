import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/events', newEvent);
      alert('Event created successfully!');
      navigate('/admin'); // redirect back to admin dashboard
    } catch (err) {
      setError(err);
      alert('Failed to create event.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create Event</h1>

      {error && <p className="text-red-500 mb-4">{error.message}</p>}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-md">
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Title:</label>
          <input
            type="text"
            name="title"
            value={newEvent.title}
            onChange={handleChange}
            placeholder="Enter event title"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Description:</label>
          <textarea
            name="description"
            value={newEvent.description}
            onChange={handleChange}
            placeholder="Enter event description"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Date:</label>
          <input
            type="date"
            name="date"
            value={newEvent.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <small className="text-gray-500">dd-mm-yyyy</small>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Location:</label>
          <input
            type="text"
            name="location"
            value={newEvent.location}
            onChange={handleChange}
            placeholder="Enter event location"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Event
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="ml-4 bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
