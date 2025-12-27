import React, { useState, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";

const AdminProfile = () => {
  const [userData, setUserData] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserData(user);
      setProfile({
        name: user.fullName || "",
        email: user.email || "",
        password: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if user wants to change password
    if (profile.password || profile.newPassword || profile.confirmPassword) {
      if (!profile.password) {
        return alert("Please enter your current password");
      }
      if (!profile.newPassword) {
        return alert("Please enter a new password");
      }
      if (profile.newPassword !== profile.confirmPassword) {
        return alert("New passwords do not match");
      }

      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/change-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userData.email,
              currentPassword: profile.password,
              newPassword: profile.newPassword,
            }),
          }
        );

        const result = await res.json();
        if (res.ok) {
          alert("Password changed successfully!");
          setProfile({
            ...profile,
            password: "",
            newPassword: "",
            confirmPassword: "",
          });
        } else {
          alert(result.msg || "Password change failed");
        }
      } catch (error) {
        console.error("Error changing password:", error);
        alert("Error changing password. Please try again.");
      }
    } else {
      alert("No changes to save");
    }
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AdminHeader />

      <main className="flex-grow flex justify-center items-center px-4 py-4">
        <div className="w-full max-w-xl bg-white p-3 rounded shadow">
          <h2 className="text-2xl font-semibold text-[#6B46C1] mb-6">
            Edit Admin Profile
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Current Password</label>
              <input
                type="password"
                name="password"
                value={profile.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter current password to change"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={profile.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={profile.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full px-3 py-2 border rounded"
                placeholder="Re-enter new password"
              />
            </div>
            <button
              type="submit"
              className="bg-[#6B46C1] text-white px-4 py-2 rounded hover:bg-[#553399]"
            >
              Change Password
            </button>
          </form>
        </div>
      </main>

      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Admin Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminProfile;
