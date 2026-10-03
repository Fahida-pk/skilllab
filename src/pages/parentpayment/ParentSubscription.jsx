import { useEffect, useState } from "react";
import {
  FaCreditCard,
  FaShieldHalved,
  FaCircleCheck,
  FaCircleExclamation,
  FaRotate,
  FaCrown,
  FaStar,
  FaCalendarDays,
  FaClock,
} from "react-icons/fa6";

import "./parentsubscription.css";

/* =========================================================
   API
========================================================= */

const PARENT_SUBSCRIPTION_API =
  "https://zyntaweb.com/skilllab/parent-subscription.php";

const PLANS_API =
  "https://zyntaweb.com/skilllab/plans.php";

const FREE_TRIAL_API =
  "https://zyntaweb.com/skilllab/parent-free-trial.php";

/*
  IMPORTANT:
  Use the GENERIC account-type endpoints.

  Do NOT use:
  parent-create-razorpay-order.php
  parent-verify-razorpay-payment.php

  Those were being used for student-wise payment.
*/

const CREATE_ORDER_API =
  "https://zyntaweb.com/skilllab/create-razorpay-order-parent.php";

const VERIFY_PAYMENT_API =
  "https://zyntaweb.com/skilllab/verify-razorpay-payment-parent.php";

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
   HELPERS
========================================================= */

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

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

const cycleText = (cycle) => {
  const value = String(cycle || "").toLowerCase();

  if (value === "monthly") return "month";
  if (value === "quarterly") return "3 months";
  if (value === "yearly") return "year";

  return value;
};

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

export default function ParentSubscription({ parent }) {
  /* =======================================================
     STATE
  ======================================================= */

  const [plans, setPlans] = useState([]);

  const [subscription, setSubscription] =
    useState(null);

  const [hasSubscription, setHasSubscription] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [trialLoading, setTrialLoading] =
    useState(false);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  /* =======================================================
     PARENT ID
  ======================================================= */

  const parentId = Number(parent?.id || 0);

  /* =======================================================
     LOAD PARENT SUBSCRIPTION
  ======================================================= */

  const loadSubscription = async () => {
    if (parentId <= 0) {
      setSubscription(null);
      setHasSubscription(false);
      return;
    }

    try {
      const response = await fetch(
        `${PARENT_SUBSCRIPTION_API}?parent_id=${encodeURIComponent(
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load parent subscription."
        );
      }

      setHasSubscription(
        Boolean(data.has_subscription)
      );

      setSubscription(
        data.has_subscription
          ? data.subscription
          : null
      );
    } catch (error) {
      console.error(
        "Parent subscription load error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load subscription."
      );

      setMessageType("error");
    }
  };

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

      const data = await response.json();

      if (!response.ok || !data.success) {
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
        "Plan loading error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load plans."
      );

      setMessageType("error");
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      if (parentId <= 0) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        await Promise.all([
          loadSubscription(),
          loadPlans(),
        ]);
      } catch (error) {
        if (!cancelled) {
          console.error(error);
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
  }, [parentId]);

  /* =======================================================
     START 7 DAY FREE TRIAL
  ======================================================= */

  const startFreeTrial = async () => {
    if (parentId <= 0) {
      setMessage("Parent information is missing.");
      setMessageType("error");
      return;
    }

    if (trialLoading || paymentLoading) {
      return;
    }

    try {
      setTrialLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        FREE_TRIAL_API,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify({
            parent_id: parentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to start free trial."
        );
      }

      setSubscription(
        data.subscription || null
      );

      setHasSubscription(true);

      setMessage(
        "Your 7-day free trial has started."
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "Free trial error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to start free trial."
      );

      setMessageType("error");
    } finally {
      setTrialLoading(false);
    }
  };

  /* =======================================================
     PAYMENT
     
     IMPORTANT:
     Parent only.
     NO student_id.
  ======================================================= */

  const handlePayment = async (plan) => {
    if (paymentLoading) {
      return;
    }

    if (parentId <= 0) {
      setMessage("Parent information is missing.");
      setMessageType("error");
      return;
    }

    const planId = Number(plan?.id || 0);

    if (planId <= 0) {
      setMessage("Invalid plan.");
      setMessageType("error");
      return;
    }

    const planName =
      plan?.name || "selected plan";

    const amount = Number(
      plan?.price || 0
    );

    const confirmed = window.confirm(
      `Continue with ${planName} for ₹${formatPrice(
        amount
      )}?\n\nThis payment is for the parent account and covers all students assigned to this parent.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPaymentLoading(true);
      setMessage("");
      setMessageType("");

      /* ==========================================
         LOAD RAZORPAY
      ========================================== */

      const loaded =
        await loadRazorpayScript();

      if (!loaded) {
        throw new Error(
          "Razorpay Checkout could not be loaded."
        );
      }

      /* ==========================================
         CREATE PARENT ORDER
         
         NO student_id
      ========================================== */

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
              account_type: "parent",
              parent_id: parentId,
              plan_id: planId,
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

      /* ==========================================
         RAZORPAY OPTIONS
      ========================================== */

      const options = {
        key: orderData.key_id,

        amount: Number(
          orderData.amount
        ),

        currency:
          orderData.currency || "INR",

        name: "SkillLab",

        description:
          `${planName} Parent Subscription`,

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
          account_type: "parent",
          parent_id:
            String(parentId),

          plan_id:
            String(planId),
        },

        theme: {
          color: "#6d28d9",
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },

        /* ======================================
           PAYMENT SUCCESS
        ====================================== */

        handler:
          async (razorpayResponse) => {
            try {
              setMessage(
                "Verifying payment..."
              );

              setMessageType(
                "success"
              );

              /* ================================
                 VERIFY PARENT PAYMENT

                 NO student_id
              ================================= */

              const verifyResponse =
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
                        "parent",

                      parent_id:
                        parentId,

                      razorpay_payment_id:
                        razorpayResponse.razorpay_payment_id,

                      razorpay_order_id:
                        razorpayResponse.razorpay_order_id,

                      razorpay_signature:
                        razorpayResponse.razorpay_signature,
                    }),
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

              /* ================================
                 UPDATE LOCAL SUBSCRIPTION
              ================================= */

              if (
                verifyData.subscription
              ) {
                setSubscription(
                  verifyData.subscription
                );

                setHasSubscription(
                  true
                );
              }

              setMessage(
                "Payment successful. Parent subscription is now active."
              );

              setMessageType(
                "success"
              );

              /* ================================
                 REFRESH
              ================================= */

              await loadSubscription();
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
              setPaymentLoading(false);
            }
          },
      };

      /* ==========================================
         OPEN RAZORPAY
      ========================================== */

      const razorpay =
        new window.Razorpay(
          options
        );

      /* ==========================================
         PAYMENT FAILED
      ========================================== */

      razorpay.on(
        "payment.failed",
        (response) => {
          setMessage(
            response?.error
              ?.description ||
              "Payment failed. Please try again."
          );

          setMessageType("error");

          setPaymentLoading(false);
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

      setMessageType("error");

      setPaymentLoading(false);
    }
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = async () => {
    if (loading || paymentLoading) {
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      await Promise.all([
        loadSubscription(),
        loadPlans(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const isActive =
    String(
      subscription?.status || ""
    ).toLowerCase() === "active";

  const isTrial =
    Number(
      subscription?.free_trial || 0
    ) === 1 ||
    String(
      subscription?.billing_cycle || ""
    ).toLowerCase() === "trial";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="parent-subscription-page">

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="parent-subscription-header">

        <div>
          <span className="parent-subscription-kicker">
            PARENT SUBSCRIPTION
          </span>

          <h1>
            Payments & Subscription
          </h1>

          <p>
            Manage one subscription for this
            parent account. The subscription
            covers all students assigned to
            this parent.
          </p>
        </div>

        <div className="parent-subscription-secure">
          <FaShieldHalved />

          <span>
            Secure Razorpay payment
          </span>

          <button
            type="button"
            onClick={refresh}
            disabled={
              loading ||
              paymentLoading
            }
            title="Refresh subscription"
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

      {/* ================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div
          className={`parent-subscription-message ${messageType}`}
        >
          {messageType ===
          "success" ? (
            <FaCircleCheck />
          ) : (
            <FaCircleExclamation />
          )}

          <span>{message}</span>
        </div>
      )}

      {/* ================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div className="parent-subscription-loading">
          <FaRotate className="spin" />

          <span>
            Loading parent subscription...
          </span>
        </div>
      ) : (
        <>
          {/* ============================================
              CURRENT SUBSCRIPTION
          ============================================= */}

          {hasSubscription &&
          subscription ? (
            <div className="parent-current-subscription">

              <div className="parent-current-left">

                <div className="parent-current-icon">
                  {isTrial ? (
                    <FaClock />
                  ) : (
                    <FaCreditCard />
                  )}
                </div>

                <div>
                  <span className="current-label">
                    CURRENT SUBSCRIPTION
                  </span>

                  <h2>
                    {isTrial
                      ? "7-Day Free Trial"
                      : subscription.plan_name ||
                        subscription.name ||
                        "Active Plan"}
                  </h2>

                  <p>
                    {isTrial
                      ? "Your parent trial is active."
                      : "Your parent subscription is active."}
                  </p>
                </div>
              </div>

              <div className="parent-current-right">

                <span
                  className={
                    isActive
                      ? "subscription-active"
                      : "subscription-expired"
                  }
                >
                  {isActive ? (
                    <>
                      <FaCircleCheck />
                      Active
                    </>
                  ) : (
                    <>
                      <FaCircleExclamation />
                      Expired
                    </>
                  )}
                </span>

                <div className="subscription-date">
                  <span>
                    Valid until
                  </span>

                  <strong>
                    {formatDate(
                      subscription.end_date
                    )}
                  </strong>
                </div>

                {Number(
                  subscription.days_left
                ) > 0 && (
                  <div className="subscription-days">
                    {subscription.days_left}{" "}
                    days remaining
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ==========================================
               NO SUBSCRIPTION
            ========================================== */

            <div className="parent-trial-card">

              <div className="parent-trial-icon">
                <FaStar />
              </div>

              <div className="parent-trial-content">
                <span>
                  START WITH SKILL LAB
                </span>

                <h2>
                  7-Day Free Trial
                </h2>

                <p>
                  Get full SkillLab access for
                  7 days. After the trial ends,
                  choose a parent subscription
                  plan.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  startFreeTrial
                }
                disabled={
                  trialLoading
                }
              >
                {trialLoading ? (
                  <>
                    <FaRotate className="spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <FaStar />
                    Start Free Trial
                  </>
                )}
              </button>
            </div>
          )}

          {/* ============================================
              PLANS
          ============================================= */}

          <div className="parent-plans-section">

            <div className="parent-plans-heading">

              <div>
                <span>
                  SUBSCRIPTION PLANS
                </span>

                <h2>
                  Choose Your Plan
                </h2>

                <p>
                  One payment for the parent
                  account covers all assigned
                  students.
                </p>
              </div>

              <div className="parent-plan-note">
                <FaShieldHalved />
                Parent account billing
              </div>
            </div>

            <div className="parent-plan-grid">

              {plans.length === 0 ? (
                <div className="parent-no-plans">
                  <FaCircleExclamation />

                  <h3>
                    No active plans
                  </h3>

                  <p>
                    Please contact the
                    administrator.
                  </p>
                </div>
              ) : (
                plans.map((plan) => {

                  const currentPlan =
                    Number(
                      subscription?.plan_id
                    ) ===
                    Number(plan.id);

                  return (
                    <article
                      key={plan.id}
                      className={`parent-plan-card ${
                        currentPlan
                          ? "current"
                          : ""
                      }`}
                    >

                      {currentPlan && (
                        <span className="parent-current-badge">
                          Current Plan
                        </span>
                      )}

                      <div className="parent-plan-icon">
                        {planIcon(
                          plan.billing_cycle
                        )}
                      </div>

                      <h3>
                        {plan.name}
                      </h3>

                      <div className="parent-plan-price">
                        ₹
                        {formatPrice(
                          plan.price
                        )}
                      </div>

                      <span className="parent-plan-cycle">
                        /{" "}
                        {cycleText(
                          plan.billing_cycle
                        )}
                      </span>

                      <p>
                        {plan.description ||
                          "SkillLab parent subscription"}
                      </p>

                      <ul>
                        <li>
                          <FaCircleCheck />
                          Full SkillLab access
                        </li>

                        <li>
                          <FaCircleCheck />
                          All assigned students
                        </li>

                        <li>
                          <FaCircleCheck />
                          Student task tracking
                        </li>

                        <li>
                          <FaCircleCheck />
                          Performance monitoring
                        </li>
                      </ul>

                      <button
                        type="button"
                        className="parent-plan-pay-button"
                        disabled={
                          paymentLoading
                        }
                        onClick={() =>
                          handlePayment(
                            plan
                          )
                        }
                      >
                        {paymentLoading ? (
                          <>
                            <FaRotate className="spin" />
                            Processing...
                          </>
                        ) : currentPlan ? (
                          <>
                            <FaRotate />
                            Renew Plan
                          </>
                        ) : (
                          <>
                            <FaCreditCard />
                            Subscribe Now
                          </>
                        )}
                      </button>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          {/* ============================================
              IMPORTANT NOTE
          ============================================= */}

          <div className="parent-subscription-note">

            <FaShieldHalved />

            <div>
              <strong>
                Parent-level subscription
              </strong>

              <span>
                Payment and renewal are saved
                against the parent account.
                Student IDs are not used for
                subscription or renewal.
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}