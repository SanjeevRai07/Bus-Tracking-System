"use client";

import { useState } from "react";

interface Student {
  id: number;
  name: string;
  enrollment: string;
  course: string;
  year: string;
  bus: string;
  stop: string;
  status: "Active" | "Inactive";
}

const emptyForm = {
  name: "",
  enrollment: "",
  course: "",
  year: "",
  bus: "",
  stop: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Rahul Kumar",
      enrollment: "AJU2026001",
      course: "B.Tech CSE",
      year: "3rd Year",
      bus: "AJU Bus 01",
      stop: "Adityapur",
      status: "Active",
    },
    {
      id: 2,
      name: "Priya Singh",
      enrollment: "AJU2026002",
      course: "B.Tech CSE",
      year: "2nd Year",
      bus: "AJU Bus 01",
      stop: "Gamharia",
      status: "Active",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(student: Student) {
    setEditingId(student.id);

    setForm({
      name: student.name,
      enrollment: student.enrollment,
      course: student.course,
      year: student.year,
      bus: student.bus,
      stop: student.stop,
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function saveStudent() {
    if (
      !form.name.trim() ||
      !form.enrollment.trim() ||
      !form.course.trim() ||
      !form.year.trim() ||
      !form.bus.trim() ||
      !form.stop.trim()
    ) {
      setError("Please fill all fields before saving.");
      return;
    }

    if (editingId !== null) {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingId
            ? {
                ...student,
                name: form.name,
                enrollment: form.enrollment,
                course: form.course,
                year: form.year,
                bus: form.bus,
                stop: form.stop,
              }
            : student
        )
      );

      closeForm();
      return;
    }

    const newStudent: Student = {
      id: Date.now(),
      name: form.name,
      enrollment: form.enrollment,
      course: form.course,
      year: form.year,
      bus: form.bus,
      stop: form.stop,
      status: "Active",
    };

    setStudents((prev) => [...prev, newStudent]);
    closeForm();
  }

  function deleteStudent(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    setStudents((prev) =>
      prev.filter((student) => student.id !== id)
    );
  }

  function toggleStatus(id: number) {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? {
              ...student,
              status:
                student.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : student
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-8">

      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#005BAC]">
            Student Management
          </h1>

          <p className="mt-2 text-lg text-slate-600">
            Manage students and their bus assignments.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-[#005BAC] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
        >
          + Add New Student
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Students
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#005BAC]">
            {students.length}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Registered students
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Students
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {
              students.filter(
                (student) => student.status === "Active"
              ).length
            }
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Currently active
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Assigned Students
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {
              students.filter(
                (student) => student.bus.trim() !== ""
              ).length
            }
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Assigned to buses
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Bus Stops
          </p>

          <h2 className="mt-2 text-3xl font-bold text-purple-600">
            {
              new Set(
                students.map((student) => student.stop)
              ).size
            }
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Registered stops
          </p>
        </div>

      </div>

      {/* STUDENT TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-2xl font-bold text-[#005BAC]">
            All Students
          </h2>

          <p className="mt-1 text-slate-500">
            View and manage registered students.
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead className="bg-slate-50">

              <tr className="text-left text-sm text-slate-500">

                <th className="px-6 py-4">
                  Student
                </th>

                <th className="px-6 py-4">
                  Enrollment
                </th>

                <th className="px-6 py-4">
                  Course
                </th>

                <th className="px-6 py-4">
                  Year
                </th>

                <th className="px-6 py-4">
                  Bus
                </th>

                <th className="px-6 py-4">
                  Stop
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {students.map((student) => (

                <tr
                  key={student.id}
                  className="border-t border-slate-100 transition hover:bg-slate-50"
                >

                  {/* STUDENT */}

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                        🎓
                      </div>

                      <div>
                        <p className="font-bold text-slate-800">
                          {student.name}
                        </p>

                        <p className="text-sm text-slate-400">
                          Student
                        </p>
                      </div>

                    </div>

                  </td>

                  {/* ENROLLMENT */}

                  <td className="px-6 py-5 font-medium text-slate-700">
                    {student.enrollment}
                  </td>

                  {/* COURSE */}

                  <td className="px-6 py-5 text-slate-700">
                    {student.course}
                  </td>

                  {/* YEAR */}

                  <td className="px-6 py-5 text-slate-700">
                    {student.year}
                  </td>

                  {/* BUS */}

                  <td className="px-6 py-5 font-medium text-[#005BAC]">
                    🚌 {student.bus}
                  </td>

                  {/* STOP */}

                  <td className="px-6 py-5 text-slate-700">
                    📍 {student.stop}
                  </td>

                  {/* STATUS */}

                  <td className="px-6 py-5">

                    <button
                      onClick={() =>
                        toggleStatus(student.id)
                      }
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        student.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      ● {student.status}
                    </button>

                  </td>

                  {/* ACTIONS */}

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2">

                      <button
                        onClick={() =>
                          openEditForm(student)
                        }
                        className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteStudent(student.id)
                        }
                        className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {students.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500">
            No students registered yet.
          </div>
        )}

      </div>

      {/* ADD / EDIT MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">

              <div>
                <h2 className="text-2xl font-bold text-[#005BAC]">
                  {editingId !== null
                    ? "Edit Student"
                    : "Add New Student"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter student information below.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="text-2xl font-semibold text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4">

              {/* NAME */}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Student Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={form.name}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ENROLLMENT */}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Enrollment Number
                </label>

                <input
                  type="text"
                  placeholder="e.g. AJU2026001"
                  value={form.enrollment}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      enrollment: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* COURSE */}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Course
                </label>

                <input
                  type="text"
                  placeholder="e.g. B.Tech CSE"
                  value={form.course}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      course: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* YEAR */}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Year
                </label>

                <select
                  value={form.year}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      year: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select Year
                  </option>
                  <option value="1st Year">
                    1st Year
                  </option>
                  <option value="2nd Year">
                    2nd Year
                  </option>
                  <option value="3rd Year">
                    3rd Year
                  </option>
                  <option value="4th Year">
                    4th Year
                  </option>
                </select>
              </div>

              {/* BUS */}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Assigned Bus
                </label>

                <input
                  type="text"
                  placeholder="e.g. AJU Bus 01"
                  value={form.bus}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      bus: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* STOP */}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Bus Stop
                </label>

                <input
                  type="text"
                  placeholder="e.g. Adityapur"
                  value={form.stop}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      stop: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  onClick={closeForm}
                  className="w-1/3 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveStudent}
                  className="w-2/3 rounded-xl bg-[#005BAC] px-5 py-3 font-semibold text-white shadow-md hover:bg-blue-700"
                >
                  {editingId !== null
                    ? "Save Changes"
                    : "Add Student"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}