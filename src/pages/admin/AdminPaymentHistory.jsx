import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaCreditCard,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUser,
  FaUsers,
  FaCalendarAlt,
  FaRupeeSign,
} from "react-icons/fa";

import "./admin-payment-history.css";

const API_URL =
  "https://zyntaweb.com/skilllab/adminpaymenthistory.php";

const AdminPaymentHistory = ({
  open,
  student,
  onClose,
}) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD PAYMENT HISTORY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open || !student?.id) {
      return;
    }

    fetchPaymentHistory();
  }, [open, student]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const adminData = JSON.parse(
        localStorage.getItem("admin") || "null"
      );

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_email: adminData?.email || "",
          student_id: student.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load payment history"
        );
      }

      setPayments(
        Array.isArray(data.payments)
          ? data.payments
          : []
      );
    } catch (err) {
      console.error("Payment history error:", err);

      setError(
        err.message || "Unable to load payment history"
      );

      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE
  |--------------------------------------------------------------------------
  */

  const handleClose = () => {
    setPayments([]);
    setError("");
    onClose();
  };

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  const getStatusIcon = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "success") {
      return <FaCheckCircle />;
    }

    if (value === "pending") {
      return <FaClock />;
    }

    if (value === "failed") {
      return <FaTimesCircle />;
    }

    return <FaClock />;
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "success") {
      return "payment-status-success";
    }

    if (value === "pending") {
      return "payment-status-pending";
    }

    if (value === "failed") {
      return "payment-status-failed";
    }

    return "payment-status-pending";
  };

  /*
  |--------------------------------------------------------------------------
  | DATE FORMAT
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | DON'T RENDER
  |--------------------------------------------------------------------------
  */

  if (!open) {
    return null;
  }

  return (
    <div
      className="admin-payment-overlay"
      onClick={handleClose}
    >
      <div
        className="admin-payment-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="admin-payment-header">

          <div className="admin-payment-title-wrap">

            <div className="admin-payment-icon">
              <FaCreditCard />
            </div>

            <div>
              <h2>Payment History</h2>

              <p>
                Student subscription payment records
              </p>
            </div>

          </div>

          <button
            type="button"
            className="admin-payment-close"
            onClick={handleClose}
          >
            <FaTimes />
          </button>

        </div>

        {/* ============================================================
            STUDENT INFO
        ============================================================ */}

        {student && (
          <div className="admin-payment-student-card">

            <div className="admin-payment-student-avatar">
              {student.name
                ? student.name.charAt(0).toUpperCase()
                : "S"}
            </div>

            <div className="admin-payment-student-info">

              <h3>
                {student.name || "Student"}
              </h3>

              {student.email && (
                <p>{student.email}</p>
              )}

            </div>

            <div className="admin-payment-total-box">

              <span>Total Payments</span>

              <strong>
                {payments.length}
              </strong>

            </div>

          </div>
        )}

        {/* ============================================================
            BODY
        ============================================================ */}

        <div className="admin-payment-body">

          {/* LOADING */}

          {loading && (
            <div className="admin-payment-loading">

              <div className="admin-payment-spinner"></div>

              <p>
                Loading payment history...
              </p>

            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="admin-payment-error">

              <FaTimesCircle />

              <span>{error}</span>

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            payments.length === 0 && (
              <div className="admin-payment-empty">

                <div className="admin-payment-empty-icon">
                  <FaCreditCard />
                </div>

                <h3>
                  No Payment History
                </h3>

                <p>
                  No payment or renewal has been
                  recorded for this student yet.
                </p>

              </div>
            )}

          {/* PAYMENT LIST */}

          {!loading &&
            !error &&
            payments.length > 0 && (
              <div className="admin-payment-list">

                {payments.map((payment) => (

                  <div
                    className="admin-payment-item"
                    key={payment.id}
                  >

                    {/* LEFT */}

                    <div className="admin-payment-main">

                      <div className="admin-payment-plan-icon">
                        <FaCreditCard />
                      </div>

                      <div className="admin-payment-details">

                        <div className="admin-payment-plan-row">

                          <h3>
                            {payment.plan_name ||
                              "Subscription"}
                          </h3>

                          <span
                            className={`admin-payment-status ${getStatusClass(
                              payment.status
                            )}`}
                          >
                            {getStatusIcon(
                              payment.status
                            )}

                            {payment.status ||
                              "Unknown"}
                          </span>

                        </div>

                        <div className="admin-payment-meta">

                          <span>
                            <FaRupeeSign />
                            ₹
                            {Number(
                              payment.amount || 0
                            ).toLocaleString("en-IN")}
                          </span>

                          <span>
                            {payment.billing_cycle ||
                              "-"}
                          </span>

                          <span>
                            <FaCalendarAlt />
                            {formatDateTime(
                              payment.paid_at
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="admin-payment-paid-by">

                      <span className="paid-by-label">
                        Paid By
                      </span>

                      <div
                        className={`paid-by-badge ${
                          payment.paid_by ===
                          "Parent"
                            ? "paid-by-parent"
                            : "paid-by-student"
                        }`}
                      >

                        {payment.paid_by ===
                        "Parent" ? (
                          <FaUsers />
                        ) : (
                          <FaUser />
                        )}

                        {payment.paid_by ||
                          "Student"}

                      </div>

                      <span className="payment-id">
                        Payment ID:{" "}
                        {payment.gateway_payment_id ||
                          "-"}
                      </span>

                    </div>

                    {/* DATES */}

                    <div className="admin-payment-dates">

                      <div>
                        <span>
                          Start Date
                        </span>

                        <strong>
                          {formatDate(
                            payment.start_date
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          End Date
                        </span>

                        <strong>
                          {formatDate(
                            payment.end_date
                          )}
                        </strong>
                      </div>

                    </div>

                  </div>

                ))}

              </div>
            )}

        </div>

        {/* ============================================================
            FOOTER
        ============================================================ */}

        <div className="admin-payment-footer">

          <button
            type="button"
            className="admin-payment-refresh"
            onClick={fetchPaymentHistory}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            type="button"
            className="admin-payment-done"
            onClick={handleClose}
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
};

export default AdminPaymentHistory;