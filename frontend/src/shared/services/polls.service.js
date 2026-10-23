// ─────────────────────────────────────────────────────────────────────────────
// services/polls.service.js
// ─────────────────────────────────────────────────────────────────────────────
import client from  "./client.js";   // ← in a real multi-file setup
// Here we inline everything in one file for easy copy-paste.
export async function fetchPolls() {
  const res = await client.get("/polls/");
  return res.data;
}

export async function createPoll({ question, options, author, anonymous = false }) {
  const res = await client.post("/polls/", { question, options, author, anonymous });
  return res.data;
}

export async function votePoll(id, optionIndex, voterId) {
  const res = await client.post(`/polls/${id}/vote`, { option: optionIndex, voterId });
  return res.data;
}

export async function deletePoll(id) {
  const res = await client.delete(`/polls/${id}`);
  return res.data;
}