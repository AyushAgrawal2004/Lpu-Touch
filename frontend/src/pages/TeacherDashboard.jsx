import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardHome from './teacher/DashboardHome';
import Attendance from './teacher/Attendance';
import Students from './teacher/Students';
import Discipline from './teacher/Discipline';
import Files from './teacher/Files';

import AdminPanel from './teacher/AdminPanel';
import TimetableView from './shared/TimetableView';
import TestsList from './teacher/TestsList';
import CreateTest from './teacher/CreateTest';

const TeacherDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/students" element={<Students />} />
        <Route path="/discipline" element={<Discipline />} />
        <Route path="/files" element={<Files />} />
        <Route path="/timetable" element={<TimetableView />} />
        <Route path="/tests" element={<TestsList />} />
        <Route path="/tests/create" element={<CreateTest />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Layout>
  );
};

export default TeacherDashboard;
