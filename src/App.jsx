import { useState } from "react";
import Navbar from "./components/Navbar";
import TransactionList from "./components/TransactionList";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <>
      <Navbar
        user={user.email}
        role={user.role}
        onLogout={() => setUser(null)}
      />

      <div style={{ paddingTop: 60 }}>
        <TransactionList role={user.role} />
      </div>
    </>
  );
}

export default App;
