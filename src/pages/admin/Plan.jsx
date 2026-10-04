import { useEffect, useState } from "react";

import {

  FaArrowLeft,

  FaCircleCheck,

  FaCircleXmark,

  FaPen,

  FaFloppyDisk,

  FaList,

  FaPlus,

  FaRotate,

  FaTag,

  FaTrash,

  FaXmark,

  FaIndianRupeeSign,

  FaCalendarDays,

} from "react-icons/fa6";

import { useNavigate } from "react-router-dom";

import "./plan.css";

const API_URL = "https\://zyntaweb.com/skilllab/plans.php";

const emptyPlan = {

  id: "",

  name: "",

  price: "",

  billing_cycle: "monthly",

  description: "",

  features_json: "",

  is_active: 1,

};

function Plan() {

  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [editing, setEditing] = useState(false);

  const [plan, setPlan] = useState(emptyPlan);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type = "error") => {

    setMessage(text);

    setMessageType(type);

    window.setTimeout(() => setMessage(""), 3500);

  };

  const loadPlans = async () => {

    try {

      setLoading(true);

      const response = await fetch(API_URL, {

        method: "GET",

        headers: { Accept: "application/json" },

      });

      const data = await response.json();

      if (!data.success) {

        throw new Error(data.message || "Unable to load plans.");

      }

      setPlans(Array.isArray(data.plans) ? data.plans : []);

    } catch (error) {

      console.error("Plans load error:", error);

      showMessage(error.message || "Unable to load plans.");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadPlans();

  }, []);

  const openAdd = () => {

    setEditing(false);

    setPlan({ ...emptyPlan });

    setMessage("");

    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });

  };

  const openEdit = (item) => {

    setEditing(true);

    setPlan({

      id: item.id ?? "",

      name: item.name ?? "",

      price: item.price ?? "",

      billing_cycle: item.billing_cycle ?? "monthly",

      description: item.description ?? "",

      features_json: item.features_json ?? "",

      is_active: Number(item.is_active ?? 1),

    });

    setMessage("");

    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });

  };

  const closeForm = () => {

    if (saving) return;

    setShowForm(false);

    setEditing(false);

    setPlan({ ...emptyPlan });

  };

  const handleChange = (field, value) => {

    setPlan((prev) => ({ ...prev, [field]: value }));

  };

  const savePlan = async (event) => {

    event.preventDefault();

    if (saving) return;

    const name = String(plan.name || "").trim();

    const price = String(plan.price ?? "").trim();

    const description = String(plan.description || "").trim();

    const featuresJson = String(plan.features_json || "").trim();

    if (!name) {

      showMessage("Plan name is required.");

      return;

    }

    if (price === "" || Number.isNaN(Number(price)) || Number(price) < 0) {

      showMessage("Please enter a valid plan price.");

      return;

    }
try {

      setSaving(true);

      const formData = new URLSearchParams();

      formData.append("action", editing ? "update" : "create");

      if (editing) {

        formData.append("id", String(plan.id));

      }

      formData.append("name", name);

      formData.append("price", price);

      formData.append("billing_cycle", plan.billing_cycle || "monthly");

      formData.append("description", description);

      formData.append("features_json", featuresJson);

      formData.append("is_active", Number(plan.is_active) === 1 ? "1" : "0");

      const response = await fetch(API_URL, {

        method: "POST",

        headers: {

          "Content-Type": "application/x-www-form-urlencoded",

          Accept: "application/json",

        },

        body: formData.toString(),

      });

      const data = await response.json();

      if (!data.success) {

        throw new Error(data.message || "Unable to save plan.");

      }

      closeForm();

      await loadPlans();

      showMessage(data.message || (editing ? "Plan updated successfully." : "Plan created successfully."), "success");

    } catch (error) {

      console.error("Plan save error:", error);

      showMessage(error.message || "Unable to save plan.");

    } finally {

      setSaving(false);

    }

  };

  const deletePlan = async (item) => {

    const confirmed = window.confirm(

      `Delete "${item.name}" plan?\n\nThis action cannot be undone.`

    );

    if (!confirmed) return;

    try {

      setDeletingId(item.id);

      const formData = new URLSearchParams();

      formData.append("action", "delete");

      formData.append("id", String(item.id));

      const response = await fetch(API_URL, {

        method: "POST",

        headers: {

          "Content-Type": "application/x-www-form-urlencoded",

          Accept: "application/json",

        },

        body: formData.toString(),

      });

      const data = await response.json();

      if (!data.success) {

        throw new Error(data.message || "Unable to delete plan.");

      }

      await loadPlans();

      showMessage(data.message || "Plan deleted successfully.", "success");

    } catch (error) {

      console.error("Plan delete error:", error);

      showMessage(error.message || "Unable to delete plan.");

    } finally {

      setDeletingId(null);

    }

  };

  const activePlans = plans.filter((item) => Number(item.is_active) === 1).length;

  if (loading) {

    return (

      <div className="plans-page">

        <div className="plans-loading">

          <FaRotate className="plans-spin" />

          <h3>Loading Plans</h3>

          <p>Please wait...</p>

        </div>

      </div>

    );

  }

  return (

    <div className="plans-page">

      <div className="plans-container">

        {/* HEADER */}

        <div className="plans-header">

          <div className="plans-header-left">

            <button

              type="button"

              className="plans-back"

              onClick={() => navigate("/AdminDashboard")}

              aria-label="Back"

            >

              <FaArrowLeft />

            </button>

            <div className="plans-header-icon">

              <FaTag />

            </div>

            <div>

              <h1>Plans</h1>

              <p>Manage SkillLab subscription plans.</p>

            </div>

          </div>

          <div className="plans-header-count">

            <strong>{plans.length}</strong>

            <span>Total Plans</span>

          </div>

        </div>

        {message && (

          <div className={`plans-message ${messageType}`}>

            {messageType === "success" ? <FaCircleCheck /> : <FaCircleXmark />}

            <span>{message}</span>

            <button type="button" onClick={() => setMessage("")}>

              <FaXmark />

            </button>

          </div>

        )}

        {/* ADD PLAN FORM */}

        {showForm && (

          <div className="plan-form-card">

            <div className="plan-form-heading">

              <div>

                <h2>

                  <FaPen /> {editing ? "Edit Plan" : "Add New Plan"}

                </h2>

                <p>

                  {editing

                    ? "Update the selected subscription plan."

                    : "Create a new SkillLab subscription plan."}

                </p>

              </div>

              <button

                type="button"

                className="plan-close-button"

                onClick={closeForm}

                disabled={saving}

              >

                <FaXmark />

              </button>

            </div>

            <form onSubmit={savePlan}>

              <div className="plan-form-grid plan-form-grid-3">

                <div className="plan-field">

                  <label>Plan Name</label>

                  <input

                    type="text"

                    value={plan.name}

                    onChange={(e) => handleChange("name", e.target.value)}

                    placeholder="Starter"

                    autoComplete="off"

                  />

                </div>

                <div className="plan-field">

                  <label>Price</label>

                  <div className="price-input-wrap">

                    <FaIndianRupeeSign />

                    <input

                      type="number"

                      min="0"

                      step="0.01"

                      value={plan.price}

                      onChange={(e) => handleChange("price", e.target.value)}

                      placeholder="999.00"

                    />

                  </div>

                </div>

                <div className="plan-field">

                  <label>Billing Cycle</label>

                  <div className="select-wrap">

                    <FaCalendarDays />

                    <select

                      value={plan.billing_cycle}

                      onChange={(e) => handleChange("billing_cycle", e.target.value)}

                    >

                      <option value="monthly">Monthly</option>

                      <option value="yearly">Yearly</option>


                    </select>

                  </div>

                </div>

              </div>

              <div className="plan-field">

                <label>Description</label>

                <input

                  type="text"

                  value={plan.description}

                  onChange={(e) => handleChange("description", e.target.value)}

                  placeholder="SkillLab Monthly Plan"

                />

              </div>

              <div className="plan-field">

                <label>Features JSON</label>

                <textarea

                  rows="4"

                  value={plan.features_json}

                  onChange={(e) => handleChange("features_json", e.target.value)}

                  placeholder='["Feature 1", "Feature 2"]'

                />

                <small>Example: ["2 users", "Task tracking", "Performance reports"]</small>

              </div>

              <div className="plan-form-bottom">

                <div className="plan-active-setting">

                  <div>

                    <strong>Active Plan</strong>

                    <span>Show this plan to students/parents for subscription.</span>

                  </div>

                  <button

                    type="button"

                    className={`plan-switch ${Number(plan.is_active) === 1 ? "on" : ""}`}

                    onClick={() =>

                      handleChange("is_active", Number(plan.is_active) === 1 ? 0 : 1)

                    }

                  >

                    <span />

                  </button>

                </div>

                <div className="plan-form-actions">

                  <button

                    type="button"

                    className="plan-cancel"

                    onClick={closeForm}

                    disabled={saving}

                  >

                    Cancel

                  </button>

                  <button

                    type="submit"

                    className="plan-save"

                    disabled={saving}

                  >

                    {saving ? (

                      <>

                        <FaRotate className="plans-spin" /> Saving...

                      </>

                    ) : (

                      <>

                        <FaFloppyDisk /> {editing ? "Update Plan" : "Add Plan"}

                      </>

                    )}

                  </button>

                </div>

              </div>

            </form>

          </div>

        )}

        {/* TOOLBAR */}

        <div className="plans-toolbar">

          <div>

            <h2>Subscription Plans</h2>


          </div>

          {!showForm && (

            <button type="button" className="add-plan-button" onClick={openAdd}>

              <FaPlus /> Add New Plan

            </button>

          )}

        </div>

        {/* PLAN TABLE */}

        <div className="plan-card">

          <div className="plan-card-heading">

            <div>

              <h2><FaList /> Plan List</h2>

              <p>Manage current subscription offerings</p>

            </div>

            <span>{plans.length} records</span>

          </div>

          {plans.length === 0 ? (

            <div className="plans-empty">

              <FaTag />

              <h3>No Plans Found</h3>

              <p>Create your first subscription plan.</p>

              <button type="button" onClick={openAdd}>

                <FaPlus /> Add Plan

              </button>

            </div>

          ) : (

            <div className="plans-table-wrap">

              <table className="plans-table">

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>NAME</th>

                    <th>PRICE</th>

                    <th>BILLING CYCLE</th>

                    <th>ACTIVE</th>

                    <th>ACTION</th>

                  </tr>

                </thead>

                <tbody>

                  {plans.map((item) => (

                    <tr key={item.id}>

                      <td className="plan-id">#{item.id}</td>

                      <td>

                        <div className="plan-name-cell">

                          <strong>{item.name}</strong>

                          <span>{item.description || "SkillLab subscription plan"}</span>

                        </div>

                      </td>

                      <td className="plan-price">

                        ₹{Number(item.price || 0).toLocaleString("en-IN", {

                          minimumFractionDigits: 2,

                          maximumFractionDigits: 2,

                        })}

                      </td>

                      <td>

                        <span className="billing-badge">

                          {String(item.billing_cycle || "monthly").charAt(0).toUpperCase() +

                            String(item.billing_cycle || "monthly").slice(1)}

                        </span>

                      </td>

                      <td>

                        {Number(item.is_active) === 1 ? (

                          <span className="active-badge">

                            <FaCircleCheck /> Yes

                          </span>

                        ) : (

                          <span className="inactive-badge">

                            <FaCircleXmark /> No

                          </span>

                        )}

                      </td>

                      <td>

                        <div className="plan-actions">

                          <button

                            type="button"

                            className="plan-edit-button"

                            onClick={() => openEdit(item)}

                          >

                            <FaPen /> Edit

                          </button>

                          <button

                            type="button"

                            className="plan-delete-button"

                            onClick={() => deletePlan(item)}

                            disabled={deletingId === item.id}

                          >

                            {deletingId === item.id ? (

                              <FaRotate className="plans-spin" />

                            ) : (

                              <FaTrash />

                            )}

                            {deletingId === item.id ? "Deleting..." : "Delete"}

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

      
      </div>

    </div>

  );

}

export default Plan;
