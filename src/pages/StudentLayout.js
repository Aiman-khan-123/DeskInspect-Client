import React from 'react';
import StudentHeader from '../components/StudentHeader';

const StudentLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default StudentLayout;