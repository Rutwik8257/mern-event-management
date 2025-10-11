// src/pages/ApprovedParticipants.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";

const ApprovedParticipants = () => {
  const token = localStorage.getItem("token");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await axios.get("/admin/participants/approved", { headers: { Authorization: `Bearer ${token}` } });
        setParticipants(res.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [token]);

  if (loading) return <p>Loading participants...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Approved Participants</h1>
      {participants.length === 0 ? <p>No approved participants yet.</p> : (
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr>
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">Event</th>
              <th className="border px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {participants.map(p => (
              <tr key={p._id}>
                <td className="border px-4 py-2">{p.username}</td>
                <td className="border px-4 py-2">{p.event}</td>
                <td className="border px-4 py-2">{p.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApprovedParticipants;
