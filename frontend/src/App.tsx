
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

  const [studentSearch, setStudentSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [savingStudentId, setSavingStudentId] = useState<number | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentStudent, setAssignmentStudent] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState("Pending");

  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("All");

  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
  const [editAssignmentTitle, setEditAssignmentTitle] = useState("");
  const [editAssignmentStudent, setEditAssignmentStudent] = useState("");
  const [editAssignmentDueDate, setEditAssignmentDueDate] = useState("");
  const [editAssignmentStatus, setEditAssignmentStatus] = useState("Pending");

  const [savingAssignmentId, setSavingAssignmentId] = useState<number | null>(null);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<number | null>(null);

  const [progressSearch, setProgressSearch] = useState("");
  const [progressFilter, setProgressFilter] = useState("All");
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function unpackData<T>(data: ApiResponse<T> | T[]): T[] {
    return Array.isArray(data) ? data : data.results;
  }

  async function refreshData() {
    const [studentsResponse, assignmentsResponse] = await Promise.all([
      fetch(`${API_URL}/students/`),
      fetch(`${API_URL}/assignments/`),
    ]);

    if (!studentsResponse.ok || !assignmentsResponse.ok) {
      throw new Error("Unable to load data.");
    }

    const studentData: ApiResponse<Student> | Student[] =
      await studentsResponse.json();

    const assignmentData: ApiResponse<Assignment> | Assignment[] =
      await assignmentsResponse.json();

    setStudents(unpackData(studentData));
    setAssignments(unpackData(assignmentData));
  }

  useEffect(() => {
    refreshData().catch(() => {
      setError("Could not connect to the Django backend.");
    });
  }, []);

  function changePage(nextPage: Page) {
    setPage(nextPage);
    setError("");
    setSuccess("");
    setEditingStudentId(null);
    setEditingAssignmentId(null);
  }

  async function addStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/students/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      await refreshData();
      setNewName("");
      setNewEmail("");
      setSuccess("Student added successfully!");
    } catch {
      setError("Unable to add student. Please try again.");
    }
  }

  function startEditingStudent(student: Student) {
    setEditingStudentId(student.id);
    setEditName(student.name);
    setEditEmail(student.email);
    setError("");
    setSuccess("");
  }

  function cancelEditingStudent() {
    setEditingStudentId(null);
    setEditName("");
    setEditEmail("");
  }

  async function saveStudent(studentId: number) {
    setError("");
    setSuccess("");

    if (!editName.trim() || !editEmail.trim()) {
      setError("Student name and email are required.");
      return;
    }

    setSavingStudentId(studentId);

    try {
      const response = await fetch(`${API_URL}/students/${studentId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update student.");
      }

      await refreshData();
      cancelEditingStudent();
      setSuccess("Student updated successfully!");
    } catch {
      setError("Unable to update student. Please try again.");
    } finally {
      setSavingStudentId(null);
    }
  }

  async function deleteStudent(student: Student) {
    const studentAssignments = assignments.filter(
      (assignment) => assignment.student === student.id
    );

    if (studentAssignments.length > 0) {
      setError(
        `Cannot delete ${student.name} while they have ${studentAssignments.length} assignment(s).`
      );
      setSuccess("");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${student.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingStudentId(student.id);

    try {
      const response = await fetch(`${API_URL}/students/${student.id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student.");
      }

      await refreshData();

      if (editingStudentId === student.id) {
        cancelEditingStudent();
      }

      setSuccess(`${student.name} deleted successfully!`);
    } catch {
      setError("Unable to delete student. Please try again.");
    } finally {
      setDeletingStudentId(null);
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
        headers: { "Content-Type": "application/json" },
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

      await refreshData();

      setAssignmentTitle("");
      setAssignmentStudent("");
      setAssignmentDueDate("");
      setAssignmentStatus("Pending");
      setSuccess("Assignment added successfully!");
    } catch {
      setError("Unable to add assignment. Please try again.");
    }
  }

  function startEditingAssignment(assignment: Assignment) {
    setEditingAssignmentId(assignment.id);
    setEditAssignmentTitle(assignment.title);
    setEditAssignmentStudent(String(assignment.student));
    setEditAssignmentDueDate(assignment.due_date);
    setEditAssignmentStatus(assignment.status);
    setError("");
    setSuccess("");
  }

  function cancelEditingAssignment() {
    setEditingAssignmentId(null);
    setEditAssignmentTitle("");
    setEditAssignmentStudent("");
    setEditAssignmentDueDate("");
    setEditAssignmentStatus("Pending");
  }

  async function saveAssignment(assignmentId: number) {
    setError("");
    setSuccess("");

    if (
      !editAssignmentTitle.trim() ||
      !editAssignmentStudent ||
      !editAssignmentDueDate
    ) {
      setError("Complete all assignment fields before saving.");
      return;
    }

    setSavingAssignmentId(assignmentId);

    try {
      const response = await fetch(`${API_URL}/assignments/${assignmentId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editAssignmentTitle.trim(),
          student: Number(editAssignmentStudent),
          due_date: editAssignmentDueDate,
          status: editAssignmentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update assignment.");
      }

      await refreshData();
      cancelEditingAssignment();
      setSuccess("Assignment updated successfully!");
    } catch {
      setError("Unable to update assignment. Please try again.");
    } finally {
      setSavingAssignmentId(null);
    }
  }

  async function deleteAssignment(assignment: Assignment) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${assignment.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingAssignmentId(assignment.id);

    try {
      const response = await fetch(`${API_URL}/assignments/${assignment.id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete assignment.");
      }

      await refreshData();

      if (editingAssignmentId === assignment.id) {
        cancelEditingAssignment();
      }

      setSuccess("Assignment deleted successfully!");
    } catch {
      setError("Unable to delete assignment. Please try again.");
    } finally {
      setDeletingAssignmentId(null);
    }
  }

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

      await refreshData();
      setSuccess("Assignment status updated successfully!");
    } catch {
      setError("Unable to update assignment status. Please try again.");
    } finally {
      setSavingAssignmentId(null);
    }
  }

  function getStudentProgress(studentId: number) {
    const studentAssignments = assignments.filter(
      (assignment) => assignment.student === studentId
    );

    const total = studentAssignments.length;

    const completed = studentAssignments.filter(
      (assignment) => assignment.status === "Completed"
    ).length;

    const percentage =
      total === 0 ? 0 : Math.round((completed / total) * 100);

    const status =
      total === 0
        ? "Not Started"
        : completed === total
        ? "Completed"
        : "In Progress";

    return { total, completed, percentage, status };
  }

  function exportProgressCSV() {
    const headers = [
      "Student ID",
      "Student Name",
      "Student Email",
      "Assignment ID",
      "Assignment Title",
      "Due Date",
      "Assignment Status",
      "Completed Assignments",
      "Total Assignments",
      "Completion Percentage",
      "Progress Status",
    ];

    function escapeCSV(value: string | number) {
      const text = String(value);
      const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
      return `"${safeText.replace(/"/g, '""')}"`;
    }

    const rows: (string | number)[][] = [];

    filteredProgressStudents.forEach((student) => {
      const progress = getStudentProgress(student.id);

      const studentAssignments = assignments.filter(
        (assignment) => assignment.student === student.id
      );

      if (studentAssignments.length === 0) {
        rows.push([
          student.id,
          student.name,
          student.email,
          "",
          "",
          "",
          "",
          progress.completed,
          progress.total,
          progress.percentage,
          progress.status,
        ]);
      } else {
        studentAssignments.forEach((assignment) => {
          rows.push([
            student.id,
            student.name,
            student.email,
            assignment.id,
            assignment.title,
            assignment.due_date,
            assignment.status,
            progress.completed,
            progress.total,
            progress.percentage,
            progress.status,
          ]);
        });
      }
    });

    if (rows.length === 0) {
      setError("There are no student records to export.");
      setSuccess("");
      return;
    }

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `squareone-student-progress-${today}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setError("");
    setSuccess("Student progress report exported successfully!");
  }

  const completedTasks = assignments.filter(
    (assignment) => assignment.status === "Completed"
  ).length;

  const pendingTasks = assignments.filter(
    (assignment) => assignment.status === "Pending"
  ).length;

  const completionRate =
    assignments.length === 0
      ? 0
      : Math.round((completedTasks / assignments.length) * 100);

  const currentDate = new Date();

  const today = [
    currentDate.getFullYear(),
    String(currentDate.getMonth() + 1).padStart(2, "0"),
    String(currentDate.getDate()).padStart(2, "0"),
  ].join("-");

  const overdueAssignments = assignments.filter(
    (assignment) =>
      assignment.status !== "Completed" &&
      assignment.due_date < today
  );

  const upcomingAssignments = assignments
    .filter(
      (assignment) =>
        assignment.status !== "Completed" &&
        assignment.due_date >= today
    )
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.email}`
      .toLowerCase()
      .includes(studentSearch.trim().toLowerCase())
  );

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      `${assignment.title} ${assignment.student_name}`
        .toLowerCase()
        .includes(assignmentSearch.trim().toLowerCase());

    const matchesStatus =
      assignmentFilter === "All" ||
      assignment.status === assignmentFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredProgressStudents = students.filter((student) => {
    const progress = getStudentProgress(student.id);

    const matchesSearch =
      `${student.name} ${student.email}`
        .toLowerCase()
        .includes(progressSearch.trim().toLowerCase());

    const matchesFilter =
      progressFilter === "All" ||
      progress.status === progressFilter;

    return matchesSearch && matchesFilter;
  });

  function progressBarStyle(percentage: number) {
    return {
      width: `${percentage}%`,
      height: "100%",
      backgroundColor:
        percentage === 100
          ? "#23834a"
          : percentage >= 50
          ? "#2874c7"
          : "#e4a11b",
      borderRadius: "8px",
      transition: "width 0.3s ease",
    };
  }

  function statusColor(status: string) {
    if (status === "Completed") return "#23834a";
    if (status === "In Progress") return "#2874c7";
    return "#a16b11";
  }

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
        <h1>{page === "Dashboard" ? "Staff Dashboard" : page}</h1>

        <p className="subtitle">
          SquareOne Student Progress Management
        </p>

        {error && (
          <p role="alert" style={{ color: "#c62828" }}>
            {error}
          </p>
        )}

        {success && (
          <p role="status" style={{ color: "#237a39" }}>
            {success}
          </p>
        )}

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

              <div className="stat-card">
                <h3>Completion Rate</h3>
                <strong>{completionRate}%</strong>
              </div>

              <div className="stat-card">
                <h3>Overdue Tasks</h3>
                <strong>{overdueAssignments.length}</strong>
              </div>
            </div>

            <section className="panel">
              <h2>Overall Assignment Completion</h2>

              <p>
                {completedTasks} of {assignments.length} assignments completed
              </p>

              <div
                style={{
                  width: "100%",
                  height: "18px",
                  backgroundColor: "#e9edf2",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div style={progressBarStyle(completionRate)} />
              </div>

              <p style={{ fontWeight: "bold" }}>
                {completionRate}% Complete
              </p>
            </section>

            <section className="panel">
              <h2>Student Progress Overview</h2>

              {students.length === 0 ? (
                <p>No students available.</p>
              ) : (
                students.map((student) => {
                  const progress = getStudentProgress(student.id);

                  return (
                    <div
                      key={student.id}
                      style={{ marginBottom: "22px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <strong>{student.name}</strong>
                        <span>{progress.percentage}%</span>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: "12px",
                          backgroundColor: "#e9edf2",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <div style={progressBarStyle(progress.percentage)} />
                      </div>

                      <p
                        style={{
                          color: "#777",
                          fontSize: "13px",
                          marginTop: "6px",
                        }}
                      >
                        {progress.completed} of {progress.total} completed
                        {" | "}
                        {progress.status}
                      </p>
                    </div>
                  );
                })
              )}
            </section>

            <section className="panel">
              <h2>Upcoming Deadlines</h2>

              {upcomingAssignments.length === 0 ? (
                <p>No upcoming incomplete assignments.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Student</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {upcomingAssignments.map((assignment) => (
                        <tr key={assignment.id}>
                          <td>{assignment.title}</td>
                          <td>{assignment.student_name}</td>
                          <td>{assignment.due_date}</td>
                          <td>{assignment.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="panel">
              <h2>Overdue Assignments</h2>

              {overdueAssignments.length === 0 ? (
                <p>No overdue assignments.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Student</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {overdueAssignments.map((assignment) => (
                        <tr key={assignment.id}>
                          <td>{assignment.title}</td>
                          <td>{assignment.student_name}</td>
                          <td>{assignment.due_date}</td>
                          <td style={{ color: "#c62828" }}>
                            {assignment.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="panel">
              <h2>Recent Activity</h2>

              {assignments.length === 0 ? (
                <p>No recent activity.</p>
              ) : (
                assignments.slice(-5).reverse().map((assignment) => (
                  <p key={assignment.id}>
                    {assignment.student_name}: {assignment.title} (
                    {assignment.status})
                  </p>
                ))
              )}
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
                  onChange={(event) => setNewName(event.target.value)}
                  required
                />

                <input
                  type="email"
                  placeholder="Student Email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  required
                />

                <button type="submit">Add Student</button>
              </form>
            </section>

            <section className="panel">
              <h2>Student List</h2>

              <input
                type="search"
                placeholder="Search students by name or email"
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "20px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                  backgroundColor: "#fff",
                  color: "#222",
                }}
              />

              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Progress</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((student) => {
                      const progress = getStudentProgress(student.id);
                      const isEditing = editingStudentId === student.id;
                      const isSaving = savingStudentId === student.id;
                      const isDeleting = deletingStudentId === student.id;

                      return (
                        <tr key={student.id}>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                aria-label="Edit student name"
                                value={editName}
                                onChange={(event) =>
                                  setEditName(event.target.value)
                                }
                                required
                              />
                            ) : (
                              student.name
                            )}
                          </td>

                          <td>
                            {isEditing ? (
                              <input
                                type="email"
                                aria-label="Edit student email"
                                value={editEmail}
                                onChange={(event) =>
                                  setEditEmail(event.target.value)
                                }
                                required
                              />
                            ) : (
                              student.email
                            )}
                          </td>

                          <td>{progress.percentage}%</td>
                          <td>{progress.status}</td>

                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => saveStudent(student.id)}
                                  >
                                    {isSaving ? "Saving..." : "Save"}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={cancelEditingStudent}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled={
                                      editingStudentId !== null ||
                                      deletingStudentId !== null
                                    }
                                    onClick={() =>
                                      startEditingStudent(student)
                                    }
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      editingStudentId !== null ||
                                      deletingStudentId !== null
                                    }
                                    onClick={() => deleteStudent(student)}
                                    style={{ color: "#b42318" }}
                                  >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length === 0 && (
                <p>No students found.</p>
              )}
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

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="search"
                  placeholder="Search by assignment or student"
                  aria-label="Search assignments"
                  value={assignmentSearch}
                  onChange={(event) =>
                    setAssignmentSearch(event.target.value)
                  }
                  style={{
                    flex: "1 1 250px",
                    minWidth: "200px",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                    backgroundColor: "#fff",
                    color: "#222",
                  }}
                />

                <select
                  aria-label="Filter assignments by status"
                  value={assignmentFilter}
                  onChange={(event) =>
                    setAssignmentFilter(event.target.value)
                  }
                  style={{
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    color: "#222",
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <p>
                Showing {filteredAssignments.length} of{" "}
                {assignments.length} assignments
              </p>

              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Assigned To</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAssignments.map((assignment) => {
                      const isEditing =
                        editingAssignmentId === assignment.id;

                      const isSaving =
                        savingAssignmentId === assignment.id;

                      const isDeleting =
                        deletingAssignmentId === assignment.id;

                      return (
                        <tr key={assignment.id}>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                aria-label="Edit assignment title"
                                value={editAssignmentTitle}
                                onChange={(event) =>
                                  setEditAssignmentTitle(event.target.value)
                                }
                              />
                            ) : (
                              assignment.title
                            )}
                          </td>

                          <td>
                            {isEditing ? (
                              <select
                                aria-label="Edit assigned student"
                                value={editAssignmentStudent}
                                onChange={(event) =>
                                  setEditAssignmentStudent(event.target.value)
                                }
                              >
                                {students.map((student) => (
                                  <option
                                    key={student.id}
                                    value={student.id}
                                  >
                                    {student.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              assignment.student_name
                            )}
                          </td>

                          <td>
                            {isEditing ? (
                              <input
                                type="date"
                                aria-label="Edit assignment due date"
                                value={editAssignmentDueDate}
                                onChange={(event) =>
                                  setEditAssignmentDueDate(event.target.value)
                                }
                              />
                            ) : (
                              assignment.due_date
                            )}
                          </td>

                          <td>
                            <select
                              aria-label={`Status for ${assignment.title}`}
                              value={
                                isEditing
                                  ? editAssignmentStatus
                                  : assignment.status
                              }
                              disabled={!isEditing && isSaving}
                              onChange={(event) => {
                                if (isEditing) {
                                  setEditAssignmentStatus(event.target.value);
                                } else {
                                  updateAssignmentStatus(
                                    assignment.id,
                                    event.target.value
                                  );
                                }
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>

                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() =>
                                      saveAssignment(assignment.id)
                                    }
                                  >
                                    {isSaving ? "Saving..." : "Save"}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={cancelEditingAssignment}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled={
                                      editingAssignmentId !== null ||
                                      deletingAssignmentId !== null ||
                                      savingAssignmentId !== null
                                    }
                                    onClick={() =>
                                      startEditingAssignment(assignment)
                                    }
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      editingAssignmentId !== null ||
                                      deletingAssignmentId !== null ||
                                      savingAssignmentId !== null
                                    }
                                    onClick={() =>
                                      deleteAssignment(assignment)
                                    }
                                    style={{ color: "#b42318" }}
                                  >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredAssignments.length === 0 && (
                <p>No assignments match your search or filter.</p>
              )}
            </section>
          </>
        )}

        {page === "Progress" && (
          <>
            <section className="panel">
              <h2>Student Progress Details</h2>

              <p>
                Monitor each student's assignments, completion rate,
                and outstanding work.
              </p>

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
                  placeholder="Search students by name or email"
                  aria-label="Search student progress"
                  value={progressSearch}
                  onChange={(event) =>
                    setProgressSearch(event.target.value)
                  }
                  style={{
                    flex: "1 1 250px",
                    minWidth: "200px",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    color: "#222",
                  }}
                />

                <select
                  aria-label="Filter students by progress"
                  value={progressFilter}
                  onChange={(event) =>
                    setProgressFilter(event.target.value)
                  }
                  style={{
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    color: "#222",
                  }}
                >
                  <option value="All">All Progress</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <p>
                Showing {filteredProgressStudents.length} of{" "}
                {students.length} students
              </p>

              <button
                type="button"
                onClick={exportProgressCSV}
                style={{
                  backgroundColor: "#23834a",
                  color: "#fff",
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Export Progress Report (CSV)
              </button>

              <p style={{ color: "#777", fontSize: "13px" }}>
                The report includes the students currently matching
                your search and progress filter.
              </p>
            </section>

            {filteredProgressStudents.map((student) => {
              const progress = getStudentProgress(student.id);

              const studentAssignments = assignments
                .filter(
                  (assignment) => assignment.student === student.id
                )
                .sort((a, b) =>
                  a.due_date.localeCompare(b.due_date)
                );

              const isExpanded = expandedStudentId === student.id;

              return (
                <section className="panel" key={student.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <h2 style={{ marginBottom: "6px" }}>
                        {student.name}
                      </h2>
                      <p style={{ color: "#777" }}>
                        {student.email}
                      </p>
                    </div>

                    <span
                      style={{
                        color: statusColor(progress.status),
                        fontWeight: "bold",
                        padding: "8px 12px",
                        backgroundColor: "#f5f6f8",
                        borderRadius: "6px",
                      }}
                    >
                      {progress.status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>Assignment Completion</strong>
                    <strong>{progress.percentage}%</strong>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "14px",
                      backgroundColor: "#e9edf2",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={progressBarStyle(progress.percentage)}
                    />
                  </div>

                  <p style={{ marginTop: "12px" }}>
                    {progress.completed} of {progress.total} assignments
                    completed
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedStudentId(
                        isExpanded ? null : student.id
                      )
                    }
                    aria-expanded={isExpanded}
                  >
                    {isExpanded
                      ? "Hide Assignments"
                      : "View Assignments"}
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: "20px" }}>
                      <h3>Assignment Breakdown</h3>

                      {studentAssignments.length === 0 ? (
                        <p>
                          No assignments have been assigned to this
                          student yet.
                        </p>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table>
                            <thead>
                              <tr>
                                <th>Assignment</th>
                                <th>Due Date</th>
                                <th>Status</th>
                              </tr>
                            </thead>

                            <tbody>
                              {studentAssignments.map((assignment) => {
                                const isOverdue =
                                  assignment.status !== "Completed" &&
                                  assignment.due_date < today;

                                return (
                                  <tr key={assignment.id}>
                                    <td>{assignment.title}</td>
                                    <td>{assignment.due_date}</td>
                                    <td>
                                      <span
                                        style={{
                                          color: isOverdue
                                            ? "#c62828"
                                            : statusColor(assignment.status),
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {assignment.status}
                                        {isOverdue ? " (Overdue)" : ""}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}

            {filteredProgressStudents.length === 0 && (
              <section className="panel">
                <p>No students match your search or progress filter.</p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
