// src/pages/AdminUsers.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";

const AdminUsers = () => {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit state
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => u._id !== id));
      alert("User deleted successfully!");
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/admin/users/${editingUser._id}`, editingUser, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.map(u => u._id === editingUser._id ? res.data : u));
      setShowEditModal(false);
      setEditingUser(null);
      alert("User updated successfully!");
    } catch (err) {
      alert("Error updating user: " + err.message);
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Manage Users</h1>
      {users.length === 0 ? <p>No users found.</p> : (
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr>
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Role</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td className="border px-4 py-2">{u.username}</td>
                <td className="border px-4 py-2">{u.email}</td>
                <td className="border px-4 py-2">{u.role}</td>
                <td className="border px-4 py-2">
                  <button onClick={() => handleEditUser(u)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Edit</button>
                  <button onClick={() => handleDeleteUser(u._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User: {editingUser.username}</h2>
            <form onSubmit={handleUpdateUser}>
              <input className="mb-2 border w-full p-2" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
              <input className="mb-2 border w-full p-2" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
              <select className="mb-2 border w-full p-2" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
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

export default AdminUsers;
