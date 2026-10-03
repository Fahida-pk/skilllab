import React, {

  useCallback,

  useEffect,

  useState,

} from "react";



import {

  FaCreditCard,

  FaCheckCircle,

  FaClock,

  FaTimesCircle,

  FaUser,

  FaUsers,

  FaCalendarAlt,

  FaRupeeSign,

  FaArrowLeft,

  FaSyncAlt,

} from "react-icons/fa";



import { useNavigate } from "react-router-dom";



import "./admin-payment-history.css";



const API_URL =

  "https://zyntaweb.com/skilllab/adminpaymenthistory.php";





function AdminPaymentHistory() {



  const navigate = useNavigate();



  const [payments, setPayments] =

    useState([]);



  const [loading, setLoading] =

    useState(true);



  const [error, setError] =

    useState("");



  const [search, setSearch] =

    useState("");





  /* =====================================================

     ADMIN PAYMENT HISTORY

  ===================================================== */



  const fetchPaymentHistory = useCallback(

    async () => {



      try {



        setLoading(true);

        setError("");



        const savedAdmin =

          localStorage.getItem("admin");



        if (!savedAdmin) {



          navigate(

            "/admin/login",

            {

              replace: true,

            }

          );



          return;

        }





        let adminData;



        try {



          adminData =

            JSON.parse(savedAdmin);



        } catch {



          localStorage.removeItem(

            "admin"

          );



          localStorage.removeItem(

            "adminLoggedIn"

          );



          navigate(

            "/admin/login",

            {

              replace: true,

            }

          );



          return;

        }





        const response =

          await fetch(

            API_URL,

            {

              method: "POST",



              headers: {

                "Content-Type":

                  "application/json",

              },



              body: JSON.stringify({

                admin_email:

                  adminData?.email || "",

              }),

            }

          );





        const data =

          await response.json();





        console.log(

          "ADMIN PAYMENT HISTORY:",

          data

        );





        if (!data.success) {



          throw new Error(

            data.message ||

              "Failed to load payment history"

          );



        }





        setPayments(

          Array.isArray(

            data.payments

          )

            ? data.payments

            : []

        );



      } catch (err) {



        console.error(

          "Payment history error:",

          err

        );



        setError(

          err.message ||

            "Unable to load payment history"

        );



        setPayments([]);



      } finally {



        setLoading(false);



      }



    },

    [navigate]

  );





  /* =====================================================

     LOAD

  ===================================================== */



  useEffect(() => {



    fetchPaymentHistory();



  }, [fetchPaymentHistory]);





  /* =====================================================

     DATE FORMAT

  ===================================================== */



  const formatDate = (

    value

  ) => {



    if (!value) {

      return "-";

    }



    const date =

      new Date(value);



    if (

      Number.isNaN(

        date.getTime()

      )

    ) {



      return value;



    }



    return date.toLocaleDateString(

      "en-IN",

      {

        day: "2-digit",

        month: "short",

        year: "numeric",

      }

    );



  };





  const formatDateTime = (

    value

  ) => {



    if (!value) {

      return "-";

    }



    const date =

      new Date(value);



    if (

      Number.isNaN(

        date.getTime()

      )

    ) {



      return value;



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



  };





  /* =====================================================

     STATUS ICON

  ===================================================== */



  const getStatusIcon = (

    status

  ) => {



    const value =

      String(

        status || ""

      ).toLowerCase();





    if (

      value === "success" ||

      value === "paid" ||

      value === "completed"

    ) {



      return (

        <FaCheckCircle />

      );



    }





    if (

      value === "failed"

    ) {



      return (

        <FaTimesCircle />

      );



    }





    return (

      <FaClock />

    );



  };





  /* =====================================================

     STATUS CLASS

  ===================================================== */



  const getStatusClass = (

    status

  ) => {



    const value =

      String(

        status || ""

      ).toLowerCase();





    if (

      value === "success" ||

      value === "paid" ||

      value === "completed"

    ) {



      return "payment-status-success";



    }





    if (

      value === "failed"

    ) {



      return "payment-status-failed";



    }





    return "payment-status-pending";



  };





  /* =====================================================

     FILTER

  ===================================================== */



  const filteredPayments =

    payments.filter(

      (payment) => {



        const keyword =

          search

            .trim()

            .toLowerCase();



        if (!keyword) {

          return true;

        }





        return [



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

          .some(

            (value) =>

              String(value)

                .toLowerCase()

                .includes(

                  keyword

                )

          );



      }

    );





  /* =====================================================

     TOTAL

  ===================================================== */



  const totalAmount =

    payments.reduce(

      (

        total,

        payment

      ) => {



        return (

          total +

          Number(

            payment.amount || 0

          )

        );



      },

      0

    );





  /* =====================================================

     RENDER

  ===================================================== */



  return (



    <div className="admin-payment-page">





      {/* =================================================

          TOP HEADER

      ================================================= */}



      <div className="admin-payment-page-header">



        <div className="admin-payment-heading">



          <div className="admin-payment-heading-icon">



            <FaCreditCard />



          </div>





          <div>



            <h1>

              Payment History

            </h1>



            <p>

              View student subscription

              and parent payment records

            </p>



          </div>



        </div>





        <div className="admin-payment-header-actions">



          <button

            type="button"

            className="admin-payment-back"

            onClick={() =>

              navigate(

                "/AdminDashboard"

              )

            }

          >



            <FaArrowLeft />



            <span>

              Back

            </span>



          </button>





          <button

            type="button"

            className="admin-payment-refresh"

            onClick={

              fetchPaymentHistory

            }

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





      {/* =================================================

          SUMMARY

      ================================================= */}



      <div className="admin-payment-summary">





        <div className="admin-payment-summary-card">



          <div className="summary-icon">



            <FaCreditCard />



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





        <div className="admin-payment-summary-card">



          <div className="summary-icon">



            <FaRupeeSign />



          </div>



          <div>



            <span>

              Total Amount

            </span>



            <strong>

              ₹

              {totalAmount.toLocaleString(

                "en-IN"

              )}

            </strong>



          </div>



        </div>





        <div className="admin-payment-summary-card">



          <div className="summary-icon">



            <FaUsers />



          </div>



          <div>



            <span>

              Parent Payments

            </span>



            <strong>

              {

                payments.filter(

                  (payment) =>

                    String(

                      payment.paid_by ||

                        ""

                    ).toLowerCase() ===

                    "parent"

                ).length

              }

            </strong>



          </div>



        </div>





      </div>





      {/* =================================================

          SEARCH

      ================================================= */}



      <div className="admin-payment-toolbar">



        <div className="admin-payment-search">



          <input

            type="text"

            placeholder="Search student, parent, email, payment ID..."

            value={search}

            onChange={(e) =>

              setSearch(

                e.target.value

              )

            }

          />



        </div>



        <div className="admin-payment-count">



          Showing{" "}



          <strong>

            {filteredPayments.length}

          </strong>



          {" "}payments



        </div>



      </div>





      {/* =================================================

          CONTENT

      ================================================= */}



      <div className="admin-payment-content">





        {/* LOADING */}



        {loading && (



          <div className="admin-payment-loading">



            <div className="admin-payment-spinner" />



            <p>

              Loading payment history...

            </p>



          </div>



        )}





        {/* ERROR */}



        {!loading &&

          error && (



            <div className="admin-payment-error">



              <FaTimesCircle />



              <div>



                <strong>

                  Unable to load payment history

                </strong>



                <p>

                  {error}

                </p>



              </div>



            </div>



          )}





        {/* EMPTY */}



        {!loading &&

          !error &&

          filteredPayments.length === 0 && (



            <div className="admin-payment-empty">



              <div className="admin-payment-empty-icon">



                <FaCreditCard />



              </div>



              <h2>

                No Payment History

              </h2>



              <p>

                No student or parent

                subscription payments

                have been recorded yet.

              </p>



            </div>



          )}





        {/* PAYMENT LIST */}



        {!loading &&

          !error &&

          filteredPayments.length > 0 && (



            <div className="admin-payment-list">





              {filteredPayments.map(

                (

                  payment,

                  index

                ) => (



                  <div

                    className="admin-payment-item"

                    key={

                      payment.id ||

                      payment.gateway_payment_id ||

                      index

                    }

                  >





                    {/* ============================

                        TOP

                    ============================ */}



                    <div className="admin-payment-item-top">





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

                                "Pending"}



                            </span>



                          </div>





                          <div className="admin-payment-meta">





                            <span>



                              <FaRupeeSign />



                              ₹

                              {Number(

                                payment.amount ||

                                  0

                              ).toLocaleString(

                                "en-IN"

                              )}



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





                      {/* ============================

                          PAID BY

                      ============================ */}



                      <div className="admin-payment-paid-by">



                        <span className="paid-by-label">

                          Paid By

                        </span>





                        <div

                          className={`paid-by-badge ${

                            String(

                              payment.paid_by ||

                                ""

                            ).toLowerCase() ===

                            "parent"

                              ? "paid-by-parent"

                              : "paid-by-student"

                          }`}

                        >



                          {String(

                            payment.paid_by ||

                              ""

                          ).toLowerCase() ===

                          "parent" ? (

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



                    </div>





                    {/* ============================

                        STUDENT

                    ============================ */}



                    <div className="admin-payment-person-section">





                      <div className="payment-person-card">



                        <div className="person-icon student-icon">



                          <FaUser />



                        </div>





                        <div>



                          <span>

                            Student

                          </span>



                          <strong>

                            {payment.student_name ||

                              "-"}



                          </strong>



                          <small>

                            {payment.student_email ||

                              "-"}

                          </small>



                        </div>



                      </div>





                      <div className="payment-person-card">



                        <div className="person-icon parent-icon">



                          <FaUsers />



                        </div>





                        <div>



                          <span>

                            Parent / Paid By

                          </span>



                          <strong>

                            {payment.parent_name ||

                              payment.paid_by ||

                              "-"}

                          </strong>



                          <small>

                            {payment.parent_email ||

                              "-"}

                          </small>



                        </div>



                      </div>





                    </div>





                    {/* ============================

                        DATES

                    ============================ */}



                    
                    {/* ============================
                        DATES - ONE BOX
                    ============================ */}

                    <div className="admin-payment-date-box">

                      <div className="payment-date-item">
                        <span>Start Date</span>
                        <strong>
                          {formatDate(payment.start_date)}
                        </strong>
                      </div>

                      <div className="payment-date-divider" />

                      <div className="payment-date-item">
                        <span>End Date</span>
                        <strong>
                          {formatDate(payment.end_date)}
                        </strong>
                      </div>

                      <div className="payment-date-divider" />

                      <div className="payment-date-item">
                        <span>Payment Date</span>
                        <strong>
                          {formatDateTime(payment.paid_at)}
                        </strong>
                      </div>

                    </div>






                  </div>



                )

              )}



            </div>



          )}



      </div>



    </div>



  );

}





export default AdminPaymentHistory;