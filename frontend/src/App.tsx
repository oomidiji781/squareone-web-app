
import { useEffect, useState, type FormEvent } from "react";
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

const API_URL = "http://localhost:8000/api";

function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentStudent, setAssignmentStudent] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState("Pending");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsResponse, assignmentsResponse] =
          await Promise.all([
            fetch(`${API_URL}/students/`),
            fetch(`${API_URL}/assignments/`),
          ]);

        if (!studentsResponse.ok || !assignmentsResponse.ok) {
          throw new Error("Unable to load data.");
        }

        const studentData: ApiResponse<Student> =
          await studentsResponse.json();

        const assignmentData: ApiResponse<Assignment> =
          await assignmentsResponse.json();

        setStudents(studentData.results);
        setAssignments(assignmentData.results);
        setError("");
      } catch {
        setError("Could not connect to the Django backend.");
      }
    }

    loadData();
  }, []);

  async function addStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/students/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          progress: 0,
          status: "Active",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add student.");
      }

      const student: Student = await response.json();

      setStudents((previous) => [...previous, student]);
      setNewName("");
      setNewEmail("");
      setSuccess("Student added successfully!");
    } catch {
      setError("Unable to add student. Please try again.");
    }
  }

  async function addAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!assignmentStudent) {
      setError("Please select a student.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/assignments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: assignmentTitle.trim(),
          student: Number(assignmentStudent),
          due_date: assignmentDueDate,
          status: assignmentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add assignment.");
      }

      const assignment: Assignment = await response.json();

      const selectedStudent = students.find(
        (student) => student.id === Number(assignmentStudent)
      );

      setAssignments((previous) => [
        ...previous,
        {
          ...assignment,
          student_name:
            assignment.student_name ||
            selectedStudent?.name ||
            "Unknown Student",
        },
      ]);

      setAssignmentTitle("");
      setAssignmentStudent("");
      setAssignmentDueDate("");
      setAssignmentStatus("Pending");
      setSuccess("Assignment added successfully!");
    } catch {
      setError("Unable to add assignment. Please try again.");
    }
  }

  const [savingAssignmentId, setSavingAssignmentId] = useState<number | null>(null);

  async function updateAssignmentStatus(id: number, newStatus: string) {
    setError("");
    setSuccess("");
    setSavingAssignmentId(id);

    try {
      const response = await fetch(`${API_URL}/assignments/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update assignment status.");
      }

      const updated: Assignment = await response.json();
      setAssignments((previous) =>
        previous.map((assignment) =>
          assignment.id === id
            ? { ...assignment, ...updated, status: newStatus }
            : assignment
        )
      );
      setSuccess("Assignment status updated successfully!");
    } catch {
      setError("Unable to update assignment status. Please try again.");
    } finally {
      setSavingAssignmentId(null);
    }
  }

  function changePage(nextPage: Page) {
    setPage(nextPage);
    setError("");
    setSuccess("");
  }

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
          {(
            [
              "Dashboard",
              "Students",
              "Assignments",
              "Progress",
            ] as Page[]
          ).map((item) => (
            <button
              key={item}
              className={page === item ? "active" : ""}
              onClick={() => changePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <h1>
          {page === "Dashboard" ? "Staff Dashboard" : page}
        </h1>

        <p className="subtitle">
          SquareOne Student Progress Management
        </p>

        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}

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
          <>
            <section className="panel">
              <h2>Add New Student</h2>

              <form onSubmit={addStudent}>
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newName}
                  onChange={(event) =>
                    setNewName(event.target.value)
                  }
                  required
                />

                <input
                  type="email"
                  placeholder="Student Email"
                  value={newEmail}
                  onChange={(event) =>
                    setNewEmail(event.target.value)
                  }
                  required
                />

                <button type="submit">Add Student</button>
              </form>
            </section>

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
          </>
        )}

        {page === "Assignments" && (
          <>
            <section className="panel">
              <h2>Add New Assignment</h2>

              <form onSubmit={addAssignment}>
                <input
                  type="text"
                  placeholder="Assignment Title"
                  value={assignmentTitle}
                  onChange={(event) =>
                    setAssignmentTitle(event.target.value)
                  }
                  required
                />

                <select
                  value={assignmentStudent}
                  onChange={(event) =>
                    setAssignmentStudent(event.target.value)
                  }
                  required
                >
                  <option value="">Select Student</option>

                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={assignmentDueDate}
                  onChange={(event) =>
                    setAssignmentDueDate(event.target.value)
                  }
                  required
                />

                <select
                  value={assignmentStatus}
                  onChange={(event) =>
                    setAssignmentStatus(event.target.value)
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <button type="submit">Add Assignment</button>
              </form>
            </section>

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
                      <td>
                        <select
                          aria-label={`Status for ${assignment.title}`}
                          value={assignment.status}
                          disabled={savingAssignmentId === assignment.id}
                          onChange={(event) =>
                            updateAssignmentStatus(assignment.id, event.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
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

                    <td>
                      {Math.round(student.progress / 25)}/4
                    </td>

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
