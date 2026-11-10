
import { useState } from "react";
import "./App.css";

type Page = "Dashboard" | "Students" | "Assignments" | "Progress";

const students = [
  { name: "Israel Johnson", email: "israel@example.com", progress: 75, status: "Active" },
  { name: "Sofia Williams", email: "sofia@example.com", progress: 50, status: "Active" },
  { name: "Joel Brown", email: "joel@example.com", progress: 100, status: "Completed" },
];

const assignments = [
  { title: "Resume Review", student: "Israel Johnson", due: "Nov 12", status: "Pending" },
  { title: "GitHub Project", student: "Sofia Williams", due: "Nov 16", status: "In Progress" },
  { title: "Mock Interview", student: "Joel Brown", due: "Nov 20", status: "Completed" },
];

function App() {
  const [page, setPage] = useState<Page>("Dashboard");

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>SquareOne</h2>
        <p>Staff Portal</p>
        <nav>
          {(["Dashboard", "Students", "Assignments", "Progress"] as Page[]).map((item) => (
            <button
              key={item}
              className={page === item ? "active" : ""}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <h1>{page === "Dashboard" ? "Staff Dashboard" : page}</h1>
        <p className="subtitle">SquareOne Student Progress Management</p>

        {page === "Dashboard" && (
          <>
            <div className="stats">
              <div className="stat-card"><h3>Total Students</h3><strong>3</strong></div>
              <div className="stat-card"><h3>Total Assignments</h3><strong>3</strong></div>
              <div className="stat-card"><h3>Completed Tasks</h3><strong>1</strong></div>
              <div className="stat-card"><h3>Pending Tasks</h3><strong>1</strong></div>
            </div>
            <section className="panel">
              <h2>Recent Activity</h2>
              <p>Joel Brown completed Mock Interview.</p>
              <p>Sofia Williams is working on GitHub Project.</p>
              <p>Israel Johnson has a pending Resume Review.</p>
            </section>
          </>
        )}

        {page === "Students" && (
          <section className="panel">
            <h2>Student List</h2>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Progress</th><th>Status</th></tr></thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.email}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.progress}%</td>
                    <td>{student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {page === "Assignments" && (
          <section className="panel">
            <h2>Assignment List</h2>
            <table>
              <thead><tr><th>Assignment</th><th>Assigned To</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.title}>
                    <td>{assignment.title}</td>
                    <td>{assignment.student}</td>
                    <td>{assignment.due}</td>
                    <td>{assignment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {page === "Progress" && (
          <section className="panel">
            <h2>Student Progress</h2>
            <table>
              <thead><tr><th>Student</th><th>Assignments Completed</th><th>Progress</th><th>Status</th></tr></thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.name}>
                    <td>{student.name}</td>
                    <td>{student.progress === 100 ? "4/4" : student.progress === 75 ? "3/4" : "2/4"}</td>
                    <td>{student.progress}%</td>
                    <td>{student.progress === 100 ? "Completed" : student.progress === 75 ? "On Track" : "In Progress"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
