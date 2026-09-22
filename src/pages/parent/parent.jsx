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
} from "react-icons/fa";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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

              /*
                Selected students are
                intentionally NOT saved.
              */
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
                      <th>Address</th>
                      <th>Phone</th>
                      <th>Email</th>
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
                                  ?.toUpperCase() ||
                                  "P"}

                              </div>

                              <strong>
                                {parent.name}
                              </strong>

                            </div>

                          </td>


                          <td>

                            <span className="parent-address">

                              {parent.address ||
                                "—"}

                            </span>

                          </td>


                          <td>

                            <span className="parent-contact">

                              <FaPhone />

                              {parent.phone}

                            </span>

                          </td>


                          <td>

                            <span className="parent-contact">

                              <FaEnvelope />

                              {parent.email}

                            </span>

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
                            Selection is only
                            shown here and is
                            not saved yet.
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

      </main>

    </div>
  );
}