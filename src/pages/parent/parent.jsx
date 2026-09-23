import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  FaPlus,
  FaSearch,
  FaPen,
  FaTrash,
  FaTimes,
  FaUserTie,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUser,
  FaLock,
  FaSyncAlt,
  FaGraduationCap,
  FaCheck,
  FaEye,
  FaUserPlus,
  FaUserMinus,
  FaBars,
} from "react-icons/fa";

import * as PhoneInputModule from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const PhoneInput =
  typeof PhoneInputModule?.default === "function"
    ? PhoneInputModule.default
    : typeof PhoneInputModule === "function"
    ? PhoneInputModule
    : PhoneInputModule?.default?.default;

import Sidebar from "../admin/Sidebar.jsx";

import "./parent.css";

const API_URL = "https://zyntaweb.com/skilllab/parent.php";

export default function Parents() {

  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [studentLoading, setStudentLoading] = useState(false);

  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [viewingParent, setViewingParent] = useState(null);
  const [viewStudents, setViewStudents] = useState([]);
  const [viewStudentSearch, setViewStudentSearch] = useState("");

  const emptyForm = {
    name: "",
    address: "",
    phone: "",
    email: "",
    username: "",
    password: "",
  };

  const [form, setForm] = useState(emptyForm);


  /* =========================================
     ADMIN
  ========================================= */

  const getAdmin = () => {

    try {

      const saved =
        localStorage.getItem("admin");

      return saved
        ? JSON.parse(saved)
        : null;

    } catch {

      return null;

    }
  };


  /* =========================================
     LOAD PARENTS
  ========================================= */

  const loadParents = async () => {

    setLoading(true);

    try {

      const admin = getAdmin();

      if (!admin?.email) {

        alert("Admin login required.");

        return;
      }


      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "list",
            admin_email: admin.email,
          }),
        }
      );


      const data =
        await response.json();


      if (!data.success) {

        throw new Error(
          data.message ||
          "Unable to load parents."
        );
      }


      setParents(
        Array.isArray(data.parents)
          ? data.parents
          : []
      );

    } catch (error) {

      console.error(
        "Parent list error:",
        error
      );

      alert(
        error.message ||
        "Unable to load parents."
      );

    } finally {

      setLoading(false);

    }
  };


  /* =========================================
     LOAD STUDENTS
  ========================================= */

  const loadStudents = async () => {

    setStudentLoading(true);

    try {

      const admin = getAdmin();

      if (!admin?.email) {

        alert("Admin login required.");

        return;
      }


      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "students",
            admin_email: admin.email,
          }),
        }
      );


      const data =
        await response.json();


      if (!data.success) {

        throw new Error(
          data.message ||
          "Unable to load students."
        );
      }


      setStudents(
        Array.isArray(data.students)
          ? data.students
          : []
      );

    } catch (error) {

      console.error(
        "Student list error:",
        error
      );

      alert(
        error.message ||
        "Unable to load students."
      );

    } finally {

      setStudentLoading(false);

    }
  };


  /* =========================================
     FILTER STUDENTS
  ========================================= */

  const filteredStudents = useMemo(() => {

    const value =
      studentSearch
        .trim()
        .toLowerCase();


    if (!value) {

      return students;

    }


    return students.filter(
      (student) =>

        [
          student.name,
          student.email,
        ].some((item) =>
          String(item || "")
            .toLowerCase()
            .includes(value)
        )
    );

  }, [
    students,
    studentSearch,
  ]);

  const filteredViewStudents = useMemo(() => {
    const value = viewStudentSearch.trim().toLowerCase();
    if (!value) return students;

    return students.filter((student) =>
      [student.name, student.email].some((item) =>
        String(item || "").toLowerCase().includes(value)
      )
    );
  }, [students, viewStudentSearch]);


  /* =========================================
     SELECT STUDENT
  ========================================= */

  const toggleStudent = (
    studentId
  ) => {

    setSelectedStudents(
      (prev) =>

        prev.includes(
          Number(studentId)
        )

          ? prev.filter(
              (id) =>
                id !==
                Number(studentId)
            )

          : [
              ...prev,
              Number(studentId),
            ]
    );
  };


  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {

    loadParents();

  }, []);


  /* =========================================
     FILTER PARENTS
  ========================================= */

  const filteredParents =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();


      if (!value) {

        return parents;

      }


      return parents.filter(
        (parent) =>

          [
            parent.name,
            parent.address,
            parent.phone,
            parent.email,
            parent.username,
          ].some((item) =>
            String(item || "")
              .toLowerCase()
              .includes(value)
          )
      );

    }, [
      parents,
      search,
    ]);


  /* =========================================
     ADD
  ========================================= */

  const openAdd = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    setEditingId(null);
    setForm({ ...emptyForm });
    setSelectedStudents([]);
    setStudentSearch("");
    setShowModal(true);

    // Load students after opening the modal.
    loadStudents();
  };


  /* =========================================
     EDIT
  ========================================= */

  const loadParentStudents = async (parentId) => {

    try {

      const admin = getAdmin();

      if (!admin?.email) {
        return;
      }

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action: "get_parent_students",
            admin_email: admin.email,
            parent_id: Number(parentId),
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
          "Unable to load assigned students."
        );
      }

      setSelectedStudents(
        (Array.isArray(data.students)
          ? data.students
          : []
        ).map((student) => Number(student.id))
      );

    } catch (error) {

      console.error(
        "Load parent students error:",
        error
      );

      setSelectedStudents([]);
    }
  };


  const openEdit = (
    parent,
    e
  ) => {

    e?.preventDefault();
    e?.stopPropagation();

    setEditingId(parent.id);

    setForm({
      name:
        parent.name || "",

      address:
        parent.address || "",

      phone:
        parent.phone || "",

      email:
        parent.email || "",

      username:
        parent.username || "",

      password: "",
    });

    setSelectedStudents([]);

    setStudentSearch("");

    setShowModal(true);

    loadStudents();
    loadParentStudents(parent.id);
  };


  /* =========================================
     CLOSE
  ========================================= */

  const closeModal = () => {

    if (saving) return;

    setShowModal(false);

    setEditingId(null);

    setForm(emptyForm);

    setSelectedStudents([]);

    setStudentSearch("");
  };


  /* =========================================
     FORM CHANGE
  ========================================= */

  const handleChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;


    setForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };


  /* =========================================
     PHONE CHANGE
  ========================================= */

  const handlePhoneChange = (
    value
  ) => {

    setForm(
      (prev) => ({
        ...prev,
        phone: value,
      })
    );
  };


  /* =========================================
     SAVE PARENT
  ========================================= */

  const saveParent = async (
    e
  ) => {

    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter parent name.");
      return;
    }

    if (!form.username.trim()) {
      alert("Please enter username.");
      return;
    }

    if (
      !editingId &&
      !form.password.trim()
    ) {
      alert("Please enter password.");
      return;
    }

    setSaving(true);

    try {

      const admin = getAdmin();

      if (!admin?.email) {
        throw new Error("Admin login required.");
      }

      /* =========================================
         SAVE PARENT
      ========================================= */

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action:
              editingId
                ? "update"
                : "create",

            admin_email:
              admin.email,

            id: editingId,

            name:
              form.name.trim(),

            address:
              form.address.trim(),

            phone:
              form.phone.trim(),

            email:
              form.email.trim(),

            username:
              form.username.trim(),

            password:
              form.password,
          }),
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
          "Unable to save parent."
        );
      }

      /* =========================================
         GET SAVED PARENT ID
      ========================================= */

      const savedParentId = Number(
        editingId || data.id
      );

      if (!savedParentId) {
        throw new Error(
          "Parent ID was not returned."
        );
      }

      /* =========================================
         SAVE SELECTED STUDENTS
      ========================================= */

      const studentResponse =
        await fetch(
          API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action:
                "save_parent_students",

              admin_email:
                admin.email,

              parent_id:
                savedParentId,

              student_ids:
                selectedStudents,
            }),
          }
        );

      const studentData =
        await studentResponse.json();

      if (!studentData.success) {
        throw new Error(
          studentData.message ||
          "Unable to save assigned students."
        );
      }

      alert(
        editingId
          ? "Parent updated successfully."
          : "Parent added successfully."
      );

      closeModal();

      await loadParents();

    } catch (error) {

      console.error(
        "Save parent error:",
        error
      );

      alert(
        error.message ||
        "Unable to save parent."
      );

    } finally {

      setSaving(false);
    }
  };


  /* =========================================
     VIEW / MANAGE STUDENTS
  ========================================= */

  const openStudentsView = async (parent, e) => {

    e?.preventDefault();
    e?.stopPropagation();

    setViewingParent(parent);
    setViewStudents([]);
    setViewStudentSearch("");
    setShowStudentsModal(true);

    await loadStudents();

    try {

      const admin = getAdmin();

      if (!admin?.email) {
        return;
      }

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action:
              "get_parent_students",

            admin_email:
              admin.email,

            parent_id:
              Number(parent.id),
          }),
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
          "Unable to load assigned students."
        );
      }

      setViewStudents(
        Array.isArray(data.students)
          ? data.students
          : []
      );

    } catch (error) {

      console.error(
        "View students error:",
        error
      );

      alert(
        error.message ||
        "Unable to load assigned students."
      );
    }
  };


  const closeStudentsView = () => {
    setShowStudentsModal(false);
    setViewingParent(null);
    setViewStudents([]);
    setViewStudentSearch("");
  };


  const saveStudentAssignments = async (
    parentId,
    studentList
  ) => {

    const admin = getAdmin();

    if (!admin?.email) {
      throw new Error(
        "Admin login required."
      );
    }

    const studentIds =
      studentList.map(
        (student) =>
          Number(student.id)
      );

    const response =
      await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action:
              "save_parent_students",

            admin_email:
              admin.email,

            parent_id:
              Number(parentId),

            student_ids:
              studentIds,
          }),
        }
      );

    const data =
      await response.json();

    if (!data.success) {
      throw new Error(
        data.message ||
        "Unable to save student assignments."
      );
    }

    return data;
  };


  const addStudentToParent = async (
    student
  ) => {

    if (!viewingParent) return;

    const exists =
      viewStudents.some(
        (item) =>
          Number(item.id) ===
          Number(student.id)
      );

    if (exists) return;

    const nextStudents = [
      ...viewStudents,
      student,
    ];

    try {

      await saveStudentAssignments(
        viewingParent.id,
        nextStudents
      );

      setViewStudents(nextStudents);

    } catch (error) {

      console.error(
        "Add student error:",
        error
      );

      alert(
        error.message ||
        "Unable to add student."
      );
    }
  };


  const removeStudentFromParent = async (
    studentId
  ) => {

    if (!viewingParent) return;

    const nextStudents =
      viewStudents.filter(
        (item) =>
          Number(item.id) !==
          Number(studentId)
      );

    try {

      await saveStudentAssignments(
        viewingParent.id,
        nextStudents
      );

      setViewStudents(nextStudents);

    } catch (error) {

      console.error(
        "Remove student error:",
        error
      );

      alert(
        error.message ||
        "Unable to remove student."
      );
    }
  };


  /* =========================================
     DELETE
  ========================================= */

  const deleteParent = async (
    id
  ) => {

    const parent =
      parents.find(
        (item) =>
          Number(item.id) ===
          Number(id)
      );


    const confirmed =
      window.confirm(
        `Delete ${
          parent?.name ||
          "this parent"
        }?`
      );


    if (!confirmed) return;


    try {

      const admin = getAdmin();


      const response =
        await fetch(
          API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action: "delete",

              admin_email:
                admin?.email || "",

              id,
            }),
          }
        );


      const data =
        await response.json();


      if (!data.success) {

        throw new Error(
          data.message ||
          "Unable to delete parent."
        );
      }


      await loadParents();

    } catch (error) {

      console.error(
        "Delete parent error:",
        error
      );

      alert(
        error.message ||
        "Unable to delete parent."
      );
    }
  };


  /* =========================================
     UI
  ========================================= */

  return (
    <div className="admin-dashboard parent-admin-dashboard">

      <Sidebar />

      <main className="admin-main">

        {/* SAME TOPBAR MODEL AS ADMIN DASHBOARD / ALL STUDENTS */}
        <header className="admin-topbar">

          <div className="admin-topbar-left">

            <button
              type="button"
              className="mobile-menu-button"
              aria-label="Open menu"
              onClick={() => {
                const sidebarButton = document.querySelector(
                  ".mobile-sidebar-menu"
                );

                if (sidebarButton) {
                  sidebarButton.click();
                }
              }}
            >
              <FaBars />
            </button>

            <div>
              <h1>Parents</h1>

              <p>
                Manage parent accounts and contact details.
              </p>
            </div>

          </div>

          <div className="admin-profile">
            <div className="admin-profile-info">
              <strong>Welcome Admin</strong>
            </div>
          </div>

        </header>

        <div className="admin-content parent-admin-content">

          <section className="parent-management-page">

          {/* HEADER */}

          <div className="parent-page-header">

            <div>

              <div className="parent-title-row">

                <div className="parent-title-icon">
                  <FaUserTie />
                </div>

                <div>

                  <h2>
                    Parents
                  </h2>

                  <p>
                    Manage parent accounts
                    and contact details.
                  </p>

                </div>

              </div>

            </div>


            <button
              type="button"
              className="parent-add-button"
              onClick={openAdd}
            >

              <FaPlus />

              Add Parent

            </button>

          </div>


          {/* LIST */}

          <div className="parent-list-card">

            <div className="parent-list-header">

              <div>

                <h3>
                  Parents List
                </h3>

                <span>
                  {filteredParents.length}
                  {" "}
                  parent(s)
                </span>

              </div>


              <div className="parent-list-actions">

                <div className="parent-search">

                  <FaSearch />

                  <input
                    type="text"
                    placeholder="Search parent..."
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                  />

                </div>


                <button
                  className="parent-refresh-button"
                  onClick={loadParents}
                  disabled={loading}
                  title="Refresh"
                >

                  <FaSyncAlt
                    className={
                      loading
                        ? "spin"
                        : ""
                    }
                  />

                </button>

              </div>

            </div>


            {loading ? (

              <div className="parent-empty-state">

                <FaSyncAlt
                  className="spin empty-icon"
                />

                <p>
                  Loading parents...
                </p>

              </div>

            ) : filteredParents.length === 0 ? (

              <div className="parent-empty-state">

                <FaUserTie
                  className="empty-icon"
                />

                <h3>
                  No parents found
                </h3>

                <p>
                  Click "Add Parent"
                  to create a parent account.
                </p>

              </div>

            ) : (

              <div className="parent-table-wrapper">

                <table className="parent-table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Password</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredParents.map((parent) => (
                      <tr key={parent.id}>

                        <td>
                          <div className="parent-name-cell">
                            <div className="parent-avatar">
                              {parent.name
                                ?.trim()
                                ?.charAt(0)
                                ?.toUpperCase() || "P"}
                            </div>
                            <strong>{parent.name}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="parent-username">
                            @{parent.username}
                          </span>
                        </td>

                        <td>
                          <span className="parent-password">
                            ••••••••
                          </span>
                        </td>

                        <td>
                          <div className="parent-actions">

                            <button
                              type="button"
                              className="parent-view-button"
                              onClick={(e) =>
                                openStudentsView(parent, e)
                              }
                              title="View students"
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              className="parent-edit-button"
                              onClick={(e) =>
                                openEdit(parent, e)
                              }
                              title="Edit"
                            >
                              <FaPen />
                            </button>

                            <button
                              type="button"
                              className="parent-delete-button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteParent(parent.id);
                              }}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* VIEW ASSIGNED STUDENTS MODAL */}

          {showStudentsModal &&
            createPortal(
              <div
                className="parent-modal-overlay"
                onClick={closeStudentsView}
              >
                <div
                  className="parent-modal parent-students-modal"
                  onClick={(e) => e.stopPropagation()}
                >

                  <div className="parent-modal-header">
                    <div>
                      <h3>
                        {viewingParent?.name || "Parent"} - Students
                      </h3>
                      <p>
                        View and manage students for this parent.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="parent-modal-close"
                      onClick={closeStudentsView}
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <div className="parent-students-toolbar">
                    <div>
                      <strong>Assigned Students</strong>
                      <span>
                        {viewStudents.length} student
                        {viewStudents.length === 1 ? "" : "s"} assigned
                      </span>
                    </div>
                  </div>

                  <div className="parent-students-list">
                    {viewStudents.length === 0 ? (
                      <div className="parent-empty-state parent-view-empty">
                        <FaGraduationCap className="empty-icon" />
                        <strong>No students assigned</strong>
                        <span>Use the search below to add students.</span>
                      </div>
                    ) : (
                      viewStudents.map((student, index) => (
                        <div
                          className="assigned-student-row"
                          key={student.id}
                        >
                          <span className="assigned-student-number">
                            {index + 1}
                          </span>

                          <div className="student-avatar">
                            {student.name
                              ?.charAt(0)
                              ?.toUpperCase() || "S"}
                          </div>

                          <div className="assigned-student-info">
                            <strong>
                              {student.name || "Unnamed Student"}
                            </strong>
                            <small>
                              {student.email || `Student #${student.id}`}
                            </small>
                          </div>

                          <div className="assigned-student-actions">
                            <button
                              type="button"
                              className="parent-view-delete-student"
                              onClick={() =>
                                removeStudentFromParent(student.id)
                              }
                              title="Remove student"
                            >
                              <FaUserMinus />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="student-action-body">

                    <div className="student-add-heading">
                      <div>
                        <strong>Add Student</strong>
                        <span>
                          Search and add a student to this parent.
                        </span>
                      </div>
                    </div>

                    <div className="student-modal-search">
                      <FaSearch />
                      <input
                        type="text"
                        placeholder="Search student by name or email..."
                        value={viewStudentSearch}
                        onChange={(e) =>
                          setViewStudentSearch(e.target.value)
                        }
                      />
                    </div>

                    <div className="student-choice-list">
                      {studentLoading ? (
                        <div className="student-empty">
                          <FaSyncAlt className="spin" />
                          Loading students...
                        </div>
                      ) : filteredViewStudents.length === 0 ? (
                        <div className="student-empty">
                          <FaGraduationCap />
                          No students found.
                        </div>
                      ) : (
                        filteredViewStudents.map((student) => {
                          const alreadyAdded = viewStudents.some(
                            (item) =>
                              Number(item.id) === Number(student.id)
                          );

                          return (
                            <div
                              className={`student-choice-row ${
                                alreadyAdded ? "selected" : ""
                              }`}
                              key={student.id}
                            >
                              <div className="student-avatar">
                                {student.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "S"}
                              </div>

                              <div className="student-info">
                                <strong>
                                  {student.name || "Unnamed Student"}
                                </strong>
                                <small>
                                  {student.email ||
                                    `Student #${student.id}`}
                                </small>
                              </div>

                              <button
                                type="button"
                                className={
                                  alreadyAdded
                                    ? "student-added-button"
                                    : "student-add-small-button"
                                }
                                disabled={alreadyAdded}
                                onClick={() =>
                                  addStudentToParent(student)
                                }
                              >
                                {alreadyAdded ? (
                                  <>
                                    <FaCheck />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <FaUserPlus />
                                    Add
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                  </div>

                  <div className="parent-modal-footer">
                    <button
                      type="button"
                      className="parent-cancel-button"
                      onClick={closeStudentsView}
                    >
                      Close
                    </button>
                  </div>

                </div>
              </div>,
              document.body
            )}

          {/* MODAL */}

          {showModal &&
            createPortal(
              <div
                className="parent-modal-overlay"
                onClick={closeModal}
              >

                <div
                  className="parent-modal"
                  onClick={(e) => e.stopPropagation()}
                >

                {/* MODAL HEADER */}

                <div className="parent-modal-header">

                  <div>

                    <h3>

                      {editingId
                        ? "Edit Parent"
                        : "Add New Parent"}

                    </h3>

                    <p>

                      {editingId
                        ? "Update parent account details."
                        : "Create a new parent account."}

                    </p>

                  </div>


                  <button
                    className="parent-modal-close"
                    onClick={closeModal}
                    disabled={saving}
                  >

                    <FaTimes />

                  </button>

                </div>


                {/* FORM */}

                <form
                  onSubmit={saveParent}
                >

                  <div className="parent-form-grid">


                    {/* NAME */}

                    <div className="parent-form-group">

                      <label>
                        Parent Name *
                      </label>

                      <div className="parent-input-wrap">

                        <FaUser />

                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Enter parent name"
                        />

                      </div>

                    </div>


                    {/* PHONE */}

                    <div className="parent-form-group">

                      <label>
                        Phone Number
                      </label>

                      <div className="parent-phone-wrap">

                        <PhoneInput
                          country="in"
                          value={form.phone}
                          onChange={handlePhoneChange}
                          inputStyle={{
                            width: "100%",
                          }}
                        />

                      </div>

                    </div>


                    {/* ADDRESS */}

                    <div className="parent-form-group full">

                      <label>
                        Address
                      </label>

                      <div className="parent-input-wrap parent-textarea-wrap">

                        <FaMapMarkerAlt />

                        <textarea
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="Enter address"
                          rows="3"
                        />

                      </div>

                    </div>


                    {/* EMAIL */}

                    <div className="parent-form-group">

                      <label>
                        Mail ID
                      </label>

                      <div className="parent-input-wrap">

                        <FaEnvelope />

                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Enter email"
                        />

                      </div>

                    </div>


                    {/* USERNAME */}

                    <div className="parent-form-group">

                      <label>
                        Username *
                      </label>

                      <div className="parent-input-wrap">

                        <FaUser />

                        <input
                          name="username"
                          value={form.username}
                          onChange={handleChange}
                          placeholder="Enter username"
                          autoComplete="off"
                        />

                      </div>

                    </div>


                    {/* PASSWORD */}

                    <div className="parent-form-group full">

                      <label>

                        Password{" "}

                        {editingId &&
                          "(leave blank to keep current)"}

                      </label>

                      <div className="parent-input-wrap">

                        <FaLock />

                        <input
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder={
                            editingId
                              ? "Enter new password only if changing"
                              : "Enter password"
                          }
                          autoComplete="new-password"
                        />

                      </div>

                    </div>


                    {/* STUDENTS */}

                    <div className="parent-form-group full">

                      <div className="student-section-title">

                        <div>

                          <label>
                            Assign Students
                          </label>

                          <span>
                            Select students for
                            this parent.
                            Selected students are saved
                            to the database.
                          </span>

                        </div>


                        <strong>
                          {selectedStudents.length}
                          {" "}
                          selected
                        </strong>

                      </div>


                      <div className="student-picker">

                        <div className="student-picker-top">

                          <div className="student-search">

                            <FaSearch />

                            <input
                              type="text"
                              placeholder="Search student..."
                              value={studentSearch}
                              onChange={(e) =>
                                setStudentSearch(
                                  e.target.value
                                )
                              }
                            />

                          </div>


                          <button
                            type="button"
                            className="student-refresh"
                            onClick={loadStudents}
                            disabled={
                              studentLoading
                            }
                            title="Refresh students"
                          >

                            <FaSyncAlt
                              className={
                                studentLoading
                                  ? "spin"
                                  : ""
                              }
                            />

                          </button>

                        </div>


                        <div className="student-list">

                          {studentLoading ? (

                            <div className="student-empty">

                              <FaSyncAlt
                                className="spin"
                              />

                              Loading students...

                            </div>

                          ) : filteredStudents.length === 0 ? (

                            <div className="student-empty">

                              <FaGraduationCap />

                              No students found.

                            </div>

                          ) : (

                            filteredStudents.map(
                              (student) => {

                                const checked =
                                  selectedStudents.includes(
                                    Number(
                                      student.id
                                    )
                                  );


                                return (

                                  <button
                                    type="button"
                                    key={student.id}
                                    className={
                                      `student-row ${
                                        checked
                                          ? "selected"
                                          : ""
                                      }`
                                    }
                                    onClick={() =>
                                      toggleStudent(
                                        student.id
                                      )
                                    }
                                  >

                                    <span
                                      className={
                                        `student-check ${
                                          checked
                                            ? "checked"
                                            : ""
                                        }`
                                      }
                                    >

                                      {checked && (
                                        <FaCheck />
                                      )}

                                    </span>


                                    <span className="student-avatar">

                                      {student.name
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "S"}

                                    </span>


                                    <span className="student-info">

                                      <strong>
                                        {student.name ||
                                          "Unnamed Student"}
                                      </strong>

                                      <small>
                                        {student.email ||
                                          `Student #${student.id}`}
                                      </small>

                                    </span>

                                  </button>

                                );
                              }
                            )

                          )}

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* FOOTER */}

                  <div className="parent-modal-footer">

                    <button
                      type="button"
                      className="parent-cancel-button"
                      onClick={closeModal}
                      disabled={saving}
                    >
                      Cancel
                    </button>


                    <button
                      type="submit"
                      className="parent-save-button"
                      disabled={saving}
                    >

                      {saving
                        ? "Saving..."
                        : editingId
                        ? "Update Parent"
                        : "Save Parent"}

                    </button>

                  </div>

                </form>

                </div>
              </div>,
              document.body
            )}

          </section>

        </div>

      </main>

    </div>
  );
}