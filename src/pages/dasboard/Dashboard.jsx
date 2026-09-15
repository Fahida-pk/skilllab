import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBullseye } from "react-icons/fa";

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
  FaGraduationCap,
} from "react-icons/fa";

const API_URL =
  "https://zyntaweb.com/skilllab/api/dashboard.php";

const TASK_API_URL =
  "https://zyntaweb.com/skilllab/api/task.php";

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

  const [weeklyProgress, setWeeklyProgress] = useState([]);
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
       * IMPORTANT:
       * Do NOT derive/overwrite Wake Up from Sleep.to.
       * The Tasks page / database is the single source of
       * truth for the task time.
       *
       * Example:
       * Tasks page -> Wake Up = 6:00 AM
       * Dashboard   -> Wake Up = 6:00 AM
       *
       * Sleep may end at another time; that must not change
       * the Wake Up time shown on the dashboard.
       */
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
   * COMPLETED ONLY WHEN USER TICKS THE CHECKBOX
   *
   * Time must NEVER automatically mark a task as completed.
   * The database/local task completion flag is the only source
   * used for the Completed state.
   */
  if (
    task.completed === true ||
    task.completed === 1 ||
    task.completed === "1" ||
    task.completed === "true"
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
  /*
   * =====================================================
   * DATE-WISE TASK FILTER
   * =====================================================
   *
   * Only show tasks belonging to selected date.
   */

  const customTasks = Array.isArray(apiTasks)
    ? apiTasks.map((task) => ({
        // Display the exact task time returned by the Tasks/database API.

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

        // Completed ONLY from the actual checkbox/completion flag.
        completed:
          task.completed === true ||
          task.completed === 1 ||
          task.completed === "1" ||
          task.completed === "true",

        // Keep the same saved task percentage used by the Tasks page.
        percentage: Math.max(
          0,
          Math.min(100, Number(task.percentage ?? 0))
        ),

        taskStatus:
          task.taskStatus ||
          task.task_status ||
          getTaskStatus(task),
      }))
    : [];

  /*
   * =====================================================
   * DASHBOARD TASK SOURCE OF TRUTH
   * =====================================================
   *
   * The Tasks page saves the task title, from time, to time,
   * completion and percentage in the database.
   *
   * Dashboard must display that same database task directly.
   * Do NOT merge local/default schedules here because they can
   * overwrite a time that was entered on the Tasks page.
   *
   * Example:
   * Tasks page -> Wake Up 6:00 AM
   * Database   -> Wake Up 6:00 AM
   * Dashboard  -> Wake Up 6:00 AM
   */
  const merged = customTasks;

  /*
   * =====================================================
   * SORT TASKS
   * =====================================================
   */

  return merged.sort((a, b) => {
    const aTitle = String(a.title || "")
      .trim()
      .toLowerCase();

    const bTitle = String(b.title || "")
      .trim()
      .toLowerCase();

    // Wake Up always FIRST
    if (
      aTitle === "wake up" &&
      bTitle !== "wake up"
    ) {
      return -1;
    }

    if (
      bTitle === "wake up" &&
      aTitle !== "wake up"
    ) {
      return 1;
    }

    // Sleep always LAST
    const aIsSleep =
      a.nextDay === true ||
      a.isSleep === true ||
      aTitle === "sleep";

    const bIsSleep =
      b.nextDay === true ||
      b.isSleep === true ||
      bTitle === "sleep";

    if (aIsSleep && !bIsSleep) {
      return 1;
    }

    if (!aIsSleep && bIsSleep) {
      return -1;
    }

    // Other tasks -> time order
    return (
      getSortMinutes(a.from || a.time) -
      getSortMinutes(b.from || b.time)
    );
  });
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
       * Get the same task percentages used by the Tasks page.
       * This prevents Today's Performance from falling back to
       * the simple completed/total percentage.
       */
      let taskPercentageData = null;

      try {
        const taskResponse = await fetch(
          TASK_API_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "get",
              email: user.email,
              task_date: date,
            }),
          }
        );

        taskPercentageData =
          await taskResponse.json();
      } catch (percentageError) {
        console.error(
          "Task percentage API error:",
          percentageError
        );
      }

      const percentageTasks =
        Array.isArray(taskPercentageData?.tasks)
          ? taskPercentageData.tasks
          : [];

      const percentageById = new Map(
        percentageTasks.map((task) => [
          String(task.id),
          Math.max(
            0,
            Math.min(
              100,
              Number(task.percentage ?? 0)
            )
          ),
        ])
      );

      const percentageByTitle = new Map(
        percentageTasks.map((task) => [
          String(task.title || "")
            .trim()
            .toLowerCase(),
          Math.max(
            0,
            Math.min(
              100,
              Number(task.percentage ?? 0)
            )
          ),
        ])
      );

      const tasksWithPercentages =
        (Array.isArray(data.tasks) ? data.tasks : []).map(
          (task) => {
            const idPercentage =
              percentageById.get(String(task.id));

            const titlePercentage =
              percentageByTitle.get(
                String(
                  task.title ||
                  task.task_name ||
                  ""
                )
                  .trim()
                  .toLowerCase()
              );

            return {
              ...task,
              percentage:
                idPercentage !== undefined
                  ? idPercentage
                  : titlePercentage !== undefined
                  ? titlePercentage
                  : Math.max(
                      0,
                      Math.min(
                        100,
                        Number(task.percentage ?? 0)
                      )
                    ),
            };
          }
        );

      /*
       * Database tasks + localStorage
       * built-in tasks.
       */
      const mergedTasks =
        mergeDashboardTasks(
          tasksWithPercentages,
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
     WEEKLY TASK PROGRESS GRAPH
     Mon -> Sun, using each day's actual completion %
  ===================================================== */

  const loadWeeklyProgress = async () => {
    if (!user?.email) return;

    try {
      const selected = new Date(
        selectedDate + "T00:00:00"
      );

      // Start from Monday of the selected date's week.
      const day = selected.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;

      const monday = new Date(selected);
      monday.setDate(
        selected.getDate() + mondayOffset
      );

      const days = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);

        days.push({
          date: `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}-${String(
            d.getDate()
          ).padStart(2, "0")}`,
          label: d.toLocaleDateString("en-US", {
            weekday: "short",
          }),
        });
      }

      const result = await Promise.all(
        days.map(async ({ date, label }) => {
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
              value: Number(
                data?.today?.percentage
              ) || 0,
            };
          } catch (error) {
            console.error(
              "Weekly graph error:",
              error
            );

            return {
              label,
              value: 0,
            };
          }
        })
      );

      setWeeklyProgress(result);
    } catch (error) {
      console.error(
        "Weekly progress error:",
        error
      );
    }
  };

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

      const result = await Promise.all(
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

      setMonthlyProgress(result);
    } catch (error) {
      console.error("Monthly progress error:", error);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadDashboard(
      selectedDate
    );
    loadWeeklyProgress();
    loadMonthlyProgress();
  }, [selectedDate, user?.email]);

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
   TODAY'S PERFORMANCE PROGRESS
   Source of truth = Today's Tasks shown below.

   Only CHECKED/COMPLETED tasks contribute their saved
   task percentage. Unchecked tasks contribute 0.
   Denominator = ALL visible tasks for today.

   Example:
   5 tasks -> 100% + 50% completed
   => (100 + 50) / 5 = 30%
   ===================================================== */

const isTaskCompleted = (task) =>
  task.completed === true ||
  task.completed === 1 ||
  task.completed === "1" ||
  task.completed === "true";

const completedPerformanceTasks = (
  dashboard.tasks || []
).filter(isTaskCompleted);

const todayPerformancePercentage =
  (dashboard.tasks || []).length > 0
    ? Math.round(
        completedPerformanceTasks.reduce(
          (sum, task) =>
            sum +
            Math.max(
              0,
              Math.min(
                100,
                Number(task.percentage ?? 0)
              )
            ),
          0
        ) / (dashboard.tasks || []).length
      )
    : 0;

/* =====================================================
   STUDENT MOTIVATION — ONE MESSAGE + ONE EMOJI
   Changes automatically according to performance %
   ===================================================== */

const getPerformanceMessage = (percentage) => {
  if (percentage === 0) {
    return {
      emoji: "🌱",
      message: "Start small — every step forward matters.",
      label: "Ready to Grow",
    };
  }

  if (percentage < 25) {
    return {
      emoji: "✨",
      message: "Great start — keep building your momentum.",
      label: "Keep Going",
    };
  }

  if (percentage < 50) {
    return {
      emoji: "💪",
      message: "You're making progress — stay consistent!",
      label: "Stay Strong",
    };
  }

  if (percentage < 75) {
    return {
      emoji: "🔥",
      message: "Great progress — keep pushing toward your goal!",
      label: "On Fire",
    };
  }

  if (percentage < 100) {
    return {
      emoji: "🚀",
      message: "You're almost there — finish strong!",
      label: "Almost There",
    };
  }

  return {
    emoji: "🏆",
    message: "Excellent performance — you achieved your goal!",
    label: "Excellent Performance",
  };
};

const performanceMotivation =
  getPerformanceMessage(todayPerformancePercentage);

/* =====================================================
   DASHBOARD TODAY PERFORMANCE CARD STYLES
   ===================================================== */

const dashboardPerformanceStyles = `
  /* =====================================================
     PREMIUM GLASSMORPHISM DASHBOARD
     Logic untouched — UI only
     ===================================================== */

  .dashboard-main {
    background:
      radial-gradient(
        circle at 85% 5%,
        rgba(145, 92, 255, 0.10),
        transparent 28%
      ),
      radial-gradient(
        circle at 10% 90%,
        rgba(105, 76, 255, 0.06),
        transparent 25%
      ),
      #f7f8fc;
  }

  /* =====================================================
     NORMAL PROGRESS CARDS
     ===================================================== */

  .dashboard-main .progress-card {
    border: 1px solid rgba(255,255,255,.75);
    border-radius: 22px;
    background: rgba(255,255,255,.72);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);

    box-shadow:
      0 12px 35px rgba(43, 31, 91, .07),
      inset 0 1px 0 rgba(255,255,255,.95);

    transition:
      transform .25s ease,
      box-shadow .25s ease,
      border-color .25s ease;
  }

  .dashboard-main .progress-card:hover {
    transform: translateY(-3px);

    box-shadow:
      0 18px 42px rgba(43,31,91,.10),
      inset 0 1px 0 rgba(255,255,255,.95);
  }

  .dashboard-main .progress-bar {
    height: 8px;
    border-radius: 999px;
    background: rgba(224,221,235,.65);
    overflow: hidden;
  }

  .dashboard-main .progress-fill {
    border-radius: 999px;
    transition: width .45s ease;
  }

  /* =====================================================
     TODAY'S PERFORMANCE — GLASS CARD
     ===================================================== */

  .dashboard-main .dashboard-performance-card {
    width: 100% !important;
    margin: 20px 0 18px !important;

    padding: 22px 24px 18px !important;

    box-sizing: border-box;
    position: relative;
    overflow: hidden;

    border-radius: 26px !important;

    /*
     * Main glass background
     */
    background:
      linear-gradient(
        135deg,
        rgba(255,255,255,.88) 0%,
        rgba(255,255,255,.70) 42%,
        rgba(247,241,255,.76) 100%
      ) !important;

    /*
     * Glass border
     */
    border: 1px solid rgba(255,255,255,.88) !important;

    /*
     * Outer glass shadow + inner highlight
     */
    box-shadow:
      0 18px 45px rgba(71,45,135,.10),
      0 4px 12px rgba(71,45,135,.045),
      inset 0 1px 0 rgba(255,255,255,.98),
      inset 0 -1px 0 rgba(142,111,220,.05) !important;

    backdrop-filter: blur(22px) saturate(135%) !important;
    -webkit-backdrop-filter: blur(22px) saturate(135%) !important;
  }

  /*
   * Purple glass glow on right side
   */
  .dashboard-main .dashboard-performance-card::after {
    content: "" !important;

    position: absolute;
    width: 230px;
    height: 230px;

    right: -80px;
    top: -115px;

    border-radius: 50%;

    background:
      radial-gradient(
        circle,
        rgba(170,104,255,.18) 0%,
        rgba(139,92,246,.08) 38%,
        transparent 70%
      );

    pointer-events: none;
  }

  /*
   * Left purple glass edge
   */
  .dashboard-main .dashboard-performance-card::before {
    content: "";

    position: absolute;

    left: 0;
    top: 0;
    bottom: 0;

    width: 4px;

    background:
      linear-gradient(
        180deg,
        #6848ff 0%,
        #884cff 48%,
        #c04cff 100%
      );

    box-shadow:
      0 0 14px rgba(123,76,255,.25);

    z-index: 3;
  }

  /* =====================================================
     HEADER
     ===================================================== */

  .dashboard-main .dashboard-performance-head {
    position: relative;
    z-index: 5;

    display: grid !important;

    grid-template-columns:
      minmax(0, 1fr)
      auto !important;

    align-items: center;

    gap: 25px !important;
  }

  .dashboard-main .dashboard-performance-title-wrap {
    display: flex;

    align-items: center;

    gap: 14px !important;

    min-width: 0;
  }

  /* =====================================================
     GLASS GRADUATION ICON
     ===================================================== */

  .dashboard-main .dashboard-performance-icon {
    width: 54px !important;
    height: 54px !important;

    flex: 0 0 54px !important;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 17px !important;

    color: white;

    background:
      linear-gradient(
        135deg,
        rgba(102,75,255,.96),
        rgba(163,73,255,.90)
      ) !important;

    border: 1px solid rgba(255,255,255,.38);

    box-shadow:
      0 10px 24px rgba(103,74,255,.24),
      inset 0 1px 0 rgba(255,255,255,.48),
      inset 0 -1px 0 rgba(72,42,170,.12);

    backdrop-filter: blur(12px);

    font-size: 22px !important;

    position: relative;
  }

  /*
   * Small glass highlight
   */
  .dashboard-main .dashboard-performance-icon::after {
    content: "";

    position: absolute;

    width: 9px;
    height: 9px;

    right: 5px;
    top: 5px;

    border-radius: 50%;

    background: rgba(255,255,255,.92);

    box-shadow:
      0 0 8px rgba(255,255,255,.55);
  }

  /* =====================================================
     TITLE
     ===================================================== */

  .dashboard-main .dashboard-performance-card h2 {
    margin: 0;

    color: #151329;

    font-size: 20px !important;

    font-weight: 850 !important;

    line-height: 1.2;

    letter-spacing: -.4px;
  }

  .dashboard-main .dashboard-performance-motivation {
    margin: 6px 0 0 !important;

    color: #6848d8 !important;

    font-size: 12px !important;

    font-weight: 750 !important;

    line-height: 1.4;
  }

  /* =====================================================
     RIGHT PERFORMANCE VALUE
     ===================================================== */

  .dashboard-main .dashboard-performance-value-wrap {
    min-width: 112px !important;

    padding-left: 22px;

    text-align: right;

    border-left:
      1px solid rgba(116,88,190,.14);

    position: relative;
  }

  .dashboard-main .dashboard-performance-value {
    color: #6848ff !important;

    font-size: 40px !important;

    font-weight: 950 !important;

    line-height: .9;

    letter-spacing: -2px;

    text-shadow:
      0 5px 18px rgba(104,72,255,.12);
  }

  .dashboard-main .dashboard-performance-label {
    margin-top: 7px !important;

    color: #765fc9 !important;

    font-size: 8px !important;

    font-weight: 900 !important;

    letter-spacing: 1.4px;

    text-transform: uppercase;
  }

  /* =====================================================
     GLASS PROGRESS TRACK
     ===================================================== */

  .dashboard-main .dashboard-performance-track {
    position: relative;
    z-index: 5;

    width: 100%;

    height: 9px !important;

    margin-top: 20px !important;

    border-radius: 999px;

    overflow: hidden;

    background:
      rgba(225,222,235,.62) !important;

    border:
      1px solid rgba(255,255,255,.78);

    box-shadow:
      inset 0 2px 4px rgba(58,43,100,.07),
      0 1px 0 rgba(255,255,255,.85);
  }

  /* =====================================================
     GLASS PROGRESS FILL
     ===================================================== */

  .dashboard-main .dashboard-performance-fill {
    height: 100%;

    border-radius: inherit;

    background:
      linear-gradient(
        90deg,
        #684cff 0%,
        #824dff 45%,
        #a84cff 75%,
        #c44cff 100%
      ) !important;

    box-shadow:
      0 2px 10px rgba(112,76,255,.28);

    transition:
      width .5s cubic-bezier(.22,.61,.36,1);
  }

  /* =====================================================
     FOOTER
     ===================================================== */

  .dashboard-main .dashboard-performance-footer {
    position: relative;
    z-index: 5;

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 12px;

    margin-top: 11px !important;

    color: #777582;

    font-size: 11px;
  }

  .dashboard-main .dashboard-performance-footer span {
    display: inline-flex;

    align-items: center;

    gap: 7px;
  }

  .dashboard-main .dashboard-performance-footer svg {
    color: #7054ff;

    font-size: 12px;
  }

  /* =====================================================
     EXCELLENT PERFORMANCE GLASS PILL
     ===================================================== */

  .dashboard-main .dashboard-performance-result {
    display: inline-flex;

    align-items: center;

    gap: 6px;

    padding: 7px 13px !important;

    border-radius: 999px;

    background:
      linear-gradient(
        135deg,
        rgba(247,242,255,.92),
        rgba(238,231,255,.72)
      ) !important;

    color: #6044c9 !important;

    font-size: 10px !important;

    font-weight: 900;

    border:
      1px solid rgba(122,92,220,.13);

    box-shadow:
      0 5px 15px rgba(86,62,150,.06),
      inset 0 1px 0 rgba(255,255,255,.9);

    backdrop-filter: blur(10px);
  }

  /* =====================================================
     TODAY'S TASK SECTION — MATCHING GLASS
     ===================================================== */

  .dashboard-main .dashboard-performance-card + .tasks-section {
    margin-top: 0 !important;

    border-radius: 24px !important;

    background:
      rgba(255,255,255,.76) !important;

    border:
      1px solid rgba(255,255,255,.88) !important;

    box-shadow:
      0 12px 35px rgba(45,32,90,.065),
      inset 0 1px 0 rgba(255,255,255,.95) !important;

    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  /* =====================================================
     TASK ITEMS
     ===================================================== */

  .dashboard-main .dashboard-task {
    border:
      1px solid rgba(225,224,235,.72);

    border-radius: 16px;

    background:
      rgba(255,255,255,.72);

    box-shadow:
      0 4px 14px rgba(45,32,90,.035),
      inset 0 1px 0 rgba(255,255,255,.85);

    backdrop-filter: blur(10px);

    transition:
      transform .2s ease,
      box-shadow .2s ease,
      border-color .2s ease;
  }

  .dashboard-main .dashboard-task:hover {
    transform: translateY(-1px);

    border-color: rgba(117,87,220,.20);

    box-shadow:
      0 8px 20px rgba(45,32,90,.065),
      inset 0 1px 0 rgba(255,255,255,.9);
  }

  /* =====================================================
     TASK COUNT PILL
     ===================================================== */

  .dashboard-main .task-count {
    background:
      rgba(240,235,255,.78) !important;

    border:
      1px solid rgba(118,88,220,.11);

    color: #6044ce !important;

    border-radius: 999px;

    backdrop-filter: blur(8px);
  }

  /* =====================================================
     RESPONSIVE
     ===================================================== */

  @media (max-width: 760px) {

    .dashboard-main .dashboard-performance-card {
      padding: 19px 17px 16px !important;

      border-radius: 21px !important;
    }

    .dashboard-main .dashboard-performance-head {
      gap: 16px !important;
    }

    .dashboard-main .dashboard-performance-icon {
      width: 48px !important;
      height: 48px !important;

      flex-basis: 48px !important;

      border-radius: 15px !important;

      font-size: 20px !important;
    }

    .dashboard-main .dashboard-performance-card h2 {
      font-size: 18px !important;
    }

    .dashboard-main .dashboard-performance-value-wrap {
      min-width: 88px !important;

      padding-left: 14px;
    }

    .dashboard-main .dashboard-performance-value {
      font-size: 32px !important;
    }
  }

  @media (max-width: 520px) {

    .dashboard-main .dashboard-performance-card {
      padding: 17px 14px 15px !important;

      border-radius: 19px !important;
    }

    .dashboard-main .dashboard-performance-head {
      grid-template-columns:
        minmax(0,1fr)
        auto !important;

      gap: 10px !important;
    }

    .dashboard-main .dashboard-performance-title-wrap {
      gap: 9px !important;
    }

    .dashboard-main .dashboard-performance-icon {
      width: 43px !important;
      height: 43px !important;

      flex-basis: 43px !important;

      border-radius: 13px !important;

      font-size: 18px !important;
    }

    .dashboard-main .dashboard-performance-card h2 {
      font-size: 15px !important;
    }

    .dashboard-main .dashboard-performance-motivation {
      font-size: 10px !important;

      max-width: 210px;
    }

    .dashboard-main .dashboard-performance-value-wrap {
      min-width: 70px !important;

      padding-left: 9px;
    }

    .dashboard-main .dashboard-performance-value {
      font-size: 27px !important;
    }

    .dashboard-main .dashboard-performance-label {
      font-size: 7px !important;
    }

    .dashboard-main .dashboard-performance-track {
      height: 7px !important;

      margin-top: 16px !important;
    }

    .dashboard-main .dashboard-performance-footer {
      font-size: 10px;

      flex-direction: row !important;
    }

    .dashboard-main .dashboard-performance-result {
      padding: 6px 9px !important;

      font-size: 9px !important;
    }
  }
`;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="dashboard-main">

        <style>{dashboardPerformanceStyles}</style>

       

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
              {liveTodayStats.percentage || 0}
              %
            </div>

            <div className="progress-bar">

              <div
                className="progress-fill blue-fill"
                style={{
                  width: `${liveTodayStats.percentage || 0}%`,
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
                    {liveTodayStats.percentage || 0}
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

        {/* WEEKLY TASK PROGRESS GRAPH */}
        <section className="task-graph-section weekly-graph-section">
          <div className="task-graph-header">
            <div>
              <h2 className="task-graph-title">
                Weekly Task Progress
              </h2>
              <p className="task-graph-subtitle">
                Daily task completion for this week
              </p>
            </div>

            <div className="task-graph-legend">
              <span className="task-graph-legend-dot" />
              Task Progress
            </div>
          </div>

          <div className="task-graph-scroll">
            <svg
              className="task-graph"
              viewBox="0 0 760 280"
              preserveAspectRatio="none"
              role="img"
              aria-label="Weekly task progress"
            >
              {[0, 25, 50, 75, 100].map((value) => {
                const y = 225 - value * 1.8;

                return (
                  <g key={value}>
                    <line
                      x1="55"
                      x2="735"
                      y1={y}
                      y2={y}
                      className="task-graph-grid"
                    />
                    <text
                      x="5"
                      y={y + 4}
                      className="task-graph-y-label"
                    >
                      {value}%
                    </text>
                  </g>
                );
              })}

              {weeklyProgress.length > 0 && (
                <>
                  <polyline
                    className="task-graph-line"
                    points={weeklyProgress
                      .map((item, index) => {
                        const x =
                          weeklyProgress.length === 1
                            ? 395
                            : 55 +
                              (index /
                                (weeklyProgress.length - 1)) *
                                680;

                        const y =
                          225 -
                          Number(item.value) * 1.8;

                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />

                  {weeklyProgress.map((item, index) => {
                    const x =
                      weeklyProgress.length === 1
                        ? 395
                        : 55 +
                          (index /
                            (weeklyProgress.length - 1)) *
                            680;

                    const y =
                      225 -
                      Number(item.value) * 1.8;

                    return (
                      <g key={`${item.label}-${index}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          className="task-graph-point"
                        />
                        <text
                          x={x}
                          y={Math.max(y - 14, 15)}
                          textAnchor="middle"
                          className="task-graph-value"
                        >
                          {item.value}%
                        </text>
                        <text
                          x={x}
                          y="258"
                          textAnchor="middle"
                          className="task-graph-label"
                        >
                          {item.label}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
        </section>

        {/* MONTHLY TASK PROGRESS GRAPH */}
        <section className="monthly-graph-section">
          <div className="monthly-graph-header">
            <div>
              <h2 className="monthly-graph-title">
                Monthly Task Progress
              </h2>
              <p className="monthly-graph-subtitle">
                Overall task completion for the last 6 months
              </p>
            </div>

            <div className="monthly-graph-legend">
              <span className="monthly-graph-legend-dot" />
              Task Progress
            </div>
          </div>

          <div className="monthly-graph-scroll">
            <svg
              className="monthly-graph"
              viewBox="0 0 760 280"
              preserveAspectRatio="none"
              role="img"
              aria-label="Monthly task progress"
            >
              {[0, 25, 50, 75, 100].map((value) => {
                const y = 225 - value * 1.8;

                return (
                  <g key={value}>
                    <line
                      x1="55"
                      x2="735"
                      y1={y}
                      y2={y}
                      className="monthly-graph-grid"
                    />

                    <text
                      x="5"
                      y={y + 4}
                      className="monthly-graph-y-label"
                    >
                      {value}%
                    </text>
                  </g>
                );
              })}

              {monthlyProgress.length > 0 && (
                <>
                  <polyline
                    className="monthly-graph-line"
                    points={monthlyProgress
                      .map((item, index) => {
                        const x =
                          monthlyProgress.length === 1
                            ? 395
                            : 55 +
                              (index /
                                (monthlyProgress.length - 1)) *
                                680;

                        const y =
                          225 - Number(item.value) * 1.8;

                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />

                  {monthlyProgress.map((item, index) => {
                    const x =
                      monthlyProgress.length === 1
                        ? 395
                        : 55 +
                          (index /
                            (monthlyProgress.length - 1)) *
                            680;

                    const y =
                      225 - Number(item.value) * 1.8;

                    return (
                      <g key={`${item.label}-${index}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          className="monthly-graph-point"
                        />

                        <text
                          x={x}
                          y={Math.max(y - 14, 15)}
                          textAnchor="middle"
                          className="monthly-graph-value"
                        >
                          {item.value}%
                        </text>

                        <text
                          x={x}
                          y="258"
                          textAnchor="middle"
                          className="monthly-graph-label"
                        >
                          {item.label}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
        </section>

        {/* TODAY'S PERFORMANCE PROGRESS */}
        <section className="dashboard-performance-card">
          <div className="dashboard-performance-head">
            <div className="dashboard-performance-title-wrap">
              <div
                className="dashboard-performance-icon"
                aria-hidden="true"
                title="Student Growth"
              >
                <FaGraduationCap />
              </div>

              <div>
                <h2>Today's Performance Progress</h2>
                <p className="dashboard-performance-motivation">
                  {performanceMotivation.emoji} {performanceMotivation.message}
                </p>
              </div>
            </div>

            <div className="dashboard-performance-value-wrap">
              <div className="dashboard-performance-value">
                {completed > 0 ? `${todayPerformancePercentage}%` : "0%"}
              </div>
              <div className="dashboard-performance-label">
                Performance
              </div>
            </div>
          </div>

          <div
            className="dashboard-performance-track"
            aria-label={`Today's performance ${todayPerformancePercentage}%`}
          >
            <div
              className="dashboard-performance-fill"
              style={{
                width: `${todayPerformancePercentage}%`,
              }}
            />
          </div>

          <div className="dashboard-performance-footer">
            <span>
              <FaCheckCircle />
              {completed} of {total} tasks completed
            </span>

            <strong className="dashboard-performance-result">
              {performanceMotivation.emoji} {performanceMotivation.label}
            </strong>
          </div>
        </section>

        {/* TODAY TASKS */}
        <section className="tasks-section">
          <div className="section-heading">
            <div>
              <h2>Today's Task </h2>
              <p style={{
                margin: "5px 0 0",
                color: "#8a8896",
                fontSize: "12px"
              }}>
                Your schedule and completion status for today
              </p>
            </div>

            <span className="task-count">
              {completed} / {total} Completed
            </span>
          </div>

          {loading ? (
            <div className="loading">
              Loading tasks...
            </div>
          ) : dashboard.tasks?.length === 0 ? (
            <div className="empty-tasks">
              <p>No tasks for this day</p>
            </div>
          ) : (
            <div className="today-task-list">
              {dashboard.tasks.map((task) => {
                const status = getTaskStatus(task);
                const taskPercentage = Math.max(
                  0,
                  Math.min(100, Number(task.percentage ?? 0))
                );

                return (
                  <div
                    className={`dashboard-task ${status}`}
                    key={`${task.id}-${selectedDate}`}
                  >
                    <div className="task-left">
                      <div className="task-status-icon">
                        {status === "completed" ? (
                          <FaCheckCircle />
                        ) : status === "in_progress" ? (
                          <FaClock />
                        ) : status === "pending" ? (
                          <FaHourglassHalf />
                        ) : (
                          <FaTimesCircle />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3>{task.title}</h3>

                        <p>
                          {task.time
                            ? formatTime(task.time)
                            : task.from
                            ? formatTime(task.from)
                            : "--"}
                          {task.to
                            ? ` - ${formatTime(task.to)}`
                            : ""}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                            marginTop: "9px",
                            maxWidth: "420px"
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: "5px",
                              borderRadius: "999px",
                              background: "#ececf3",
                              overflow: "hidden"
                            }}
                          >
                            <div
                              style={{
                                width: `${status === "completed" ? taskPercentage : 0}%`,
                                height: "100%",
                                borderRadius: "999px",
                                background:
                                  "linear-gradient(90deg,#6854ff,#b34cff)",
                                transition: "width .35s ease"
                              }}
                            />
                          </div>

                          <strong
                            style={{
                              minWidth: "36px",
                              textAlign: "right",
                              color: status === "completed" ? "#6249d8" : "#9997a4",
                              fontSize: "11px"
                            }}
                          >
                            {status === "completed" ? `${taskPercentage}%` : "0%"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <span className={`status-badge ${status}`}>
                      {status === "in_progress"
                        ? "In Progress"
                        : status === "not_started"
                        ? "Not Started"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      

    </div>
  );
}

export default Dashboard;