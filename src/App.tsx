import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/authContext';
import LoginPage from './pages/LoginPage';
import SelectRolePage from './pages/SelectRolePage';
import RiderPage from './pages/RiderPage';
import DriverPage from './pages/DriverPage';
import HistoryPage from './pages/HistoryPage';

// Blocks unauthenticated users
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  const { isLoggedIn, role } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        
        <Route
          path="/login"
          element={
            isLoggedIn
              ? <Navigate to={`/${role}`} replace />
              : <LoginPage />
          }
        />

        <Route
          path="/select-role"
          element={
            <PrivateRoute>
              <SelectRolePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/rider"
          element={
            <PrivateRoute>
              <RiderPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/driver"
          element={
            <PrivateRoute>
              <DriverPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/history"
          element={
            <PrivateRoute>
              <HistoryPage />
            </PrivateRoute>
          }
        />

       
        <Route
          path="*"
          element={
            isLoggedIn
              ? <Navigate to={`/${role}`} replace />
              : <Navigate to="/login" replace />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;