import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { AuthProvider } from "./context/AuthContext";

// User pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";

// Admin pages
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminUsers from "./pages/AdminUsers";
import ApprovedParticipants from "./pages/ApprovedParticipants";
import CreateEvent from "./pages/CreateEvent";
import ParticipantsPage from "./pages/ParticipantsPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <PublicRoute>
                  <Login />
                </PublicRoute>
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <Navbar />
                <PublicRoute>
                  <Register />
                </PublicRoute>
              </>
            }
          />

          {/* Admin protected routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminAnalytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminEvents />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/participants"
            element={
              <PrivateRoute adminOnly={true}>
                <ApprovedParticipants />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/create-event"
            element={
              <PrivateRoute adminOnly={true}>
                <CreateEvent />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events/:eventId/participants"
            element={
              <PrivateRoute adminOnly={true}>
                <ParticipantsPage />
              </PrivateRoute>
            }
          />

          {/* User protected routes */}
          <Route
            path="/dashboard"
            element={
              <>
                <Navbar />
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              </>
            }
          />

          {/* Catch-all redirect */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              </>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
