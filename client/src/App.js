import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Forms from './components/forms/Forms';
import FormBuilder from './components/forms/FormBuilder';
import Layout from './components/layout/Layout';
import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import ResponseDashboard from './components/admin/ResponseDashboard';
import RolesPermissions from './components/admin/RolesPermissions';
import FormSettings from './components/admin/FormSettings';
import AccountSettings from './components/admin/AccountSettings';
import AuditLogs from './components/admin/AuditLogs';
import PublicForms from './components/admin/PublicForms';
import Settings from './components/admin/Settings';
import PublicFormView from './components/public/PublicFormView';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="bottom-right" />
      <Router>
        <Routes>
          {/* Public Form Route */}
          <Route path="/form/:formId" element={<PublicFormView />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="forms" element={<Forms />} />
            <Route path="forms/new" element={<FormBuilder />} />
            <Route path="forms/:formId/edit" element={<FormBuilder />} />
            <Route path="responses" element={<ResponseDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="roles-permissions" element={<RolesPermissions />} />
            <Route path="settings" element={<Settings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="account-settings" element={<AccountSettings />} />
            <Route path="public-forms" element={<PublicForms />} />
            <Route path="form-settings" element={<FormSettings />} />
          </Route>

          {/* Redirect root to admin dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
