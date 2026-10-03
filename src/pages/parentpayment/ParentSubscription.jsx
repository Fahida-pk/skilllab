import { useEffect, useMemo, useState } from "react";

import {
  FaCreditCard,
  FaShieldHalved,
  FaCircleCheck,
  FaCircleExclamation,
  FaRotate,
  FaCrown,
  FaStar,
  FaCalendarDays,
  FaXmark,
} from "react-icons/fa6";

import "./parentsubscription.css";

/* =========================================================
   API
========================================================= */

const PARENT_DASHBOARD_API =
  "https://zyntaweb.com/skilllab/parent-dashboard.php";

const PLANS_API =
  "https://zyntaweb.com/skilllab/plans.php";

const SUBSCRIPTION_API =
  "https://zyntaweb.com/skilllab/student-subscription.php";

const CREATE_ORDER_API =
  "https://zyntaweb.com/skilllab/parent-create-razorpay-order.php";

const VERIFY_PAYMENT_API =
  "https://zyntaweb.com/skilllab/parent-verify-razorpay-payment.php";

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

/* =========================================================
   RAZORPAY SCRIPT
========================================================= */

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT}"]`
    );

    if (existing) {
      existing.onload = () => resolve(true);
      existing.onerror = () => resolve(false);
      return;
    }

    const script = document.createElement("script");

    script.src = RAZORPAY_SCRIPT;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

/* =========================================================
   FORMAT PRICE
========================================================= */

const formatPrice = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   BILLING CYCLE
========================================================= */

const cycleText = (cycle) => {
  const value = String(cycle || "").toLowerCase();

  if (value === "monthly") {
    return "month";
  }

  if (value === "quarterly") {
    return "3 months";
  }

  if (value === "yearly") {
    return "year";
  }

  return value;
};

/* =========================================================
   PLAN ICON
========================================================= */

const planIcon = (cycle) => {
  const value = String(cycle || "").toLowerCase();

  if (value === "yearly") {
    return <FaCrown />;
  }

  if (value === "quarterly") {
    return <FaStar />;
  }

  return <FaCalendarDays />;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ParentPayments({
  parent,
  students = [],
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [plans, setPlans] = useState([]);

  const [loadedStudents, setLoadedStudents] = useState([]);

  const [subscriptions, setSubscriptions] = useState({});

  const [loading, setLoading] = useState(true);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] =
    useState("");

  /* =======================================================
     STUDENTS

     IMPORTANT:
     Do NOT depend only on students prop.

     We load all students directly using parent_id.
  ======================================================= */

  const studentList = useMemo(() => {
    const source =
      Array.isArray(loadedStudents) &&
      loadedStudents.length > 0
        ? loadedStudents
        : Array.isArray(students)
        ? students
        : [];

    const uniqueStudents = [];
    const usedIds = new Set();

    source.forEach((student) => {
      const id = Number(student?.id);

      if (id <= 0) {
        return;
      }

      if (usedIds.has(id)) {
        return;
      }

      usedIds.add(id);

      uniqueStudents.push({
        ...student,
        id,
      });
    });

    return uniqueStudents;
  }, [loadedStudents, students]);

  /* =======================================================
     LOAD ALL ASSIGNED STUDENTS

     parent_id
        ↓
     parent-dashboard.php
        ↓
     overview.students
  ======================================================= */

  const loadAssignedStudents = async () => {
    const parentId = Number(parent?.id);

    if (parentId <= 0) {
      setLoadedStudents([]);
      return;
    }

    try {
      const response = await fetch(
        PARENT_DASHBOARD_API,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept: "application/json",
          },

          body: JSON.stringify({
            action: "parent_overview",

            parent_id: parentId,
          }),

          cache: "no-store",
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load assigned students."
        );
      }

      const apiStudents =
        Array.isArray(
          data?.overview?.students
        )
          ? data.overview.students
          : [];

      const validStudents =
        apiStudents.filter(
          (student) =>
            Number(student?.id) > 0
        );

      setLoadedStudents(
        validStudents
      );

      console.log(
        "PARENT PAYMENT ASSIGNED STUDENTS:",
        validStudents
      );
    } catch (error) {
      console.error(
        "Load assigned students error:",
        error
      );

      /*
       * Do not immediately show an error.
       *
       * If parent dashboard already passed students,
       * use that as fallback.
       */
      setLoadedStudents([]);
    }
  };

  /* =======================================================
     LOAD PLANS
  ======================================================= */

  const loadPlans = async () => {
    const response = await fetch(
      PLANS_API,
      {
        method: "GET",

        headers: {
          Accept: "application/json",
        },

        cache: "no-store",
      }
    );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
          "Unable to load subscription plans."
      );
    }

    const activePlans =
      Array.isArray(data.plans)
        ? data.plans.filter(
            (plan) =>
              Number(
                plan.is_active ?? 1
              ) === 1
          )
        : [];

    setPlans(activePlans);
  };

  /* =======================================================
     LOAD EACH STUDENT SUBSCRIPTION
  ======================================================= */

  const loadStudentSubscriptions =
    async (studentArray = studentList) => {
      if (
        !Array.isArray(studentArray) ||
        studentArray.length === 0
      ) {
        setSubscriptions({});
        return;
      }

      const entries =
        await Promise.all(
          studentArray.map(
            async (student) => {
              const studentId =
                Number(student?.id);

              if (studentId <= 0) {
                return [
                  studentId,
                  null,
                ];
              }

              try {
                const response =
                  await fetch(
                    `${SUBSCRIPTION_API}?user_id=${encodeURIComponent(
                      studentId
                    )}`,
                    {
                      method: "GET",

                      headers: {
                        Accept:
                          "application/json",
                      },

                      cache:
                        "no-store",
                    }
                  );

                const data =
                  await response.json();

                return [
                  studentId,

                  data.success &&
                  data.has_subscription
                    ? data.subscription
                    : null,
                ];
              } catch (error) {
                console.error(
                  `Subscription load failed for student ${studentId}:`,
                  error
                );

                return [
                  studentId,
                  null,
                ];
              }
            }
          )
        );

      setSubscriptions(
        Object.fromEntries(entries)
      );
    };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const initialize =
      async () => {
        if (!parent?.id) {
          return;
        }

        setLoading(true);

        try {
          /*
           * FIRST:
           * Load all students assigned
           * to this parent.
           */
          await loadAssignedStudents();

          /*
           * Load plans.
           */
          await loadPlans();
        } catch (error) {
          if (!cancelled) {
            console.error(
              "Parent payment initialization error:",
              error
            );

            setMessage(
              error.message ||
                "Unable to load payment details."
            );

            setMessageType("error");
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [parent?.id]);

  /* =======================================================
     LOAD SUBSCRIPTIONS AFTER STUDENTS LOAD
  ======================================================= */

  useEffect(() => {
    if (!parent?.id) {
      return;
    }

    if (
      !Array.isArray(studentList) ||
      studentList.length === 0
    ) {
      setSubscriptions({});
      return;
    }

    loadStudentSubscriptions(
      studentList
    );
  }, [
    parent?.id,
    studentList,
  ]);

  /* =======================================================
     OPEN PLAN MODAL
  ======================================================= */

  const openPlans = (student) => {
    setMessage("");
    setMessageType("");

    setSelectedStudent(
      student
    );
  };

  /* =======================================================
     CLOSE PLAN MODAL
  ======================================================= */

  const closePlans = () => {
    if (paymentLoading) {
      return;
    }

    setSelectedStudent(null);

    setMessage("");
    setMessageType("");
  };

  /* =======================================================
     PAYMENT
  ======================================================= */

  const handlePayment = async (
    student,
    plan
  ) => {
    if (paymentLoading) {
      return;
    }

    const parentId =
      Number(parent?.id);

    const studentId =
      Number(student?.id);

    const planId =
      Number(plan?.id);

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (
      parentId <= 0 ||
      studentId <= 0 ||
      planId <= 0
    ) {
      setMessage(
        "Parent, student or plan information is missing."
      );

      setMessageType("error");

      return;
    }

    /* -----------------------------------------------------
       CONFIRM
    ----------------------------------------------------- */

    const confirmed =
      window.confirm(
        `Continue with ${plan.name} for ${
          student.name ||
          "this student"
        } for ₹${formatPrice(
          plan.price
        )}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setPaymentLoading(true);

      setMessage("");

      setMessageType("");

      /* ---------------------------------------------------
         LOAD RAZORPAY
      --------------------------------------------------- */

      const loaded =
        await loadRazorpayScript();

      if (!loaded) {
        throw new Error(
          "Razorpay Checkout could not be loaded."
        );
      }

      /* ---------------------------------------------------
         CREATE ORDER

         IMPORTANT:
         Payment belongs to selected STUDENT.
      --------------------------------------------------- */

      const orderResponse =
        await fetch(
          CREATE_ORDER_API,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              parent_id:
                parentId,

              student_id:
                studentId,

              plan_id:
                planId,
            }),
          }
        );

      const orderData =
        await orderResponse.json();

      if (
        !orderResponse.ok ||
        !orderData.success
      ) {
        throw new Error(
          orderData.message ||
            "Unable to create Razorpay order."
        );
      }

      /* ---------------------------------------------------
         RAZORPAY OPTIONS
      --------------------------------------------------- */

      const options = {
        key:
          orderData.key_id,

        amount:
          Number(
            orderData.amount
          ),

        currency:
          orderData.currency ||
          "INR",

        name:
          "SkillLab",

        description:
          `${plan.name} Subscription for ${
            student.name ||
            "Student"
          }`,

        order_id:
          orderData.order_id,

        prefill: {
          name:
            parent?.name ||
            parent?.username ||
            "",

          email:
            parent?.email ||
            "",

          contact:
            parent?.phone ||
            "",
        },

        notes: {
          parent_id:
            String(parentId),

          student_id:
            String(studentId),

          student_name:
            student?.name ||
            "",
        },

        theme: {
          color:
            "#6d28d9",
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(
              false
            );
          },
        },

        /* -------------------------------------------------
           PAYMENT SUCCESS
        ------------------------------------------------- */

        handler:
          async (
            razorpayResponse
          ) => {
            try {
              setMessage(
                "Verifying payment..."
              );

              setMessageType(
                "success"
              );

              /* -------------------------------------------
                 VERIFY PAYMENT
              ------------------------------------------- */

              const verifyResponse =
                await fetch(
                  VERIFY_PAYMENT_API,
                  {
                    method:
                      "POST",

                    headers: {
                      "Content-Type":
                        "application/json",

                      Accept:
                        "application/json",
                    },

                    body: JSON.stringify(
                      {
                        parent_id:
                          parentId,

                        student_id:
                          studentId,

                        razorpay_payment_id:
                          razorpayResponse.razorpay_payment_id,

                        razorpay_order_id:
                          razorpayResponse.razorpay_order_id,

                        razorpay_signature:
                          razorpayResponse.razorpay_signature,
                      }
                    ),
                  }
                );

              const verifyData =
                await verifyResponse.json();

              if (
                !verifyResponse.ok ||
                !verifyData.success
              ) {
                throw new Error(
                  verifyData.message ||
                    "Payment verification failed."
                );
              }

              /* -------------------------------------------
                 UPDATE LOCAL SUBSCRIPTION
              ------------------------------------------- */

              setSubscriptions(
                (previous) => ({
                  ...previous,

                  [studentId]:
                    verifyData.subscription ||
                    {
                      status:
                        "active",
                    },
                })
              );

              /* -------------------------------------------
                 SUCCESS MESSAGE
              ------------------------------------------- */

              setMessage(
                `Payment successful. ${
                  student?.name ||
                  "Student"
                }'s subscription is active.`
              );

              setMessageType(
                "success"
              );

              setSelectedStudent(
                null
              );

              /* -------------------------------------------
                 REFRESH STUDENT SUBSCRIPTIONS
              ------------------------------------------- */

              await loadStudentSubscriptions(
                studentList
              );
            } catch (error) {
              console.error(
                "Parent payment verification error:",
                error
              );

              setMessage(
                error.message ||
                  "Payment verification failed."
              );

              setMessageType(
                "error"
              );
            } finally {
              setPaymentLoading(
                false
              );
            }
          },
      };

      /* ---------------------------------------------------
         OPEN RAZORPAY
      --------------------------------------------------- */

      const razorpay =
        new window.Razorpay(
          options
        );

      /* ---------------------------------------------------
         PAYMENT FAILED
      --------------------------------------------------- */

      razorpay.on(
        "payment.failed",
        (response) => {
          setMessage(
            response?.error
              ?.description ||
              "Payment failed. Please try again."
          );

          setMessageType(
            "error"
          );

          setPaymentLoading(
            false
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Parent payment error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to start payment."
      );

      setMessageType(
        "error"
      );

      setPaymentLoading(
        false
      );
    }
  };

  /* =======================================================
     REFRESH BUTTON
  ======================================================= */

  const refreshPayments = async () => {
    if (paymentLoading) {
      return;
    }

    try {
      setLoading(true);

      await loadAssignedStudents();

      await loadPlans();

      /*
       * Small delay because
       * loadedStudents state update is async.
       */
      const parentId =
        Number(parent?.id);

      if (parentId > 0) {
        const response =
          await fetch(
            PARENT_DASHBOARD_API,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify({
                action:
                  "parent_overview",

                parent_id:
                  parentId,
              }),

              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        const freshStudents =
          Array.isArray(
            data?.overview
              ?.students
          )
            ? data.overview.students
            : [];

        const validStudents =
          freshStudents.filter(
            (student) =>
              Number(
                student?.id
              ) > 0
          );

        setLoadedStudents(
          validStudents
        );

        await loadStudentSubscriptions(
          validStudents
        );
      }
    } catch (error) {
      console.error(
        "Refresh payment data error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to refresh payment details."
      );

      setMessageType(
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="parent-payment-section">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="parent-payment-header">

        <div>
          <span className="section-kicker">
            STUDENT SUBSCRIPTIONS
          </span>

          <h2>
            Payments & Subscription
          </h2>

          <p>
            Manage subscription payments
            separately for each student
            assigned to this parent account.
          </p>
        </div>

        <div className="parent-payment-secure">
          <FaShieldHalved />

          <span>
            Secure Razorpay payment
          </span>

          <button
            type="button"
            onClick={refreshPayments}
            disabled={
              loading ||
              paymentLoading
            }
            title="Refresh students"
            style={{
              marginLeft: "12px",
              border: "none",
              background:
                "transparent",
              cursor:
                loading ||
                paymentLoading
                  ? "not-allowed"
                  : "pointer",
              color:
                "inherit",
            }}
          >
            <FaRotate
              className={
                loading
                  ? "spin"
                  : ""
              }
            />
          </button>
        </div>

      </div>

      {/* ===================================================
          MESSAGE
      =================================================== */}

      {message && (
        <div
          className={`parent-payment-message ${
            messageType
          }`}
        >
          {messageType ===
          "success" ? (
            <FaCircleCheck />
          ) : (
            <FaCircleExclamation />
          )}

          <span>
            {message}
          </span>
        </div>
      )}

      {/* ===================================================
          LOADING
      =================================================== */}

      {loading ? (
        <div className="parent-payment-loading">

          <FaRotate className="spin" />

          <span>
            Loading students and
            subscription details...
          </span>

        </div>
      ) : studentList.length ===
        0 ? (
        /* =================================================
           NO STUDENTS
        ================================================= */

        <div className="parent-payment-empty">

          <FaCircleExclamation />

          <h3>
            No assigned students
          </h3>

          <p>
            No students are currently
            assigned to this parent
            account.
          </p>

        </div>
      ) : (
        /* =================================================
           STUDENT CARDS
        ================================================= */

        <div className="parent-payment-student-grid">

          {studentList.map(
            (student) => {
              const studentId =
                Number(
                  student.id
                );

              const subscription =
                subscriptions[
                  studentId
                ];

              const active =
                String(
                  subscription?.status ||
                    ""
                ).toLowerCase() ===
                "active";

              return (
                <article
                  className="parent-payment-student-card"
                  key={
                    studentId
                  }
                >

                  {/* =======================================
                      STUDENT HEADER
                  ======================================= */}

                  <div className="parent-payment-student-top">

                    <div className="parent-payment-avatar">
                      {(
                        student.name ||
                        "S"
                      )
                        .trim()
                        .slice(
                          0,
                          2
                        )
                        .toUpperCase()}
                    </div>

                    <div>

                      <h3>
                        {student.name ||
                          "Unnamed Student"}
                      </h3>

                      <span>
                        Student ID #
                        {studentId}
                      </span>

                    </div>

                  </div>

                  {/* =======================================
                      EMAIL
                  ======================================= */}

                  <div className="parent-payment-email">
                    {student.email ||
                      "No email available"}
                  </div>

                  {/* =======================================
                      SUBSCRIPTION STATUS
                  ======================================= */}

                  <div className="parent-payment-status">

                    <span
                      className={
                        active
                          ? "active"
                          : "inactive"
                      }
                    >

                      {active ? (
                        <FaCircleCheck />
                      ) : (
                        <FaCircleExclamation />
                      )}

                      {active
                        ? "Subscription Active"
                        : "No Active Subscription"}

                    </span>

                    {active && (
                      <small>

                        {subscription.plan_name ||
                          subscription.name ||
                          "Current Plan"}

                        {" · "}

                        Until{" "}

                        {formatDate(
                          subscription.end_date
                        )}

                      </small>
                    )}

                  </div>

                  {/* =======================================
                      PAYMENT BUTTON
                  ======================================= */}

                  <button
                    type="button"
                    className="parent-pay-button"
                    onClick={() =>
                      openPlans(
                        student
                      )
                    }
                  >

                    <FaCreditCard />

                    {active
                      ? "Renew / Change Plan"
                      : "Pay Subscription"}

                  </button>

                </article>
              );
            }
          )}

        </div>
      )}

      {/* ===================================================
          PLAN MODAL
      =================================================== */}

      {selectedStudent && (
        <div
          className="parent-payment-modal-backdrop"

          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closePlans();
            }
          }}
        >

          <div className="parent-payment-modal">

            {/* =============================================
                MODAL HEADER
            ============================================= */}

            <div className="parent-payment-modal-head">

              <div>

                <span className="section-kicker">
                  STUDENT SUBSCRIPTION
                </span>

                <h3>
                  {selectedStudent.name ||
                    "Student"}
                </h3>

                <p>
                  Student ID #
                  {selectedStudent.id}

                  {" · "}

                  Select a subscription
                  plan
                </p>

              </div>

              <button
                type="button"
                className="parent-payment-close"
                onClick={
                  closePlans
                }
                disabled={
                  paymentLoading
                }
                aria-label="Close"
              >
                <FaXmark />
              </button>

            </div>

            {/* =============================================
                PLANS
            ============================================= */}

            <div className="parent-payment-plan-grid">

              {plans.length ===
              0 ? (
                <div className="parent-payment-empty">

                  <FaCircleExclamation />

                  <h3>
                    No active plans
                  </h3>

                  <p>
                    Please contact
                    the administrator.
                  </p>

                </div>
              ) : (
                plans.map(
                  (plan) => {
                    const current =
                      subscriptions[
                        Number(
                          selectedStudent.id
                        )
                      ];

                    const isCurrent =
                      Number(
                        current?.plan_id
                      ) ===
                      Number(
                        plan.id
                      );

                    return (
                      <article
                        className={`parent-plan-card ${
                          isCurrent
                            ? "current"
                            : ""
                        }`}
                        key={
                          plan.id
                        }
                      >

                        {/* =================================
                            CURRENT BADGE
                        ================================= */}

                        {isCurrent && (
                          <span className="current-plan-badge">
                            Current Plan
                          </span>
                        )}

                        {/* =================================
                            ICON
                        ================================= */}

                        <div className="parent-plan-icon">

                          {planIcon(
                            plan.billing_cycle
                          )}

                        </div>

                        {/* =================================
                            NAME
                        ================================= */}

                        <h4>
                          {plan.name}
                        </h4>

                        {/* =================================
                            PRICE
                        ================================= */}

                        <div className="parent-plan-price">

                          ₹
                          {formatPrice(
                            plan.price
                          )}

                        </div>

                        <span className="parent-plan-cycle">
                          /
                          {" "}
                          {cycleText(
                            plan.billing_cycle
                          )}
                        </span>

                        {/* =================================
                            DESCRIPTION
                        ================================= */}

                        <p>
                          {plan.description ||
                            "SkillLab learning subscription"}
                        </p>

                        {/* =================================
                            PAYMENT
                        ================================= */}

                        <button
                          type="button"
                          className="parent-plan-pay-button"
                          disabled={
                            paymentLoading
                          }
                          onClick={() =>
                            handlePayment(
                              selectedStudent,
                              plan
                            )
                          }
                        >

                          {paymentLoading ? (
                            <>
                              <FaRotate className="spin" />

                              Processing...
                            </>
                          ) : (
                            <>
                              <FaCreditCard />

                              {isCurrent
                                ? "Renew Plan"
                                : "Pay Now"}
                            </>
                          )}

                        </button>

                      </article>
                    );
                  }
                )
              )}

            </div>

            {/* =============================================
                PAYMENT NOTE
            ============================================= */}

            <div className="parent-payment-note">

              <FaShieldHalved />

              <span>
                Payment is processed
                securely through Razorpay.
                The subscription is saved
                against the selected student,
                not the parent account.
              </span>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}