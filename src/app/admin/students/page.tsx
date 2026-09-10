"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type StudentRecord = {
  [key: string]: unknown;
};

function stringValue(
  student: StudentRecord,
  keys: string[]
): string {
  for (const key of keys) {
    const value = student[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }
  }

  return "";
}

function getStudentName(student: StudentRecord) {
  return (
    stringValue(student, [
      "full_name",
      "name",
      "student_name",
      "studentName",
      "fullName",
    ]) || "Unnamed Student"
  );
}

function getStudentEmail(student: StudentRecord) {
  return stringValue(student, [
    "email",
    "student_email",
    "studentEmail",
  ]);
}

function getStudentPhone(student: StudentRecord) {
  return stringValue(student, [
    "phone",
    "mobile",
    "phone_number",
    "contact",
    "contact_number",
  ]);
}

function getRollNumber(student: StudentRecord) {
  return stringValue(student, [
    "roll_number",
    "roll_no",
    "roll",
    "enrollment_no",
    "enrollment_number",
    "registration_no",
    "registration_number",
  ]);
}

function getCourse(student: StudentRecord) {
  return stringValue(student, [
    "course",
    "program",
    "branch",
    "department",
  ]);
}

function getYear(student: StudentRecord) {
  return stringValue(student, [
    "year",
    "academic_year",
    "study_year",
  ]);
}

function getSemester(student: StudentRecord) {
  return stringValue(student, [
    "semester",
    "sem",
  ]);
}

function getStudentId(student: StudentRecord) {
  return stringValue(student, [
    "id",
    "student_id",
  ]);
}

export default function AdminStudentsPage() {
  const router = useRouter();

  const requestInFlightRef =
    useRef(false);

  const [students, setStudents] =
    useState<StudentRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedStudent, setSelectedStudent] =
    useState<StudentRecord | null>(null);

  async function loadData() {
    if (requestInFlightRef.current) {
      return;
    }

    requestInFlightRef.current = true;

    try {
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(
          `Authentication error: ${authError.message}`
        );
      }

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      /*
       * IMPORTANT:
       * Use select("*") here because the exact student-column
       * names can vary between project versions.
       *
       * The page safely reads the common names through helpers
       * below instead of hard-coding one schema.
       */
      const {
        data,
        error: studentsError,
      } = await supabase
        .from("students")
        .select("*");

      if (studentsError) {
        throw new Error(
          `Students query failed: ${studentsError.message}`
        );
      }

      setStudents(
        (data ?? []) as StudentRecord[]
      );
    } catch (err) {
      console.error(
        "Admin students page error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load students."
      );
    } finally {
      setLoading(false);
      requestInFlightRef.current = false;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      await loadData();

      if (!mounted) {
        return;
      }
    }

    initialize();

    /*
     * Keep the page fresh without creating
     * overlapping Supabase requests.
     */
    const pollTimer =
      window.setInterval(() => {
        loadData();
      }, 10000);

    return () => {
      mounted = false;
      window.clearInterval(pollTimer);
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(
        "Admin logout error:",
        err
      );
    } finally {
      router.replace("/admin/login");
    }
  }

  const filteredStudents = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter(
      (student) => {
        const searchableText = [
          getStudentName(student),
          getStudentEmail(student),
          getStudentPhone(student),
          getRollNumber(student),
          getCourse(student),
          getYear(student),
          getSemester(student),
          getStudentId(student),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          query
        );
      }
    );
  }, [students, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-7 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-[#005BAC]">
              AJU SMART BUS
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Student Management
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 md:text-base">
              View and manage registered university
              students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
              System Online
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={
                refreshing ||
                loading
              }
              className="
                rounded-xl
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                text-slate-700
                shadow-sm
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-2.5
                text-sm
                font-bold
                text-red-600
                transition
                hover:bg-red-100
              "
            >
              Logout
            </button>
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="
              mb-6
              rounded-2xl
              border
              border-red-200
              bg-red-50
              px-5
              py-4
            "
          >
            <p className="font-black text-red-700">
              Unable to load students
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* ====================================================
            STATS
        ==================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-50
                  text-2xl
                "
              >
                🎓
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#005BAC]">
                REGISTERED
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-400">
              Total Students
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading
                ? "—"
                : students.length}
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-50
                  text-2xl
                "
              >
                🔎
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                RESULTS
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-400">
              Matching Students
            </p>

            <p className="mt-1 text-3xl font-black text-emerald-600">
              {loading
                ? "—"
                : filteredStudents.length}
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-violet-50
                  text-2xl
                "
              >
                ⚡
              </div>

              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                LIVE
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-400">
              Database Status
            </p>

            <p className="mt-1 text-3xl font-black text-violet-600">
              {error
                ? "ERROR"
                : "READY"}
            </p>
          </div>
        </div>

        {/* ====================================================
            SEARCH + TABLE
        ==================================================== */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              border-b
              border-slate-100
              px-6
              py-6
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                All Students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search registered students by name,
                email, phone, roll number or course.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <div className="relative">
                <span
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-lg
                    text-slate-400
                  "
                >
                  🔎
                </span>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search students..."
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    py-3
                    pl-11
                    pr-4
                    text-sm
                    font-medium
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-[#005BAC]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />
              </div>
            </div>
          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl border border-slate-100 p-5"
                    >
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-200" />

                        <div className="flex-1">
                          <div className="h-4 w-40 rounded bg-slate-200" />

                          <div className="mt-3 h-3 w-64 rounded bg-slate-100" />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            /* ==================================================
               EMPTY
            ================================================== */

            <div className="px-6 py-16 text-center">
              <div
                className="
                  mx-auto
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-3xl
                  bg-blue-50
                  text-4xl
                "
              >
                🎓
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-800">
                {searchQuery
                  ? "No matching students"
                  : "No students found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {searchQuery
                  ? "Try a different name, email, phone number or roll number."
                  : "There are currently no student records available in the students table."}
              </p>
            </div>
          ) : (
            /* ==================================================
               TABLE
            ================================================== */

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">
                      Student
                    </th>

                    <th className="px-6 py-4">
                      Roll Number
                    </th>

                    <th className="px-6 py-4">
                      Email
                    </th>

                    <th className="px-6 py-4">
                      Phone
                    </th>

                    <th className="px-6 py-4">
                      Course
                    </th>

                    <th className="px-6 py-4">
                      Year / Semester
                    </th>

                    <th className="px-6 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map(
                    (student, index) => {
                      const name =
                        getStudentName(
                          student
                        );

                      const email =
                        getStudentEmail(
                          student
                        );

                      const phone =
                        getStudentPhone(
                          student
                        );

                      const roll =
                        getRollNumber(
                          student
                        );

                      const course =
                        getCourse(
                          student
                        );

                      const year =
                        getYear(
                          student
                        );

                      const semester =
                        getSemester(
                          student
                        );

                      const id =
                        getStudentId(
                          student
                        );

                      return (
                        <tr
                          key={
                            id ||
                            `${name}-${index}`
                          }
                          className="
                            border-t
                            border-slate-100
                            transition
                            hover:bg-blue-50/40
                          "
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div
                                className="
                                  flex
                                  h-12
                                  w-12
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-2xl
                                  bg-gradient-to-br
                                  from-blue-50
                                  to-cyan-50
                                  text-xl
                                  font-black
                                  text-[#005BAC]
                                "
                              >
                                {name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-black text-slate-800">
                                  {name}
                                </p>

                                {id && (
                                  <p className="mt-1 text-xs font-medium text-slate-400">
                                    ID: {id}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-[#005BAC]">
                              {roll ||
                                "—"}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span className="text-sm font-semibold text-slate-700">
                              {email ||
                                "—"}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span className="text-sm font-semibold text-slate-700">
                              {phone ||
                                "—"}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span className="text-sm font-semibold text-slate-700">
                              {course ||
                                "—"}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              {year && (
                                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                                  Year{" "}
                                  {year}
                                </span>
                              )}

                              {semester && (
                                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                                  Sem{" "}
                                  {semester}
                                </span>
                              )}

                              {!year &&
                                !semester && (
                                  <span className="text-sm font-semibold text-slate-400">
                                    —
                                  </span>
                                )}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedStudent(
                                  student
                                )
                              }
                              className="
                                rounded-xl
                                bg-blue-50
                                px-4
                                py-2.5
                                text-sm
                                font-bold
                                text-[#005BAC]
                                transition
                                hover:bg-blue-100
                              "
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ======================================================
          STUDENT DETAIL MODAL
      ====================================================== */}

      {selectedStudent && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-slate-950/50
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedStudent(null);
            }
          }}
        >
          <div
            className="
              w-full
              max-w-2xl
              overflow-hidden
              rounded-3xl
              bg-white
              shadow-2xl
            "
          >
            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-start
                justify-between
                bg-gradient-to-r
                from-[#005BAC]
                to-[#0878d1]
                px-6
                py-6
                text-white
              "
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                  Student Profile
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {getStudentName(
                    selectedStudent
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedStudent(null)
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/10
                  text-xl
                  font-bold
                  transition
                  hover:bg-white/20
                "
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Name
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {getStudentName(
                    selectedStudent
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Student ID
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {getStudentId(
                    selectedStudent
                  ) || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Roll Number
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {getRollNumber(
                    selectedStudent
                  ) || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all font-black text-slate-800">
                  {getStudentEmail(
                    selectedStudent
                  ) || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Phone
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {getStudentPhone(
                    selectedStudent
                  ) || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Course
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {getCourse(
                    selectedStudent
                  ) || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Year
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {getYear(
                    selectedStudent
                  ) || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Semester
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {getSemester(
                    selectedStudent
                  ) || "—"}
                </p>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end border-t border-slate-100 px-6 py-5">
              <button
                type="button"
                onClick={() =>
                  setSelectedStudent(null)
                }
                className="
                  rounded-xl
                  bg-[#005BAC]
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-blue-700
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
