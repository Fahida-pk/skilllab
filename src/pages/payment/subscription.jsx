import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import "./subscription.css";

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

} from "react-icons/fa6";

// =====================================================

// API URLS

// =====================================================

const PLANS_API =

  "https://zyntaweb.com/skilllab/plans.php";

const CREATE_ORDER_API =

  "https://zyntaweb.com/skilllab/create-razorpay-order.php";

const VERIFY_PAYMENT_API =

  "https://zyntaweb.com/skilllab/verify-razorpay-payment.php";

const SUBSCRIPTION_API =

  "https://zyntaweb.com/skilllab/student-subscription.php";

// =====================================================

// RAZORPAY SCRIPT

// =====================================================

const RAZORPAY_SCRIPT =

  "https://checkout.razorpay.com/v1/checkout.js";

// =====================================================

// LOAD RAZORPAY SCRIPT

// =====================================================

function loadRazorpayScript() {

  return new Promise((resolve) => {

    // Already loaded

    if (window.Razorpay) {

      resolve(true);

      return;

    }

    const existingScript =

      document.querySelector(

        `script[src="${RAZORPAY_SCRIPT}"]`

      );

    if (existingScript) {

      existingScript.onload = () =>

        resolve(true);

      existingScript.onerror = () =>

        resolve(false);

      return;

    }

    const script =

      document.createElement("script");

    script.src = RAZORPAY_SCRIPT;

    script.async = true;

    script.onload = () =>

      resolve(true);

    script.onerror = () =>

      resolve(false);

    document.body.appendChild(script);

  });

}

// =====================================================

// GET LOGGED-IN USER

// =====================================================

function getLoggedInUser() {

  try {

    const userString =

      localStorage.getItem("user");

    if (!userString) {

      return null;

    }

    const user =

      JSON.parse(userString);

    return user;

  } catch (error) {

    console.error(

      "Unable to read logged-in user:",

      error

    );

    return null;

  }

}

// =====================================================

// COMPONENT

// =====================================================

function Subscription() {

  const navigate = useNavigate();

  // ===================================================

  // STATE

  // ===================================================

  const [user, setUser] =

    useState(null);

  const [plans, setPlans] =

    useState([]);

  const [subscription, setSubscription] =

    useState(null);

  const [loading, setLoading] =

    useState(true);

  const [paymentLoading, setPaymentLoading] =

    useState(false);

  const [selectedPlanId, setSelectedPlanId] =

    useState(null);

  const [message, setMessage] =

    useState("");

  const [messageType, setMessageType] =

    useState("");

  // ===================================================

  // LOAD USER

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

  }, [navigate]);

  // ===================================================

  // LOAD PLANS

  // ===================================================

  const loadPlans = async () => {

    try {

      const response =

        await fetch(

          PLANS_API,

          {

            method: "GET",

            headers: {

              Accept:

                "application/json",

            },

          }

        );

      if (!response.ok) {

        throw new Error(

          `Plans API error: ${response.status}`

        );

      }

      const data =

        await response.json();

      console.log(

        "SKILL LAB PLANS:",

        data

      );

      if (!data.success) {

        throw new Error(

          data.message ||

            "Unable to load plans"

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

  // ===================================================

  // LOAD CURRENT SUBSCRIPTION

  // ===================================================

  const loadSubscription = async (

    userId

  ) => {

    try {

      const response =

        await fetch(

          `${SUBSCRIPTION_API}?user_id=${encodeURIComponent(

            userId

          )}`,

          {

            method: "GET",

            headers: {

              Accept:

                "application/json",

            },

          }

        );

      if (!response.ok) {

        throw new Error(

          `Subscription API error: ${response.status}`

        );

      }

      const data =

        await response.json();

      console.log(

        "CURRENT SUBSCRIPTION:",

        data

      );

      if (

        data.success &&

        data.has_subscription &&

        data.subscription

      ) {

        setSubscription(

          data.subscription

        );

      } else {

        setSubscription(null);

      }

    } catch (error) {

      console.error(

        "Load subscription error:",

        error

      );

      // Don't block payment page

      setSubscription(null);

    }

  };

  // ===================================================

  // INITIAL LOAD

  // ===================================================

  useEffect(() => {

    if (!user) {

      return;

    }

    const initialize =

      async () => {

        try {

          setLoading(true);

          await Promise.all([

            loadPlans(),

            loadSubscription(

              getUserId(user)

            ),

          ]);

        } finally {

          setLoading(false);

        }

      };

    initialize();

  }, [user]);

  // ===================================================

  // GET USER ID

  // ===================================================

  const getUserId = (currentUser) => {

    if (!currentUser) {

      return 0;

    }

    return Number(

      currentUser.id ??

      currentUser.user_id ??

      currentUser.userId ??

      0

    );

  };

  // ===================================================

  // FORMAT PRICE

  // ===================================================

  const formatPrice = (price) => {

    const amount =

      Number(price || 0);

    return amount.toLocaleString(

      "en-IN",

      {

        maximumFractionDigits: 2,

      }

    );

  };

  // ===================================================

  // FORMAT BILLING CYCLE

  // ===================================================

  const formatCycle = (cycle) => {

    if (!cycle) {

      return "";

    }

    const value =

      String(cycle)

        .toLowerCase();

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

  // ===================================================

  // GET PLAN DURATION TEXT

  // ===================================================

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

  // ===================================================

  // GET PLAN ICON

  // ===================================================

  const getPlanIcon = (

    billingCycle

  ) => {

    const cycle =

      String(

        billingCycle || ""

      ).toLowerCase();

    if (cycle === "yearly") {

      return (

        <FaCrown />

      );

    }

    if (cycle === "quarterly") {

      return (

        <FaStar />

      );

    }

    return (

      <FaCalendarDays />

    );

  };

  // ===================================================

  // START PAYMENT

  // ===================================================

  const handleSubscribe = async (

    plan

  ) => {

    if (paymentLoading) {

      return;

    }

    // -----------------------------------------------

    // USER

    // -----------------------------------------------

    const currentUser =

      user || getLoggedInUser();

    const userId =

      getUserId(currentUser);

    if (userId <= 0) {

      setMessage(

        "User information not found. Please login again."

      );

      setMessageType("error");

      return;

    }

    // -----------------------------------------------

    // PLAN

    // -----------------------------------------------

    const planId =

      Number(plan.id);

    if (planId <= 0) {

      setMessage(

        "Invalid subscription plan."

      );

      setMessageType("error");

      return;

    }

    // -----------------------------------------------

    // CONFIRM

    // -----------------------------------------------

    const confirmed =

      window.confirm(

        `Continue with ${plan.name} plan for ₹${formatPrice(

          plan.price

        )}?`

      );

    if (!confirmed) {

      return;

    }

    try {

      setPaymentLoading(true);

      setSelectedPlanId(

        planId

      );

      setMessage("");

      // =================================================

      // LOAD RAZORPAY

      // =================================================

      const razorpayLoaded =

        await loadRazorpayScript();

      if (!razorpayLoaded) {

        throw new Error(

          "Razorpay Checkout could not be loaded. Please check your internet connection."

        );

      }

      // =================================================

      // CREATE ORDER

      // =================================================

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

              user_id: userId,

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

        "RAZORPAY ORDER:",

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

      // =================================================

      // RAZORPAY CHECKOUT OPTIONS

      // =================================================

      const options = {

        key:

          orderData.key_id,

        amount:

          Number(orderData.amount),

        currency:

          orderData.currency ||

          "INR",

        name:

          "SkillLab",

        description:

          `${plan.name} Subscription`,

        order_id:

          orderData.order_id,

        // ---------------------------------------------

        // PREFILL

        // ---------------------------------------------

        prefill: {

          name:

            currentUser.name ||

            currentUser.full_name ||

            "",

          email:

            currentUser.email ||

            "",

          contact:

            currentUser.phone ||

            currentUser.mobile ||

            "",

        },

        // ---------------------------------------------

        // THEME

        // ---------------------------------------------

        theme: {

          color:

            "#6d28d9",

        },

        // ---------------------------------------------

        // MODAL

        // ---------------------------------------------

        modal: {

          ondismiss: () => {

            console.log(

              "Razorpay checkout closed"

            );

            setPaymentLoading(false);

            setSelectedPlanId(null);

          },

        },

        // ---------------------------------------------

        // PAYMENT HANDLER

        // ---------------------------------------------

        handler:

          async (

            razorpayResponse

          ) => {

            await verifyPayment(

              razorpayResponse,

              userId,

              planId

            );

          },

      };

      // =================================================

      // OPEN RAZORPAY

      // =================================================

      const razorpay =

        new window.Razorpay(

          options

        );

      // -----------------------------------------------

      // PAYMENT FAILED

      // -----------------------------------------------

      razorpay.on(

        "payment.failed",

        (response) => {

          console.error(

            "Razorpay payment failed:",

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

        "Subscription payment error:",

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

  // ===================================================

  // VERIFY PAYMENT

  // ===================================================

  const verifyPayment = async (

    razorpayResponse,

    userId,

    planId

  ) => {

    try {

      setMessage(

        "Verifying payment..."

      );

      setMessageType("success");

      // =================================================

      // SEND TO BACKEND

      // =================================================

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

              user_id:

                userId,

              plan_id:

                Number(planId),

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

        "PAYMENT VERIFICATION:",

        data

      );

      // =================================================

      // SUCCESS

      // =================================================

      if (!data.success) {

        throw new Error(

          data.message ||

            "Payment verification failed."

        );

      }

      setMessage(

        data.message ||

          "Payment successful! Your subscription is active."

      );

      setMessageType("success");

      // =================================================

      // RELOAD SUBSCRIPTION

      // =================================================

      await loadSubscription(

        userId

      );

      setPaymentLoading(false);

      setSelectedPlanId(null);

      // =================================================

      // GO TO DASHBOARD AFTER SUCCESS

      // =================================================

      setTimeout(() => {

        navigate(

          "/dashboard",

          {

            replace: true,

          }

        );

      }, 1800);

    } catch (error) {

      console.error(

        "Payment verification error:",

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

  // ===================================================

  // LOADING

  // ===================================================

  if (loading) {

    return (

      <div className="subscription-page">

        <div className="subscription-loading">

          <FaRotate

            className="loading-icon"

          />

          <h2>

            Loading Subscription Plans

          </h2>

          <p>

            Please wait...

          </p>

        </div>

        <style>{subscriptionStyles}</style>

      </div>

    );

  }

  // ===================================================

  // PAGE

  // ===================================================

  return (

    <div className="subscription-page">

      {/* =================================================

          BACKGROUND

      ================================================= */}

      <div className="subscription-glow glow-one" />

      <div className="subscription-glow glow-two" />

      {/* =================================================

          HEADER

      ================================================= */}

      <div className="subscription-header">

        <div className="header-left">

     {String(subscription?.status || "").toLowerCase() === "active" && (

  <button

    type="button"

    className="back-button"

    onClick={() =>

      navigate("/dashboard")

    }

  >

    <FaArrowLeft />

  </button>

)}

          <div className="header-icon">

            <FaCreditCard />

          </div>

          <div>

            <h1>

              SkillLab Subscription

            </h1>

            <p>

              Choose a plan and continue your learning journey.

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

          className={`subscription-message ${

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

          CURRENT SUBSCRIPTION

      ================================================= */}

      {subscription && (

        <div className="current-subscription">

          <div className="current-icon">

            <FaCircleCheck />

          </div>

          <div className="current-content">

            <div className="current-top">

              <span className="current-label">

                Current Subscription

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

          </div>

        </div>

      )}

      {/* =================================================

          TITLE

      ================================================= */}

      <div className="plans-heading">

        <span className="eyebrow">

          SUBSCRIPTION PLANS

        </span>

        <h2>

          Choose the right plan for you

        </h2>

        <p>

          Select a subscription plan to continue using SkillLab learning features.

        </p>

      </div>

      {/* =================================================

          PLANS

      ================================================= */}

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

            (plan, index) => {

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

                ) === Number(plan.id);

              return (

                <div

                  key={plan.id}

                  className={`plan-card ${

                    isYearly

                      ? "featured"

                      : ""

                  }`}

                >

                  {/* ---------------------------------------

                      POPULAR

                  --------------------------------------- */}

                  {isYearly && (

                    <div className="popular-badge">

                      <FaCrown />

                      Most Popular

                    </div>

                  )}

                  {/* ---------------------------------------

                      PLAN ICON

                  --------------------------------------- */}

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

                  {/* ---------------------------------------

                      PLAN NAME

                  --------------------------------------- */}

                  <h3>

                    {plan.name}

                  </h3>

                  {/* ---------------------------------------

                      DESCRIPTION

                  --------------------------------------- */}

                  <p className="plan-description">

                    {plan.description ||

                      `SkillLab ${plan.name} Plan`}

                  </p>

                  {/* ---------------------------------------

                      PRICE

                  --------------------------------------- */}

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

                  {/* ---------------------------------------

                      FEATURES

                  --------------------------------------- */}

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

                  {/* ---------------------------------------

                      BUTTON

                  --------------------------------------- */}

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

                      handleSubscribe(

                        plan

                      )

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

            }

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

            Secure online payment

          </strong>

          <p>

            Your payment is processed securely through Razorpay.

            SkillLab does not store your card or UPI payment details.

          </p>

        </div>

      </div>

      {/* =================================================

          INLINE CSS

      ================================================= */}

      <style>{subscriptionStyles}</style>

    </div>

  );

}

// =====================================================

// STYLES

// =====================================================

const subscriptionStyles = `

* {

  box-sizing: border-box;

}

.subscription-page {

  min-height: 100vh;

  padding: 28px;

  position: relative;

  overflow-x: hidden;

  background:

    radial-gradient(

      circle at top right,

      rgba(124,58,237,.12),

      transparent 34%

    ),

    radial-gradient(

      circle at bottom left,

      rgba(59,130,246,.08),

      transparent 32%

    ),

    #f7f8fc;

  color: #172033;

}

.subscription-glow {

  position: fixed;

  width: 300px;

  height: 300px;

  border-radius: 50%;

  filter: blur(80px);

  pointer-events: none;

  opacity: .35;

}

.glow-one {

  top: 80px;

  right: -120px;

  background: #c4b5fd;

}

.glow-two {

  bottom: -120px;

  left: -100px;

  background: #bfdbfe;

}

.subscription-header {

  position: relative;

  z-index: 2;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  padding: 22px 26px;

  margin-bottom: 24px;

  border: 1px solid #ebe8f5;

  border-radius: 22px;

  background:

    linear-gradient(

      135deg,

      rgba(255,255,255,.96),

      rgba(248,247,255,.96)

    );

  box-shadow:

    0 12px 40px rgba(40,32,80,.07);

}

.header-left {

  display: flex;

  align-items: center;

  gap: 15px;

}

.back-button {

  width: 42px;

  height: 42px;

  border: 1px solid #e4e0ef;

  border-radius: 12px;

  background: #fff;

  color: #5b21b6;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 16px;

}

.back-button:hover {

  background: #f5f1ff;

}

.header-icon {

  width: 56px;

  height: 56px;

  border-radius: 16px;

  background:

    linear-gradient(

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

    0 9px 22px rgba(91,33,182,.23);

}

.subscription-header h1 {

  margin: 0;

  font-size: 25px;

  font-weight: 800;

}

.subscription-header p {

  margin: 5px 0 0;

  color: #77728a;

  font-size: 14px;

}

.secure-badge {

  display: flex;

  align-items: center;

  gap: 8px;

  padding: 10px 14px;

  border-radius: 30px;

  background: #ecfdf5;

  color: #047857;

  font-size: 12px;

  font-weight: 700;

}

.subscription-message {

  position: relative;

  z-index: 2;

  max-width: 1100px;

  margin: 0 auto 20px;

  display: flex;

  align-items: center;

  gap: 10px;

  padding: 14px 17px;

  border-radius: 13px;

  font-size: 14px;

  font-weight: 600;

}

.subscription-message.success {

  background: #ecfdf5;

  border: 1px solid #a7f3d0;

  color: #047857;

}

.subscription-message.error {

  background: #fef2f2;

  border: 1px solid #fecaca;

  color: #b91c1c;

}

.current-subscription {

  position: relative;

  z-index: 2;

  max-width: 1100px;

  margin: 0 auto 28px;

  padding: 18px 20px;

  border: 1px solid #c7f1dd;

  border-radius: 17px;

  background:

    linear-gradient(

      135deg,

      #f0fdf7,

      #ffffff

    );

  display: flex;

  align-items: center;

  gap: 15px;

}

.current-icon {

  width: 45px;

  height: 45px;

  flex-shrink: 0;

  border-radius: 13px;

  background: #d1fae5;

  color: #059669;

  display: flex;

  align-items: center;

  justify-content: center;

}

.current-content {

  min-width: 0;

  flex: 1;

}

.current-top {

  display: flex;

  align-items: center;

  gap: 9px;

  margin-bottom: 4px;

}

.current-label {

  color: #047857;

  font-size: 11px;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: .5px;

}

.active-badge {

  padding: 3px 8px;

  border-radius: 20px;

  background: #10b981;

  color: #fff;

  font-size: 9px;

  font-weight: 800;

}

.current-content h3 {

  margin: 0;

  font-size: 17px;

  font-weight: 800;

}

.current-content p {

  margin: 4px 0 0;

  color: #6b7280;

  font-size: 12px;

}

.plans-heading {

  position: relative;

  z-index: 2;

  text-align: center;

  max-width: 700px;

  margin: 0 auto 30px;

}

.eyebrow {

  display: inline-block;

  margin-bottom: 7px;

  color: #7c3aed;

  font-size: 11px;

  font-weight: 800;

  letter-spacing: 1.2px;

}

.plans-heading h2 {

  margin: 0;

  font-size: 28px;

  font-weight: 850;

  color: #172033;

}

.plans-heading p {

  margin: 8px 0 0;

  color: #77728a;

  font-size: 14px;

  line-height: 1.6;

}

.plans-grid {

  position: relative;

  z-index: 2;

  max-width: 1100px;

  margin: 0 auto;

  display: grid;

  grid-template-columns:

    repeat(3, minmax(0, 1fr));

  gap: 20px;

}

.plan-card {

  position: relative;

  padding: 28px 24px 23px;

  border: 1px solid #ebe8f5;

  border-radius: 22px;

  background: rgba(255,255,255,.96);

  box-shadow:

    0 12px 35px rgba(40,32,80,.06);

  text-align: center;

  transition:

    transform .2s ease,

    box-shadow .2s ease;

}

.plan-card:hover {

  transform: translateY(-5px);

  box-shadow:

    0 18px 45px rgba(40,32,80,.11);

}

.plan-card.featured {

  border:

    2px solid #7c3aed;

  box-shadow:

    0 15px 45px rgba(124,58,237,.15);

}

.popular-badge {

  position: absolute;

  top: -12px;

  left: 50%;

  transform: translateX(-50%);

  display: flex;

  align-items: center;

  gap: 6px;

  padding: 7px 13px;

  border-radius: 30px;

  background:

    linear-gradient(

      135deg,

      #6d28d9,

      #8b5cf6

    );

  color: #fff;

  font-size: 10px;

  font-weight: 800;

  white-space: nowrap;

}

.plan-icon {

  width: 58px;

  height: 58px;

  margin: 5px auto 17px;

  border-radius: 17px;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 21px;

}

.plan-icon.green {

  background: #ecfdf5;

  color: #059669;

}

.plan-icon.blue {

  background: #eff6ff;

  color: #2563eb;

}

.plan-icon.purple {

  background: #f3e8ff;

  color: #7c3aed;

}

.plan-card h3 {

  margin: 0;

  font-size: 20px;

  font-weight: 800;

}

.plan-description {

  min-height: 40px;

  margin: 7px 0 14px;

  color: #858092;

  font-size: 12px;

  line-height: 1.5;

}

.plan-price {

  display: flex;

  align-items: baseline;

  justify-content: center;

  color: #172033;

}

.currency {

  margin-right: 2px;

  font-size: 18px;

  font-weight: 800;

}

.amount {

  font-size: 38px;

  font-weight: 850;

  letter-spacing: -1.5px;

}

.billing-text {

  margin-top: 1px;

  color: #8a8497;

  font-size: 12px;

}

.plan-features {

  margin: 23px 0;

  padding: 17px 0;

  border-top: 1px solid #eeeaf5;

  border-bottom: 1px solid #eeeaf5;

  display: flex;

  flex-direction: column;

  gap: 11px;

  text-align: left;

}

.plan-features div {

  display: flex;

  align-items: center;

  gap: 9px;

  color: #514b5d;

  font-size: 12px;

}

.plan-features svg {

  flex-shrink: 0;

  color: #10b981;

  font-size: 12px;

}

.subscribe-button {

  width: 100%;

  height: 47px;

  border: 1px solid #ddd6fe;

  border-radius: 12px;

  background: #fff;

  color: #6d28d9;

  font-size: 13px;

  font-weight: 800;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  transition: .2s;

}

.subscribe-button:hover {

  background: #f5f3ff;

}

.subscribe-button.primary {

  border: 0;

  background:

    linear-gradient(

      135deg,

      #5b21b6,

      #7c3aed

    );

  color: #fff;

  box-shadow:

    0 8px 20px rgba(91,33,182,.2);

}

.subscribe-button.primary:hover {

  opacity: .94;

}

.subscribe-button:disabled {

  opacity: .55;

  cursor: not-allowed;

}

.secure-text {

  margin-top: 12px;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 5px;

  color: #9a94a6;

  font-size: 10px;

}

.secure-text svg {

  color: #059669;

}

.payment-note {

  position: relative;

  z-index: 2;

  max-width: 1100px;

  margin: 25px auto 0;

  padding: 17px 20px;

  border: 1px solid #e8e4f1;

  border-radius: 15px;

  background: rgba(255,255,255,.78);

  display: flex;

  align-items: flex-start;

  gap: 12px;

}

.payment-note > svg {

  margin-top: 2px;

  color: #059669;

}

.payment-note strong {

  display: block;

  font-size: 12px;

}

.payment-note p {

  margin: 4px 0 0;

  color: #858092;

  font-size: 11px;

  line-height: 1.5;

}

.subscription-loading {

  min-height: 80vh;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-direction: column;

  color: #6d28d9;

}

.loading-icon {

  font-size: 32px;

  animation:

    subscription-spin 1s linear infinite;

}

.subscription-loading h2 {

  margin: 15px 0 4px;

  font-size: 19px;

}

.subscription-loading p {

  margin: 0;

  color: #888;

  font-size: 13px;

}

.no-plans {

  max-width: 500px;

  margin: 40px auto;

  padding: 45px 25px;

  border: 1px solid #ebe8f5;

  border-radius: 20px;

  background: #fff;

  text-align: center;

  color: #777;

}

.no-plans > svg {

  color: #f59e0b;

  font-size: 35px;

}

.no-plans h3 {

  margin: 15px 0 5px;

  color: #252033;

}

.no-plans p {

  margin: 0;

  font-size: 13px;

}

.spin {

  animation:

    subscription-spin 1s linear infinite;

}

@keyframes subscription-spin {

  to {

    transform: rotate(360deg);

  }

}

@media (max-width: 850px) {

  .plans-grid {

    grid-template-columns:

      1fr;

    max-width: 550px;

  }

}

@media (max-width: 650px) {

  .subscription-page {

    padding: 14px;

  }

  .subscription-header {

    padding: 17px;

    align-items: flex-start;

  }

  .secure-badge {

    display: none;

  }

  .subscription-header h1 {

    font-size: 20px;

  }

  .subscription-header p {

    font-size: 12px;

  }

  .current-subscription {

    align-items: flex-start;

  }

  .plans-heading h2 {

    font-size: 23px;

  }

  .plans-heading p {

    font-size: 12px;

  }

  .plan-card {

    padding: 25px 20px 21px;

  }

  .payment-note {

    padding: 14px;

  }

}

`;

// =====================================================

// EXPORT

// =====================================================

export default Subscription;
