import React, { useEffect, useState } from "react";
import StudentHeader from "../components/StudentHeader";

const StudentProfile = () => {
  const [userData, setUserData] = useState(null);
  const [contactNumber, setContactNumber] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    if (data) {
      setUserData(data);
      setContactNumber(data.contactNumber || "");
      setEmailNotifications(data.notificationPreferences?.email ?? true);
      if (data.profileImageUrl) {
        setImagePreview(data.profileImageUrl);
      }
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file)); // Instant preview
  };

  const handleSaveChanges = async () => {
    if (!userData?.email) return alert("User not found");

    const formData = new FormData();
    formData.append("contactNumber", contactNumber);
    formData.append("emailPref", emailNotifications);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/profile/${userData.email}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const result = await res.json();
      if (res.ok) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...userData,
            contactNumber,
            notificationPreferences: { email: emailNotifications },
            profileImageUrl: result.profileImageUrl,
          })
        );
        alert("Profile updated!");
      } else {
        alert(result.msg || "Update failed");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      return alert("New passwords do not match.");
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userData.email,
            currentPassword: passwords.current,
            newPassword: passwords.new,
          }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        alert("Password changed successfully!");
        setShowPasswordModal(false);
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        alert(result.msg || "Password change failed.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Error changing password. Please try again.");
    }
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen w-full bg-white overflow-hidden">
      <StudentHeader />

      <div className="flex flex-col sm:flex-row justify-center gap-8 p-8 max-w-7xl mx-auto">
        {/* Left panel (narrower) */}
        <div className="bg-white shadow-lg rounded-xl p-14 flex-shrink-0 max-w-xs text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-2xl font-semibold overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <>
                {userData.fullName?.charAt(0)}
                {userData.fullName?.split(" ")[1]?.charAt(0)}
              </>
            )}
          </div>
          <div className="mt-4">
            <input
              type="file"
              id="profile-picture-input"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() =>
                document.getElementById("profile-picture-input").click()
              }
              className="px-4 py-2 bg-[#6B46C1] text-white rounded-lg hover:bg-[#553399] transition-colors text-sm font-medium cursor-pointer"
            >
              {imagePreview ? "Change Picture" : "Add Picture"}
            </button>
          </div>
          <div className="mt-6 text-lg font-semibold text-gray-700">
            {userData.fullName}
          </div>
          <div className="text-sm text-gray-500">{userData.role}</div>
          <div className="text-sm text-gray-500">{userData.department}</div>
        </div>

        {/* Right panel (wider) */}
        <div className="bg-white shadow-lg rounded-xl p-6 w-full flex-1">
          <h2 className="text-xl font-semibold text-[#6B46C1] mb-6">
            Profile Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold text-sm">Full Name</label>
              <input
                type="text"
                value={userData.fullName}
                disabled
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-sm">Department</label>
              <input
                type="text"
                value={userData.department}
                disabled
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-sm mb-1">
              Student ID
            </label>
            <input
              type="text"
              value={userData.studentId}
              disabled
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-sm mb-1">Email</label>
            <input
              type="email"
              value={userData.email}
              disabled
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-sm mb-1">
              Contact Number
            </label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold text-sm mb-2">
              Notification Preferences
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Send notifications to my email address</span>
            </label>
          </div>

          <button
            onClick={handleSaveChanges}
            className="w-full bg-[#6B46C1] hover:bg-[#553399] text-white py-2 rounded font-semibold transition duration-200 mb-3"
          >
            Save Changes
          </button>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full border border-[#6B46C1] text-[#6B46C1] py-2 rounded font-semibold transition duration-200 hover:bg-[#6B46C1] hover:text-white"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          style={{ zIndex: 9999 }}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-96 relative"
            style={{ zIndex: 10000 }}
          >
            <h3 className="text-lg font-semibold text-[#6B46C1] mb-4">
              Change Password
            </h3>
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  autoComplete="new-password"
                  className="w-full p-2 border rounded pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showCurrentPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  autoComplete="new-password"
                  className="w-full p-2 border rounded pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showNewPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  autoComplete="new-password"
                  className="w-full p-2 border rounded pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                className="px-4 py-2 rounded bg-[#6B46C1] text-white hover:bg-[#553399] text-sm cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Student Profile
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StudentProfile;
