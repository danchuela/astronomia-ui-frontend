import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Login from "@/pages/Login";
import Chat from "@/pages/Chat";
import SpaceBackground from "@/components/SpaceBackground";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { email } = useAuth();
  if (!email) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <SpaceBackground />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
