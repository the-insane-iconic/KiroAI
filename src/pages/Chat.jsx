// Chat.jsx — redirects to the new ChatCanvas
import { Navigate } from "react-router-dom";
export default function Chat() {
  return <Navigate to="/chat" replace />;
}