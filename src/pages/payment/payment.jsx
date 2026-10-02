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
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const API_URL =
  "https://zyntaweb.com/skilllab/payment-gateway.php";

function Payment() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [gateway, setGateway] = useState({
    id: 1,
    code: "razorpay",
    name: "Razorpay",
    is_enabled: 0,
    is_live: 0,
    public_key: "",
    secret_key: "",
    webhook_secret: "",
  });

  /* =====================================================
     LOAD RAZORPAY SETTINGS
  ===================================================== */

  const loadGateway = async () => {
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

      console.log("PAYMENT GATEWAY:", data);

      if (!data.success) {
        throw new Error(
          data.message || "Unable to load payment gateway"
        );
      }

      if (data.gateway) {
        setGateway({
          id: data.gateway.id ?? 1,
          code: data.gateway.code ?? "razorpay",
          name: data.gateway.name ?? "Razorpay",

          is_enabled:
            Number(data.gateway.is_enabled ?? 0),

          is_live:
            Number(data.gateway.is_live ?? 0),

          public_key:
            data.gateway.public_key ?? "",

          secret_key:
            data.gateway.secret_key ?? "",

          webhook_secret:
            data.gateway.webhook_secret ?? "",
        });
      }
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
    loadGateway();
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
     SAVE GATEWAY
  ===================================================== */

  const saveGateway = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage("");

    try {
      const formData = new URLSearchParams();

      formData.append(
        "save_gateway",
        "1"
      );

      formData.append(
        "gateway_id",
        String(gateway.id || 1)
      );

      formData.append(
        "code",
        gateway.code || "razorpay"
      );

      formData.append(
        "name",
        gateway.name || "Razorpay"
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
        "extra_config_json",
        ""
      );

      formData.append(
        "sort_order",
        "1"
      );

      if (Number(gateway.is_enabled) === 1) {
        formData.append(
          "is_enabled",
          "1"
        );
      }

      if (Number(gateway.is_live) === 1) {
        formData.append(
          "is_live",
          "1"
        );
      }

      /*
       * SkillLab is using Razorpay online payment.
       * Manual payment is not enabled here.
       */
      formData.append(
        "is_manual",
        "0"
      );

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      console.log(
        "SAVE PAYMENT GATEWAY:",
        data
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to save payment gateway"
        );
      }

      setMessage(
        data.message ||
          "Razorpay settings saved successfully."
      );

      setMessageType("success");

      await loadGateway();

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
     TOGGLE ENABLE
  ===================================================== */

  const toggleEnabled = () => {
    setGateway((prev) => ({
      ...prev,
      is_enabled:
        Number(prev.is_enabled) === 1
          ? 0
          : 1,
    }));
  };

  /* =====================================================
     TOGGLE LIVE / TEST
  ===================================================== */

  const toggleLive = () => {
    setGateway((prev) => ({
      ...prev,
      is_live:
        Number(prev.is_live) === 1
          ? 0
          : 1,
    }));
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
            Loading Payment Gateway
          </h3>

          <p>
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="payment-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="payment-header">

        <div className="payment-header-left">

          <button
            type="button"
            className="payment-back-button"
            onClick={() =>
              navigate("/AdminDashboard")
            }
          >
            <FaArrowLeft />
          </button>

          <div className="payment-header-icon">
            <FaCreditCard />
          </div>

          <div>
            <h1>
              Payment Gateway
            </h1>

            <p>
              Manage Razorpay payment settings for SkillLab
            </p>
          </div>

        </div>

        <div className="payment-status-header">

          {Number(gateway.is_enabled) === 1 ? (
            <>
              <FaCircleCheck />
              <span>
                Gateway Enabled
              </span>
            </>
          ) : (
            <>
              <FaCircleXmark />
              <span>
                Gateway Disabled
              </span>
            </>
          )}

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
          MAIN GRID
      ================================================= */}

      <div className="payment-grid">

        {/* =================================================
            RAZORPAY CARD
        ================================================= */}

        <div className="payment-card">

          <div className="payment-card-header">

            <div className="razorpay-logo">
              ₹
            </div>

            <div>
              <h2>
                Razorpay
              </h2>

              <p>
                Online payment gateway
              </p>
            </div>

            <div
              className={`gateway-badge ${
                Number(gateway.is_enabled) === 1
                  ? "enabled"
                  : "disabled"
              }`}
            >
              {Number(gateway.is_enabled) === 1
                ? "Enabled"
                : "Disabled"}
            </div>

          </div>


          {/* =================================================
              SETTINGS
          ================================================= */}

          <div className="payment-card-body">

            {/* ENABLE */}

            <div className="payment-setting-row">

              <div className="setting-info">

                <div className="setting-icon green">
                  <FaCircleCheck />
                </div>

                <div>
                  <h3>
                    Enable Razorpay
                  </h3>

                  <p>
                    Allow students to make online renewal payments.
                  </p>
                </div>

              </div>

              <button
                type="button"
                className={`payment-switch ${
                  Number(gateway.is_enabled) === 1
                    ? "on"
                    : ""
                }`}
                onClick={toggleEnabled}
                aria-label="Toggle Razorpay"
              >
                <span />
              </button>

            </div>


            {/* MODE */}

            <div className="payment-setting-row">

              <div className="setting-info">

                <div className="setting-icon blue">
                  <FaGlobe />
                </div>

                <div>
                  <h3>
                    Payment Mode
                  </h3>

                  <p>
                    Choose whether Razorpay uses Test or Live mode.
                  </p>
                </div>

              </div>

              <button
                type="button"
                className={`mode-switch ${
                  Number(gateway.is_live) === 1
                    ? "live"
                    : "test"
                }`}
                onClick={toggleLive}
              >
                {Number(gateway.is_live) === 1
                  ? "LIVE"
                  : "TEST"}
              </button>

            </div>


            {/* DIVIDER */}

            <div className="payment-divider" />


            {/* PUBLIC KEY */}

            <div className="payment-field">

              <label>
                <FaKey />
                Razorpay Key ID
              </label>

              <input
                type="text"
                value={
                  gateway.public_key || ""
                }
                onChange={(e) =>
                  handleChange(
                    "public_key",
                    e.target.value
                  )
                }
                placeholder="rzp_test_xxxxxxxxxxxxx"
                autoComplete="off"
              />

              <small>
                This is the Razorpay public Key ID.
              </small>

            </div>


            {/* SECRET KEY */}

            <div className="payment-field">

              <label>
                <FaShieldHalved />
                Razorpay Key Secret
              </label>

              <div className="secret-input">

                <input
                  type={
                    showSecret
                      ? "text"
                      : "password"
                  }
                  value={
                    gateway.secret_key || ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "secret_key",
                      e.target.value
                    )
                  }
                  placeholder="Enter Razorpay Key Secret"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowSecret(
                      (prev) => !prev
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

              <small className="security-note">
                <FaShieldHalved />
                Secret key is used only by the server.
              </small>

            </div>


            {/* WEBHOOK SECRET */}

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
                    gateway.webhook_secret || ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "webhook_secret",
                      e.target.value
                    )
                  }
                  placeholder="Enter webhook secret"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowWebhook(
                      (prev) => !prev
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


            {/* SAVE */}

            <button
              type="button"
              className="payment-save-button"
              disabled={saving}
              onClick={saveGateway}
            >
              {saving ? (
                <>
                  <FaRotate className="spin" />
                  Saving...
                </>
              ) : (
                <>
<FaFloppyDisk />
                  Save Razorpay Settings
                </>
              )}
            </button>

          </div>

</div>
</div>

     

      {/* =================================================
          INLINE CSS
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .payment-page {
          min-height: 100vh;
          padding: 28px;
          background:
            radial-gradient(
              circle at top right,
              rgba(124,58,237,0.10),
              transparent 35%
            ),
            #f6f7fb;
          color: #172033;
        }

        .payment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 22px 24px;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            #ffffff,
            #f8f7ff
          );
          border: 1px solid #ebe8f5;
          box-shadow:
            0 10px 35px rgba(40, 32, 80, 0.07);
          margin-bottom: 22px;
        }

        .payment-header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .payment-back-button {
          width: 40px;
          height: 40px;
          border: 1px solid #e4e0ef;
          border-radius: 11px;
          background: #fff;
          color: #5b21b6;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .payment-back-button:hover {
          background: #f4f0ff;
        }

        .payment-header-icon {
          width: 54px;
          height: 54px;
          border-radius: 15px;
          background: linear-gradient(
            135deg,
            #5b21b6,
            #7c3aed
          );
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow:
            0 8px 20px rgba(91,33,182,.22);
        }

        .payment-header h1 {
          margin: 0;
          font-size: 25px;
          font-weight: 800;
        }

        .payment-header p {
          margin: 4px 0 0;
          color: #77728a;
          font-size: 14px;
        }

        .payment-status-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          border-radius: 30px;
          background: #ecfdf5;
          color: #047857;
          font-size: 13px;
          font-weight: 700;
        }

        .payment-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          border-radius: 13px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .payment-message.success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
        }

        .payment-message.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .payment-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            340px;
          gap: 22px;
          align-items: start;
        }

        .payment-card,
        .payment-info-card,
        .payment-mode-card {
          background: #fff;
          border: 1px solid #ebe8f5;
          border-radius: 20px;
          box-shadow:
            0 10px 35px rgba(40,32,80,.06);
          overflow: hidden;
        }

        .payment-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 22px;
          border-bottom: 1px solid #eeeaf5;
        }

        .razorpay-logo {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: linear-gradient(
            135deg,
            #3395ff,
            #1674d1
          );
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          font-weight: 800;
        }

        .payment-card-header h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
        }

        .payment-card-header p {
          margin: 3px 0 0;
          color: #858092;
          font-size: 13px;
        }

        .gateway-badge {
          margin-left: auto;
          padding: 7px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .gateway-badge.enabled {
          background: #ecfdf5;
          color: #047857;
        }

        .gateway-badge.disabled {
          background: #f3f4f6;
          color: #6b7280;
        }

        .payment-card-body {
          padding: 24px;
        }

        .payment-setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 10px 0;
        }

        .setting-info {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .setting-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .setting-icon.green {
          background: #ecfdf5;
          color: #059669;
        }

        .setting-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .setting-info h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 750;
        }

        .setting-info p {
          margin: 3px 0 0;
          font-size: 12px;
          color: #888394;
        }

        .payment-switch {
          width: 51px;
          height: 29px;
          border: 0;
          border-radius: 30px;
          background: #d7d5df;
          padding: 3px;
          cursor: pointer;
          transition: .2s;
        }

        .payment-switch span {
          display: block;
          width: 23px;
          height: 23px;
          border-radius: 50%;
          background: #fff;
          transition: .2s;
          box-shadow: 0 2px 5px rgba(0,0,0,.15);
        }

        .payment-switch.on {
          background: #16a34a;
        }

        .payment-switch.on span {
          transform: translateX(22px);
        }

        .mode-switch {
          min-width: 74px;
          height: 32px;
          border: 0;
          border-radius: 20px;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .mode-switch.test {
          background: #f59e0b;
        }

        .mode-switch.live {
          background: #dc2626;
        }

        .payment-divider {
          height: 1px;
          background: #eeeaf5;
          margin: 20px 0;
        }

        .payment-field {
          margin-bottom: 20px;
        }

        .payment-field label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 750;
          color: #29233b;
        }

        .payment-field label svg {
          color: #6d28d9;
        }

        .payment-field input {
          width: 100%;
          height: 46px;
          border: 1px solid #ddd8e9;
          border-radius: 11px;
          padding: 0 13px;
          outline: none;
          font-size: 13px;
          color: #27223a;
          background: #fff;
        }

        .payment-field input:focus {
          border-color: #8b5cf6;
          box-shadow:
            0 0 0 3px rgba(139,92,246,.10);
        }

        .payment-field small {
          display: block;
          margin-top: 6px;
          color: #9993a5;
          font-size: 11px;
        }

        .security-note {
          display: flex !important;
          align-items: center;
          gap: 5px;
          color: #059669 !important;
        }

        .secret-input {
          position: relative;
        }

        .secret-input input {
          padding-right: 48px;
        }

        .secret-input button {
          position: absolute;
          top: 50%;
          right: 5px;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border: 0;
          background: transparent;
          color: #777;
          cursor: pointer;
          border-radius: 8px;
        }

        .secret-input button:hover {
          background: #f4f1fa;
        }

        .optional {
          margin-left: 5px;
          font-size: 10px;
          color: #9a93a7;
          font-weight: 500;
        }

        .payment-save-button {
          width: 100%;
          height: 48px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            #5b21b6,
            #7c3aed
          );
          color: #fff;
          font-weight: 750;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow:
            0 8px 18px rgba(91,33,182,.20);
        }

        .payment-save-button:hover {
          opacity: .94;
        }

        .payment-save-button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .payment-side {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .payment-info-card {
          padding: 24px;
        }

        .info-card-icon {
          width: 46px;
          height: 46px;
          border-radius: 13px;
          background: #f3e8ff;
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          margin-bottom: 15px;
        }

        .payment-info-card h2 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 800;
        }

        .payment-info-card > p {
          margin: 0;
          color: #777283;
          line-height: 1.6;
          font-size: 13px;
        }

        .info-list {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .info-list div {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 12px;
          color: #514b5d;
        }

        .info-list svg {
          flex-shrink: 0;
          color: #10b981;
          margin-top: 2px;
        }

        .payment-mode-card {
          padding: 17px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mode-card-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .payment-mode-card span {
          display: block;
          font-size: 11px;
          color: #9993a5;
        }

        .payment-mode-card strong {
          display: block;
          margin-top: 3px;
          font-size: 13px;
        }

        .payment-loading {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #5b21b6;
        }

        .payment-loading h3 {
          margin: 15px 0 4px;
        }

        .payment-loading p {
          margin: 0;
          color: #888;
        }

        .payment-loading-icon {
          font-size: 30px;
          animation: payment-spin 1s linear infinite;
        }

        .spin {
          animation: payment-spin 1s linear infinite;
        }

        @keyframes payment-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {

          .payment-grid {
            grid-template-columns: 1fr;
          }

          .payment-side {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

        }

        @media (max-width: 650px) {

          .payment-page {
            padding: 14px;
          }

          .payment-header {
            padding: 17px;
            align-items: flex-start;
          }

          .payment-header h1 {
            font-size: 20px;
          }

          .payment-status-header {
            display: none;
          }

          .payment-card-header {
            flex-wrap: wrap;
          }

          .gateway-badge {
            margin-left: auto;
          }

          .payment-card-body {
            padding: 18px;
          }

          .payment-setting-row {
            align-items: flex-start;
          }

          .setting-info p {
            max-width: 220px;
          }

          .payment-side {
            display: flex;
          }

        }

      `}</style>

    </div>
  );
}

export default Payment;