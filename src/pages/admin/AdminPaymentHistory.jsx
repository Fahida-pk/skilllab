import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaRupeeSign,
  FaSyncAlt,
  FaTimesCircle,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./admin-payment-history.css";

const API_URL =
  "https://zyntaweb.com/skilllab/adminpaymenthistory.php";

function AdminPaymentHistory() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const savedAdmin = localStorage.getItem("admin");

      if (!savedAdmin) {
        navigate("/admin/login", { replace: true });
        return;
      }

      let adminData;

      try {
        adminData = JSON.parse(savedAdmin);
      } catch {
        localStorage.removeItem("admin");
        localStorage.removeItem("adminLoggedIn");
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_email: adminData?.email || "",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load payment history"
        );
      }

      setPayments(
        Array.isArray(data.payments) ? data.payments : []
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
  }, [navigate]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "success" ||
      value === "paid" ||
      value === "completed"
    ) {
      return <FaCheckCircle />;
    }

    if (value === "failed") {
      return <FaTimesCircle />;
    }

    return <FaClock />;
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "success" ||
      value === "paid" ||
      value === "completed"
    ) {
      return "payment-status-success";
    }

    if (value === "failed") {
      return "payment-status-failed";
    }

    return "payment-status-pending";
  };

  const filteredPayments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return payments;

    return payments.filter((payment) =>
      [
        payment.student_name,
        payment.student_email,
        payment.parent_name,
        payment.parent_email,
        payment.plan_name,
        payment.billing_cycle,
        payment.status,
        payment.paid_by,
        payment.gateway_payment_id,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [payments, search]);

  const groupedPayments = useMemo(() => {
    const groups = filteredPayments.reduce((result, payment) => {
      const key =
        payment.student_id ||
        payment.student_email ||
        payment.student_name ||
        `payment-${payment.id}`;

      if (!result[key]) {
        result[key] = {
          student: payment,
          payments: [],
        };
      }

      result[key].payments.push(payment);
      return result;
    }, {});

    return Object.values(groups).map((group) => ({
      ...group,
      payments: [...group.payments].sort(
        (a, b) =>
          new Date(b.paid_at || 0).getTime() -
          new Date(a.paid_at || 0).getTime()
      ),
    }));
  }, [filteredPayments]);

  const totalAmount = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  const parentPayments = payments.filter(
    (payment) =>
      String(payment.paid_by || "").toLowerCase() === "parent"
  ).length;

  return (
    <div className="admin-payment-page">
      <div className="admin-payment-page-header">
        <div className="admin-payment-heading">
          <div className="admin-payment-heading-icon">
            <FaCreditCard />
          </div>

          <div>
            <h1>Payment History</h1>
            <p>
              View student subscriptions and parent payment records
            </p>
          </div>
        </div>

        <div className="admin-payment-header-actions">
          <button
            type="button"
            className="admin-payment-back"
            onClick={() => navigate("/AdminDashboard")}
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <button
            type="button"
            className="admin-payment-refresh"
            onClick={fetchPaymentHistory}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? "payment-spin" : ""} />
            <span>{loading ? "Loading..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      <div className="admin-payment-summary">
        <div className="admin-payment-summary-card">
          <div className="summary-icon blue">
            <FaCreditCard />
          </div>
          <div>
            <span>Total Payments</span>
            <strong>{payments.length}</strong>
          </div>
        </div>

        <div className="admin-payment-summary-card">
          <div className="summary-icon green">
            <FaRupeeSign />
          </div>
          <div>
            <span>Total Amount</span>
            <strong>
              ₹{totalAmount.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="admin-payment-summary-card">
          <div className="summary-icon purple">
            <FaUsers />
          </div>
          <div>
            <span>Parent Payments</span>
            <strong>{parentPayments}</strong>
          </div>
        </div>
      </div>

      <div className="admin-payment-toolbar">
        <div className="admin-payment-search">
          <input
            type="text"
            placeholder="Search student, parent, email, payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-payment-count">
          Showing <strong>{groupedPayments.length}</strong> students
          <span>
            ({filteredPayments.length} payments)
          </span>
        </div>
      </div>

      <div className="admin-payment-content">
        {loading && (
          <div className="admin-payment-state">
            <div className="admin-payment-spinner" />
            <p>Loading payment history...</p>
          </div>
        )}

        {!loading && error && (
          <div className="admin-payment-error">
            <FaTimesCircle />
            <div>
              <strong>Unable to load payment history</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          filteredPayments.length === 0 && (
            <div className="admin-payment-state admin-payment-empty">
              <div className="empty-icon">
                <FaCreditCard />
              </div>
              <h2>No Payment History</h2>
              <p>
                No student or parent subscription payments
                have been recorded yet.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          groupedPayments.length > 0 && (
            <div className="admin-payment-list">
              {groupedPayments.map((group, index) => {
                const latestPayment = group.payments[0];

                const paidByParent =
                  String(latestPayment.paid_by || "").toLowerCase() ===
                  "parent";

                return (
                  <article
                    className="admin-payment-card"
                    key={
                      latestPayment.student_id ||
                      latestPayment.student_email ||
                      latestPayment.id ||
                      index
                    }
                  >
                    <div className="payment-card-header">
                      <div className="payment-title-wrap">
                        <div className="payment-plan-icon">
                          <FaCreditCard />
                        </div>

                        <div>
                          <div className="payment-title-row">
                            <h2>
                              {latestPayment.plan_name ||
                                "Subscription"}
                            </h2>

                            <span
                              className={`admin-payment-status ${getStatusClass(
                                latestPayment.status
                              )}`}
                            >
                              {getStatusIcon(latestPayment.status)}
                              {latestPayment.status || "Pending"}
                            </span>
                          </div>

                          <div className="payment-meta">
                            <span>
                              <FaRupeeSign />
                              ₹
                              {Number(
                                latestPayment.amount || 0
                              ).toLocaleString("en-IN")}
                            </span>

                            <span>
                              {latestPayment.billing_cycle || "-"}
                            </span>

                            <span>
                              <FaCalendarAlt />
                              {formatDateTime(
                                latestPayment.paid_at
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="payment-paid-by">
                        <span>Paid By</span>
                        <div
                          className={`paid-by-badge ${
                            paidByParent
                              ? "paid-by-parent"
                              : "paid-by-student"
                          }`}
                        >
                          {paidByParent ? (
                            <FaUsers />
                          ) : (
                            <FaUser />
                          )}
                          {paidByParent ? "Parent" : "Student"}
                        </div>

                        <small>
                          Payment ID:{" "}
                          {latestPayment.gateway_payment_id || "-"}
                        </small>
                      </div>
                    </div>

                    <div className="payment-people">
                      <div className="person-card">
                        <div className="person-icon student">
                          <FaUser />
                        </div>

                        <div>
                          <span>Student</span>
                          <strong>
                            {latestPayment.student_name || "-"}
                          </strong>
                          <small>
                            {latestPayment.student_email || "-"}
                          </small>
                        </div>
                      </div>

                      <div className="person-card">
                        <div
                          className={`person-icon ${
                            paidByParent ? "parent" : "student"
                          }`}
                        >
                          {paidByParent ? <FaUsers /> : <FaUser />}
                        </div>

                        <div>
                          <span>
                            {paidByParent
                              ? "Parent / Paid By"
                              : "Student / Paid By"}
                          </span>

                          <strong>
                            {paidByParent
                              ? latestPayment.parent_name || "Parent"
                              : latestPayment.student_name || "-"}
                          </strong>

                          <small>
                            {paidByParent
                              ? latestPayment.parent_email || "-"
                              : latestPayment.student_email || "-"}
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="payment-history">
                      <div className="payment-history-heading">
                        <div>
                          <h3>Payment History</h3>
                          <span>
                            {group.payments.length}{" "}
                            {group.payments.length === 1
                              ? "payment"
                              : "payments"}
                          </span>
                        </div>
                      </div>

                      <div className="payment-history-list">
                        {group.payments.map((item, paymentIndex) => (
                          <div
                            className="payment-history-row"
                            key={
                              item.id ||
                              item.gateway_payment_id ||
                              paymentIndex
                            }
                          >
                            <div className="history-number">
                              {paymentIndex + 1}
                            </div>

                            <div className="history-main">
                              <strong>
                                {item.plan_name || "Subscription"}
                              </strong>
                              <span>
                                {formatDateTime(item.paid_at)}
                              </span>
                            </div>

                            <div className="history-cycle">
                              {item.billing_cycle || "-"}
                            </div>

                            <div className="history-amount">
                              ₹
                              {Number(
                                item.amount || 0
                              ).toLocaleString("en-IN")}
                            </div>

                            <div
                              className={`history-status ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {getStatusIcon(item.status)}
                              {item.status || "Pending"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="payment-date-box">
                      <div>
                        <span>Start Date</span>
                        <strong>
                          {formatDate(latestPayment.start_date)}
                        </strong>
                      </div>

                      <div className="date-divider" />

                      <div>
                        <span>End Date</span>
                        <strong>
                          {formatDate(latestPayment.end_date)}
                        </strong>
                      </div>

                      <div className="date-divider" />

                      <div>
                        <span>Latest Payment</span>
                        <strong>
                          {formatDateTime(latestPayment.paid_at)}
                        </strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}

export default AdminPaymentHistory;
