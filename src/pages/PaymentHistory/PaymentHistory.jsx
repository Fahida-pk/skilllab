import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaCreditCard,
  FaCircleCheck,
  FaCircleXmark,
  FaClock,
  FaReceipt,
  FaRotate,
  FaShieldHalved,
  FaCalendarDays,
  FaIndianRupeeSign,
} from "react-icons/fa6";

import "./payment-history.css";

// =====================================================
// API
// =====================================================

const PAYMENT_HISTORY_API =
  "https://zyntaweb.com/skilllab/payment-history.php";

// =====================================================
// GET LOGGED USER
// =====================================================

function getLoggedInUser() {

  try {

    const userString =
      localStorage.getItem("user");

    if (!userString) {
      return null;
    }

    return JSON.parse(userString);

  } catch (error) {

    console.error(
      "Unable to read user:",
      error
    );

    return null;
  }
}

// =====================================================
// GET USER ID
// =====================================================

function getUserId(user) {

  if (!user) {
    return 0;
  }

  return Number(
    user.id ??
    user.user_id ??
    user.userId ??
    0
  );
}

// =====================================================
// FORMAT MONEY
// =====================================================

function formatMoney(amount) {

  return Number(
    amount || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateValue) {

  if (!dateValue) {
    return "-";
  }

  const date =
    new Date(
      dateValue.replace(" ", "T")
    );

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

// =====================================================
// FORMAT DATE TIME
// =====================================================

function formatDateTime(dateValue) {

  if (!dateValue) {
    return "-";
  }

  const date =
    new Date(
      dateValue.replace(" ", "T")
    );

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

// =====================================================
// FORMAT TRANSACTION
// =====================================================

function formatTransactionType(type) {

  const value =
    String(type || "")
      .toLowerCase();

  if (value === "new") {
    return "New Subscription";
  }

  if (value === "renewal") {
    return "Renewal";
  }

  if (value === "upgrade") {
    return "Upgrade";
  }

  return type || "Payment";
}

// =====================================================
// COMPONENT
// =====================================================

function PaymentHistory() {

  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [user, setUser] =
    useState(null);

  const [payments, setPayments] =
    useState([]);

  const [totalPaid, setTotalPaid] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===================================================
  // LOAD HISTORY
  // ===================================================

  useEffect(() => {

    const loggedUser =
      getLoggedInUser();

    if (!loggedUser) {

      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }

    setUser(loggedUser);

    const userId =
      getUserId(loggedUser);

    if (userId <= 0) {

      setError(
        "User information not found. Please login again."
      );

      setLoading(false);

      return;
    }

    loadPaymentHistory(
      userId
    );

  }, [navigate]);

  // ===================================================
  // FETCH PAYMENT HISTORY
  // ===================================================

  const loadPaymentHistory =
    async (userId) => {

      try {

        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${PAYMENT_HISTORY_API}?user_id=${encodeURIComponent(
              userId
            )}`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",
              },

              cache: "no-store",
            }
          );

        if (!response.ok) {

          throw new Error(
            `Payment history API error: ${response.status}`
          );
        }

        const data =
          await response.json();

        console.log(
          "PAYMENT HISTORY:",
          data
        );

        if (!data.success) {

          throw new Error(
            data.message ||
            "Unable to load payment history."
          );
        }

        const history =
          data.data?.payments;

        setPayments(
          Array.isArray(history)
            ? history
            : []
        );

        setTotalPaid(
          Number(
            data.data?.total_paid || 0
          )
        );

      } catch (error) {

        console.error(
          "Payment history error:",
          error
        );

        setError(
          error.message ||
          "Unable to load payment history."
        );

        setPayments([]);

      } finally {

        setLoading(false);
      }
    };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (
      <div className="payment-history-page">

        <div className="payment-history-loading">

          <FaRotate
            className="payment-loading-icon"
          />

          <h2>
            Loading Payment History
          </h2>

          <p>
            Please wait...
          </p>

        </div>

      </div>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (

    <div className="payment-history-page">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="payment-history-glow glow-one" />
      <div className="payment-history-glow glow-two" />

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="payment-history-header">

        <div className="payment-header-left">

      <button
  type="button"
  className="payment-back-button"
  onClick={() => navigate("/dashboard")}
>
  <FaArrowLeft />
</button>

          <div className="payment-header-icon">
            <FaReceipt />
          </div>

          <div>

            <h1>
              Payment History
            </h1>

            <p>
              View your SkillLab subscription payments.
            </p>

          </div>

        </div>

        <div className="payment-secure-badge">

          <FaShieldHalved />

          <span>
            Secure Payment Records
          </span>

        </div>

      </div>

      {/* =================================================
          USER INFO
      ================================================= */}

      <div className="payment-user-card">

        <div className="payment-user-avatar">

          {user?.picture ? (

            <img
              src={user.picture}
              alt="Profile"
            />

          ) : (

            <FaCreditCard />

          )}

        </div>

        <div>

          <div className="payment-user-label">
            PAYMENT ACCOUNT
          </div>

          <h3>
            {user?.name ||
              user?.full_name ||
              "User"}
          </h3>

          <p>
            {user?.email || ""}
          </p>

        </div>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="payment-summary-grid">

        <div className="payment-summary-card">

          <div className="summary-icon purple">
            <FaReceipt />
          </div>

          <div>

            <span>
              Total Payments
            </span>

            <strong>
              {payments.length}
            </strong>

          </div>

        </div>

        <div className="payment-summary-card">

          <div className="summary-icon green">
            <FaIndianRupeeSign />
          </div>

          <div>

            <span>
              Total Paid
            </span>

            <strong>
              ₹{formatMoney(totalPaid)}
            </strong>

          </div>

        </div>

        <div className="payment-summary-card">

          <div className="summary-icon blue">
            <FaShieldHalved />
          </div>

          <div>

            <span>
              Payment Gateway
            </span>

            <strong>
              Razorpay
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="payment-error">

          <FaCircleXmark />

          <span>
            {error}
          </span>

        </div>

      )}

      {/* =================================================
          HISTORY
      ================================================= */}

      <div className="payment-history-card">

        <div className="payment-history-title">

          <div>

            <span>
              TRANSACTION HISTORY
            </span>

            <h2>
              Your Payments
            </h2>

          </div>

          <div className="history-count">

            {payments.length}{" "}
            {payments.length === 1
              ? "Payment"
              : "Payments"}

          </div>

        </div>

        {payments.length === 0 ? (

          <div className="no-payment-history">

            <div className="empty-payment-icon">
              <FaReceipt />
            </div>

            <h3>
              No Payment History
            </h3>

            <p>
              You have not made any subscription payments yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/subscription")
              }
            >
              View Subscription Plans
            </button>

          </div>

        ) : (

          <div className="payment-list">

            {payments.map(
              (payment) => {

                const status =
                  String(
                    payment.status || ""
                  ).toLowerCase();

                const isSuccess =
                  status === "success";

                const isFailed =
                  status === "failed";

                return (

                  <div
                    className="payment-item"
                    key={payment.id}
                  >

                    {/* LEFT */}

                    <div className="payment-item-left">

                      <div
                        className={`payment-item-icon ${
                          isSuccess
                            ? "success"
                            : isFailed
                            ? "failed"
                            : "pending"
                        }`}
                      >

                        {isSuccess ? (

                          <FaCircleCheck />

                        ) : isFailed ? (

                          <FaCircleXmark />

                        ) : (

                          <FaClock />

                        )}

                      </div>

                      <div className="payment-main">

                        <div className="payment-plan-row">

                          <h3>
                            {payment.plan_name ||
                              "Subscription"}
                          </h3>

                          <span
                            className={`payment-status ${
                              isSuccess
                                ? "success"
                                : isFailed
                                ? "failed"
                                : "pending"
                            }`}
                          >
                            {status === "success"
                              ? "PAID"
                              : status === "failed"
                              ? "FAILED"
                              : "PENDING"}
                          </span>

                        </div>

                        <p className="payment-type">

                          {formatTransactionType(
                            payment.transaction_type
                          )}

                          {payment.billing_cycle && (
                            <>
                              {" • "}
                              {payment.billing_cycle}
                            </>
                          )}

                        </p>

                        <div className="payment-date">

                          <FaCalendarDays />

                          <span>
                            {formatDateTime(
                              payment.paid_at ||
                              payment.created_at
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="payment-item-right">

                      <div className="payment-amount">

                        ₹
                        {formatMoney(
                          payment.amount
                        )}

                      </div>

                      {payment.gateway_payment_id && (

                        <div className="payment-id">

                          <span>
                            Payment ID
                          </span>

                          <strong
                            title={
                              payment.gateway_payment_id
                            }
                          >
                            {payment.gateway_payment_id}
                          </strong>

                        </div>

                      )}

                      {payment.gateway_order_id && (

                        <div className="payment-id">

                          <span>
                            Order ID
                          </span>

                          <strong
                            title={
                              payment.gateway_order_id
                            }
                          >
                            {payment.gateway_order_id}
                          </strong>

                        </div>

                      )}

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

      {/* =================================================
          FOOTER NOTE
      ================================================= */}

      <div className="payment-history-note">

        <FaShieldHalved />

        <div>

          <strong>
            Secure Payment Information
          </strong>

          <p>
            Your payment information is retrieved
            securely from your SkillLab subscription
            records. Card and UPI details are not stored
            by SkillLab.
          </p>

        </div>

      </div>

    </div>
  );
}

export default PaymentHistory;