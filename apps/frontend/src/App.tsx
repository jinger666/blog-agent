import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import MemoryManager from './pages/MemoryManager';
import DifyWorkflowPage from './pages/DifyWorkflowPage';
import LoginPage from './pages/LoginPage';
import { useAuthStore } from './stores/authStore';
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

const WorkflowRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <MainLayout hideHeader>{children}</MainLayout>;
};

function App() {
  return (
    <AntdApp>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/workflows"
            element={
              <WorkflowRoute>
                <DifyWorkflowPage />
              </WorkflowRoute>
            }
          />
          <Route
            path="/memories"
            element={
              <PrivateRoute>
                <MemoryManager />
              </PrivateRoute>
            }
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AntdApp>
  );
}

export default App;
