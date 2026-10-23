import {
  Search,
  Plus,
  LogOut,
  Bell,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import ThemePicker from "./ThemePicker.jsx";

import {
  fetchNotifications,
  markNotificationRead,
} from "../services/notifications.service.js";

export default function Header({
  searchQuery,
  setSearchQuery,
  onPostClick,
}) {
  const username = localStorage.getItem("username");

  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // -----------------------------------------
  // LOAD NOTIFICATIONS
  // -----------------------------------------

  async function loadNotifications() {
    if (!username) return;

    try {
      setLoadingNotifications(true);

      const data = await fetchNotifications(username);

      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }

  // -----------------------------------------
  // INITIAL LOAD
  // -----------------------------------------

  useEffect(() => {
    loadNotifications();
  }, [username]);

  // -----------------------------------------
  // AUTO REFRESH
  // -----------------------------------------

  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, [username]);

  // -----------------------------------------
  // MARK NOTIFICATION AS READ
  // -----------------------------------------

  async function handleNotificationClick(notification) {
    try {
      const notificationId =
        notification._id || notification.id;

      if (!notification.read) {
        await markNotificationRead(notificationId);
      }

      setNotifications((previous) =>
        previous.map((item) => {
          const itemId = item._id || item.id;

          if (itemId === notificationId) {
            return {
              ...item,
              read: true,
            };
          }

          return item;
        })
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  }

  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------

  const logout = () => {
    // Keep the user's visual preference across sessions.
    // Only authentication/session data should be cleared on logout.
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.reload();
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <header
      className="
        sticky top-0 z-50
        bg-cv-surface/95 backdrop-blur-xl
        border-b border-cv-border
        shadow-cv-xs
      "
    >
      <div
        className="
          max-w-7xl mx-auto
          h-[68px]
          px-4 sm:px-5 lg:px-6
          flex items-center
          gap-3 sm:gap-5
        "
      >

        {/* =====================================
            LOGO
        ====================================== */}

        <div className="flex items-center shrink-0">
          <div className="flex items-center gap-2.5 group">

            <div
              className="
                w-9 h-9
                rounded-cv-sm
                bg-cv-primary
                flex items-center justify-center
                shadow-cv-sm
                transition-transform duration-200
                group-hover:scale-[1.03]
              "
            >
              <span
                className="
                  text-white
                  text-[11px]
                  font-extrabold
                  tracking-tight
                "
              >
                CV
              </span>
            </div>

            <div className="hidden sm:block leading-none">

              <span
                className="
                  text-[17px]
                  font-semibold
                  tracking-[-0.025em]
                  text-cv-text
                "
              >
                Campus
                <span className="text-cv-primary">
                  Voice
                </span>
              </span>

              <p
                className="
                  text-[9px]
                  font-semibold
                  text-cv-text-muted
                  mt-1
                  tracking-[0.07em]
                "
              >
                STUDENT COMMUNITY
              </p>

            </div>
          </div>
        </div>


        {/* =====================================
            SEARCH
        ====================================== */}

        <div
          className="
            flex-1
            max-w-[520px]
            mx-auto
            relative
          "
        >

          <Search
            className="
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              w-[17px]
              h-[17px]
              text-cv-text-muted
              pointer-events-none
            "
          />

          <input
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search issues..."
            className="
              w-full
              h-10

              bg-cv-surface-soft
              border border-cv-border
              rounded-cv-sm

              pl-10
              pr-4

              text-[13px]
              text-cv-text
              font-medium

              outline-none

              placeholder:text-cv-text-muted
              placeholder:font-medium

              focus:bg-cv-surface
              focus:border-cv-primary/45
              focus:ring-4
              focus:ring-cv-primary/[0.07]

              transition-all
              duration-200
            "
          />

        </div>


        {/* =====================================
            RIGHT ACTIONS
        ====================================== */}

        <div
          className="
            flex items-center
            gap-2
            shrink-0
          "
        >

          {/* ---------------------------------
              POST ISSUE
          ---------------------------------- */}

          <button
            onClick={onPostClick}
            className="
              h-10
              px-3.5 sm:px-4

              flex items-center
              justify-center
              gap-1.5

              rounded-cv-sm

              bg-cv-primary
              hover:bg-cv-primary-hover
              active:scale-[0.98]

              text-white
              text-[13px]
              font-semibold

              shadow-cv-sm

              transition-all
              duration-200
            "
          >
            <Plus className="w-[16px] h-[16px]" />

            <span>Create</span>
          </button>


          {/* ---------------------------------
              NOTIFICATIONS
          ---------------------------------- */}

          <div className="relative">

            <button
              onClick={() =>
                setNotificationOpen(
                  (previous) => !previous
                )
              }
              title="Notifications"
              aria-label="Notifications"
              className={`
                relative
                w-10 h-10

                flex items-center
                justify-center

                rounded-cv-sm

                border

                transition-all
                duration-200

                ${
                  notificationOpen
                    ? `
                      bg-cv-primary-soft
                      border-cv-primary-border
                      text-cv-primary-hover
                    `
                    : `
                      bg-cv-surface-soft
                      border-cv-border
                      text-cv-text-secondary

                      hover:bg-cv-surface
                      hover:border-cv-primary-border
                      hover:text-cv-primary-hover
                    `
                }
              `}
            >

              <Bell className="w-[17px] h-[17px]" />

              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    -top-1
                    -right-1

                    min-w-[17px]
                    h-[17px]
                    px-1

                    rounded-full

                    bg-cv-danger
                    text-white

                    text-[9px]
                    font-bold

                    flex items-center
                    justify-center

                    border-2
                    border-white
                  "
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            </button>


            {/* =================================
                NOTIFICATION DROPDOWN
            ================================== */}

            {notificationOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[48px]

                  w-[350px]
                  max-w-[calc(100vw-24px)]

                  bg-cv-surface

                  border
                  border-cv-border

                  rounded-cv-lg

                  shadow-cv-lg

                  overflow-hidden

                  z-[100]
                "
              >

                {/* PANEL HEADER */}

                <div
                  className="
                    px-4
                    py-3.5

                    border-b
                    border-cv-divider

                    flex
                    items-center
                    justify-between
                  "
                >

                  <div>

                    <h3
                      className="
                        text-[14px]
                        font-semibold
                        text-cv-text
                      "
                    >
                      Notifications
                    </h3>

                    <p
                      className="
                        text-[11px]
                        text-cv-text-muted
                        font-medium
                        mt-0.5
                      "
                    >
                      Updates about your campus activity
                    </p>

                  </div>

                  {unreadCount > 0 && (
                    <span
                      className="
                        text-[11px]
                        font-semibold
                        text-cv-primary-hover
                      "
                    >
                      {unreadCount} unread
                    </span>
                  )}

                </div>


                {/* NOTIFICATION CONTENT */}

                <div
                  className="
                    max-h-[430px]
                    overflow-y-auto
                  "
                >

                  {/* LOADING */}

                  {loadingNotifications ? (

                    <div className="p-8 text-center">

                      <div
                        className="
                          w-5 h-5
                          mx-auto

                          rounded-full
                          border-2
                          border-cv-primary-border
                          border-t-cv-primary

                          animate-spin
                        "
                      />

                      <p
                        className="
                          text-xs
                          text-cv-text-muted
                          font-medium
                          mt-3
                        "
                      >
                        Loading notifications...
                      </p>

                    </div>

                  ) : notifications.length === 0 ? (

                    /* EMPTY */

                    <div
                      className="
                        px-6
                        py-10
                        text-center
                      "
                    >

                      <div
                        className="
                          w-11 h-11
                          mx-auto

                          rounded-full

                          bg-cv-primary-soft

                          flex items-center
                          justify-center
                        "
                      >
                        <Bell
                          className="
                            w-5
                            h-5
                            text-cv-text-muted
                          "
                        />
                      </div>

                      <p
                        className="
                          text-[13px]
                          font-semibold
                          text-cv-text-secondary
                          mt-3
                        "
                      >
                        No notifications
                      </p>

                      <p
                        className="
                          text-[11px]
                          text-cv-text-muted
                          font-medium
                          mt-1
                        "
                      >
                        You're all caught up.
                      </p>

                    </div>

                  ) : (

                    /* NOTIFICATIONS */

                    notifications.map(
                      (notification) => {
                        const id =
                          notification._id ||
                          notification.id;

                        return (
                          <button
                            key={id}
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`
                              w-full
                              text-left

                              px-4
                              py-3.5

                              border-b
                              border-cv-divider

                              transition-colors
                              duration-150

                              ${
                                notification.read
                                  ? "bg-cv-surface hover:bg-cv-surface-soft"
                                  : "bg-cv-primary-soft hover:bg-cv-primary-soft"
                              }
                            `}
                          >

                            <div
                              className="
                                flex
                                gap-3
                              "
                            >

                              {/* ICON */}

                              <div
                                className={`
                                  w-8 h-8
                                  shrink-0

                                  rounded-cv-sm

                                  flex
                                  items-center
                                  justify-center

                                  ${
                                    notification.read
                                      ? "bg-cv-surface-muted text-cv-text-muted"
                                      : "bg-cv-primary-soft text-cv-primary-hover"
                                  }
                                `}
                              >
                                <Bell className="w-4 h-4" />
                              </div>


                              {/* TEXT */}

                              <div
                                className="
                                  min-w-0
                                  flex-1
                                "
                              >

                                <div
                                  className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-2
                                  "
                                >

                                  <p
                                    className={`
                                      text-[13px]
                                      leading-snug

                                      ${
                                        notification.read
                                          ? "font-medium text-cv-text-secondary"
                                          : "font-semibold text-cv-text"
                                      }
                                    `}
                                  >
                                    {notification.title ||
                                      "Notification"}
                                  </p>

                                  {!notification.read && (
                                    <span
                                      className="
                                        w-2
                                        h-2
                                        mt-1

                                        rounded-full

                                        bg-cv-primary

                                        shrink-0
                                      "
                                    />
                                  )}

                                </div>

                                <p
                                  className="
                                    text-[11px]
                                    leading-relaxed
                                    text-cv-text-secondary
                                    font-medium
                                    mt-1
                                  "
                                >
                                  {notification.message}
                                </p>

                                {notification.createdAt && (
                                  <p
                                    className="
                                      text-[10px]
                                      text-cv-text-muted
                                      font-medium
                                      mt-1.5
                                    "
                                  >
                                    {formatNotificationDate(
                                      notification.createdAt
                                    )}
                                  </p>
                                )}

                              </div>

                            </div>

                          </button>
                        );
                      }
                    )

                  )}

                </div>

              </div>
            )}

          </div>


          {/* =====================================
              USER PROFILE + APPEARANCE
          ====================================== */}

          <div className="relative hidden md:flex items-center gap-2 h-10 pl-1.5 pr-2 rounded-cv-md bg-cv-surface-soft border border-cv-border">
            <div className="w-7 h-7 rounded-full bg-cv-primary flex items-center justify-center">
              <span className="text-white text-[10px] font-bold uppercase">{username?.[0] ?? "U"}</span>
            </div>
            <span className="max-w-[100px] truncate text-[12px] font-semibold text-cv-text-secondary">{username}</span>
            <ThemePicker compact />

            <button onClick={logout} title="Logout" aria-label="Logout" className="w-6 h-6 flex items-center justify-center rounded-cv-sm text-cv-text-muted hover:bg-cv-surface hover:text-cv-danger transition-all duration-150">
              <LogOut className="w-[14px] h-[14px]" />
            </button>
          </div>


          {/* =====================================
              MOBILE LOGOUT
          ====================================== */}

          <button
            onClick={logout}
            title="Logout"
            aria-label="Logout"
            className="
              md:hidden

              w-10 h-10

              flex items-center
              justify-center

              rounded-cv-sm

              bg-cv-surface-soft
              border
              border-cv-border

              text-cv-text-secondary

              hover:bg-cv-surface
              hover:border-cv-danger-border
              hover:text-cv-danger

              transition-all
              duration-200
            "
          >
            <LogOut className="w-[16px] h-[16px]" />
          </button>

        </div>

      </div>
    </header>
  );
}


// =============================================
// DATE FORMATTER
// =============================================

function formatNotificationDate(value) {
  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString([], {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}