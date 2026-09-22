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
  FaExchangeAlt,
} from "react-icons/fa";

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

  // Student selections are intentionally LOCAL ONLY.
  // They are not saved to the database.
  const [parentStudentMap, setParentStudentMap] = useState({});
  const [viewParent, setViewParent] = useState(null);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [studentManagerMode, setStudentManagerMode] = useState("add");
  const [studentManagerId, setStudentManagerId] = useState(null);
  const [studentManagerSearch, setStudentManagerSearch] = useState("");

  const emptyForm = {
    name: "",
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
          [parent.name, parent.username].some((item) =>
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
    loadStudents();
  };


  /* =========================================
     EDIT
  ========================================= */

  const openEdit = (parent, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    setEditingId(parent.id);

    setForm({
      name: parent.name || "",
      username: parent.username || "",
      password: "",
    });

    setSelectedStudents(
      Array.isArray(parentStudentMap[parent.id])
        ? parentStudentMap[parent.id]
        : []
    );

    setStudentSearch("");
    setShowModal(true);
    loadStudents();
  };


  /* =========================================
     CLOSE
  ========================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setSelectedStudents([]);
    setStudentSearch("");
  };


  /* =========================================
     VIEW PARENT STUDENTS
  ========================================= */

  const getParentStudents = (parentId) => {
    const ids = Array.isArray(parentStudentMap[parentId])
      ? parentStudentMap[parentId]
      : [];

    return students.filter((student) =>
      ids.includes(Number(student.id))
    );
  };


  const openView = (parent, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    setViewParent(parent);
    setStudentManagerSearch("");
  };


  const closeView = () => {
    if (showStudentManager) return;

    setViewParent(null);
    setStudentManagerSearch("");
    setStudentManagerId(null);
  };


  const openAddStudent = () => {
    setStudentManagerMode("add");
    setStudentManagerId(null);
    setStudentManagerSearch("");
    setShowStudentManager(true);

    if (!students.length) {
      loadStudents();
    }
  };


  const openEditStudent = (student) => {
    setStudentManagerMode("edit");
    setStudentManagerId(Number(student.id));
    setStudentManagerSearch("");
    setShowStudentManager(true);

    if (!students.length) {
      loadStudents();
    }
  };


  const closeStudentManager = () => {
    setShowStudentManager(false);
    setStudentManagerId(null);
    setStudentManagerSearch("");
  };


  const saveStudentFromManager = (studentId) => {
    if (!viewParent) return;

    const parentId = Number(viewParent.id);
    const current = Array.isArray(parentStudentMap[parentId])
      ? parentStudentMap[parentId]
      : [];

    if (studentManagerMode === "edit") {
      const oldId = Number(studentManagerId);

      setParentStudentMap((prev) => ({
        ...prev,
        [parentId]: current.map((id) =>
          Number(id) === oldId ? Number(studentId) : Number(id)
        ),
      }));
    } else {
      if (!current.includes(Number(studentId))) {
        setParentStudentMap((prev) => ({
          ...prev,
          [parentId]: [...current, Number(studentId)],
        }));
      }
    }

    closeStudentManager();
  };


  const deleteParentStudent = (studentId) => {
    if (!viewParent) return;

    const confirmed = window.confirm(
      "Remove this student from this parent's list?"
    );

    if (!confirmed) return;

    const parentId = Number(viewParent.id);

    setParentStudentMap((prev) => ({
      ...prev,
      [parentId]: (prev[parentId] || []).filter(
        (id) => Number(id) !== Number(studentId)
      ),
    }));
  };

  /* =========================================
     SAVE PARENT
  ========================================= */

  const saveParent = async (
    e
  ) => {

    e.preventDefault();


    if (!form.name.trim()) {

      alert(
        "Please enter parent name."
      );

      return;
    }


    if (!form.username.trim()) {

      alert(
        "Please enter username."
      );

      return;
    }


    if (
      !editingId &&
      !form.password.trim()
    ) {

      alert(
        "Please enter password."
      );

      return;
    }


    setSaving(true);


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
              action:
                editingId
                  ? "update"
                  : "create",

              admin_email:
                admin?.email || "",

              id: editingId,

              name:
                form.name.trim(),

              username:
                form.username.trim(),

              password:
                form.password
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


      alert(
        editingId
          ? "Parent updated successfully."
          : "Parent added successfully."
      );


      const savedParentId =
        Number(editingId) || Number(data.id || data.parent_id || 0);

      if (savedParentId > 0) {
        setParentStudentMap((prev) => ({
          ...prev,
          [savedParentId]: [...selectedStudents],
        }));
      }

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
<div className="parent-layout">
  <Sidebar />

  <main className="parent-main">

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

                      <th>#</th>
                      <th>Parent</th>
                      <th>Username</th>
                      <th>Actions</th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredParents.map(
                      (parent, index) => (

                        <tr key={parent.id}>

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <div className="parent-name-cell">
                              <div className="parent-avatar">
                                {parent.name
                                  ?.trim()
                                  ?.charAt(0)
                                  ?.toUpperCase() || "P"}
                              </div>

                              <strong>
                                {parent.name}
                              </strong>
                            </div>
                          </td>

                          <td>
                            <span className="parent-username">
                              @{parent.username}
                            </span>
                          </td>

                          <td>
                            <div className="parent-actions">

                              <button
                                type="button"
                                className="parent-view-button"
                                onClick={(e) => openView(parent, e)}
                                title="View Students"
                              >
                                <FaEye />
                              </button>

                              <button
                                type="button"
                                className="parent-edit-button"
                                onClick={(e) => openEdit(parent, e)}
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

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>


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
                    <div className="parent-form-group full">
                      <label>Parent Name *</label>

                      <div className="parent-input-wrap">
                        <FaUser />

                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Enter parent name"
                          autoComplete="off"
                        />
                      </div>
                    </div>


                    {/* USERNAME */}
                    <div className="parent-form-group full">
                      <label>Username *</label>

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


                    {/* STUDENTS - DISPLAY / CHECK ONLY, NOT SAVED */}
                    <div className="parent-form-group full">
                      <div className="student-section-title">
                        <div>
                          <label>Students</label>
                          <span>
                            Tick the students for this parent.
                            This selection is only kept on this page.
                          </span>
                        </div>

                        <strong>
                          {selectedStudents.length} selected
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
                                setStudentSearch(e.target.value)
                              }
                            />
                          </div>

                          <button
                            type="button"
                            className="student-refresh"
                            onClick={loadStudents}
                            disabled={studentLoading}
                            title="Refresh students"
                          >
                            <FaSyncAlt
                              className={
                                studentLoading ? "spin" : ""
                              }
                            />
                          </button>
                        </div>

                        <div className="student-list">

                          {studentLoading ? (
                            <div className="student-empty">
                              <FaSyncAlt className="spin" />
                              Loading students...
                            </div>
                          ) : filteredStudents.length === 0 ? (
                            <div className="student-empty">
                              <FaGraduationCap />
                              No students found.
                            </div>
                          ) : (
                            filteredStudents.map((student) => {
                              const checked =
                                selectedStudents.includes(
                                  Number(student.id)
                                );

                              return (
                                <button
                                  type="button"
                                  key={student.id}
                                  className={`student-row ${
                                    checked ? "selected" : ""
                                  }`}
                                  onClick={() =>
                                    toggleStudent(student.id)
                                  }
                                >
                                  <span
                                    className={`student-check ${
                                      checked ? "checked" : ""
                                    }`}
                                  >
                                    {checked && <FaCheck />}
                                  </span>

                                  <span className="student-avatar">
                                    {student.name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "S"}
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
                            })
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


          {/* VIEW PARENT -> STUDENTS */}
          {viewParent &&
            createPortal(
              <div
                className="parent-modal-overlay"
                onClick={closeView}
              >
                <div
                  className="parent-modal parent-students-modal"
                  onClick={(e) => e.stopPropagation()}
                >

                  <div className="parent-modal-header">
                    <div>
                      <h3>{viewParent.name}</h3>
                      <p>
                        @{viewParent.username} · Students
                      </p>
                    </div>

                    <button
                      type="button"
                      className="parent-modal-close"
                      onClick={closeView}
                    >
                      <FaTimes />
                    </button>
                  </div>


                  <div className="parent-students-toolbar">
                    <div>
                      <strong>Students List</strong>
                      <span>
                        {getParentStudents(viewParent.id).length}
                        {" "}student(s)
                      </span>
                    </div>

                    <button
                      type="button"
                      className="parent-student-add-button"
                      onClick={openAddStudent}
                    >
                      <FaUserPlus />
                      Add Student
                    </button>
                  </div>


                  <div className="parent-students-list">

                    {getParentStudents(viewParent.id).length === 0 ? (
                      <div className="student-empty parent-view-empty">
                        <FaGraduationCap />
                        <strong>No students selected</strong>
                        <span>
                          Click Add Student to add from the student list.
                        </span>
                      </div>
                    ) : (
                      getParentStudents(viewParent.id).map(
                        (student, index) => (
                          <div
                            className="assigned-student-row"
                            key={student.id}
                          >
                            <div className="assigned-student-number">
                              {index + 1}
                            </div>

                            <div className="student-avatar">
                              {student.name
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}
                            </div>

                            <div className="assigned-student-info">
                              <strong>
                                {student.name ||
                                  "Unnamed Student"}
                              </strong>

                              <small>
                                {student.email ||
                                  `Student #${student.id}`}
                              </small>
                            </div>

                            <div className="assigned-student-actions">

                              <button
                                type="button"
                                className="parent-view-edit-student"
                                title="Edit Student"
                                onClick={() =>
                                  openEditStudent(student)
                                }
                              >
                                <FaExchangeAlt />
                              </button>

                              <button
                                type="button"
                                className="parent-view-delete-student"
                                title="Delete from list"
                                onClick={() =>
                                  deleteParentStudent(student.id)
                                }
                              >
                                <FaTrash />
                              </button>

                            </div>
                          </div>
                        )
                      )
                    )}

                  </div>
                </div>
              </div>,
              document.body
            )}


          {/* ADD / EDIT STUDENT - LOCAL ONLY */}
          {showStudentManager &&
            viewParent &&
            createPortal(
              <div
                className="parent-modal-overlay student-action-overlay"
                onClick={closeStudentManager}
              >
                <div
                  className="parent-modal student-action-modal"
                  onClick={(e) => e.stopPropagation()}
                >

                  <div className="parent-modal-header">
                    <div>
                      <h3>
                        {studentManagerMode === "edit"
                          ? "Edit Student"
                          : "Add Student"}
                      </h3>

                      <p>
                        Select from the existing student list.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="parent-modal-close"
                      onClick={closeStudentManager}
                    >
                      <FaTimes />
                    </button>
                  </div>


                  <div className="student-action-body">

                    <div className="student-modal-search">
                      <FaSearch />

                      <input
                        type="text"
                        placeholder="Search student..."
                        value={studentManagerSearch}
                        onChange={(e) =>
                          setStudentManagerSearch(
                            e.target.value
                          )
                        }
                      />
                    </div>


                    <div className="student-choice-list">

                      {students
                        .filter((student) => {
                          const q =
                            studentManagerSearch
                              .trim()
                              .toLowerCase();

                          if (!q) return true;

                          return (
                            String(student.name || "")
                              .toLowerCase()
                              .includes(q) ||
                            String(student.email || "")
                              .toLowerCase()
                              .includes(q)
                          );
                        })
                        .map((student) => {
                          const alreadySelected =
                            getParentStudents(
                              viewParent.id
                            ).some(
                              (item) =>
                                Number(item.id) ===
                                Number(student.id)
                            );

                          const selected =
                            studentManagerMode === "edit"
                              ? Number(studentManagerId) ===
                                Number(student.id)
                              : alreadySelected;

                          return (
                            <button
                              type="button"
                              key={student.id}
                              className={`student-choice-row ${
                                selected ? "selected" : ""
                              }`}
                              onClick={() =>
                                saveStudentFromManager(
                                  student.id
                                )
                              }
                            >
                              <span
                                className={`student-check ${
                                  selected ? "checked" : ""
                                }`}
                              >
                                {selected && <FaCheck />}
                              </span>

                              <span className="student-avatar">
                                {student.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "S"}
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
                        })}

                      {students.length === 0 && (
                        <div className="student-empty">
                          <FaGraduationCap />
                          No students found.
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </div>,
              document.body
            )}
        </section>

      </main>

    </div>
  );
}