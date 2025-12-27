import React from 'react';

const ProfileForm = ({
  userData,
  contact,
  setContact,
  roleSpecificField,
  renderExtraFields,
  handlePhotoChange,
  handleSaveChanges,
  photoPreview,
  setShowPwdModal
}) => (
  <div className="bg-white shadow p-8 rounded-lg flex-1">
    <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label>Full Name</label>
        <input value={userData.fullName} disabled className="w-full border p-2 rounded bg-gray-100" />
      </div>
      <div>
        <label>Email</label>
        <input value={userData.email} disabled className="w-full border p-2 rounded bg-gray-100" />
      </div>
      <div>
        <label>Contact Number</label>
        <input value={contact} onChange={e => setContact(e.target.value)} className="w-full border p-2 rounded" />
      </div>
      {roleSpecificField}
      {renderExtraFields && renderExtraFields()}
    </div>

    <div className="flex justify-between items-center mt-6">
      <button onClick={() => setShowPwdModal(true)} className="text-[#575C9E] underline font-semibold">
        Change Password
      </button>
      <button onClick={handleSaveChanges} className="bg-[#575C9E] text-white px-6 py-2 rounded font-semibold">
        Save Changes
      </button>
    </div>
  </div>
);

export default ProfileForm;
