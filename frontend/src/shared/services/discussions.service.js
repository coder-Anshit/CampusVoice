// ─────────────────────────────────────────────────────────────────────────────
// services/discussions.service.js
// ─────────────────────────────────────────────────────────────────────────────
import client from  "./client.js";   // ← in a real multi-file setup
// Here we inline everything in one file for easy copy-paste.
export async function fetchDiscussions() {
  const res = await client.get("/discussions/");
  return res.data;
}

export async function createDiscussion({ title, details, author, anonymous = false }) {
  const res = await client.post("/discussions/", {
    title,
    details,
    author,
    anonymous,
    timestamp: new Date().toISOString(),
  });
  return res.data;
}

export async function commentOnDiscussion(id, text, user) {
  const res = await client.post(`/discussions/${id}/comment`, { text, user });
  return res.data;
}

export async function voteDiscussion(id, voterId) {
  const res = await client.post(`/discussions/${id}/vote`, { voterId });
  return res.data;
}
export async function deleteDiscussion(id) {
  const res = await client.delete(`/discussions/${id}`);
  return res.data;
}
