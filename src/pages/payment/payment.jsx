import { useEffect, useState } from "react";

import {
  FaCreditCard,
  FaFloppyDisk,
  FaRotate,
  FaShieldHalved,
  FaCircleCheck,
  FaCircleXmark,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaGlobe,
  FaArrowLeft,
  FaPlus,
  FaPen,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";

import { useNavigate } from "react-router-dom";

const API_URL =
  "https://zyntaweb.com/skilllab/payment-gateway.php";

function Payment() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gateways, setGateways] = useState([]);

  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);

  const emptyGateway = {
    id: "",
    code: "",
    name: "",
    is_enabled: 0,
    is_live: 0,
    public_key: "",
    secret_key: "",
    webhook_secret: "",
    sort_order: 1,
  };

  const [gateway, setGateway] = useState(emptyGateway);

  /* =====================================================
     LOAD ALL GATEWAYS
  ===================================================== */

  const loadGateways = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      console.log("PAYMENT GATEWAYS:", data);

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to load payment gateways"
        );
      }

      setGateways(
        Array.isArray(data.gateways)
          ? data.gateways
          : []
      );
    } catch (error) {
      console.error(
        "Payment gateway load error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load payment gateway settings."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGateways();
  }, []);

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (field, value) => {
    setGateway((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =====================================================
     OPEN ADD FORM
  ===================================================== */

  const openAddForm = () => {
    setEditing(false);

    setGateway({
      ...emptyGateway,
      sort_order: gateways.length + 1,
    });

    setShowSecret(false);
    setShowWebhook(false);

    setMessage("");
    setShowForm(true);
  };

  /* =====================================================
     OPEN EDIT FORM
  ===================================================== */

  const openEditForm = (item) => {
    setEditing(true);

    setGateway({
      id: item.id ?? "",
      code: item.code ?? "",
      name: item.name ?? "",
      is_enabled: Number(
        item.is_enabled ?? 0
      ),
      is_live: Number(
        item.is_live ?? 0
      ),
      public_key: item.public_key ?? "",
      secret_key: "",
      webhook_secret: "",
      sort_order: Number(
        item.sort_order ?? 1
      ),
    });

    setShowSecret(false);
    setShowWebhook(false);

    setMessage("");
    setShowForm(true);
  };

  /* =====================================================
     CLOSE FORM
  ===================================================== */

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditing(false);

    setGateway({
      ...emptyGateway,
    });

    setShowSecret(false);
    setShowWebhook(false);
  };

  /* =====================================================
     SAVE GATEWAY
  ===================================================== */

  const saveGateway = async (event) => {
    event.preventDefault();

    if (saving) return;

    setMessage("");

    const code = gateway.code
      .trim()
      .toLowerCase();

    const name = gateway.name.trim();

    if (!code) {
      setMessage(
        "Gateway code is required."
      );

      setMessageType("error");
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(code)) {
      setMessage(
        "Gateway code can contain only lowercase letters, numbers, underscore and hyphen."
      );

      setMessageType("error");
      return;
    }

    if (!name) {
      setMessage(
        "Display name is required."
      );

      setMessageType("error");
      return;
    }

    if (
      !editing &&
      !gateway.secret_key.trim()
    ) {
      setMessage(
        "Secret Key is required for a new gateway."
      );

      setMessageType("error");
      return;
    }

    try {
      setSaving(true);

      const formData =
        new URLSearchParams();

      formData.append(
        "action",
        editing ? "update" : "create"
      );

      if (editing) {
        formData.append(
          "gateway_id",
          String(gateway.id)
        );
      }

      formData.append(
        "code",
        code
      );

      formData.append(
        "name",
        name
      );

      formData.append(
        "is_enabled",
        Number(gateway.is_enabled) === 1
          ? "1"
          : "0"
      );

      formData.append(
        "is_live",
        Number(gateway.is_live) === 1
          ? "1"
          : "0"
      );

      formData.append(
        "public_key",
        gateway.public_key || ""
      );

      formData.append(
        "secret_key",
        gateway.secret_key || ""
      );

      formData.append(
        "webhook_secret",
        gateway.webhook_secret || ""
      );

      formData.append(
        "sort_order",
        String(
          gateway.sort_order || 1
        )
      );

      const response = await fetch(
        API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
            Accept:
              "application/json",
          },
          body: formData.toString(),
        }
      );

      const data =
        await response.json();

      console.log(
        "SAVE GATEWAY:",
        data
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to save gateway"
        );
      }

      setMessage(
        data.message ||
          (editing
            ? "Gateway updated successfully."
            : "Gateway added successfully.")
      );

      setMessageType("success");

      await loadGateways();

      setShowForm(false);
      setEditing(false);

      setGateway({
        ...emptyGateway,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Payment gateway save error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to save payment gateway."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     ENABLE / DISABLE
  ===================================================== */

  const toggleGateway = async (item) => {
    try {
      const formData =
        new URLSearchParams();

      formData.append(
        "action",
        "toggle"
      );

      formData.append(
        "gateway_id",
        String(item.id)
      );

      formData.append(
        "is_enabled",
        Number(item.is_enabled) === 1
          ? "0"
          : "1"
      );

      const response = await fetch(
        API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
            Accept:
              "application/json",
          },
          body: formData.toString(),
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to update gateway"
        );
      }

      await loadGateways();
    } catch (error) {
      setMessage(
        error.message
      );

      setMessageType("error");
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const deleteGateway = async (item) => {
    if (
      !window.confirm(
        `Delete "${item.name}" gateway?`
      )
    ) {
      return;
    }

    try {
      const formData =
        new URLSearchParams();

      formData.append(
        "action",
        "delete"
      );

      formData.append(
        "gateway_id",
        String(item.id)
      );

      const response = await fetch(
        API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
            Accept:
              "application/json",
          },
          body: formData.toString(),
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to delete gateway"
        );
      }

      setMessage(
        data.message ||
          "Gateway deleted successfully."
      );

      setMessageType("success");

      await loadGateways();
    } catch (error) {
      setMessage(
        error.message
      );

      setMessageType("error");
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="payment-page">

        <div className="payment-loading">

          <FaRotate className="payment-loading-icon" />

          <h3>
            Loading Payment Gateways
          </h3>

          <p>
            Please wait...
          </p>

        </div>

        <PaymentStyles />

      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="payment-page">

      {/* =================================================
          PAYMENT HEADER
      ================================================= */}

      <div className="payment-header">

        <div className="payment-header-left">

          <button
            type="button"
            className="payment-back-button"
            onClick={() =>
              navigate(
                "/AdminDashboard"
              )
            }
          >
            <FaArrowLeft />
          </button>

          <div className="payment-header-icon">
            <FaCreditCard />
          </div>

          <div className="payment-header-text">

            <h1>
              Payment Gateway
            </h1>

            <p>
              Manage payment gateways
              for SkillLab
            </p>

          </div>

        </div>

        <div className="payment-total">

          <strong>
            {gateways.length}
          </strong>

          <span>
            Total Gateways
          </span>

        </div>

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div
          className={`payment-message ${
            messageType === "success"
              ? "success"
              : "error"
          }`}
        >

          {messageType === "success" ? (
            <FaCircleCheck />
          ) : (
            <FaCircleXmark />
          )}

          <span>
            {message}
          </span>

        </div>
      )}


      {/* =================================================
          SEPARATE PAGE HEADING
      ================================================= */}

      <div className="gateway-toolbar">

        <div className="gateway-heading-content">

          <h2>
            Configured Gateways
          </h2>

          <p>
            Add and manage all payment
            integrations.
          </p>

        </div>


        <button
          type="button"
          className="add-gateway-button"
          onClick={openAddForm}
        >
          <FaPlus />

          <span>
            Add New Gateway
          </span>
        </button>

      </div>


      {/* =================================================
          GATEWAY TABLE
      ================================================= */}

      <div className="gateway-list">

        {gateways.length === 0 ? (

          /* EMPTY */

          <div className="empty-gateway">

            <FaCreditCard />

            <h3>
              No Payment Gateways
            </h3>

            <p>
              Add your first payment
              gateway.
            </p>

            <button
              type="button"
              onClick={openAddForm}
            >
              <FaPlus />
              Add Gateway
            </button>

          </div>

        ) : (

          <div className="gateway-table-scroll">

            <table className="gateway-table">

              <thead>

                <tr>

                  <th className="col-number">
                    #
                  </th>

                  <th className="col-gateway">
                    Gateway
                  </th>

                  <th className="col-mode">
                    Mode
                  </th>

                  <th className="col-type">
                    Type
                  </th>

                  <th className="col-status">
                    Status
                  </th>

                  <th className="col-sort">
                    Sort
                  </th>

                  <th className="col-actions">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {gateways.map(
                  (item, index) => (

                    <tr key={item.id}>

                      {/* NUMBER */}

                      <td
                        className="gateway-number"
                        data-label="#"
                      >
                        {index + 1}
                      </td>


                      {/* GATEWAY */}

                      <td
                        className="gateway-cell"
                        data-label="Gateway"
                      >

                        <div className="gateway-cell-inner">

                          <div className="gateway-logo">

                            {item.code ===
                            "razorpay"
                              ? "₹"
                              : item.code ===
                                "stripe"
                              ? "$"
                              : "₿"}

                          </div>


                          <div className="gateway-info">

                            <div className="gateway-name-line">

                              <strong>
                                {item.name}
                              </strong>

                              <span className="code-badge">
                                {item.code}
                              </span>

                            </div>

                            <span className="gateway-description">
                              Online payment gateway
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* MODE */}

                      <td
                        className="gateway-mode"
                        data-label="Mode"
                      >

                        <span
                          className={
                            Number(
                              item.is_live
                            ) === 1
                              ? "mode-live"
                              : "mode-test"
                          }
                        >

                          <FaGlobe />

                          {Number(
                            item.is_live
                          ) === 1
                            ? "Live"
                            : "Test"}

                        </span>

                      </td>


                      {/* TYPE */}

                      <td
                        className="gateway-type"
                        data-label="Type"
                      >

                        <span className="type-badge">
                          Auto
                        </span>

                      </td>


                      {/* STATUS */}

                      <td
                        className="gateway-status"
                        data-label="Status"
                      >

                        <span
                          className={
                            Number(
                              item.is_enabled
                            ) === 1
                              ? "status-enabled"
                              : "status-disabled"
                          }
                        >

                          <span className="status-dot" />

                          {Number(
                            item.is_enabled
                          ) === 1
                            ? "Enabled"
                            : "Disabled"}

                        </span>

                      </td>


                      {/* SORT */}

                      <td
                        className="sort-cell"
                        data-label="Sort"
                      >

                        <span className="sort-badge">

                          {item.sort_order ??
                            index + 1}

                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td
                        className="gateway-actions-cell"
                        data-label="Actions"
                      >

                        <div className="gateway-actions">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              openEditForm(
                                item
                              )
                            }
                          >
                            <FaPen />
                            <span>
                              Edit
                            </span>
                          </button>


                          <button
                            type="button"
                            className={
                              Number(
                                item.is_enabled
                              ) === 1
                                ? "disable-button"
                                : "enable-button"
                            }
                            onClick={() =>
                              toggleGateway(
                                item
                              )
                            }
                          >

                            {Number(
                              item.is_enabled
                            ) === 1 ? (
                              <>
                                <FaCircleXmark />

                                <span>
                                  Disable
                                </span>
                              </>
                            ) : (
                              <>
                                <FaCircleCheck />

                                <span>
                                  Enable
                                </span>
                              </>
                            )}

                          </button>


                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              deleteGateway(
                                item
                              )
                            }
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


      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showForm && (

        <div
          className="gateway-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
                e.currentTarget &&
              !saving
            ) {
              closeForm();
            }

          }}
        >

          <div className="gateway-modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  {editing
                    ? "Edit Payment Gateway"
                    : "Add New Gateway"}
                </h2>

                <p>
                  {editing
                    ? "Update payment gateway settings"
                    : "Configure a new payment gateway"}
                </p>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={closeForm}
                disabled={saving}
              >
                <FaXmark />
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={saveGateway}
            >

              <div className="form-grid">

                {/* CODE */}

                <div className="payment-field">

                  <label>

                    <FaKey />

                    Gateway Code

                  </label>

                  <input
                    type="text"
                    value={
                      gateway.code
                    }
                    onChange={(e) =>
                      handleChange(
                        "code",
                        e.target.value
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "_"
                          )
                      )
                    }
                    placeholder="razorpay"
                    disabled={editing}
                    autoComplete="off"
                  />

                  <small>
                    Unique lowercase
                    identifier.
                  </small>

                </div>


                {/* NAME */}

                <div className="payment-field">

                  <label>
                    Display Name
                  </label>

                  <input
                    type="text"
                    value={
                      gateway.name
                    }
                    onChange={(e) =>
                      handleChange(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Razorpay"
                  />

                </div>

              </div>


              {/* ENABLE / MODE */}

              <div className="modal-setting-grid">

                <div className="modal-setting">

                  <div>

                    <strong>
                      Enable Gateway
                    </strong>

                    <small>
                      Allow students to use
                      this gateway.
                    </small>

                  </div>


                  <button
                    type="button"
                    className={`payment-switch ${
                      Number(
                        gateway.is_enabled
                      ) === 1
                        ? "on"
                        : ""
                    }`}
                    onClick={() =>
                      handleChange(
                        "is_enabled",
                        Number(
                          gateway.is_enabled
                        ) === 1
                          ? 0
                          : 1
                      )
                    }
                  >
                    <span />
                  </button>

                </div>


                <div className="modal-setting">

                  <div>

                    <strong>
                      Payment Mode
                    </strong>

                    <small>
                      Test or Live
                      payment mode.
                    </small>

                  </div>


                  <button
                    type="button"
                    className={`mode-switch ${
                      Number(
                        gateway.is_live
                      ) === 1
                        ? "live"
                        : "test"
                    }`}
                    onClick={() =>
                      handleChange(
                        "is_live",
                        Number(
                          gateway.is_live
                        ) === 1
                          ? 0
                          : 1
                      )
                    }
                  >

                    {Number(
                      gateway.is_live
                    ) === 1
                      ? "LIVE"
                      : "TEST"}

                  </button>

                </div>

              </div>


              {/* PUBLIC KEY */}

              <div className="payment-field">

                <label>

                  <FaKey />

                  Public Key

                </label>

                <input
                  type="text"
                  value={
                    gateway.public_key
                  }
                  onChange={(e) =>
                    handleChange(
                      "public_key",
                      e.target.value
                    )
                  }
                  placeholder="rzp_live_xxxxxxxxx"
                  autoComplete="off"
                />

              </div>


              {/* SECRET KEY */}

              <div className="payment-field">

                <label>

                  <FaShieldHalved />

                  Secret Key

                </label>


                <div className="secret-input">

                  <input
                    type={
                      showSecret
                        ? "text"
                        : "password"
                    }
                    value={
                      gateway.secret_key
                    }
                    onChange={(e) =>
                      handleChange(
                        "secret_key",
                        e.target.value
                      )
                    }
                    placeholder={
                      editing
                        ? "Leave blank to keep existing secret"
                        : "Enter secret key"
                    }
                    autoComplete="new-password"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowSecret(
                        (prev) =>
                          !prev
                      )
                    }
                  >

                    {showSecret ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}

                  </button>

                </div>


                {editing && (

                  <small className="security-note">

                    <FaShieldHalved />

                    Leave blank to keep
                    the existing secret.

                  </small>

                )}

              </div>


              {/* WEBHOOK */}

              <div className="payment-field">

                <label>

                  <FaShieldHalved />

                  Webhook Secret

                  <span className="optional">
                    Optional
                  </span>

                </label>


                <div className="secret-input">

                  <input
                    type={
                      showWebhook
                        ? "text"
                        : "password"
                    }
                    value={
                      gateway.webhook_secret
                    }
                    onChange={(e) =>
                      handleChange(
                        "webhook_secret",
                        e.target.value
                      )
                    }
                    placeholder={
                      editing
                        ? "Leave blank to keep existing secret"
                        : "Enter webhook secret"
                    }
                    autoComplete="new-password"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowWebhook(
                        (prev) =>
                          !prev
                      )
                    }
                  >

                    {showWebhook ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}

                  </button>

                </div>

              </div>


              {/* SORT */}

              <div className="payment-field">

                <label>
                  Sort Order
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    gateway.sort_order
                  }
                  onChange={(e) =>
                    handleChange(
                      "sort_order",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* BUTTONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="payment-save-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <FaRotate className="spin" />

                      Saving...
                    </>
                  ) : (
                    <>
                      <FaFloppyDisk />

                      {editing
                        ? "Update Gateway"
                        : "Add Gateway"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      <PaymentStyles />

    </div>
  );
}


/* =====================================================
   CSS
===================================================== */

function PaymentStyles() {
  return (
    <style>{`

      * {
        box-sizing: border-box;
      }


      body {
        margin: 0;
      }


      /* =================================================
         PAGE
      ================================================= */

      .payment-page {
        min-height:100vh;

        padding:28px;

        background:
          radial-gradient(
            circle at top right,
            rgba(124,58,237,.10),
            transparent 35%
          ),
          #f6f7fb;

        color:#172033;
      }


      /* =================================================
         MAIN HEADER
      ================================================= */

      .payment-header {
        display:flex;

        align-items:center;

        justify-content:space-between;

        gap:20px;

        padding:22px 24px;

        border-radius:20px;

        background:
          linear-gradient(
            135deg,
            #fff,
            #f8f7ff
          );

        border:1px solid #ebe8f5;

        box-shadow:
          0 10px 35px
          rgba(40,32,80,.07);

        margin-bottom:28px;
      }


      .payment-header-left {
        display:flex;

        align-items:center;

        gap:15px;

        min-width:0;
      }


      .payment-back-button {
        width:40px;

        height:40px;

        flex:0 0 40px;

        border:1px solid #e4e0ef;

        border-radius:11px;

        background:#fff;

        color:#5b21b6;

        cursor:pointer;

        display:flex;

        align-items:center;

        justify-content:center;

        font-size:16px;
      }


      .payment-back-button:hover {
        background:#f8f5ff;
      }


      .payment-header-icon {
        width:54px;

        height:54px;

        flex:0 0 54px;

        border-radius:15px;

        background:
          linear-gradient(
            135deg,
            #5b21b6,
            #7c3aed
          );

        color:#fff;

        display:flex;

        align-items:center;

        justify-content:center;

        font-size:22px;

        box-shadow:
          0 8px 20px
          rgba(91,33,182,.22);
      }


      .payment-header-text {
        min-width:0;
      }


      .payment-header h1 {
        margin:0;

        font-size:25px;

        font-weight:800;

        color:#172033;
      }


      .payment-header p {
        margin:4px 0 0;

        color:#77728a;

        font-size:14px;
      }


      .payment-total {
        min-width:100px;

        text-align:center;

        padding:12px 18px;

        border-radius:15px;

        background:#f3e8ff;

        color:#6d28d9;
      }


      .payment-total strong {
        display:block;

        font-size:25px;

        font-weight:800;
      }


      .payment-total span {
        display:block;

        font-size:11px;
      }


      /* =================================================
         MESSAGE
      ================================================= */

      .payment-message {
        max-width:1200px;

        margin:0 auto 20px;

        display:flex;

        align-items:center;

        gap:10px;

        padding:13px 16px;

        border-radius:13px;

        font-size:14px;

        font-weight:600;
      }


      .payment-message.success {
        background:#ecfdf5;

        border:1px solid #a7f3d0;

        color:#047857;
      }


      .payment-message.error {
        background:#fef2f2;

        border:1px solid #fecaca;

        color:#b91c1c;
      }


      /* =================================================
         SEPARATE HEADING
      ================================================= */

      .gateway-toolbar {
        max-width:1200px;

        margin:0 auto 18px;

        display:flex;

        align-items:flex-end;

        justify-content:space-between;

        gap:20px;
      }


      .gateway-heading-content {
        min-width:0;
      }


      .gateway-heading-content h2 {
        margin:0;

        font-size:24px;

        line-height:1.2;

        font-weight:800;

        color:#172033;
      }


      .gateway-heading-content p {
        margin:7px 0 0;

        color:#817b91;

        font-size:13px;
      }


      /* =================================================
         ADD BUTTON
      ================================================= */

      .add-gateway-button {
        flex-shrink:0;

        border:0;

        border-radius:11px;

        padding:13px 18px;

        background:
          linear-gradient(
            135deg,
            #5b21b6,
            #7c3aed
          );

        color:#fff;

        font-weight:700;

        cursor:pointer;

        display:flex;

        align-items:center;

        justify-content:center;

        gap:8px;

        box-shadow:
          0 8px 18px
          rgba(91,33,182,.20);

        transition:
          transform .15s ease,
          box-shadow .15s ease;
      }


      .add-gateway-button:hover {
        transform:translateY(-1px);

        box-shadow:
          0 11px 22px
          rgba(91,33,182,.25);
      }


      /* =================================================
         TABLE CONTAINER
      ================================================= */

      .gateway-list {
        max-width:1200px;

        margin:0 auto;

        background:#fff;

        border:1px solid #ebe8f5;

        border-radius:18px;

        overflow:hidden;

        box-shadow:
          0 10px 35px
          rgba(40,32,80,.06);
      }


      /* =================================================
         TABLE SCROLL
      ================================================= */

      .gateway-table-scroll {
        width:100%;

        overflow-x:auto;

        overflow-y:hidden;

        -webkit-overflow-scrolling:touch;

        scrollbar-width:thin;
      }


      .gateway-table-scroll::-webkit-scrollbar {
        height:7px;
      }


      .gateway-table-scroll::-webkit-scrollbar-track {
        background:#f1f3f7;
      }


      .gateway-table-scroll::-webkit-scrollbar-thumb {
        background:#b8a9d8;

        border-radius:10px;
      }


      /* =================================================
         TABLE
      ================================================= */

      .gateway-table {
        width:100%;

        min-width:900px;

        border-collapse:collapse;

        background:#fff;
      }


      /* =================================================
         TABLE HEADER
      ================================================= */

      .gateway-table thead th {
        height:54px;

        padding:0 14px;

        background:#f8fafc;

        border-bottom:1px solid #e5e7eb;

        color:#4b5563;

        font-size:11px;

        font-weight:800;

        text-align:left;

        text-transform:uppercase;

        letter-spacing:.65px;

        white-space:nowrap;
      }


      /* =================================================
         TABLE ROW
      ================================================= */

      .gateway-table tbody td {
        height:100px;

        padding:16px 14px;

        border-bottom:1px solid #eeeaf5;

        vertical-align:middle;

        background:#fff;
      }


      .gateway-table tbody tr:last-child td {
        border-bottom:0;
      }


      .gateway-table tbody tr:hover td {
        background:#fbfaff;
      }


      /* =================================================
         COLUMN WIDTH
      ================================================= */

      .gateway-table .col-number {
        width:55px;

        text-align:center;
      }


      .gateway-table .col-gateway {
        width:360px;
      }


      .gateway-table .col-mode {
        width:110px;
      }


      .gateway-table .col-type {
        width:90px;
      }


      .gateway-table .col-status {
        width:120px;
      }


      .gateway-table .col-sort {
        width:70px;
      }


      .gateway-table .col-actions {
        width:245px;
      }


      /* =================================================
         NUMBER
      ================================================= */

      .gateway-number {
        color:#777;

        font-size:13px;

        text-align:center;
      }


      /* =================================================
         GATEWAY CELL
      ================================================= */

      .gateway-cell-inner {
        display:flex;

        align-items:center;

        gap:14px;

        min-width:280px;
      }


      .gateway-logo {
        width:55px;

        height:55px;

        flex:0 0 55px;

        border-radius:15px;

        background:
          linear-gradient(
            135deg,
            #3395ff,
            #1674d1
          );

        color:#fff;

        display:flex;

        align-items:center;

        justify-content:center;

        font-size:24px;

        font-weight:800;

        box-shadow:
          0 6px 14px
          rgba(22,116,209,.16);
      }


      .gateway-info {
        min-width:0;
      }


      .gateway-name-line {
        display:flex;

        align-items:center;

        gap:8px;

        flex-wrap:wrap;
      }


      .gateway-name-line strong {
        font-size:15px;

        color:#202638;

        white-space:nowrap;
      }


      .code-badge {
        padding:4px 8px;

        border-radius:10px;

        background:#f3e8ff;

        color:#6d28d9;

        font-size:10px;

        font-weight:700;

        white-space:nowrap;
      }


      .gateway-description {
        display:block;

        margin-top:5px;

        color:#898397;

        font-size:11px;

        white-space:nowrap;
      }


      /* =================================================
         MODE
      ================================================= */

      .mode-live,
      .mode-test {
        display:inline-flex;

        align-items:center;

        justify-content:center;

        gap:5px;

        padding:7px 10px;

        border-radius:15px;

        font-size:10px;

        font-weight:700;

        white-space:nowrap;
      }


      .mode-live {
        background:#fff7ed;

        color:#c2410c;
      }


      .mode-test {
        background:#eff6ff;

        color:#2563eb;
      }


      /* =================================================
         TYPE
      ================================================= */

      .gateway-type {
        white-space:nowrap;
      }


      .type-badge {
        display:inline-flex;

        align-items:center;

        justify-content:center;

        min-width:48px;

        padding:7px 10px;

        border-radius:14px;

        background:#eef2ff;

        color:#4338ca;

        font-size:10px;

        font-weight:800;
      }


      /* =================================================
         STATUS
      ================================================= */

      .gateway-status {
        white-space:nowrap;
      }


      .status-enabled,
      .status-disabled {
        display:inline-flex;

        align-items:center;

        gap:6px;

        padding:8px 11px;

        border-radius:15px;

        font-size:10px;

        font-weight:700;

        white-space:nowrap;
      }


      .status-enabled {
        background:#d1fae5;

        color:#047857;
      }


      .status-disabled {
        background:#fee2e2;

        color:#b91c1c;
      }


      .status-dot {
        width:6px;

        height:6px;

        border-radius:50%;

        background:currentColor;
      }


      /* =================================================
         SORT
      ================================================= */

      .sort-cell {
        text-align:center;
      }


      .sort-badge {
        width:36px;

        height:36px;

        border-radius:9px;

        border:1px solid #ddd8e9;

        display:inline-flex;

        align-items:center;

        justify-content:center;

        font-size:11px;

        color:#514b60;

        background:#fff;
      }


      /* =================================================
         ACTIONS
      ================================================= */

      .gateway-actions-cell {
        white-space:nowrap;
      }


      .gateway-actions {
        display:flex;

        align-items:center;

        gap:8px;
      }


      .gateway-actions button {
        border:0;

        border-radius:9px;

        min-height:40px;

        padding:9px 11px;

        cursor:pointer;

        display:flex;

        align-items:center;

        justify-content:center;

        gap:6px;

        font-size:11px;

        font-weight:700;

        transition:
          transform .15s ease,
          opacity .15s ease;
      }


      .gateway-actions button:hover {
        transform:translateY(-1px);

        opacity:.92;
      }


      .edit-button {
        background:#eef2ff;

        color:#4338ca;
      }


      .enable-button {
        background:#d1fae5;

        color:#047857;
      }


      .disable-button {
        background:#fef3c7;

        color:#92400e;
      }


      .delete-button {
        width:42px;

        background:#fee2e2;

        color:#b91c1c;
      }


      /* =================================================
         EMPTY
      ================================================= */

      .empty-gateway {
        text-align:center;

        padding:70px 20px;

        color:#817b91;
      }


      .empty-gateway > svg {
        font-size:45px;

        color:#7c3aed;

        margin-bottom:15px;
      }


      .empty-gateway h3 {
        margin:0 0 6px;

        color:#27223a;

        font-size:18px;
      }


      .empty-gateway p {
        margin:0 0 20px;

        font-size:13px;
      }


      .empty-gateway button {
        border:0;

        border-radius:10px;

        padding:11px 16px;

        background:#7c3aed;

        color:#fff;

        font-weight:700;

        cursor:pointer;

        display:inline-flex;

        align-items:center;

        gap:7px;
      }


      /* =================================================
         MODAL OVERLAY
      ================================================= */

      .gateway-modal-overlay {
        position:fixed;

        inset:0;

        z-index:9999;

        background:
          rgba(20,15,35,.48);

        backdrop-filter:blur(5px);

        display:flex;

        align-items:center;

        justify-content:center;

        padding:20px;
      }


      .gateway-modal {
        width:min(700px,100%);

        max-height:92vh;

        overflow:auto;

        background:#fff;

        border-radius:20px;

        box-shadow:
          0 25px 70px
          rgba(0,0,0,.25);
      }


      /* =================================================
         MODAL HEADER
      ================================================= */

      .modal-header {
        padding:20px 22px;

        border-bottom:1px solid #eeeaf5;

        display:flex;

        align-items:center;

        justify-content:space-between;

        gap:15px;
      }


      .modal-header h2 {
        margin:0;

        font-size:20px;

        font-weight:800;
      }


      .modal-header p {
        margin:4px 0 0;

        color:#888394;

        font-size:12px;
      }


      .modal-close {
        width:36px;

        height:36px;

        border:0;

        border-radius:9px;

        background:#f4f1fa;

        color:#6b6478;

        cursor:pointer;

        display:flex;

        align-items:center;

        justify-content:center;
      }


      /* =================================================
         FORM
      ================================================= */

      .gateway-modal form {
        padding:22px;
      }


      .form-grid {
        display:grid;

        grid-template-columns:
          1fr 1fr;

        gap:15px;
      }


      .payment-field {
        margin-bottom:18px;
      }


      .payment-field label {
        display:flex;

        align-items:center;

        gap:7px;

        margin-bottom:8px;

        font-size:13px;

        font-weight:750;

        color:#29233b;
      }


      .payment-field label svg {
        color:#6d28d9;
      }


      .payment-field input {
        width:100%;

        height:45px;

        border:1px solid #ddd8e9;

        border-radius:10px;

        padding:0 13px;

        outline:none;

        font-size:13px;

        color:#27223a;

        background:#fff;
      }


      .payment-field input:focus {
        border-color:#8b5cf6;

        box-shadow:
          0 0 0 3px
          rgba(139,92,246,.10);
      }


      .payment-field input:disabled {
        background:#f4f1fa;

        color:#777;

        cursor:not-allowed;
      }


      .payment-field small {
        display:block;

        margin-top:6px;

        color:#9993a5;

        font-size:11px;
      }


      .security-note {
        display:flex !important;

        align-items:center;

        gap:5px;

        color:#059669 !important;
      }


      /* =================================================
         MODAL SETTINGS
      ================================================= */

      .modal-setting-grid {
        display:grid;

        grid-template-columns:
          1fr 1fr;

        gap:14px;

        margin-bottom:20px;
      }


      .modal-setting {
        border:1px solid #ebe8f5;

        border-radius:13px;

        padding:14px;

        display:flex;

        align-items:center;

        justify-content:space-between;

        gap:10px;
      }


      .modal-setting strong {
        display:block;

        font-size:13px;
      }


      .modal-setting small {
        display:block;

        margin-top:3px;

        color:#888394;

        font-size:10px;
      }


      /* =================================================
         ENABLE SWITCH
      ================================================= */

      .payment-switch {
        width:51px;

        height:29px;

        border:0;

        border-radius:30px;

        background:#d7d5df;

        padding:3px;

        cursor:pointer;

        transition:.2s;

        flex-shrink:0;
      }


      .payment-switch span {
        display:block;

        width:23px;

        height:23px;

        border-radius:50%;

        background:#fff;

        transition:.2s;

        box-shadow:
          0 2px 5px
          rgba(0,0,0,.15);
      }


      .payment-switch.on {
        background:#16a34a;
      }


      .payment-switch.on span {
        transform:
          translateX(22px);
      }


      /* =================================================
         MODE SWITCH
      ================================================= */

      .mode-switch {
        min-width:70px;

        height:32px;

        border:0;

        border-radius:20px;

        color:#fff;

        font-size:10px;

        font-weight:800;

        cursor:pointer;

        flex-shrink:0;
      }


      .mode-switch.test {
        background:#f59e0b;
      }


      .mode-switch.live {
        background:#dc2626;
      }


      /* =================================================
         SECRET INPUT
      ================================================= */

      .secret-input {
        position:relative;
      }


      .secret-input input {
        padding-right:48px;
      }


      .secret-input button {
        position:absolute;

        top:50%;

        right:5px;

        transform:
          translateY(-50%);

        width:36px;

        height:36px;

        border:0;

        background:transparent;

        color:#777;

        cursor:pointer;

        border-radius:8px;
      }


      .optional {
        margin-left:5px;

        font-size:10px;

        color:#9a93a7;

        font-weight:500;
      }


      /* =================================================
         MODAL ACTIONS
      ================================================= */

      .modal-actions {
        display:flex;

        justify-content:flex-end;

        gap:10px;

        padding-top:5px;
      }


      .cancel-button {
        height:48px;

        padding:0 20px;

        border:1px solid #ddd8e9;

        border-radius:11px;

        background:#fff;

        color:#5d566b;

        font-weight:700;

        cursor:pointer;
      }


      .payment-save-button {
        min-width:170px;

        height:48px;

        border:0;

        border-radius:11px;

        background:
          linear-gradient(
            135deg,
            #5b21b6,
            #7c3aed
          );

        color:#fff;

        font-weight:750;

        cursor:pointer;

        display:flex;

        align-items:center;

        justify-content:center;

        gap:8px;
      }


      .payment-save-button:disabled {
        opacity:.6;

        cursor:not-allowed;
      }


      /* =================================================
         LOADING
      ================================================= */

      .payment-loading {
        min-height:80vh;

        display:flex;

        align-items:center;

        justify-content:center;

        flex-direction:column;

        color:#5b21b6;
      }


      .payment-loading h3 {
        margin:15px 0 4px;
      }


      .payment-loading p {
        margin:0;

        color:#888394;
      }


      .payment-loading-icon {
        font-size:30px;

        animation:
          payment-spin
          1s linear infinite;
      }


      .spin {
        animation:
          payment-spin
          1s linear infinite;
      }


      @keyframes payment-spin {

        to {
          transform:
            rotate(360deg);
        }

      }


      /* =================================================
         TABLET
      ================================================= */

      @media(max-width:1100px) {

        .payment-page {
          padding:20px;
        }

        .gateway-table {
          min-width:900px;
        }

      }


      /* =================================================
         MOBILE
      ================================================= */

      @media(max-width:650px) {

        .payment-page {
          padding:14px;
        }


        /* HEADER */

        .payment-header {
          padding:16px;

          border-radius:18px;

          margin-bottom:22px;
        }


        .payment-header-left {
          gap:9px;

          min-width:0;
        }


        .payment-back-button {
          width:35px;

          height:35px;

          flex:0 0 35px;
        }


        .payment-header-icon {
          width:43px;

          height:43px;

          flex:0 0 43px;

          border-radius:12px;

          font-size:17px;
        }


        .payment-header h1 {
          font-size:20px;

          line-height:1.15;
        }


        .payment-header p {
          font-size:11px;

          line-height:1.35;
        }


        .payment-total {
          display:none;
        }


        /* HEADING */

        .gateway-toolbar {
          align-items:stretch;

          flex-direction:column;

          gap:13px;

          margin-bottom:16px;
        }


        .gateway-heading-content h2 {
          font-size:21px;
        }


        .gateway-heading-content p {
          margin-top:5px;

          font-size:12px;
        }


        .add-gateway-button {
          width:100%;

          min-height:48px;

          justify-content:center;

          border-radius:11px;

          font-size:14px;
        }


        /* TABLE CONTAINER */

        .gateway-list {
          width:100%;

          max-width:100%;

          border-radius:16px;
        }


        /*
          On mobile the table becomes
          card-like while keeping labels.
        */

        .gateway-table {
          width:100%;

          min-width:0;

          border-collapse:separate;

          border-spacing:0;
        }


        .gateway-table thead {
          display:none;
        }


        .gateway-table tbody {
          display:block;

          width:100%;
        }


        .gateway-table tbody tr {
          display:block;

          width:100%;

          padding:17px 15px;

          border-bottom:1px solid #eeeaf5;

          background:#fff;
        }


        .gateway-table tbody tr:last-child {
          border-bottom:0;
        }


        .gateway-table tbody td {
          display:flex;

          align-items:center;

          justify-content:space-between;

          width:100%;

          height:auto;

          min-height:38px;

          padding:5px 0;

          border:0;

          background:transparent;

          text-align:right;
        }


        .gateway-table tbody tr:hover td {
          background:transparent;
        }


        .gateway-table tbody td::before {
          content:attr(data-label);

          flex:0 0 auto;

          margin-right:15px;

          color:#77728a;

          font-size:10px;

          font-weight:800;

          text-transform:uppercase;

          letter-spacing:.5px;

          text-align:left;
        }


        /* NUMBER */

        .gateway-table td.gateway-number {
          display:none;
        }


        /* GATEWAY */

        .gateway-table td.gateway-cell {
          display:block;

          padding:0 0 10px;

          text-align:left;
        }


        .gateway-table td.gateway-cell::before {
          display:none;
        }


        .gateway-cell-inner {
          display:flex;

          align-items:center;

          gap:12px;

          min-width:0;
        }


        .gateway-logo {
          width:50px;

          height:50px;

          flex:0 0 50px;

          border-radius:14px;

          font-size:21px;
        }


        .gateway-info {
          min-width:0;
        }


        .gateway-name-line {
          gap:6px;
        }


        .gateway-name-line strong {
          font-size:15px;
        }


        .code-badge {
          font-size:9px;

          padding:4px 7px;
        }


        .gateway-description {
          font-size:10px;

          margin-top:4px;
        }


        /* MODE */

        .gateway-table td.gateway-mode {
          justify-content:space-between;
        }


        /* TYPE */

        .gateway-table td.gateway-type {
          justify-content:space-between;
        }


        /* STATUS */

        .gateway-table td.gateway-status {
          justify-content:space-between;
        }


        /* SORT */

        .gateway-table td.sort-cell {
          justify-content:space-between;

          text-align:right;
        }


        .sort-badge {
          width:32px;

          height:32px;
        }


        /* ACTIONS */

        .gateway-table td.gateway-actions-cell {
          display:block;

          padding-top:10px;

          margin-top:5px;

          border-top:1px solid #f0edf5;

        }


        .gateway-table td.gateway-actions-cell::before {
          display:none;
        }


        .gateway-actions {
          width:100%;

          display:grid;

          grid-template-columns:
            1fr
            1fr
            42px;

          gap:7px;
        }


        .gateway-actions button {
          min-height:39px;

          width:100%;

          padding:8px 7px;

          font-size:10px;
        }


        .delete-button {
          width:42px !important;
        }


        /* EMPTY */

        .empty-gateway {
          padding:50px 20px;
        }


        /* MODAL */

        .gateway-modal-overlay {
          padding:10px;
        }


        .gateway-modal {
          width:100%;

          max-height:94vh;

          border-radius:17px;
        }


        .modal-header {
          padding:17px;

          gap:10px;
        }


        .modal-header h2 {
          font-size:17px;
        }


        .modal-header p {
          font-size:10px;
        }


        .gateway-modal form {
          padding:17px;
        }


        .form-grid,
        .modal-setting-grid {
          grid-template-columns:1fr;
        }


        .modal-setting {
          padding:13px;
        }


        .modal-actions {
          flex-direction:column-reverse;
        }


        .cancel-button,
        .payment-save-button {
          width:100%;
        }

      }


      /* =================================================
         VERY SMALL MOBILE
      ================================================= */

      @media(max-width:380px) {

        .payment-page {
          padding:10px;
        }


        .payment-header {
          padding:13px;
        }


        .payment-header-icon {
          width:40px;

          height:40px;

          flex-basis:40px;
        }


        .payment-header h1 {
          font-size:18px;
        }


        .gateway-heading-content h2 {
          font-size:19px;
        }


        .gateway-actions {
          grid-template-columns:
            1fr
            1fr
            40px;
        }

      }

    `}</style>
  );
}

export default Payment;