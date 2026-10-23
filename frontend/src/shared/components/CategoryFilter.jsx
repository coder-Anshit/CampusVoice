import {
  Home,
  Building,
  BookOpen,
  MessageSquare,
  Users,
  Utensils,
  Clock3,
  Flame,
  SlidersHorizontal,
} from "lucide-react";

const CATEGORIES = [
  {
    name: "All",
    Icon: Home,
    color: "text-cv-primary",
    activeDot: "bg-cv-primary",
  },
  {
    name: "Hostel",
    Icon: Building,
    color: "text-cv-category-green",
    activeDot: "bg-cv-category-green",
  },
  {
    name: "Academics",
    Icon: BookOpen,
    color: "text-cv-category-blue",
    activeDot: "bg-cv-category-blue",
  },
  {
    name: "General",
    Icon: MessageSquare,
    color: "text-cv-category-purple",
    activeDot: "bg-cv-category-purple",
  },
  {
    name: "Faculty",
    Icon: Users,
    color: "text-cv-category-pink",
    activeDot: "bg-cv-category-pink",
  },
  {
    name: "Food",
    Icon: Utensils,
    color: "text-cv-category-amber",
    activeDot: "bg-cv-category-amber",
  },
];

const SORT_OPTIONS = [
  {
    key: "newest",
    label: "Newest",
    Icon: Clock3,
  },
  {
    key: "most_voted",
    label: "Top Voted",
    Icon: Flame,
  },
];

export default function CategoryFilter({
  category,
  setCategory,
  sort,
  setSort,
}) {
  return (
    <div
      className="
        w-full
        rounded-cv-md
        border border-cv-border
        bg-cv-surface
        p-2.5
        shadow-cv-md
      "
    >
      {/* ------------------------------------------------------------ */}
      {/* CATEGORY                                                      */}
      {/* ------------------------------------------------------------ */}

      <div className="px-1">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-cv-text-muted
              "
            >
              Category
            </p>

            <p
              className="
                mt-0.5
                text-[9px]
                text-cv-text-subtle
              "
            >
              Explore campus issues
            </p>
          </div>

          <div
            className="
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-lg
              bg-cv-primary-soft
              text-cv-primary
            "
          >
            <SlidersHorizontal
              className="h-3 w-3"
              strokeWidth={1.8}
            />
          </div>
        </div>
      </div>

      <div className="space-y-0.5">
        {CATEGORIES.map(
          ({
            name,
            Icon,
            color,
            activeDot,
          }) => {
            const isActive =
              category === name;

            return (
              <button
                key={name}
                type="button"
                onClick={() =>
                  setCategory(name)
                }
                className={`
                  group
                  relative
                  flex
                  w-full
                  items-center
                  gap-2.5
                  rounded-cv-sm
                  px-2.5
                  py-2
                  text-left
                  transition-all
                  duration-150
                  ease-out
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-cv-primary/20

                  ${
                    isActive
                      ? "bg-cv-primary text-white shadow-cv-sm"
                      : "text-cv-text-secondary hover:bg-cv-primary-soft hover:text-cv-text"
                  }
                `}
              >
                {/* Active indicator */}
                <span
                  className={`
                    absolute
                    left-0
                    top-1/2
                    h-4
                    w-[2px]
                    -translate-y-1/2
                    rounded-full
                    transition-opacity
                    duration-150
                    ${
                      isActive
                        ? activeDot
                        : "opacity-0"
                    }
                  `}
                />

                {/* Icon */}
                <span
                  className={`
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    transition-all
                    duration-150

                    ${
                      isActive
                        ? "bg-cv-surface/12 text-white"
                        : `bg-transparent ${color} group-hover:bg-cv-surface`
                    }
                  `}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    strokeWidth={1.8}
                  />
                </span>

                {/* Label */}
                <span
                  className={`
                    text-[11px]
                    leading-none
                    ${
                      isActive
                        ? "font-semibold"
                        : "font-medium"
                    }
                  `}
                >
                  {name}
                </span>

                {/* Active marker */}
                {isActive && (
                  <span
                    className="
                      ml-auto
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-cv-surface/75
                    "
                  />
                )}
              </button>
            );
          }
        )}
      </div>

      {/* ------------------------------------------------------------ */}
      {/* DIVIDER                                                       */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          my-3
          border-t
          border-cv-divider
        "
      />

      {/* ------------------------------------------------------------ */}
      {/* SORT                                                          */}
      {/* ------------------------------------------------------------ */}

      <div className="px-1">
        <div className="mb-2">
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-cv-text-muted
            "
          >
            Sort by
          </p>
        </div>

        <div
          className="
            grid
            grid-cols-2
            gap-1
            rounded-cv-sm
            bg-cv-surface-muted
            p-1
          "
        >
          {SORT_OPTIONS.map(
            ({
              key,
              label,
              Icon,
            }) => {
              const isActive =
                sort === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setSort(key)
                  }
                  className={`
                    flex
                    min-w-0
                    items-center
                    justify-center
                    gap-1.5
                    rounded-cv-sm
                    px-1.5
                    py-2
                    text-[9px]
                    transition-all
                    duration-150
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-cv-primary/20

                    ${
                      isActive
                        ? "bg-cv-surface text-cv-primary shadow-cv-xs"
                        : "text-cv-text-muted hover:text-cv-text-secondary"
                    }
                  `}
                >
                  <Icon
                    className="h-3 w-3 shrink-0"
                    strokeWidth={1.9}
                  />

                  <span
                    className={
                      isActive
                        ? "font-semibold"
                        : "font-medium"
                    }
                  >
                    {label}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}