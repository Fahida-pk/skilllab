import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./parentsubscription.css";

import {
  FaCheck,
  FaCrown,
  FaCreditCard,
  FaArrowLeft,
  FaRotate,
  FaCircleCheck,
  FaShieldHalved,
  FaCalendarDays,
  FaStar,
  FaCircleExclamation,
  FaUsers,
  FaUserGraduate,
  FaArrowRight,
  FaClock,
} from "react-icons/fa6";

/* =========================================================
   API
========================================================= */

const PLANS_API =
  "https://zyntaweb.com/skilllab/plans.php";

const STUDENT_PAYMENTS_API =
  "https://zyntaweb.com/skilllab/parent_subscription.php";

const CREATE_ORDER_API =
  "https://zyntaweb.com/skilllab/create-razorpay-order.php";

const VERIFY_PAYMENT_API =
  "https://zyntaweb.com/skilllab/verify-razorpay-payment.php";

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

    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT}"]`
    );

    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
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
   PARENT HELPERS
========================================================= */

function getLoggedInParent() {
  try {
    const parentString =
      localStorage.getItem("parent");

    if (!parentString) {
      return null;
    }

    return JSON.parse(parentString);
  } catch (error) {
    console.error(
      "Unable to read logged-in parent:",
      error
    );

    return null;
  }
}

function getParentId(parent) {
  if (!parent) {
    return 0;
  }

  return Number(
    parent.id ??
      parent.parent_id ??
      parent.parentId ??
      0
  );
}

function getParentName(parent) {
  if (!parent) {
    return "";
  }

  return (
    parent.name ||
    parent.full_name ||
    parent.parent_name ||
    parent.username ||
    "Parent"
  );
}

function getParentEmail(parent) {
  if (!parent) {
    return "";
  }

  return parent.email || "";
}

function getParentPhone(parent) {
  if (!parent) {
    return "";
  }

  return (
    parent.phone ||
    parent.mobile ||
    parent.contact ||
    ""
  );
}

/* =========================================================
   COMPONENT
========================================================= */

function ParentSubscription() {
  const navigate = useNavigate();

  const [parent, setParent] = useState(null);

  const [plans, setPlans] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] =
    useState(false);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [selectedStudentId, setSelectedStudentId] =
    useState(null);

  const [selectedPlanId, setSelectedPlanId] =
    useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("");

  /* =======================================================
     LOGIN CHECK
  ======================================================= */

  useEffect(() => {
    const loggedParent =
      getLoggedInParent();

    if (!loggedParent) {
      navigate("/parent/login", {
        replace: true,
      });

      return;
    }

    setParent(loggedParent);
  }, [navigate]);

  /* =======================================================
     LOAD PLANS
  ======================================================= */

  const loadPlans = async () => {
    try {
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

      if (!response.ok) {
        throw new Error(
          `Plans API error: ${response.status}`
        );
      }

      const data =
        await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to load plans."
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
    } catch (error) {
      console.error(
        "Load plans error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load subscription plans."
      );

      setMessageType("error");
    }
  };

  /* =======================================================
     LOAD ASSIGNED STUDENTS + THEIR SUBSCRIPTIONS
  ======================================================= */

  const loadStudentPayments = async (
    parentId,
    silent = false
  ) => {
    if (parentId <= 0) {
      setStudents([]);
      return;
    }

    try {
      if (!silent) {
        setStudentsLoading(true);
      }

      const response = await fetch(
        `${STUDENT_PAYMENTS_API}?parent_id=${encodeURIComponent(
          parentId
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Student payment API error: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "PARENT STUDENT PAYMENTS:",
        data
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to load assigned students."
        );
      }

      const studentList =
        Array.isArray(data.students)
          ? data.students
          : [];

      setStudents(studentList);

      /*
       * If the selected student no longer exists,
       * clear the selection.
       */
      if (
        selectedStudentId &&
        !studentList.some(
          (student) =>
            Number(student.id) ===
            Number(selectedStudentId)
        )
      ) {
        setSelectedStudentId(null);
        setSelectedPlanId(null);
      }
    } catch (error) {
      console.error(
        "Load student payment data error:",
        error
      );

      if (!silent) {
        setStudents([]);
        setMessage(
          error.message ||
            "Unable to load student payment details."
        );
        setMessageType("error");
      }
    } finally {
      if (!silent) {
        setStudentsLoading(false);
      }
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (!parent) {
      return;
    }

    const initialize = async () => {
      const parentId =
        getParentId(parent);

      if (parentId <= 0) {
        setMessage(
          "Parent information not found. Please login again."
        );

        setMessageType("error");
        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        await Promise.all([
          loadPlans(),
          loadStudentPayments(parentId),
        ]);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [parent]);

  /* =======================================================
     AUTO REFRESH STUDENT PAYMENT STATUS
  ======================================================= */

  useEffect(() => {
    if (!parent?.id) {
      return;
    }

    const parentId =
      getParentId(parent);

    const interval = setInterval(() => {
      loadStudentPayments(
        parentId,
        true
      );
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [parent]);

  /* =======================================================
     FORMATTERS
  ======================================================= */

  const formatPrice = (price) => {
    const amount =
      Number(price || 0);

    return amount.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );
  };

  const formatCycle = (cycle) => {
    if (!cycle) {
      return "";
    }

    const value =
      String(cycle).toLowerCase();

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

  const getDurationText = (
    billingCycle
  ) => {
    const cycle =
      String(
        billingCycle || ""
      ).toLowerCase();

    if (cycle === "monthly") {
      return "30 days";
    }

    if (cycle === "quarterly") {
      return "3 months";
    }

    if (cycle === "yearly") {
      return "1 year";
    }

    return billingCycle || "";
  };

  const getPlanIcon = (
    billingCycle
  ) => {
    const cycle =
      String(
        billingCycle || ""
      ).toLowerCase();

    if (cycle === "yearly") {
      return <FaCrown />;
    }

    if (cycle === "quarterly") {
      return <FaStar />;
    }

    return <FaCalendarDays />;
  };

  const getInitials = (name) => {
    if (!name) {
      return "ST";
    }

    const parts = String(name)
      .trim()
      .split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      `${parts[0][0]}${
        parts[parts.length - 1][0]
      }`
    ).toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =======================================================
     SELECTED STUDENT
  ======================================================= */

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) {
      return null;
    }

    return (
      students.find(
        (student) =>
          Number(student.id) ===
          Number(selectedStudentId)
      ) || null
    );
  }, [
    students,
    selectedStudentId,
  ]);

  /* =======================================================
     PAYMENT STATUS HELPERS
  ======================================================= */

  const isStudentPaid = (student) => {
    return (
      String(
        student?.payment_status || ""
      ).toLowerCase() === "paid"
    );
  };

  const isStudentExpired = (
    student
  ) => {
    return (
      String(
        student?.subscription_status ||
          ""
      ).toLowerCase() ===
      "expired"
    );
  };

  const getStudentStatusLabel = (
    student
  ) => {
    if (isStudentPaid(student)) {
      return "ACTIVE";
    }

    if (isStudentExpired(student)) {
      return "EXPIRED";
    }

    return "PAYMENT REQUIRED";
  };

  /* =======================================================
     START PAYMENT FOR STUDENT
  ======================================================= */

  const handleStudentPayment = async (
    student,
    plan
  ) => {
    if (paymentLoading) {
      return;
    }

    if (!student?.id) {
      setMessage(
        "Student information not found."
      );
      setMessageType("error");
      return;
    }

    if (!plan?.id) {
      setMessage(
        "Subscription plan not found."
      );
      setMessageType("error");
      return;
    }

    const studentId =
      Number(student.id);

    const planId =
      Number(plan.id);

    if (studentId <= 0) {
      setMessage(
        "Invalid student ID."
      );
      setMessageType("error");
      return;
    }

    if (planId <= 0) {
      setMessage(
        "Invalid subscription plan."
      );
      setMessageType("error");
      return;
    }

    const confirmed =
      window.confirm(
        `Continue payment for ${student.name || "this student"} with ${plan.name || "selected plan"} for ₹${formatPrice(plan.price)}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setPaymentLoading(true);
      setSelectedStudentId(studentId);
      setSelectedPlanId(planId);
      setMessage("");

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Please check your internet connection."
        );
      }

      /* ================================================
         CREATE ORDER

         IMPORTANT:
         Parent is only making the payment.
         The subscription belongs to the STUDENT.

         account_type = student
         user_id      = student.id
      ================================================ */

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
              account_type:
                "student",

              user_id:
                studentId,

              plan_id:
                planId,
            }),
          }
        );

      if (!orderResponse.ok) {
        throw new Error(
          `Order API error: ${orderResponse.status}`
        );
      }

      const orderData =
        await orderResponse.json();

      console.log(
        "STUDENT RAZORPAY ORDER:",
        orderData
      );

      if (!orderData.success) {
        throw new Error(
          orderData.message ||
            "Unable to create Razorpay order."
        );
      }

      if (!orderData.order_id) {
        throw new Error(
          "Razorpay order ID was not received."
        );
      }

      if (!orderData.key_id) {
        throw new Error(
          "Razorpay Key ID was not received."
        );
      }

      /* ================================================
         RAZORPAY CHECKOUT
      ================================================ */

      const options = {
        key: orderData.key_id,

        amount:
          Number(orderData.amount),

        currency:
          orderData.currency || "INR",

        name: "SkillLab",

        description:
          `${plan.name || "SkillLab"} Subscription - ${student.name || "Student"}`,

        order_id:
          orderData.order_id,

        prefill: {
          name:
            student.name ||
            getParentName(parent),

          email:
            student.email ||
            getParentEmail(parent),

          contact:
            getParentPhone(parent),
        },

        notes: {
          account_type:
            "student",

          student_id:
            String(studentId),

          parent_id:
            String(
              getParentId(parent)
            ),
        },

        theme: {
          color: "#5b21b6",
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            setSelectedPlanId(null);
          },
        },

        handler:
          async (
            razorpayResponse
          ) => {
            await verifyStudentPayment(
              razorpayResponse,
              studentId
            );
          },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        (response) => {
          console.error(
            "Student Razorpay payment failed:",
            response
          );

          setMessage(
            response?.error
              ?.description ||
              "Payment failed. Please try again."
          );

          setMessageType("error");

          setPaymentLoading(false);
          setSelectedPlanId(null);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Student payment error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to start payment."
      );

      setMessageType("error");

      setPaymentLoading(false);
      setSelectedPlanId(null);
    }
  };

  /* =======================================================
     VERIFY STUDENT PAYMENT
  ======================================================= */

  const verifyStudentPayment = async (
    razorpayResponse,
    studentId
  ) => {
    try {
      setMessage(
        "Verifying payment..."
      );

      setMessageType("success");

      const response =
        await fetch(
          VERIFY_PAYMENT_API,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              account_type:
                "student",

              user_id:
                Number(studentId),

              razorpay_payment_id:
                razorpayResponse.razorpay_payment_id,

              razorpay_order_id:
                razorpayResponse.razorpay_order_id,

              razorpay_signature:
                razorpayResponse.razorpay_signature,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          `Payment verification error: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "STUDENT PAYMENT VERIFICATION:",
        data
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Payment verification failed."
        );
      }

      setMessage(
        data.message ||
          "Payment successful. Student subscription is now active."
      );

      setMessageType("success");

      /* ================================================
         REFRESH STUDENT PAYMENT STATUS
      ================================================ */

      await loadStudentPayments(
        getParentId(parent)
      );

      setPaymentLoading(false);
      setSelectedPlanId(null);

      /*
       * Keep the user on the payment page for a moment
       * so they can see the ACTIVE status.
       */

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Student payment verification error:",
        error
      );

      setMessage(
        error.message ||
          "Payment verification failed."
      );

      setMessageType("error");

      setPaymentLoading(false);
      setSelectedPlanId(null);
    }
  };

  /* =======================================================
     OPEN PLAN SECTION FOR STUDENT
  ======================================================= */

  const openStudentPlans = (
    student
  ) => {
    if (!student?.id) {
      return;
    }

    setSelectedStudentId(
      Number(student.id)
    );

    setSelectedPlanId(null);

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="parent-subscription-page">
        <div className="parent-subscription-loading">
          <FaRotate className="loading-icon" />

          <h2>
            Loading Student Subscriptions
          </h2>

          <p>
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="parent-subscription-page">

      <div className="parent-subscription-glow glow-one" />
      <div className="parent-subscription-glow glow-two" />

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="parent-subscription-header">

        <div className="header-left">

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate(
                "/parent/dashboard"
              )
            }
          >
            <FaArrowLeft />
          </button>

          <div className="header-icon">
            <FaCreditCard />
          </div>

          <div>
            <h1>
              Student Payments
            </h1>

            <p>
              Manage subscriptions and payments
              for students assigned to this parent.
            </p>
          </div>

        </div>

        <div className="secure-badge">
          <FaShieldHalved />

          <span>
            Secure Payment
          </span>
        </div>

      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div
          className={`parent-subscription-message ${
            messageType === "success"
              ? "success"
              : "error"
          }`}
        >
          {messageType === "success" ? (
            <FaCircleCheck />
          ) : (
            <FaCircleExclamation />
          )}

          <span>
            {message}
          </span>
        </div>
      )}

      {/* =================================================
          PARENT INFO
      ================================================= */}

      <div className="parent-coverage-card">

        <div className="coverage-icon">
          <FaUsers />
        </div>

        <div className="coverage-content">

          <span className="coverage-label">
            PARENT ACCOUNT
          </span>

          <h3>
            {getParentName(parent)}
          </h3>

          <p>
            Payments are made by this parent
            account, but each subscription is
            linked to the selected student account.
          </p>

        </div>

        <div className="coverage-student-count">
          <strong>
            {students.length}
          </strong>

          <span>
            Assigned Students
          </span>
        </div>

      </div>

      {/* =================================================
          ASSIGNED STUDENTS
      ================================================= */}

      <div className="plans-heading">

        <span className="eyebrow">
          ASSIGNED STUDENTS
        </span>

        <h2>
          Student Subscription Status
        </h2>

        <p>
          Select a student to view plans and
          make a payment for that student.
        </p>

      </div>

      {studentsLoading &&
      students.length === 0 ? (
        <div className="no-plans">
          <FaRotate className="loading-icon" />

          <h3>
            Loading Students
          </h3>

          <p>
            Please wait...
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="no-plans">

          <FaUserGraduate />

          <h3>
            No Students Assigned
          </h3>

          <p>
            No students are currently assigned
            to this parent account.
          </p>

        </div>
      ) : (
        <div className="student-payment-grid">

          {students.map(
            (student) => {

              const paid =
                isStudentPaid(
                  student
                );

              const expired =
                isStudentExpired(
                  student
                );

              const selected =
                Number(
                  selectedStudentId
                ) ===
                Number(student.id);

              return (
                <div
                  className={`student-payment-card ${
                    selected
                      ? "selected"
                      : ""
                  }`}
                  key={student.id}
                >

                  {/* STUDENT HEADER */}

                  <div className="student-payment-header">

                    <div className="student-avatar">
                      {getInitials(
                        student.name
                      )}
                    </div>

                    <div className="student-payment-name">

                      <h3>
                        {student.name ||
                          "Unnamed Student"}
                      </h3>

                      <p>
                        Student ID #
                        {student.id}
                      </p>

                      <span>
                        {student.email ||
                          "No email available"}
                      </span>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div
                    className={`student-payment-status ${
                      paid
                        ? "paid"
                        : expired
                        ? "expired"
                        : "required"
                    }`}
                  >

                    {paid ? (
                      <>
                        <FaCircleCheck />

                        <div>
                          <strong>
                            ACTIVE
                          </strong>

                          <span>
                            Subscription active
                          </span>
                        </div>
                      </>
                    ) : expired ? (
                      <>
                        <FaClock />

                        <div>
                          <strong>
                            EXPIRED
                          </strong>

                          <span>
                            Renewal required
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <FaCreditCard />

                        <div>
                          <strong>
                            PAYMENT REQUIRED
                          </strong>

                          <span>
                            No active subscription
                          </span>
                        </div>
                      </>
                    )}

                  </div>

                  {/* CURRENT SUBSCRIPTION */}

                  {student.has_subscription && (
                    <div className="student-current-subscription">

                      <div>
                        <span>
                          Current Plan
                        </span>

                        <strong>
                          {student.plan_name ||
                            "Subscription"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Valid Until
                        </span>

                        <strong>
                          {student.end_date
                            ? formatDate(
                                student.end_date
                              )
                            : "—"}
                        </strong>
                      </div>

                      {Number(
                        student.days_left
                      ) > 0 && (
                        <div>
                          <span>
                            Remaining
                          </span>

                          <strong>
                            {student.days_left} days
                          </strong>
                        </div>
                      )}

                    </div>
                  )}

                  {/* ACTION */}

                  <button
                    type="button"
                    className={`student-pay-button ${
                      paid
                        ? "renew"
                        : ""
                    }`}
                    onClick={() =>
                      openStudentPlans(
                        student
                      )
                    }
                  >

                    <FaCreditCard />

                    {paid
                      ? "Renew / Change Plan"
                      : expired
                      ? "Renew Now"
                      : "Pay Now"}

                    <FaArrowRight />

                  </button>

                </div>
              );
            }
          )}

        </div>
      )}

      {/* =================================================
          SELECTED STUDENT + PLANS
      ================================================= */}

      {selectedStudent && (
        <div
          className="selected-student-section"
          id="student-plans"
        >

          <div className="selected-student-header">

            <div className="selected-student-title">

              <div className="selected-student-avatar">
                {getInitials(
                  selectedStudent.name
                )}
              </div>

              <div>

                <span>
                  PAYMENT FOR STUDENT
                </span>

                <h2>
                  {selectedStudent.name}
                </h2>

                <p>
                  {selectedStudent.email}
                </p>

              </div>

            </div>

            <button
              type="button"
              className="close-student-plans"
              onClick={() => {
                setSelectedStudentId(
                  null
                );
                setSelectedPlanId(
                  null
                );
              }}
            >
              Close
            </button>

          </div>

          <div className="selected-student-note">

            <FaShieldHalved />

            <span>
              The parent makes the payment,
              but the subscription will be saved
              against this student's account.
            </span>

          </div>

          <div className="plans-heading">

            <span className="eyebrow">
              SUBSCRIPTION PLANS
            </span>

            <h2>
              Choose a plan
            </h2>

            <p>
              Select a plan for{" "}
              <strong>
                {selectedStudent.name}
              </strong>
              .
            </p>

          </div>

          {plans.length === 0 ? (
            <div className="no-plans">

              <FaCircleExclamation />

              <h3>
                No subscription plans available
              </h3>

              <p>
                Please contact the administrator.
              </p>

            </div>
          ) : (
            <div className="plans-grid">

              {plans.map(
                (plan) => {

                  const isYearly =
                    String(
                      plan.billing_cycle
                    ).toLowerCase() ===
                    "yearly";

                  const isQuarterly =
                    String(
                      plan.billing_cycle
                    ).toLowerCase() ===
                    "quarterly";

                  const isSelected =
                    Number(
                      selectedPlanId
                    ) ===
                    Number(plan.id);

                  const processing =
                    paymentLoading &&
                    isSelected;

                  return (
                    <div
                      key={plan.id}
                      className={`plan-card ${
                        isYearly
                          ? "featured"
                          : ""
                      } ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                    >

                      {isYearly && (
                        <div className="popular-badge">

                          <FaCrown />

                          Most Popular

                        </div>
                      )}

                      <div
                        className={`plan-icon ${
                          isYearly
                            ? "purple"
                            : isQuarterly
                            ? "blue"
                            : "green"
                        }`}
                      >
                        {getPlanIcon(
                          plan.billing_cycle
                        )}
                      </div>

                      <h3>
                        {plan.name}
                      </h3>

                      <p className="plan-description">
                        {plan.description ||
                          `SkillLab ${plan.name} Subscription`}
                      </p>

                      <div className="plan-price">

                        <span className="currency">
                          ₹
                        </span>

                        <span className="amount">
                          {formatPrice(
                            plan.price
                          )}
                        </span>

                      </div>

                      <div className="billing-text">
                        per{" "}
                        {formatCycle(
                          plan.billing_cycle
                        )}
                      </div>

                      <div className="plan-features">

                        <div>
                          <FaCheck />

                          <span>
                            Full SkillLab access
                          </span>
                        </div>

                        <div>
                          <FaCheck />

                          <span>
                            Student task tracking
                          </span>
                        </div>

                        <div>
                          <FaCheck />

                          <span>
                            Performance monitoring
                          </span>
                        </div>

                        <div>
                          <FaCheck />

                          <span>
                            {getDurationText(
                              plan.billing_cycle
                            )} subscription
                          </span>
                        </div>

                      </div>

                      <button
                        type="button"
                        className={`subscribe-button ${
                          isYearly
                            ? "primary"
                            : ""
                        }`}
                        disabled={
                          paymentLoading
                        }
                        onClick={() =>
                          handleStudentPayment(
                            selectedStudent,
                            plan
                          )
                        }
                      >

                        {processing ? (
                          <>
                            <FaRotate className="spin" />

                            Processing...
                          </>
                        ) : (
                          <>
                            <FaCreditCard />

                            {isStudentPaid(
                              selectedStudent
                            )
                              ? "Renew / Continue"
                              : "Pay Now"}
                          </>
                        )}

                      </button>

                      <div className="secure-text">

                        <FaShieldHalved />

                        Secure Razorpay payment

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>
      )}

      {/* =================================================
          FOOTER NOTE
      ================================================= */}

      <div className="payment-note">

        <FaShieldHalved />

        <div>

          <strong>
            Secure Student Subscription
          </strong>

          <p>
            The parent account is used to make
            the payment. The subscription itself
            is linked to the selected student's
            account.
          </p>

        </div>

      </div>

    </div>
  );
}

export default ParentSubscription;
