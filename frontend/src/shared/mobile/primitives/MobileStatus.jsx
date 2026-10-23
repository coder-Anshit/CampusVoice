import MobileBadge from "./MobileBadge.jsx";

const STATUS = {
  created: ["New", "warning"],
  viewed: ["Viewed", "info"],
  assigned: ["Assigned", "primary"],
  accepted: ["Accepted", "primary"],
  investigating: ["Being Worked On", "info"],
  resolved: ["Resolved", "success"],
  verified: ["Verified", "success"],
  closed: ["Closed", "neutral"],
};

export default function MobileStatus({ status, label }) {
  const [fallbackLabel, tone] = STATUS[String(status || "").toLowerCase()] || [status || "Unknown", "neutral"];
  return <MobileBadge tone={tone} dot>{label || fallbackLabel}</MobileBadge>;
}
