import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardHome from './student/DashboardHome';
import Attendance from './student/Attendance';
import Discipline from './student/Discipline';
import Files from './student/Files';
import Tests from './student/Tests';
import TakeTest from './student/TakeTest';

import TimetableView from './shared/TimetableView';

const StudentDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/discipline" element={<Discipline />} />
        <Route path="/files" element={<Files />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/tests/:id" element={<TakeTest />} />
        <Route path="/timetable" element={<TimetableView />} />
      </Routes>
    </Layout>
  );
};

export default StudentDashboard;
