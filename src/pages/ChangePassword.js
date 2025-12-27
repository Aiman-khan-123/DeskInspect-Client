import React, { useState } from 'react';
import axios from 'axios';

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/change-password',
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(res.data.message || 'Password updated successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error updating password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-[#575C9E]">
      {/* Header */}
      <div className="bg-[#575C9E] p-4 text-white font-bold text-xl">DeskInspect</div>

      {/* Form Centered Without Extra Gap */}
      <div className="flex justify-center py-10">
        <div className="bg-white shadow p-6 rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-[#575C9E]">Change Password</h2>
          {message && <div className="mb-4 text-sm text-red-600">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                required
                className="w-full border p-2 rounded"
                value={form.currentPassword}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-semibold">New Password</label>
              <input
                type="password"
                name="newPassword"
                required
                className="w-full border p-2 rounded"
                value={form.newPassword}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-semibold">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="w-full border p-2 rounded"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#575C9E] text-white py-2 rounded font-semibold"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
