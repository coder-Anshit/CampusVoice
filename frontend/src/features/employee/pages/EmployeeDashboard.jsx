import AdminPanel from "../../admin/pages/AdminPanel.jsx";

/**
 * Staff workspace.
 *
 * Community, analytics, feedback and issue visibility mirror the institutional
 * workspace, while User Management remains admin-only. The My Work tab uses
 * employee-owned task endpoints for accept → investigate → resolve.
 */
export default function EmployeeDashboard({ onCreateClick }) {
  return <AdminPanel role="employee" onCreateClick={onCreateClick} />;
}
