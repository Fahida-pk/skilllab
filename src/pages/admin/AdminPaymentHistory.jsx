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

  /* =========================================================
     FETCH PAYMENT HISTORY
  ========================================================= */

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
  }, [navigate]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  /* =========================================================
     DATE FORMAT
  ========================================================= */

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================================
     STATUS
  ========================================================= */

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

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredPayments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return payments;
    }

    return payments.filter((payment) =>
      [
        payment.student_name,
        payment.student_email,
        payment.parent_name,
        payment.parent_email,
        payment.plan_name,
        payment.plan_description,
        payment.description,
        payment.billing_cycle,
        payment.status,
        payment.paid_by,
        payment.gateway_payment_id,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(keyword)
        )
    );
  }, [payments, search]);

  /* =========================================================
     GROUP BY STUDENT
  ========================================================= */

  const groupedPayments = useMemo(() => {
    const groups = filteredPayments.reduce(
      (result, payment) => {
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
      },
      {}
    );

    return Object.values(groups).map((group) => ({
      ...group,

      payments: [...group.payments].sort(
        (a, b) =>
          new Date(b.paid_at || 0).getTime() -
          new Date(a.paid_at || 0).getTime()
      ),
    }));
  }, [filteredPayments]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalAmount = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  const parentPayments = payments.filter(
    (payment) =>
      String(payment.paid_by || "").toLowerCase() ===
      "parent"
  ).length;

  const studentPayments = payments.filter(
    (payment) =>
      String(payment.paid_by || "").toLowerCase() ===
      "student"
  ).length;

  /* =========================================================
     PLAN DESCRIPTION
  ========================================================= */

  const getPlanDescription = (payment) => {
    if (
      payment.plan_description &&
      String(payment.plan_description).trim()
    ) {
      return payment.plan_description;
    }

    if (
      payment.description &&
      String(payment.description).trim()
    ) {
      return payment.description;
    }

    const planName = String(
      payment.plan_name || ""
    ).toLowerCase();

    if (planName.includes("monthly")) {
      return "SkillLab Monthly Plan";
    }

    if (planName.includes("yearly")) {
      return "SkillLab Yearly Plan";
    }

    return "SkillLab Subscription Plan";
  };

  /* =========================================================
     PAYMENT BOX
  ========================================================= */

  const PaymentTypeBox = ({
    title,
    icon,
    paymentsList,
    type,
  }) => {
    if (!paymentsList.length) {
      return null;
    }

    const latestPayment = paymentsList[0];

    const description =
      getPlanDescription(latestPayment);

    const planAmount =
      Number(
        latestPayment.plan_price ??
          latestPayment.price ??
          latestPayment.amount ??
          0
      );

    const totalPaid = paymentsList.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

    const isParent = type === "parent";

    return (
      <section
        className={`payment-type-box ${
          isParent
            ? "parent-payment-box"
            : "student-payment-box"
        }`}
      >
        {/* HEADER */}

        <div className="payment-type-header">

          <div className="payment-type-title">

            <div
              className={`payment-type-icon ${
                isParent
                  ? "parent-type-icon"
                  : "student-type-icon"
              }`}
            >
              {icon}
            </div>

            <div>
              <h3>{title}</h3>

              <span>
                {paymentsList.length}{" "}
                {paymentsList.length === 1
                  ? "payment"
                  : "payments"}
              </span>
            </div>

          </div>

          <div
            className={`payment-type-badge ${
              isParent
                ? "parent-badge"
                : "student-badge"
            }`}
          >
            {isParent ? (
              <FaUsers />
            ) : (
              <FaUser />
            )}

            {isParent
              ? "Parent"
              : "Student"}
          </div>

        </div>

        {/* PLAN NOTE */}

        <div className="payment-plan-note">

          <div className="payment-plan-note-main">

            <div className="payment-plan-note-icon">
              <FaCreditCard />
            </div>

            <div className="payment-plan-note-content">

              <span className="payment-plan-note-label">
                Subscription Plan
              </span>

              <h4>
                {latestPayment.plan_name ||
                  "Subscription"}
              </h4>

              <p>
                {description}
              </p>

            </div>

          </div>

          <div className="payment-plan-price">

            <span>Plan Amount</span>

            <strong>
              ₹
              {planAmount.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              /{" "}
              {latestPayment.billing_cycle ||
                "monthly"}
            </small>

          </div>

        </div>

        {/* PLAN DETAILS */}

        <div className="payment-plan-details">

          <div className="payment-plan-detail">
            <span>Plan</span>

            <strong>
              {latestPayment.plan_name ||
                "-"}
            </strong>
          </div>

          <div className="payment-plan-detail">
            <span>Description</span>

            <strong>
              {description}
            </strong>
          </div>

          <div className="payment-plan-detail">
            <span>Billing Cycle</span>

            <strong>
              {latestPayment.billing_cycle ||
                "-"}
            </strong>
          </div>

          <div className="payment-plan-detail">
            <span>Total Paid</span>

            <strong>
              ₹
              {totalPaid.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

        </div>

        {/* PAID BY */}

        <div
          className={`payment-person ${
            isParent
              ? "payment-person-parent"
              : "payment-person-student"
          }`}
        >

          <div className="payment-person-icon">
            {isParent ? (
              <FaUsers />
            ) : (
              <FaUser />
            )}
          </div>

          <div className="payment-person-content">

            <span>
              {isParent
                ? "Paid By Parent"
                : "Paid By Student"}
            </span>

            <strong>
              {isParent
                ? latestPayment.parent_name ||
                  "Parent"
                : latestPayment.student_name ||
                  "-"}
            </strong>

            <small>
              {isParent
                ? latestPayment.parent_email ||
                  "-"
                : latestPayment.student_email ||
                  "-"}
            </small>

          </div>

        </div>

        {/* PAYMENT HISTORY */}

        <div className="payment-type-history">

          <div className="payment-type-history-heading">

            <div>
              <h4>
                Payment History
              </h4>

              <span>
                {paymentsList.length}{" "}
                {paymentsList.length === 1
                  ? "payment"
                  : "payments"}
              </span>
            </div>

          </div>

          <div className="payment-type-history-list">

            {paymentsList.map(
              (item, index) => {

                const itemDescription =
                  getPlanDescription(item);

                return (
                  <div
                    className="payment-type-history-row"
                    key={
                      item.id ||
                      item.gateway_payment_id ||
                      index
                    }
                  >

                    <div className="history-number">
                      {index + 1}
                    </div>

                    <div className="history-plan">

                      <strong>
                        {item.plan_name ||
                          "Subscription"}
                      </strong>

                      <small>
                        {itemDescription}
                      </small>

                      <span>
                        <FaCalendarAlt />

                        {formatDateTime(
                          item.paid_at
                        )}
                      </span>

                    </div>

                    <div className="history-cycle">
                      {item.billing_cycle ||
                        "-"}
                    </div>

                    <div className="history-amount">
                      ₹
                      {Number(
                        item.amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </div>

                    <div
                      className={`history-status ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusIcon(
                        item.status
                      )}

                      {item.status ||
                        "Pending"}
                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* DATES */}

        <div className="payment-date-box">

          <div>
            <span>Start Date</span>

            <strong>
              {formatDate(
                latestPayment.start_date
              )}
            </strong>
          </div>

          <div className="date-divider" />

          <div>
            <span>End Date</span>

            <strong>
              {formatDate(
                latestPayment.end_date
              )}
            </strong>
          </div>

          <div className="date-divider" />

          <div>
            <span>Latest Payment</span>

            <strong>
              {formatDateTime(
                latestPayment.paid_at
              )}
            </strong>
          </div>

        </div>

      </section>
    );
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="admin-payment-page">

      {/* HEADER */}

      <div className="admin-payment-page-header">

        <div className="admin-payment-heading">

          <div className="admin-payment-heading-icon">
            <FaCreditCard />
          </div>

          <div>
            <h1>Payment History</h1>

            <p>
              View student subscriptions and
              parent payment records
            </p>
          </div>

        </div>

        <div className="admin-payment-header-actions">

          <button
            type="button"
            className="admin-payment-back"
            onClick={() =>
              navigate("/AdminDashboard")
            }
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
            <FaSyncAlt
              className={
                loading
                  ? "payment-spin"
                  : ""
              }
            />

            <span>
              {loading
                ? "Loading..."
                : "Refresh"}
            </span>
          </button>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="admin-payment-summary">

        <div className="admin-payment-summary-card">

          <div className="summary-icon blue">
            <FaCreditCard />
          </div>

          <div>
            <span>Total Payments</span>

            <strong>
              {payments.length}
            </strong>
          </div>

        </div>

        <div className="admin-payment-summary-card">

          <div className="summary-icon green">
            <FaRupeeSign />
          </div>

          <div>
            <span>Total Amount</span>

            <strong>
              ₹
              {totalAmount.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

        </div>

        <div className="admin-payment-summary-card">

          <div className="summary-icon purple">
            <FaUsers />
          </div>

          <div>
            <span>Parent Payments</span>

            <strong>
              {parentPayments}
            </strong>
          </div>

        </div>

        <div className="admin-payment-summary-card">

          <div className="summary-icon orange">
            <FaUser />
          </div>

          <div>
            <span>Student Payments</span>

            <strong>
              {studentPayments}
            </strong>
          </div>

        </div>

      </div>

      {/* SEARCH */}

      <div className="admin-payment-toolbar">

        <div className="admin-payment-search">

          <input
            type="text"
            placeholder="Search student, parent, plan, email, payment ID..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="admin-payment-count">

          Showing{" "}

          <strong>
            {groupedPayments.length}
          </strong>{" "}

          students

          <span>
            ({filteredPayments.length} payments)
          </span>

        </div>

      </div>

      {/* CONTENT */}

      <div className="admin-payment-content">

        {/* LOADING */}

        {loading && (
          <div className="admin-payment-state">

            <div className="admin-payment-spinner" />

            <p>
              Loading payment history...
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="admin-payment-error">

            <FaTimesCircle />

            <div>
              <strong>
                Unable to load payment history
              </strong>

              <p>{error}</p>
            </div>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredPayments.length === 0 && (
            <div className="admin-payment-state admin-payment-empty">

              <div className="empty-icon">
                <FaCreditCard />
              </div>

              <h2>
                No Payment History
              </h2>

              <p>
                No student or parent subscription
                payments have been recorded yet.
              </p>

            </div>
          )}

        {/* STUDENT LIST */}

        {!loading &&
          !error &&
          groupedPayments.length > 0 && (

            <div className="admin-payment-list">

              {groupedPayments.map(
                (group, index) => {

                  const studentPaidPayments =
                    group.payments.filter(
                      (payment) =>
                        String(
                          payment.paid_by || ""
                        ).toLowerCase() ===
                        "student"
                    );

                  const parentPaidPayments =
                    group.payments.filter(
                      (payment) =>
                        String(
                          payment.paid_by || ""
                        ).toLowerCase() ===
                        "parent"
                    );

                  return (
                    <article
                      className="admin-payment-card"
                      key={
                        group.student
                          ?.student_id ||
                        group.student
                          ?.student_email ||
                        index
                      }
                    >

                      {/* STUDENT HEADER */}

                      <div className="student-main-header">

                        <div className="student-main-info">

                          <div className="student-main-icon">
                            <FaUser />
                          </div>

                          <div>

                            <span>
                              Student
                            </span>

                            <h2>
                              {group.student
                                ?.student_name ||
                                "-"}
                            </h2>

                            <small>
                              {group.student
                                ?.student_email ||
                                "-"}
                            </small>

                          </div>

                        </div>

                        <div className="student-payment-total">

                          <span>
                            Total Payments
                          </span>

                          <strong>
                            {group.payments.length}
                          </strong>

                        </div>

                      </div>

                      {/* SEPARATE BOXES */}

                      <div className="payment-type-grid">

                        <PaymentTypeBox
                          title="Student Payment"
                          icon={<FaUser />}
                          paymentsList={
                            studentPaidPayments
                          }
                          type="student"
                        />

                        <PaymentTypeBox
                          title="Parent Payment"
                          icon={<FaUsers />}
                          paymentsList={
                            parentPaidPayments
                          }
                          type="parent"
                        />

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </div>

    </div>
  );
}

export default AdminPaymentHistory;