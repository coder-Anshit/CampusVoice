import client from "./client.js";

export async function fetchIssues() {
  const res = await client.get("/issues/");
  return res.data;
}

export async function fetchMyIssues() {
  const res = await client.get("/issues/my");
  return res.data;
}

export async function addIssue({
  title,
  text,
  category,
  anonymous,
}) {
  const res = await client.post("/issues/", {
    title,
    text,
    category,
    anonymous,
  });

  return res.data;
}

export async function upvoteIssue(id, voterId) {
  const res = await client.post(
    `/issues/${id}/upvote`,
    { voterId }
  );

  return res.data;
}

export async function commentOnIssue(id, text) {
  const res = await client.post(
    `/issues/${id}/comment`,
    {
      text,
    }
  );

  return res.data;
}

export async function replyToComment(
  id,
  commentId,
  text
) {
  const res = await client.post(
    `/issues/${id}/reply/${commentId}`,
    {
      text,
    }
  );

  return res.data;
}

export async function deleteIssue(id) {
  const res = await client.delete(
    `/issues/${id}`
  );

  return res.data;
}

export async function reportIssue(id, reason) {
  const res = await client.post(
    `/issues/${id}/report`,
    {
      reason,
    }
  );

  return res.data;
}

export async function markIssueViewed(id) {
  const res = await client.post(`/issues/${id}/view`);
  return res.data;
}

export async function updateIssueStatus(
  id,
  status
) {
  const res = await client.patch(
    `/issues/${id}/status`,
    {
      status,
    }
  );

  return res.data;
}

export async function verifyIssue(
  id,
  action
) {
  const res = await client.post(
    `/issues/${id}/verify`,
    {
      action,
    }
  );

  return res.data;
}

export async function closeIssue(id) {
  const res = await client.patch(
    `/issues/${id}/close`
  );

  return res.data;
}

/*
 * Assign grievance to an employee.
 */
export async function assignIssue(
  id,
  assignmentData
) {
  const res = await client.patch(
    `/issues/${id}/assign`,
    {
      department:
        assignmentData.department,

      assignedTo:
        assignmentData.assignedTo,

      expectedDays: Number(
        assignmentData.expectedDays
      ),
    }
  );

  return res.data;
}