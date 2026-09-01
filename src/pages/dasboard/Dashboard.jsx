import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import "./dashboard.css";

import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaHourglassHalf,
  FaTimesCircle,
} from "react-icons/fa";

const API_URL =
  "https://zyntaweb.com/skilllab/api/dashboard.php";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  /* =====================================================
     DATE
  ===================================================== */

  const getLocalDate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] =
    useState(getLocalDate());

  const [loading, setLoading] =
    useState(true);
// Re-render every second so task status
// changes automatically according to current time.
const [, setTimeTick] = useState(0);
  const [dashboard, setDashboard] =
    useState({
      today: {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        notStarted: 0,
        percentage: 0,
      },

      week: {
        total: 0,
        completed: 0,
        percentage: 0,
      },

      month: {
        total: 0,
        completed: 0,
        percentage: 0,
      },

      studyHours: {
        hours: 0,
        minutes: 0,
      },

      tasks: [],
    });

  // Monthly progress graph data
  const [monthlyProgress, setMonthlyProgress] = useState([]);

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (dateString) => {
    const date = new Date(
      dateString + "T00:00:00"
    );

    return date.toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     LOCAL STORAGE HELPERS
  ===================================================== */

  const readJSON = (
    key,
    fallback
  ) => {
    try {
      const value =
        localStorage.getItem(key);

      if (!value) {
        return fallback;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error(
        "localStorage error:",
        key,
        error
      );

      return fallback;
    }
  };

  /* =====================================================
     DEFAULT TASKS
  ===================================================== */

  const DEFAULT_TASKS = [
    {
      id: "d1",
      title: "Wake Up",
      time: "5:00 AM",
      icon: "sun",
      color:
        "linear-gradient(135deg, #f6d365, #fda085)",
      completed: false,
      isWakeUp: true,
    },

    {
      id: "d2",
      title: "Study MERN",
      from: "5:00 AM",
      to: "10:00 AM",
      icon: "book",
      color:
        "linear-gradient(135deg, #a18cd1, #fbc2eb)",
      completed: false,
    },

    {
      id: "d3",
      title: "Practice English",
      from: "1:00 PM",
      to: "4:00 PM",
      icon: "language",
      color:
        "linear-gradient(135deg, #84fab0, #8fd3f4)",
      completed: false,
    },

    {
      id: "d4",
      title: "Workout",
      from: "6:00 PM",
      to: "7:00 PM",
      icon: "dumbbell",
      color:
        "linear-gradient(135deg, #fccb90, #d57eeb)",
      completed: false,
    },

    {
      id: "d5",
      title: "Sleep",
      from: "10:00 PM",
      to: "8:00 AM",
      icon: "moon",
      color:
        "linear-gradient(135deg, #141e30, #243b55)",
      completed: false,
      nextDay: true,
      isSleep: true,
    },
  ];

  /* =====================================================
     STORAGE KEYS
  ===================================================== */

  const getDeletedDefaultKey = (
    dateKey
  ) =>
    `deletedDefaultTasks_${dateKey}`;

  const getDefaultScheduleKey = (
    dateKey
  ) =>
    `defaultTaskSchedule_${dateKey}`;

  const getDefaultCompletionKey = (
    dateKey
  ) =>
    `defaultTaskCompleted_${dateKey}`;

  /* =====================================================
     LOCAL DEFAULT CHANGES
  ===================================================== */

  const getLocalDefaultChanges = (
    dateKey
  ) => {
    const deleted = readJSON(
      getDeletedDefaultKey(dateKey),
      []
    );

    const schedules = readJSON(
      getDefaultScheduleKey(dateKey),
      {}
    );

    const completed = readJSON(
      getDefaultCompletionKey(dateKey),
      {}
    );

    return {
      deleted: Array.isArray(deleted)
        ? deleted.map(String)
        : [],

      schedules:
        schedules &&
        typeof schedules === "object" &&
        !Array.isArray(schedules)
          ? schedules
          : {},

      completed:
        completed &&
        typeof completed === "object" &&
        !Array.isArray(completed)
          ? completed
          : {},
    };
  };

  /* =====================================================
     SAVED DEFAULT DEFINITIONS
  ===================================================== */

  const getSavedDefaultDefinitions =
    () => {
      const saved = readJSON(
        "defaultTasks",
        []
      );

      if (!Array.isArray(saved)) {
        return DEFAULT_TASKS;
      }

      const savedById = new Map(
        saved.map((task) => [
          String(task.id),
          task,
        ])
      );

      return DEFAULT_TASKS.map(
        (baseTask) => ({
          ...baseTask,
          ...(savedById.get(
            String(baseTask.id)
          ) || {}),
          completed: false,
        })
      );
    };

  /* =====================================================
     TIME FORMAT
  ===================================================== */

  const normalizeTime = (time) => {
    if (!time) return "";

    const value = String(time)
      .trim()
      .toUpperCase();

    /*
      Supports:

      5:00 AM
      05:00 AM
      17:00
      17:00:00
    */

    if (
      value.includes("AM") ||
      value.includes("PM")
    ) {
      const parts = value.split(/\s+/);

      const timePart = parts[0];
      const modifier = parts[1];

      let [hours, minutes] =
        timePart
          .split(":")
          .map(Number);

      if (
        modifier === "PM" &&
        hours !== 12
      ) {
        hours += 12;
      }

      if (
        modifier === "AM" &&
        hours === 12
      ) {
        hours = 0;
      }

      return `${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    }

    const parts = value.split(":");

    if (parts.length >= 2) {
      return `${String(
        Number(parts[0])
      ).padStart(
        2,
        "0"
      )}:${String(
        Number(parts[1])
      ).padStart(
        2,
        "0"
      )}`;
    }

    return value;
  };

  const formatTime = (time) => {
    if (!time) return "";

    const normalized =
      normalizeTime(time);

    const parts =
      normalized.split(":");

    if (parts.length < 2) {
      return time;
    }

    let hours =
      Number(parts[0]);

    const minutes =
      Number(parts[1]);

    const modifier =
      hours >= 12 ? "PM" : "AM";

    hours =
      hours % 12 || 12;

    return `${hours}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )} ${modifier}`;
  };

  /* =====================================================
     SORT TIME
  ===================================================== */

  const getSortMinutes = (
    time
  ) => {
    if (!time) {
      return 9999;
    }

    const normalized =
      normalizeTime(time);

    const parts =
      normalized.split(":");

    if (parts.length < 2) {
      return 9999;
    }

    const hours =
      Number(parts[0]);

    const minutes =
      Number(parts[1]);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return 9999;
    }

    return (
      hours * 60 + minutes
    );
  };

  /* =====================================================
     GET DEFAULT TASKS FOR DATE
  ===================================================== */

  const getTodayDefaultTasks =
    (dateKey) => {
      const {
        deleted,
        schedules,
        completed,
      } =
        getLocalDefaultChanges(
          dateKey
        );

      const definitions =
        getSavedDefaultDefinitions();

      let tasks =
        definitions
          .filter(
            (task) =>
              !deleted.includes(
                String(task.id)
              )
          )
          .map((task) => {
            const schedule =
              schedules[
                String(task.id)
              ] || {};

            return {
              ...task,
              ...schedule,

              id: String(task.id),

              from:
                schedule.from !==
                undefined
                  ? schedule.from
                  : task.from,

              time:
                schedule.time !==
                undefined
                  ? schedule.time
                  : task.time,

              to:
                schedule.to !==
                undefined
                  ? schedule.to
                  : task.to,

              nextDay:
                schedule.nextDay !==
                undefined
                  ? schedule.nextDay
                  : task.nextDay,

              completed:
                completed[
                  String(task.id)
                ] === true,
            };
          });

      /*
       * ==================================================
       * WAKE UP TIME
       * ==================================================
       *
       * Sleep:
       *   9:00 PM -> 2:00 AM
       *
       * Wake Up becomes:
       *   2:00 AM
       *
       * This means Wake Up is always based on
       * Sleep's ending time.
       */

      const sleepTask =
        tasks.find(
          (task) =>
            task.isSleep === true ||
            String(task.id) === "d5" ||
            task.title?.toLowerCase() ===
              "sleep"
        );

      const wakeTask =
        tasks.find(
          (task) =>
            task.isWakeUp === true ||
            String(task.id) === "d1" ||
            task.title?.toLowerCase() ===
              "wake up"
        );

      if (
        sleepTask &&
        wakeTask &&
        sleepTask.to
      ) {
        wakeTask.time =
          formatTime(
            sleepTask.to
          );

        /*
         * Wake Up belongs to the
         * beginning of the next day
         * when Sleep crosses midnight.
         */
        wakeTask.nextDay = true;
      }

      return tasks;
    };

/* =====================================================
   TASK STATUS
   ===================================================== */

const getTaskDateTime = (dateKey, time, addDay = false) => {
  if (!dateKey || !time) return null;

  const normalized = normalizeTime(time);

  const parts = normalized.split(":");

  if (parts.length < 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  const date = new Date(`${dateKey}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (addDay) {
    date.setDate(date.getDate() + 1);
  }

  date.setHours(hours, minutes, 0, 0);

  return date;
};

const getTaskStatus = (task) => {

  /*
   * COMPLETED ALWAYS WINS
   *
   * User tick cheythal time kazhinjalum
   * Completed thanne ayirikkum.
   */
  if (
    task.taskStatus === "completed" ||
    task.status === "completed" ||
    task.task_status === "completed" ||
    task.completed === true ||
    task.completed === 1 ||
    task.completed === "1"
  ) {
    return "completed";
  }

  const now = new Date();
  const today = getLocalDate();

  /*
   * Previous date
   * unfinished task = Pending
   */
  if (selectedDate < today) {
    return "pending";
  }

  /*
   * Future date
   * task = Not Started
   */
  if (selectedDate > today) {
    return "not_started";
  }

  /*
   * Today task
   */
  const startTime = task.from || task.time;
  const endTime = task.to;

  /*
   * No time available
   */
  if (!startTime) {

    if (
      task.taskStatus === "in_progress" ||
      task.status === "in_progress" ||
      task.task_status === "in_progress" ||
      task.taskStatus === "in progress" ||
      task.status === "in progress" ||
      task.task_status === "in progress"
    ) {
      return "in_progress";
    }

    if (
      task.taskStatus === "pending" ||
      task.status === "pending" ||
      task.task_status === "pending"
    ) {
      return "pending";
    }

    return "not_started";
  }

  const start = getTaskDateTime(
    selectedDate,
    startTime
  );

  if (!start) {
    return "not_started";
  }

  let end = null;

  if (endTime) {

    /*
     * Sleep pole midnight cross cheyyunna
     * task handle cheyyunnu.
     */
    const endIsNextDay =
      task.nextDay === true ||
      task.isSleep === true ||
      getSortMinutes(endTime) <=
        getSortMinutes(startTime);

    end = getTaskDateTime(
      selectedDate,
      endTime,
      endIsNextDay
    );
  }

  /*
   * Start time mathram undenkil
   */
  if (!end) {
    return now >= start
      ? "in_progress"
      : "not_started";
  }

  /*
   * Before start
   * ----------------
   * 5:10 AM
   * Task: 5:13 - 5:18
   * => Not Started
   */
  if (now < start) {
    return "not_started";
  }

  /*
   * During task time
   * ----------------
   * 5:15 AM
   * Task: 5:13 - 5:18
   * => In Progress
   */
  if (now < end) {
    return "in_progress";
  }

  /*
   * Time finished but user did NOT tick
   * => Pending
   *
   * 5:19 AM
   * Task: 5:13 - 5:18
   * => Pending
   */
  return "pending";
};  /* =====================================================
     TODAY STATS
  ===================================================== */

  const getTodayStats = (
    taskList
  ) => {
    const stats = {
      total: taskList.length,
      completed: 0,
      inProgress: 0,
      pending: 0,
      notStarted: 0,
      percentage: 0,
    };

    taskList.forEach(
      (task) => {
        const status =
          getTaskStatus(task);

        if (
          status === "completed"
        ) {
          stats.completed++;
        } else if (
          status === "in_progress"
        ) {
          stats.inProgress++;
        } else if (
          status === "pending"
        ) {
          stats.pending++;
        } else {
          stats.notStarted++;
        }
      }
    );

    stats.percentage =
      stats.total > 0
        ? Math.round(
            (stats.completed /
              stats.total) *
              100
          )
        : 0;

    return stats;
  };

  /* =====================================================
     MERGE DATABASE + DEFAULT TASKS
  ===================================================== */

  const mergeDashboardTasks = (
    apiTasks,
    dateKey
  ) => {
    const customTasks =
      Array.isArray(apiTasks)
        ? apiTasks.map(
            (task) => ({
              ...task,

              id: task.id,

              title:
                task.title ||
                task.task_name,

              from:
                task.from ||
                task.from_time,

              to:
                task.to ||
                task.to_time,

              completed:
                task.completed ===
                  true ||
                task.completed === 1 ||
                task.completed ===
                  "1",

              taskStatus:
                task.taskStatus ||
                getTaskStatus(task),
            })
          )
        : [];

    const defaultTasks =
      getTodayDefaultTasks(
        dateKey
      );

    /*
     * Prevent duplicate custom/default
     * task if same ID somehow appears.
     */
    const defaultIds =
      new Set(
        defaultTasks.map(
          (task) =>
            String(task.id)
        )
      );

    const filteredCustomTasks =
      customTasks.filter(
        (task) =>
          !defaultIds.has(
            String(task.id)
          )
      );

    const merged = [
      ...defaultTasks,
      ...filteredCustomTasks,
    ];

    /*
     * ==================================================
     * ORDER
     * ==================================================
     *
     * Normal tasks first according to time.
     *
     * Wake Up is marked nextDay when it comes
     * from Sleep's ending time, therefore it is
     * kept at the end.
     *
     * This avoids:
     *
     * Wake Up
     * Study MERN
     *
     * and gives:
     *
     * Study MERN
     * Practice English
     * Workout
     * Sleep
     * Wake Up
     */

    return merged.sort(
      (a, b) => {
        if (
          a.nextDay &&
          !b.nextDay
        ) {
          return 1;
        }

        if (
          !a.nextDay &&
          b.nextDay
        ) {
          return -1;
        }

        return (
          getSortMinutes(
            a.from || a.time
          ) -
          getSortMinutes(
            b.from || b.time
          )
        );
      }
    );
  };

  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  const loadDashboard = async (
    date = selectedDate
  ) => {
    if (!user?.email) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

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
              action:
                "dashboard",

              email:
                user.email,

              date,
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "DASHBOARD API:",
        data
      );

      if (!data.success) {
        console.error(
          "Dashboard error:",
          data.message
        );

        return;
      }

      /*
       * Database tasks + localStorage
       * built-in tasks.
       */
      const mergedTasks =
        mergeDashboardTasks(
          data.tasks,
          date
        );

      /*
       * Recalculate TODAY using the
       * actual visible task list.
       */
      const fixedToday =
        getTodayStats(
          mergedTasks
        );

      setDashboard({
        ...data,

        tasks:
          mergedTasks,

        today: {
          ...data.today,

          ...fixedToday,
        },
      });
    } catch (error) {
      console.error(
        "Dashboard API error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  const timer = setInterval(() => {
    setTimeTick((value) => value + 1);
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);

  /* =====================================================
     MONTHLY TASK PROGRESS GRAPH
  ===================================================== */

  const loadMonthlyProgress = async () => {
    if (!user?.email) return;

    try {
      const now = new Date();
      const months = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        );

        months.push({
          date: `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}-01`,
          label: d.toLocaleDateString("en-US", {
            month: "short",
          }),
        });
      }

      const results = await Promise.all(
        months.map(async ({ date, label }) => {
          try {
            const response = await fetch(API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "dashboard",
                email: user.email,
                date,
              }),
            });

            const data = await response.json();

            return {
              label,
              value: Number(data?.month?.percentage) || 0,
            };
          } catch (error) {
            console.error("Monthly graph error:", error);
            return { label, value: 0 };
          }
        })
      );

      setMonthlyProgress(results);
    } catch (error) {
      console.error("Monthly progress error:", error);
      setMonthlyProgress([]);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadDashboard(
      selectedDate
    );
    loadMonthlyProgress();
  }, [selectedDate]);

  /* =====================================================
     REFRESH AFTER TASK UPDATE
  ===================================================== */

  useEffect(() => {
    const refreshDashboard =
      () => {
        loadDashboard(
          selectedDate
        );
      };

    window.addEventListener(
      "taskUpdated",
      refreshDashboard
    );

    window.addEventListener(
      "focus",
      refreshDashboard
    );

    return () => {
      window.removeEventListener(
        "taskUpdated",
        refreshDashboard
      );

      window.removeEventListener(
        "focus",
        refreshDashboard
      );
    };
  }, [
    selectedDate,
    user?.email,
  ]);

  /* =====================================================
     PREVIOUS DAY
  ===================================================== */

  const previousDay = () => {
    const date =
      new Date(
        selectedDate +
          "T00:00:00"
      );

    date.setDate(
      date.getDate() - 1
    );

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    setSelectedDate(
      `${year}-${month}-${day}`
    );
  };

  /* =====================================================
     NEXT DAY
  ===================================================== */

  const nextDay = () => {
    const date =
      new Date(
        selectedDate +
          "T00:00:00"
      );

    date.setDate(
      date.getDate() + 1
    );

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    setSelectedDate(
      `${year}-${month}-${day}`
    );
  };

  /* =====================================================
   PIE
   ===================================================== */

// Always calculate status using current time.
const liveTodayStats = getTodayStats(
  dashboard.tasks || []
);

const completed =
  liveTodayStats.completed;

const inProgress =
  liveTodayStats.inProgress;

const pending =
  liveTodayStats.pending;

const notStarted =
  liveTodayStats.notStarted;

const total =
  liveTodayStats.total;

const completedDeg =
  total > 0
    ? (completed / total) * 360
    : 0;

const inProgressDeg =
  total > 0
    ? (inProgress / total) * 360
    : 0;

const pendingDeg =
  total > 0
    ? (pending / total) * 360
    : 0;

const pieStyle =
  total > 0
    ? {
        background:
          `conic-gradient(
            #22c55e 0deg ${completedDeg}deg,
            #2f80ed ${completedDeg}deg ${
              completedDeg + inProgressDeg
            }deg,
            #f5a623 ${
              completedDeg + inProgressDeg
            }deg ${
              completedDeg +
              inProgressDeg +
              pendingDeg
            }deg,
            #ef3340 ${
              completedDeg +
              inProgressDeg +
              pendingDeg
            }deg 360deg
          )`,
      }
    : {
        background: "#e5e7eb",
      };

/* =====================================================
   PERCENTAGE
   ===================================================== */

const getPercentage = (value) => {
  if (!total) {
    return 0;
  }

  return Math.round(
    (value / total) * 100
  );
};


  /* =====================================================
     GRAPH CALCULATIONS
  ===================================================== */

  const graphWidth = 760;
  const graphHeight = 260;
  const graphPaddingX = 48;
  const graphPaddingTop = 20;
  const graphPaddingBottom = 38;

  const graphInnerWidth =
    graphWidth - graphPaddingX * 2;

  const graphInnerHeight =
    graphHeight -
    graphPaddingTop -
    graphPaddingBottom;

  const graphPoints =
    monthlyProgress.map((item, index) => {
      const x =
        monthlyProgress.length === 1
          ? graphWidth / 2
          : graphPaddingX +
            (index / (monthlyProgress.length - 1)) *
              graphInnerWidth;

      const y =
        graphPaddingTop +
        ((100 - item.value) / 100) *
          graphInnerHeight;

      return { ...item, x, y };
    });

  const graphLinePath =
    graphPoints.length > 0
      ? graphPoints
          .map(
            (point, index) =>
              `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
          )
          .join(" ")
      : "";

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="dashboard-main">

        {/* DATE NAVIGATION */}
        <div className="date-navigation">

          <button
            className="date-arrow"
            onClick={
              previousDay
            }
          >
            <FaChevronLeft />
          </button>

          <div className="selected-date">

            <FaCalendarAlt />

            <span>
              {formatDate(
                selectedDate
              )}
            </span>

          </div>

          <button
            className="date-arrow"
            onClick={
              nextDay
            }
          >
            <FaChevronRight />
          </button>

        </div>

        {/* PROGRESS CARDS */}
        <div className="progress-cards">

          {/* TODAY */}
          <div className="progress-card today-card">

            <div className="card-top">

              <div className="card-icon blue">
                <FaCalendarAlt />
              </div>

              <div>
                <h3>
                  Today
                </h3>

                <p>
                  Overall Progress
                </p>
              </div>

            </div>

            <div className="percentage blue-text">
              {dashboard.today?.percentage ||
                0}
              %
            </div>

            <div className="progress-bar">

              <div
                className="progress-fill blue-fill"
                style={{
                  width: `${
                    dashboard
                      .today
                      ?.percentage ||
                    0
                  }%`,
                }}
              />

            </div>

          </div>

          {/* WEEK */}
          <div className="progress-card week-card">

            <div className="card-top">

              <div className="card-icon green">
                <FaCalendarAlt />
              </div>

              <div>
                <h3>
                  This Week
                </h3>

                <p>
                  Overall Progress
                </p>
              </div>

            </div>

            <div className="percentage green-text">
              {dashboard.week?.percentage ||
                0}
              %
            </div>

            <div className="progress-bar">

              <div
                className="progress-fill green-fill"
                style={{
                  width: `${
                    dashboard
                      .week
                      ?.percentage ||
                    0
                  }%`,
                }}
              />

            </div>

          </div>

          {/* MONTH */}
          <div className="progress-card month-card">

            <div className="card-top">

              <div className="card-icon purple">
                <FaCalendarAlt />
              </div>

              <div>
                <h3>
                  This Month
                </h3>

                <p>
                  Overall Progress
                </p>
              </div>

            </div>

            <div className="percentage purple-text">
              {dashboard.month?.percentage ||
                0}
              %
            </div>

            <div className="progress-bar">

              <div
                className="progress-fill purple-fill"
                style={{
                  width: `${
                    dashboard
                      .month
                      ?.percentage ||
                    0
                  }%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* PROGRESS STATUS */}
        <section className="progress-section">

          <h2>
            Progress Status
          </h2>

          <div className="progress-content">

            <div className="pie-wrapper">

              <div
                className="pie-chart"
                style={
                  pieStyle
                }
              >

                <div className="pie-center">

                  <span>
                    Overall
                  </span>

                  <strong>
                    {dashboard
                      .today
                      ?.percentage ||
                      0}
                    %
                  </strong>

                  <small>
                    Completed
                  </small>

                </div>

              </div>

            </div>

            <div className="legend">

              <div className="legend-row">

                <div className="legend-name">
                  <span className="dot completed-dot" />
                  Completed
                </div>

                <strong>
                  {getPercentage(
                    completed
                  )}
                  %
                </strong>

              </div>

              <div className="legend-row">

                <div className="legend-name">
                  <span className="dot progress-dot" />
                  In Progress
                </div>

                <strong>
                  {getPercentage(
                    inProgress
                  )}
                  %
                </strong>

              </div>

              <div className="legend-row">

                <div className="legend-name">
                  <span className="dot pending-dot" />
                  Pending
                </div>

                <strong>
                  {getPercentage(
                    pending
                  )}
                  %
                </strong>

              </div>

              <div className="legend-row">

                <div className="legend-name">
                  <span className="dot notstarted-dot" />
                  Not Started
                </div>

                <strong>
                  {getPercentage(
                    notStarted
                  )}
                  %
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* QUICK OVERVIEW */}
        <section className="quick-section">

          <h2>
            Quick Overview
          </h2>

          <div className="quick-list">

            <div className="quick-item">

              <div className="quick-icon blue-icon">
                <FaCheckCircle />
              </div>

              <span>
                Tasks Completed Today
              </span>

              <strong className="blue-text">
                {completed} /{" "}
                {total}
              </strong>

              <FaChevronRight />

            </div>

            <div className="quick-item">

              <div className="quick-icon green-icon">
                <FaCheckCircle />
              </div>

              <span>
                Tasks Completed This Week
              </span>

              <strong className="green-text">
                {dashboard
                  .week
                  ?.completed ||
                  0}{" "}
                /{" "}
                {dashboard
                  .week
                  ?.total ||
                  0}
              </strong>

              <FaChevronRight />

            </div>

            <div className="quick-item">

              <div className="quick-icon purple-icon">
                <FaCalendarAlt />
              </div>

              <span>
                Monthly Goal Progress
              </span>

              <strong className="purple-text">
                {dashboard
                  .month
                  ?.percentage ||
                  0}
                %
              </strong>

              <FaChevronRight />

            </div>

            <div className="quick-item">

              <div className="quick-icon orange-icon">
                <FaClock />
              </div>

              <span>
                Total Study Hours (This Week)
              </span>

              <strong className="orange-text">
                {dashboard
                  .studyHours
                  ?.hours ||
                  0}
                h{" "}
                {dashboard
                  .studyHours
                  ?.minutes ||
                  0}
                m
              </strong>

              <FaChevronRight />

            </div>

          </div>

        </section>

        {/* TODAY TASKS */}
        <section className="tasks-section">

          <div className="section-heading">

            <h2>
              Today's Tasks
            </h2>

            <span className="task-count">
              {completed} /{" "}
              {total} Completed
            </span>

          </div>

          {loading ? (

            <div className="loading">
              Loading tasks...
            </div>

          ) : dashboard.tasks?.length ===
            0 ? (

            <div className="empty-tasks">

              <p>
                No tasks for this day
              </p>

            </div>

          ) : (

            <div className="today-task-list">

              {dashboard.tasks.map(
                (task) => {

                  const status =
                    getTaskStatus(
                      task
                    );

                  return (
                    <div
                      className={`dashboard-task ${status}`}
                      key={
                        `${task.id}-${selectedDate}`
                      }
                    >

                      <div className="task-left">

                        <div className="task-status-icon">

                          {status ===
                          "completed" ? (
                            <FaCheckCircle />
                          ) : status ===
                            "in_progress" ? (
                            <FaClock />
                          ) : status ===
                            "pending" ? (
                            <FaHourglassHalf />
                          ) : (
                            <FaTimesCircle />
                          )}

                        </div>

                        <div>

                          <h3>
                            {task.title}
                          </h3>

                          <p>

                            {task.time
                              ? formatTime(
                                  task.time
                                )
                              : task.from
                              ? formatTime(
                                  task.from
                                )
                              : "--"}

                            {task.to
                              ? ` - ${formatTime(
                                  task.to
                                )}`
                              : ""}

                          </p>

                        </div>

                      </div>

                      <span
                        className={`status-badge ${status}`}
                      >

                        {status ===
                        "in_progress"
                          ? "In Progress"
                          : status ===
                            "not_started"
                          ? "Not Started"
                          : status
                              .charAt(
                                0
                              )
                              .toUpperCase() +
                            status.slice(
                              1
                            )}

                      </span>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

      

    </div>
  );
}

export default Dashboard;