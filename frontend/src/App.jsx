import { useEffect, useState } from "react";
import api from "./api";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setUser(response.data.user);
      setMessage("Login successful!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  const loadStores = async () => {
    try {
      const response = await api.get("/stores");
      setStores(response.data.stores || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load stores");
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.users || []);
    } catch (error) {
      console.log("Users endpoint unavailable");
    }
  };

  useEffect(() => {
    if (user) {
      loadStores();

      if (user.role === "ADMIN") {
        loadUsers();
      }
    }
  }, [user]);

  const submitRating = async (storeId, rating) => {
    try {
      const response = await api.post("/ratings", {
        storeId,
        rating,
      });

      setMessage(response.data.message);
      loadStores();
    } catch (error) {
      setMessage(error.response?.data?.message || "Rating failed");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setStores([]);
    setUsers([]);
  };

  if (!user) {
    return (
      <div className="app">
        <div className="login-card">
          <h1>Store Rating Platform</h1>
          <p className="subtitle">Sign in to continue</p>

          <form onSubmit={login}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>

          {message && <p className="message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="navbar">
        <div>
          <h2>Store Rating Platform</h2>
          <small>
            Logged in as {user.name} — {user.role}
          </small>
        </div>

        <button className="logout" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="content">
        {message && <div className="message">{message}</div>}

        {user.role === "ADMIN" ? (
          <>
            <h1>Admin Dashboard</h1>

            <div className="stats">
              <div className="stat-card">
                <h3>Total Stores</h3>
                <strong>{stores.length}</strong>
              </div>

              <div className="stat-card">
                <h3>Total Users</h3>
                <strong>{users.length}</strong>
              </div>
            </div>

            <h2>Stores</h2>

            <div className="store-grid">
              {stores.map((store) => (
                <div className="store-card" key={store.id}>
                  <h2>{store.name}</h2>
                  <p>
                    <strong>Email:</strong> {store.email}
                  </p>
                  <p>
                    <strong>Address:</strong> {store.address}
                  </p>
                  <div className="rating">
                    ⭐ Overall Rating: {store.overall_rating}
                  </div>
                </div>
              ))}
            </div>

            <h2 className="section-title">Users</h2>

            <div className="user-table">
              {users.length === 0 ? (
                <p>No users returned by the API.</p>
              ) : (
                users.map((u) => (
                  <div className="user-row" key={u.id}>
                    <span>{u.name}</span>
                    <span>{u.email}</span>
                    <span>{u.role}</span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <h1>Store Listings</h1>
            <p>Find a store and submit your rating.</p>

            <div className="store-grid">
              {stores.map((store) => (
                <div className="store-card" key={store.id}>
                  <h2>{store.name}</h2>

                  <p>
                    <strong>Email:</strong> {store.email}
                  </p>

                  <p>
                    <strong>Address:</strong> {store.address}
                  </p>

                  <div className="rating">
                    ⭐ Overall Rating: {store.overall_rating}
                  </div>

                  <div className="rating-buttons">
                    <p>Your rating:</p>

                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => submitRating(store.id, rating)}
                      >
                        {rating} ⭐
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;