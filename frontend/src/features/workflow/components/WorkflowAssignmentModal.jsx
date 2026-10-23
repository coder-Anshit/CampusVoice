import {
  X,
  Loader2,
  UserRound,
  Building2,
  Clock3,
  CheckCircle2,
  Eye,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { assignIssue, markIssueViewed } from "../../../shared/services/issues.service.js";
import client from "../../../shared/services/client.js";

export default function WorkflowAssignmentModal({
  issue,
  open,
  onClose,
  onViewed,
}) {
  const [department, setDepartment] = useState(
    issue?.department || ""
  );

  const [expectedDays, setExpectedDays] = useState(
    issue?.expectedResolutionDays || 3
  );

  const [assignedTo, setAssignedTo] = useState(
    issue?.assignedTo?.userId ||
      issue?.assignedTo?.username ||
      ""
  );

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [loadingData, setLoadingData] =
    useState(false);

  const [assigning, setAssigning] =
    useState(false);
  const [viewing, setViewing] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD DEPARTMENTS + USERS
  // =========================================================

  useEffect(() => {
    if (!open || !issue) return;

    let cancelled = false;

    const currentStatus = String(issue.status || "created").toLowerCase();
    if (currentStatus === "created") {
      setLoadingData(false);
      setError("");
      return () => { cancelled = true; };
    }

    const loadAssignmentData = async () => {
      setLoadingData(true);
      setError("");

      try {
        /*
         * IMPORTANT:
         *
         * We deliberately DO NOT filter employees
         * by departmentId anymore.
         *
         * Department = grievance area
         * Employee   = person responsible for task
         *
         * They are independent.
         */

        const results =
          await Promise.allSettled([
            client.get("/departments/"),
            client.get("/users"),
          ]);

        if (cancelled) return;

        // -----------------------------------------------------
        // DEPARTMENTS
        // -----------------------------------------------------

        const departmentResult = results[0];

        if (
          departmentResult.status === "fulfilled"
        ) {
          const raw =
            departmentResult.value?.data;

          const departmentData =
            Array.isArray(raw)
              ? raw
              : Array.isArray(raw?.departments)
              ? raw.departments
              : [];

          setDepartments(departmentData);
        } else {
          console.error(
            "Department API failed:",
            departmentResult.reason
          );

          setDepartments([]);
        }

        // -----------------------------------------------------
        // USERS
        // -----------------------------------------------------

        const usersResult = results[1];

        if (
          usersResult.status === "fulfilled"
        ) {
          const raw =
            usersResult.value?.data;

          const userData =
            Array.isArray(raw)
              ? raw
              : Array.isArray(raw?.users)
              ? raw.users
              : [];

          setUsers(userData);

          console.log(
            "Users loaded for assignment:",
            userData
          );
        } else {
          console.error(
            "Users API failed:",
            usersResult.reason
          );

          setUsers([]);

          setError(
            usersResult.reason?.response?.data
              ?.error ||
              "Unable to load employees. Please check the users API."
          );
        }
      } catch (err) {
        console.error(
          "Failed to load assignment data:",
          err
        );

        if (!cancelled) {
          setError(
            err?.response?.data?.error ||
              "Unable to load assignment data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    };

    loadAssignmentData();

    return () => {
      cancelled = true;
    };
  }, [open, issue]);

  // =========================================================
  // SYNC STATE WITH ISSUE
  // =========================================================

  useEffect(() => {
    if (!issue) return;

    setDepartment(
      issue.department || ""
    );

    setExpectedDays(
      issue.expectedResolutionDays || 3
    );

    setAssignedTo(
      issue.assignedTo?.userId ||
        issue.assignedTo?.username ||
        ""
    );

    setError("");
  }, [issue]);

  // =========================================================
  // ELIGIBLE EMPLOYEES
  // =========================================================
  //
  // VERY IMPORTANT:
  //
  // We are NOT checking departmentId here.
  //
  // faculty_cse will therefore appear even if:
  //
  // departmentId: null
  //
  // or departmentId doesn't exist.
  //
  // =========================================================

  const eligibleUsers = useMemo(() => {
    return users
      .filter((user) => {
        // Ignore explicitly inactive users.
        if (user.active === false) {
          return false;
        }

        const role = String(
          user.role || ""
        ).toLowerCase();

        return (
          role === "employee" ||
          role === "faculty" ||
          role === "hod"
        );
      })
      .sort((a, b) => {
        const nameA =
          a.fullName ||
          a.username ||
          "";

        const nameB =
          b.fullName ||
          b.username ||
          "";

        return nameA.localeCompare(nameB);
      });
  }, [users]);

  // =========================================================
  // SELECTED EMPLOYEE
  // =========================================================

  const selectedEmployee = useMemo(() => {
    if (!assignedTo) return null;

    return (
      eligibleUsers.find(
        (user) =>
          String(user._id) ===
          String(assignedTo)
      ) ||
      eligibleUsers.find(
        (user) =>
          String(user.username) ===
          String(assignedTo)
      ) ||
      null
    );
  }, [
    eligibleUsers,
    assignedTo,
  ]);

  // =========================================================
  // SELECTED DEPARTMENT
  // =========================================================

  const selectedDepartment = useMemo(() => {
    return departments.find(
      (dep) =>
        String(dep.name) ===
          String(department) ||
        String(dep._id) ===
          String(department)
    );
  }, [
    departments,
    department,
  ]);

  // =========================================================
  // DEPARTMENT CHANGE
  // =========================================================

  const handleDepartmentChange = (
    value
  ) => {
    setDepartment(value);

    /*
     * DO NOT clear employee here.
     *
     * Department and employee are independent.
     *
     * This means admin can select:
     *
     * Department: Academic
     * Employee: faculty_cse
     *
     * even if faculty_cse has no departmentId.
     */

    setError("");
  };

  // =========================================================
  // MARK AS VIEWED
  // =========================================================

  const handleMarkViewed = async () => {
    if (!issue?._id || viewing) return;
    setError("");
    try {
      setViewing(true);
      const updated = await markIssueViewed(issue._id);
      toast.success("Issue marked as viewed.");
      onViewed?.(updated);
      onClose?.();
    } catch (err) {
      console.error("Mark as viewed failed:", err);
      setError(err?.response?.data?.error || "Unable to mark this issue as viewed.");
    } finally {
      setViewing(false);
    }
  };

  // =========================================================
  // ASSIGN ISSUE
  // =========================================================

  const handleAssign = async () => {
    setError("");

    // Department required
    if (!department) {
      setError(
        "Please select a department."
      );
      return;
    }

    // Employee required
    if (!assignedTo) {
      setError(
        "Please select an employee."
      );
      return;
    }

    // Validate SLA
    if (
      !expectedDays ||
      Number(expectedDays) <= 0
    ) {
      setError(
        "Expected resolution days must be greater than 0."
      );
      return;
    }

    // Find actual employee
    const employee =
      selectedEmployee;

    if (!employee) {
      setError(
        "Selected employee could not be found."
      );
      return;
    }

    // Employee username MUST exist
    if (!employee.username) {
      setError(
        "Selected employee does not have a username."
      );
      return;
    }

    const selectedDepartmentName =
      selectedDepartment?.name ||
      department;

    /*
     * THIS IS THE IMPORTANT PART.
     *
     * We send both:
     *
     * userId   = actual MongoDB _id
     * username = actual login username
     *
     * For faculty_cse it becomes something like:
     *
     * {
     *   userId: "actual-mongodb-id",
     *   username: "faculty_cse",
     *   name: "...",
     *   role: "faculty"
     * }
     */

    const assignedEmployee = {
      userId: String(
        employee._id
      ),

      username:
        employee.username,

      name:
        employee.fullName ||
        employee.name ||
        employee.username,

      role:
        employee.role || "employee",
    };

    console.log(
      "===================================="
    );

    console.log(
      "ASSIGNING ISSUE"
    );

    console.log(
      "Issue:",
      issue._id
    );

    console.log(
      "Department:",
      selectedDepartmentName
    );

    console.log(
      "Employee:",
      assignedEmployee
    );

    console.log(
      "===================================="
    );

    try {
      setAssigning(true);

      const response =
        await assignIssue(
          issue._id,
          {
            department:
              selectedDepartmentName,

            assignedTo:
              assignedEmployee,

            expectedDays:
              Number(expectedDays),
          }
        );

      console.log(
        "Assignment API response:",
        response
      );

      toast.success(`Issue assigned to ${assignedEmployee.name} successfully.`);
      onClose?.();

    } catch (err) {
      console.error(
        "Assignment failed:",
        err
      );

      console.error(
        "Assignment error response:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.error ||
          "Assignment failed. Please try again."
      );
    } finally {
      setAssigning(false);
    }
  };

  // =========================================================
  // CLOSED MODAL
  // =========================================================

  if (!open || !issue) {
    return null;
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        fixed inset-0
        bg-black/40
        backdrop-blur-sm
        flex items-center justify-center
        z-[70]
        p-4
      "
    >
      <div
        className="
          bg-cv-surface
          rounded-3xl
          p-6
          w-full
          max-w-2xl
          max-h-[calc(100dvh-1.5rem)]
          overflow-y-auto
          overscroll-contain
          pb-[calc(5rem+env(safe-area-inset-bottom)+2rem)]
          shadow-2xl
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex items-center
            justify-between
            mb-6
          "
        >
          <div>
            <p
              className="
                text-xs
                uppercase
                tracking-widest
                text-cv-text-subtle
                font-semibold
              "
            >
              Institutional Workflow
            </p>

            <h2
              className="
                text-xl
                font-bold
                text-cv-text
                mt-1
              "
            >
              Manage Grievance
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={assigning}
            className="
              w-9 h-9
              rounded-full
              flex items-center
              justify-center
              text-cv-text-muted
              hover:bg-cv-surface-muted
              transition
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-5
              rounded-xl
              border border-cv-danger-border
              bg-cv-danger-soft
              px-4 py-3
              text-sm
              text-cv-danger
            "
          >
            {error}
          </div>
        )}

        {/* =================================================
            ISSUE SUMMARY
        ================================================= */}

        <div
          className="
            rounded-2xl
            bg-cv-surface-soft
            border border-cv-border
            p-4
            mb-6
          "
        >
          <p
            className="
              text-xs
              uppercase
              tracking-widest
              text-cv-text-subtle
              font-semibold
              mb-2
            "
          >
            Grievance
          </p>

          <p
            className="
              font-semibold
              text-cv-text
            "
          >
            {issue.title ||
              issue.text}
          </p>

          {issue.title &&
            issue.text && (
              <p
                className="
                  text-sm
                  text-cv-text-muted
                  mt-1
                "
              >
                {issue.text}
              </p>
            )}

          <div
            className="
              grid
              grid-cols-2
              gap-4
              mt-4
            "
          >
            <div>
              <p
                className="
                  text-xs
                  text-cv-text-subtle
                "
              >
                Status
              </p>

              <p
                className="
                  text-sm
                  font-semibold
                  capitalize
                  mt-1
                "
              >
                {issue.status === "created" ? "Created" : issue.status === "viewed" ? "Viewed" : issue.status}
              </p>
            </div>

            <div>
              <p
                className="
                  text-xs
                  text-cv-text-subtle
                "
              >
                Current Department
              </p>

              <p
                className="
                  text-sm
                  font-semibold
                  mt-1
                "
              >
                {issue.department ||
                  "Not Assigned"}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loadingData ? (
          <div
            className="
              flex flex-col
              items-center
              justify-center
              py-12
              text-cv-text-muted
            "
          >
            <Loader2
              className="animate-spin mb-3"
              size={28}
            />

            <p className="text-sm">
              Loading departments and employees...
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {String(issue.status || "created").toLowerCase() === "created" && (
              <div className="rounded-2xl border border-cv-primary-border bg-cv-primary-soft p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cv-surface text-cv-primary">
                    <Eye size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-cv-text">New issue</p>
                    <p className="mt-1 text-xs leading-5 text-cv-text-secondary">
                      Confirm that you have reviewed this issue. This records who viewed it and when.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleMarkViewed}
                  disabled={viewing}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cv-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-cv-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {viewing ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                  {viewing ? "Marking as viewed…" : "Mark as Viewed"}
                </button>
              </div>
            )}

            {String(issue.status || "created").toLowerCase() !== "created" && (
            <>
            {/* =================================================
                ASSIGNMENT
            ================================================= */}

            <div>

              <div
                className="
                  flex items-center
                  gap-2
                  mb-4
                "
              >
                <Building2
                  size={17}
                  className="text-cv-primary"
                />

                <h3
                  className="
                    font-semibold
                    text-cv-text
                  "
                >
                  Assignment
                </h3>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-4
                "
              >

                {/* =================================================
                    DEPARTMENT
                ================================================= */}

                <div>

                  <label
                    className="
                      text-xs
                      text-cv-text-muted
                      font-medium
                    "
                  >
                    Department
                  </label>

                  <select
                    value={department}
                    onChange={(e) =>
                      handleDepartmentChange(
                        e.target.value
                      )
                    }
                    disabled={assigning}
                    className="
                      mt-1
                      w-full
                      border
                      border-cv-border
                      rounded-xl
                      px-3
                      py-2.5
                      bg-cv-surface
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-cv-primary/20
                      focus:border-cv-primary
                    "
                  >

                    <option value="">
                      Select department
                    </option>

                    {departments.map(
                      (dep) => (
                        <option
                          key={
                            dep._id ||
                            dep.name
                          }
                          value={
                            dep.name
                          }
                        >
                          {dep.name}
                        </option>
                      )
                    )}

                  </select>

                  {departments.length ===
                    0 && (
                    <p
                      className="
                        text-xs
                        text-cv-warning
                        mt-2
                      "
                    >
                      No departments found.
                    </p>
                  )}

                </div>

                {/* =================================================
                    EMPLOYEE
                ================================================= */}

                <div>

                  <label
                    className="
                      text-xs
                      text-cv-text-muted
                      font-medium
                    "
                  >
                    Assign Employee
                  </label>

                  <select
                    value={assignedTo}
                    onChange={(e) =>
                      setAssignedTo(
                        e.target.value
                      )
                    }
                    disabled={
                      assigning
                    }
                    className="
                      mt-1
                      w-full
                      border
                      border-cv-border
                      rounded-xl
                      px-3
                      py-2.5
                      bg-cv-surface
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-cv-primary/20
                      focus:border-cv-primary
                    "
                  >

                    <option value="">
                      Select employee
                    </option>

                    {eligibleUsers.map(
                      (user) => (
                        <option
                          key={
                            user._id ||
                            user.username
                          }
                          value={
                            user._id ||
                            user.username
                          }
                        >
                          {user.fullName ||
                            user.username}

                          {user.username
                            ? ` — ${user.username}`
                            : ""}

                          {user.role
                            ? ` (${user.role})`
                            : ""}
                        </option>
                      )
                    )}

                  </select>

                  {eligibleUsers.length ===
                    0 && (
                    <p
                      className="
                        text-xs
                        text-cv-warning
                        mt-2
                      "
                    >
                      No active employees,
                      faculty or HOD found.
                    </p>
                  )}

                </div>

              </div>

              {/* =================================================
                  EMPLOYEE INFORMATION
              ================================================= */}

              {selectedEmployee && (
                <div
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-cv-primary/20
                    bg-cv-primary/5
                    p-4
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      w-10 h-10
                      rounded-full
                      bg-cv-primary
                      text-white
                      flex items-center
                      justify-center
                    "
                  >
                    <UserRound
                      size={18}
                    />
                  </div>

                  <div>

                    <p
                      className="
                        text-xs
                        text-cv-text-subtle
                      "
                    >
                      Task will be assigned to
                    </p>

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-cv-text
                      "
                    >
                      {selectedEmployee.fullName ||
                        selectedEmployee.username}
                    </p>

                    <p
                      className="
                        text-xs
                        text-cv-text-muted
                        mt-0.5
                      "
                    >
                      Username:{" "}
                      {selectedEmployee.username}
                      {" • "}
                      Role:{" "}
                      {selectedEmployee.role}
                    </p>

                  </div>

                </div>
              )}

            </div>

            {/* =================================================
                SLA
            ================================================= */}

            <div>

              <div
                className="
                  flex items-center
                  gap-2
                  mb-4
                "
              >
                <Clock3
                  size={17}
                  className="text-cv-primary"
                />

                <h3
                  className="
                    font-semibold
                    text-cv-text
                  "
                >
                  Resolution SLA
                </h3>
              </div>

              <div>

                <label
                  className="
                    text-xs
                    text-cv-text-muted
                    font-medium
                  "
                >
                  Expected Resolution Days
                </label>

                <input
                  type="number"
                  min="1"
                  max="365"
                  value={expectedDays}
                  onChange={(e) =>
                    setExpectedDays(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  disabled={assigning}
                  className="
                    mt-1
                    w-full
                    border
                    border-cv-border
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-cv-primary/20
                    focus:border-cv-primary
                  "
                />

              </div>

            </div>

            {/* =================================================
                ASSIGN BUTTON
            ================================================= */}

            <button
              onClick={handleAssign}
              disabled={
                assigning ||
                loadingData ||
                !department ||
                !assignedTo
              }
              className="
                w-full
                mt-2
                bg-cv-primary
                hover:bg-cv-primary-hover
                disabled:bg-cv-border
                disabled:cursor-not-allowed
                text-white
                px-4
                py-3
                rounded-xl
                font-semibold
                transition
                flex items-center
                justify-center
                gap-2
              "
            >

              {assigning ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Assigning...
                </>
              ) : (
                <>
                  <UserRound
                    size={17}
                  />

                  Assign Issue
                </>
              )}

            </button>

          </>
            )}

          </div>
        )}

        {/* =================================================
            CURRENT ASSIGNMENT
        ================================================= */}

        {issue.assignedTo?.name && (
          <div
            className="
              mt-6
              border-t
              border-cv-border
              pt-5
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-widest
                text-cv-text-subtle
                font-semibold
                mb-2
              "
            >
              Current Assignee
            </p>

            <p
              className="
                text-sm
                font-semibold
                text-cv-text
              "
            >
              {issue.assignedTo.name}
            </p>

            {issue.assignedTo.username && (
              <p
                className="
                  text-xs
                  text-cv-text-muted
                  mt-1
                "
              >
                {issue.assignedTo.username}
              </p>
            )}

          </div>
        )}

        {/* =================================================
            RESOLUTION NOTE
        ================================================= */}

        {issue.resolutionNote && (
          <div
            className="
              mt-5
              border-t
              border-cv-border
              pt-5
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-widest
                text-cv-text-subtle
                font-semibold
                mb-2
              "
            >
              Resolution Note
            </p>

            <p
              className="
                text-sm
                text-cv-text-secondary
              "
            >
              {issue.resolutionNote}
            </p>

          </div>
        )}

        {/* =================================================
            TIMELINE
        ================================================= */}

        <div
          className="
            mt-6
            border-t
            border-cv-border
            pt-5
          "
        >

          <p
            className="
              text-xs
              uppercase
              tracking-widest
              text-cv-text-subtle
              font-semibold
              mb-4
            "
          >
            Workflow Timeline
          </p>

          <div className="space-y-3">

            {issue.timeline?.length ? (
              issue.timeline.map(
                (step, index) => (
                  <div
                    key={index}
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >

                    <div
                      className="
                        w-6 h-6
                        flex-shrink-0
                        rounded-full
                        bg-cv-success
                        text-white
                        flex items-center
                        justify-center
                        text-[10px]
                        mt-0.5
                      "
                    >
                      <CheckCircle2
                        size={14}
                      />
                    </div>

                    <div>

                      <p
                        className="
                          text-sm
                          font-medium
                          text-cv-text
                        "
                      >
                        {step.action}
                      </p>

                      <p
                        className="
                          text-xs
                          text-cv-text-subtle
                          mt-0.5
                        "
                      >
                        {step.by ||
                          "System"}
                      </p>

                    </div>

                  </div>
                )
              )
            ) : (
              <p
                className="
                  text-sm
                  text-cv-text-subtle
                "
              >
                No workflow events yet.
              </p>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}