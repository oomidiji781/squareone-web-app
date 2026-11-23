import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import apiClient from "../api/client";

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
};

const emptyForm = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
};

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data?.detail) {
      return String(data.detail);
    }

    if (data && typeof data === "object") {
      return Object.entries(data)
        .map(([field, value]) =>
          `${field.replace(/_/g, " ")}: ${String(value)}`
        )
        .join(" ");
    }
  }

  return "Unable to complete the request. Please try again.";
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadUsers() {
    const response = await apiClient.get("/users/");

    const data = response.data;

    setUsers(Array.isArray(data) ? data : data.results);
  }

  useEffect(() => {
    loadUsers()
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function openEditForm(user: User) {
    setForm({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: "",
    });

    setEditingId(user.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      username: form.username.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
    };

    try {
      if (editingId !== null) {
        await apiClient.patch(
          `/users/${editingId}/`,
          payload
        );

        setSuccess("User updated successfully.");
      } else {
        await apiClient.post("/users/", {
          ...payload,
          password: form.password,
          is_active: true,
        });

        setSuccess("Staff account created successfully.");
      }

      closeForm();
      await loadUsers();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleUserStatus(user: User) {
    const action = user.is_active
      ? "deactivate"
      : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${user.full_name}?`
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiClient.patch(`/users/${user.id}/`, {
        is_active: !user.is_active,
      });

      setSuccess(
        user.is_active
          ? "Account deactivated successfully."
          : "Account activated successfully."
      );

      await loadUsers();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      `${user.full_name} ${user.username} ${user.email}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && user.is_active) ||
      (filter === "Inactive" && !user.is_active) ||
      (filter === "Administrators" &&
        user.role === "Administrator") ||
      (filter === "Staff" && user.role === "Staff");

    return matchesSearch && matchesFilter;
  });

  const activeUsers = users.filter(
    (user) => user.is_active
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.is_active
  ).length;

  const administrators = users.filter(
    (user) => user.role === "Administrator"
  ).length;

  return (
    <>
      <div className="stats">
        {[
          ["Total Users", users.length],
          ["Active Accounts", activeUsers],
          ["Inactive Accounts", inactiveUsers],
          ["Administrators", administrators],
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <h3>{label}</h3>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      {success && (
        <p role="status" style={{ color: "#176b4d" }}>
          {success}
        </p>
      )}

      <section className="panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h2>Manage User Accounts</h2>
            <p>
              Create and manage staff access to the
              SquareOne portal.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            disabled={saving || loading}
          >
            + Add User
          </button>
        </div>
      </section>

      {showForm && (
        <section className="panel">
          <h2>
            {editingId !== null
              ? "Edit User"
              : "Create Staff Account"}
          </h2>

          <form
            onSubmit={saveUser}
            style={{
              display: "grid",
              gap: "16px",
              maxWidth: "600px",
            }}
          >
            {(
              [
                ["first_name", "First Name"],
                ["last_name", "Last Name"],
                ["username", "Username"],
                ["email", "Email Address"],
              ] as const
            ).map(([field, label]) => (
              <label
                key={field}
                style={{
                  display: "grid",
                  gap: "6px",
                }}
              >
                {label}

                <input
                  type={field === "email" ? "email" : "text"}
                  value={form[field]}
                  required
                  onChange={(event) =>
                    setForm({
                      ...form,
                      [field]: event.target.value,
                    })
                  }
                />
              </label>
            ))}

            {editingId === null && (
              <>
                <label
                  style={{
                    display: "grid",
                    gap: "6px",
                  }}
                >
                  Initial Password

                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    required
                    onChange={(event) =>
                      setForm({
                        ...form,
                        password: event.target.value,
                      })
                    }
                  />
                </label>

                <label
                  style={{
                    display: "grid",
                    gap: "6px",
                  }}
                >
                  Account Role
                  <input value="Staff" readOnly />
                </label>

                <small>
                  Staff members can change their passwords
                  after signing in.
                </small>
              </>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Save Changes"
                  : "Create Account"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={closeForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel">
        <h2>Registered Users</h2>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <input
            type="search"
            placeholder="Search by name, username or email"
            aria-label="Search users"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            style={{ flex: "1 1 250px" }}
          />

          <select
            aria-label="Filter users"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
          >
            <option value="All">All Users</option>
            <option value="Active">Active Accounts</option>
            <option value="Inactive">Inactive Accounts</option>
            <option value="Administrators">Administrators</option>
            <option value="Staff">Staff</option>
          </select>
        </div>

        {loading ? (
          <p>Loading user accounts...</p>
        ) : (
          <>
            <p>
              Showing {filteredUsers.length} of{" "}
              {users.length} users
            </p>

            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <span className="student-identity">
                          <span className="student-avatar">
                            {user.full_name
                              .trim()
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase()}
                          </span>

                          {user.full_name}
                        </span>
                      </td>

                      <td>{user.username}</td>
                      <td>{user.email || "Not provided"}</td>

                      <td>
                        <span
                          style={{
                            background:
                              user.role === "Administrator"
                                ? "#e6eefb"
                                : "#edf5ef",
                            color:
                              user.role === "Administrator"
                                ? "#2859a5"
                                : "#176b4d",
                            padding: "6px 10px",
                            borderRadius: "20px",
                            fontWeight: 600,
                          }}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            color: user.is_active
                              ? "#176b4d"
                              : "#b42318",
                            fontWeight: 600,
                          }}
                        >
                          {user.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        {user.role === "Administrator" ? (
                          <small>Protected account</small>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                openEditForm(user)
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                toggleUserStatus(user)
                              }
                              style={{
                                color: user.is_active
                                  ? "#b42318"
                                  : "#176b4d",
                              }}
                            >
                              {user.is_active
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <p>No matching users found.</p>
            )}
          </>
        )}
      </section>
    </>
  );
}