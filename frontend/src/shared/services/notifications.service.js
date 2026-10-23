import client from "./client.js";

export async function fetchNotifications(username) {
  const res = await client.get(
    `/notifications/${encodeURIComponent(username)}`
  );

  return res.data;
}

export async function markNotificationRead(id) {
  const res = await client.patch(
    `/notifications/${id}/read`
  );

  return res.data;
}