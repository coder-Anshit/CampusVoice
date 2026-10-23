import {
  House,
  Flag,
  BarChart3,
  MessageCircle,
  Megaphone,
  ClipboardList,
} from "lucide-react";


const TAB_META = {
  dashboard: {
    label: "My Dashboard",
    icon: House,
    color: "text-cv-primary",
  },

  issues: {
    label: "Issues",
    icon: Flag,
    color: "text-cv-danger",
  },

  polls: {
    label: "Polls",
    icon: BarChart3,
    color: "text-cv-warning",
  },

  discussions: {
    label: "Discussions",
    icon: MessageCircle,
    color: "text-cv-success",
  },

  announcements: {
    label: "Announcements",
    icon: Megaphone,
    color: "text-cv-primary",
  },

  feedback: {
    label: "Feedback",
    icon: ClipboardList,
    color: "text-cv-info",
  },
};


export default function Navbar({
  active,
  setActive,
}) {

  const TABS = [
    "dashboard",
    "issues",
    "polls",
    "discussions",
    "announcements",
    "feedback",
  ];


  return (
    <div
      className="
        mb-6
        w-full
        flex
        justify-center
      "
    >

      <nav
        className="
          w-full
          flex
          items-center
          justify-center

          bg-cv-surface/95

          border
          border-cv-border

          p-1.5

          rounded-cv-lg

          shadow-cv-md

          overflow-x-auto
          scrollbar-hide
        "
      >

        {/* CENTERED TAB GROUP */}

        <div className="flex w-full items-center justify-center gap-1">

          {TABS.map((tab) => {

            const meta = TAB_META[tab];
            const Icon = meta.icon;
            const isActive = active === tab;


            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`
                  group
                  relative

                  flex
                  items-center
                  justify-center

                  gap-1.5

                  min-h-[38px]

                  flex-1 px-2.5 sm:px-3

                  py-2

                  rounded-cv-sm

                  whitespace-nowrap

                  text-[12px]
                  sm:text-[13px]

                  font-semibold

                  transition-all
                  duration-200
                  ease-out

                  ${
                    isActive
                      ? `
                        bg-cv-primary
                        text-white

                        shadow-cv-sm

                        hover:bg-cv-primary-hover
                      `
                      : `
                        text-cv-text-secondary

                        hover:bg-cv-primary-soft
                        hover:text-cv-text
                      `
                  }
                `}
              >

                {/* ICON */}

                <Icon
                  className={`
                    w-[15px]
                    h-[15px]

                    shrink-0

                    transition-transform
                    duration-200

                    ${
                      isActive
                        ? "text-white"
                        : `${meta.color} group-hover:scale-[1.04]`
                    }
                  `}
                  strokeWidth={isActive ? 2.1 : 1.9}
                />


                {/* DESKTOP LABEL */}

                <span className="hidden sm:inline">
                  {meta.label}
                </span>


                {/* MOBILE LABEL */}

                <span className="sm:hidden">
                  {tab === "dashboard"
                    ? "Home"
                    : tab === "discussions"
                    ? "Chat"
                    : tab === "announcements"
                    ? "News"
                    : meta.label}
                </span>

              </button>
            );
          })}

        </div>

      </nav>

    </div>
  );
}