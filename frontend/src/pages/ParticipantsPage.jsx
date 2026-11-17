import { Button } from "../components/Button";
import "../styles/enterprise.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

const ParticipantsPage = () => {
  const { eventId } = useParams();
  const token = localStorage.getItem("token");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = async () => {
    try {
      const res = await axios.get(`/admin/events/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParticipants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, status) => {
    try {
      await axios.put(`/admin/events/${eventId}/participants`, { userId, status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParticipants(participants.map(p =>
        p.user._id === userId ? { ...p, status } : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  if (loading) return <p>Loading participants...</p>;

  return (
    <div className="eh-screen eh-workspace container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Participants</h1>
      <div className="eh-table-scroll"><table className="min-w-full eh-bg-white eh-shadow rounded">
        <thead>
          <tr>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {participants.map(p => (
            <tr key={p.user._id}>
              <td className="border px-4 py-2">{p.user.username}</td>
              <td className="border px-4 py-2">{p.user.email}</td>
              <td className="border px-4 py-2">{p.status}</td>
              <td className="border px-4 py-2">
                {p.status === "Pending" && (
                  <>
                    <Button
                      onClick={() => handleStatusChange(p.user._id, "Approved")}
                      className="eh-bg-green-500 eh-text-white px-2 py-1 rounded mr-2"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(p.user._id, "Rejected")}
                      className="eh-bg-red-500 eh-text-white px-2 py-1 rounded"
                    >
                      Reject
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
};

export default ParticipantsPage;
