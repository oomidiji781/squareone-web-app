
import { useEffect, useState } from "react";
import "./App.css";

type Page = "Dashboard" | "Students" | "Assignments" | "Progress";

type Student = {
  id: number;
  name: string;
  email: string;
  progress: number;
  status: string;
};

type Assignment = {
  id: number;
  title: string;
  student: number;
  student_name: string;
  due_date: string;
  status: string;
};

type ApiResponse<T> = {
  results: T[];
};

function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsResponse, assignmentsResponse] = await Promise.all([
          fetch("http://localhost:8000/api/students/"),
          fetch("http://localhost:8000/api/assignments/"),
        ]);

        if (!studentsResponse.ok || !assignmentsResponse.ok) {
          throw new Error("Unable to load dashboard data.");
        }

        const studentData: ApiResponse<Student> = await studentsResponse.json();
        const assignmentData: ApiResponse<Assignment> = await assignmentsResponse.json();

        setStudents(studentData.results);
        setAssignments(assignmentData.results);
      } catch {
        setError("Could not connect to the Django backend.");
      }
    }

    loadData();
  }, []);

  const completedTasks = assignments.filter(
    (assignment) => assignment.status === "Completed"
  ).length;

  const pendingTasks = assignments.filter(
    (assignment) => assignment.status === "Pending"
  ).length;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>SquareOne</h2>
        <p>Staff Portal</p>

        <nav>
          {(["Dashboard", "Students", "Assignments", "Progress"] as Page[]).map(
            (item) => (
              <button
                key={item}
                className={page === item ? "active" : ""}
                onClick={() => setPage(item)}
              >
                {item}
              </button>
            )
          )}
        </nav>
      </aside>

      <main className="main-content">
        <h1>{page === "Dashboard" ? "Staff Dashboard" : page}</h1>
        <p className="subtitle">SquareOne Student Progress Management</p>

        {error && <p role="alert">{error}</p>}

        {page === "Dashboard" && (
          <>
            <div className="stats">
              <div className="stat-card">
                <h3>Total Students</h3>
                <strong>{students.length}</strong>
              </div>
              <div className="stat-card">
                <h3>Total Assignments</h3>
                <strong>{assignments.length}</strong>
              </div>
              <div className="stat-card">
                <h3>Completed Tasks</h3>
                <strong>{completedTasks}</strong>
              </div>
              <div className="stat-card">
                <h3>Pending Tasks</h3>
                <strong>{pendingTasks}</strong>
              </div>
            </div>

            <section className="panel">
              <h2>Recent Activity</h2>
              {assignments.map((assignment) => (
                <p key={assignment.id}>
                  {assignment.student_name}: {assignment.title} (
                  {assignment.status})
                </p>
              ))}
            </section>
          </>
        )}

        {page === "Students" && (
          <section className="panel">
            <h2>Student List</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
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
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>{assignment.title}</td>
                    <td>{assignment.student_name}</td>
                    <td>{assignment.due_date}</td>
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
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignments Completed</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{Math.round(student.progress / 25)}/4</td>
                    <td>{student.progress}%</td>
                    <td>
                      {student.progress === 100
                        ? "Completed"
                        : student.progress >= 75
                        ? "On Track"
                        : "In Progress"}
                    </td>
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
