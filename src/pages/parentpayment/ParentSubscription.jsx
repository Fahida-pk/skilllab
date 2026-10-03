import { useEffect, useState } from "react";
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
} from "react-icons/fa6";

const PLANS_API =
  "https://zyntaweb.com/skilllab/plans.php";

const CREATE_ORDER_API =
  "https://zyntaweb.com/skilllab/create-razorpay-order.php";

const VERIFY_PAYMENT_API =
  "https://zyntaweb.com/skilllab/verify-razorpay-payment.php";

const SUBSCRIPTION_API =
  "https://zyntaweb.com/skilllab/parent_subscription.php";

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

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

function getLoggedInParent() {
  try {
    const parentString = localStorage.getItem("parent");

    if (!parentString) {
      return null;
    }

    return JSON.parse(parentString);
  } catch (error) {
    console.error("Unable to read logged-in parent:", error);
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
    ""
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

function ParentSubscription() {
  const navigate = useNavigate();

  const [parent, setParent] = useState(null);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const loggedParent = getLoggedInParent();

    if (!loggedParent) {
      navigate("/parent/login", { replace: true });
      return;
    }

    setParent(loggedParent);
  }, [navigate]);

  const loadPlans = async () => {
    try {
      const response = await fetch(PLANS_API, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Plans API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Unable to load plans."
        );
      }

      const activePlans = Array.isArray(data.plans)
        ? data.plans.filter(
            (plan) =>
              Number(plan.is_active ?? 1) === 1
          )
        : [];

      setPlans(activePlans);
    } catch (error) {
      console.error("Load parent plans error:", error);
      setMessage(
        error.message ||
          "Unable to load subscription plans."
      );
      setMessageType("error");
    }
  };

  const loadSubscription = async (parentId) => {
    if (parentId <= 0) {
      setSubscription(null);
      return;
    }

    try {
      const response = await fetch(
        `${SUBSCRIPTION_API}?parent_id=${encodeURIComponent(
          parentId
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Parent subscription API error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "PARENT CURRENT SUBSCRIPTION:",
        data
      );

      if (
        data.success &&
        data.has_subscription &&
        data.subscription
      ) {
        setSubscription(data.subscription);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error(
        "Load parent subscription error:",
        error
      );
      setSubscription(null);
    }
  };

  useEffect(() => {
    if (!parent) {
      return;
    }

    const initialize = async () => {
      try {
        setLoading(true);

        const parentId = getParentId(parent);

        if (parentId <= 0) {
          setMessage(
            "Parent information not found. Please login again."
          );
          setMessageType("error");
          return;
        }

        await Promise.all([
          loadPlans(),
          loadSubscription(parentId),
        ]);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [parent]);

  const formatPrice = (price) => {
    const amount = Number(price || 0);

    return amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatCycle = (cycle) => {
    if (!cycle) {
      return "";
    }

    const value = String(cycle).toLowerCase();

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

  const getDurationText = (billingCycle) => {
    const cycle = String(
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

  const getPlanIcon = (billingCycle) => {
    const cycle = String(
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

  const handleSubscribe = async (plan) => {
    if (paymentLoading) {
      return;
    }

    const currentParent =
      parent || getLoggedInParent();

    const parentId = getParentId(currentParent);
    const planId = Number(plan.id);

    if (parentId <= 0) {
      setMessage(
        "Parent information not found. Please login again."
      );
      setMessageType("error");
      return;
    }

    if (planId <= 0) {
      setMessage("Invalid subscription plan.");
      setMessageType("error");
      return;
    }

    const confirmed = window.confirm(
      `Continue with ${plan.name} plan for ₹${formatPrice(
        plan.price
      )}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPaymentLoading(true);
      setSelectedPlanId(planId);
      setMessage("");

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Please check your internet connection."
        );
      }

      const orderResponse = await fetch(
        CREATE_ORDER_API,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            account_type: "parent",
            parent_id: parentId,
            plan_id: planId,
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
        "PARENT RAZORPAY ORDER:",
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

      const options = {
        key: orderData.key_id,
        amount: Number(orderData.amount),
        currency: orderData.currency || "INR",
        name: "SkillLab",
        description: `${plan.name} Parent Subscription`,
        order_id: orderData.order_id,

        prefill: {
          name: getParentName(currentParent),
          email: getParentEmail(currentParent),
          contact: getParentPhone(currentParent),
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

        handler: async (razorpayResponse) => {
          await verifyPayment(
            razorpayResponse,
            parentId
          );
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response) => {
          console.error(
            "Parent Razorpay payment failed:",
            response
          );

          setMessage(
            response?.error?.description ||
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
        "Parent subscription payment error:",
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

  const verifyPayment = async (
    razorpayResponse,
    parentId
  ) => {
    try {
      setMessage("Verifying payment...");
      setMessageType("success");

      const response = await fetch(
        VERIFY_PAYMENT_API,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            account_type: "parent",
            parent_id: parentId,
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

      const data = await response.json();

      console.log(
        "PARENT PAYMENT VERIFICATION:",
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
          "Payment successful! Your parent subscription is active."
      );
      setMessageType("success");

      await loadSubscription(parentId);

      setPaymentLoading(false);
      setSelectedPlanId(null);

      setTimeout(() => {
        navigate("/parent/dashboard", {
          replace: true,
        });
      }, 1800);
    } catch (error) {
      console.error(
        "Parent payment verification error:",
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

  if (loading) {
    return (
      <div className="parent-subscription-page">
        <div className="parent-subscription-loading">
          <FaRotate className="loading-icon" />

          <h2>
            Loading Subscription Plans
          </h2>

          <p>
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-subscription-page">

      <div className="parent-subscription-glow glow-one" />
      <div className="parent-subscription-glow glow-two" />

      {/* HEADER */}
      <div className="parent-subscription-header">

        <div className="header-left">

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/parent/dashboard")
            }
          >
            <FaArrowLeft />
          </button>

          <div className="header-icon">
            <FaCreditCard />
          </div>

          <div>
            <h1>
              Parent Subscription
            </h1>

            <p>
              One subscription for all students assigned to this parent.
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

      {/* MESSAGE */}
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

          <span>{message}</span>
        </div>
      )}

      {/* PARENT COVERAGE */}
      <div className="parent-coverage-card">

        <div className="coverage-icon">
          <FaUsers />
        </div>

        <div className="coverage-content">
          <span className="coverage-label">
            PARENT ACCOUNT
          </span>

          <h3>
            {getParentName(parent) ||
              "Parent Account"}
          </h3>

          <p>
            This subscription covers the students
            assigned to this parent account.
          </p>
        </div>

      </div>

      {/* CURRENT SUBSCRIPTION */}
      {subscription && (
        <div className="current-parent-subscription">

          <div className="current-icon">
            <FaCircleCheck />
          </div>

          <div className="current-content">

            <div className="current-top">
              <span className="current-label">
                Current Parent Subscription
              </span>

              <span className="active-badge">
                {String(
                  subscription.status ||
                    "active"
                ).toUpperCase()}
              </span>
            </div>

            <h3>
              {subscription.plan_name ||
                subscription.name ||
                "Active Plan"}
            </h3>

            <p>
              ₹
              {formatPrice(
                subscription.amount
              )}
              {" • "}
              {subscription.billing_cycle ||
                "Subscription"}

              {subscription.end_date
                ? ` • Valid until ${subscription.end_date}`
                : ""}
            </p>

            {subscription.days_left !==
              undefined && (
              <span className="days-left">
                {Number(
                  subscription.days_left
                ) > 0
                  ? `${subscription.days_left} days remaining`
                  : "Subscription expired"}
              </span>
            )}

          </div>

        </div>
      )}

      {/* TITLE */}
      <div className="plans-heading">

        <span className="eyebrow">
          PARENT SUBSCRIPTION PLANS
        </span>

        <h2>
          Choose a plan for your family
        </h2>

        <p>
          One payment covers all students
          assigned to your parent account.
        </p>

      </div>

      {/* PLANS */}
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

          {plans.map((plan) => {

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
              Number(selectedPlanId) ===
              Number(plan.id);

            return (
              <div
                key={plan.id}
                className={`plan-card ${
                  isYearly
                    ? "featured"
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
                    `SkillLab ${plan.name} Parent Plan`}
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
                      All assigned students
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
                  disabled={paymentLoading}
                  onClick={() =>
                    handleSubscribe(plan)
                  }
                >
                  {isSelected &&
                  paymentLoading ? (
                    <>
                      <FaRotate className="spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCreditCard />
                      {subscription
                        ? "Renew / Continue"
                        : "Subscribe Now"}
                    </>
                  )}
                </button>

                <div className="secure-text">
                  <FaShieldHalved />
                  Secure Razorpay payment
                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* FOOTER NOTE */}
      <div className="payment-note">

        <FaShieldHalved />

        <div>
          <strong>
            One parent payment
          </strong>

          <p>
            Your subscription is linked to your
            parent account. All students assigned
            to this parent account are covered by
            the same parent subscription.
          </p>
        </div>

      </div>

    </div>
  );
}

export default ParentSubscription;
