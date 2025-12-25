import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import TransactionList from "../components/TransactionList";

function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    }
  }, [user, navigate, setIsAuthenticated]);

  if (!user) return null;

  return (
    <div style={{ background: "#f4f6f8", minHeight: "100vh" }}>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div style={{ paddingTop: 88, padding: 24 }}>
        <TransactionList role={user.role} />
      </div>
    </div>
  );
}

export default Dashboard;
