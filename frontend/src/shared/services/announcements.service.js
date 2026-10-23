// services/client.js
// ─────────────────────────────────────────────────────────────────────────────
// Single axios instance for the whole app.
// Every service imports THIS — never creates its own axios instance.
// To switch from  localhost to production just change BASE_URL (or use .env).
// ─────────────────────────────────────────────────────────────────────────────

import axios from  "axios";

const BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:5000/api";

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach auth token when present ──────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — normalise error shape ──────────────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Preserve the original error so callers can still inspect err.response
    return Promise.reject(err);
  }
);

export default client;


// ─────────────────────────────────────────────────────────────────────────────
// services/issues.service.js
// ─────────────────────────────────────────────────────────────────────────────

// import client from  "./client.js";   ← in a real multi-file setup
// Here we inline everything in one file for easy copy-paste.

export async function fetchIssues() {
  const res = await client.get("/issues/");
  return res.data;
}

export async function addIssue({ text, category, user, anonymous }) {
  const res = await client.post("/issues/", { text, category, user, anonymous });
  return res.data;
}

export async function upvoteIssue(id, voterId) {
  const res = await client.post(`/issues/${id}/upvote`, { voterId });
  return res.data;
}

export async function commentOnIssue(id, text, user = "Anonymous", anonymous = true) {
  const res = await client.post(`/issues/${id}/comment`, { text, user, anonymous });
  return res.data;
}

export async function replyToComment(issueId, commentId, text, user = "Anonymous", anonymous = true) {
  const res = await client.post(`/issues/${issueId}/reply/${commentId}`, { text, user, anonymous });
  return res.data;
}

export async function deleteIssue(id) {
  const res = await client.delete(`/issues/${id}`);
  return res.data;
}

export async function reportIssue(id) {
  const res = await client.post(`/issues/${id}/report`);
  return res.data;
}

export async function approveIssue(id) {
  const res = await client.post(`/issues/${id}/approve`);
  return res.data;
}

export async function rejectIssue(id) {
  const res = await client.post(`/issues/${id}/reject`);
  return res.data;
}

export async function updateIssueStatus(id, status, resolutionNote = "") {
  const res = await client.patch(`/issues/${id}/status`, { status, resolutionNote });
  return res.data;
}


// ─────────────────────────────────────────────────────────────────────────────
// services/polls.service.js
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchPolls() {
  const res = await client.get("/polls/");
  return res.data;
}

export async function createPoll({ question, options }) {
  const res = await client.post("/polls/", { question, options });
  return res.data;
}

export async function votePoll(id, optionIndex, voterId) {
  const res = await client.post(`/polls/${id}/vote`, { option: optionIndex, voterId });
  return res.data;
}


// ─────────────────────────────────────────────────────────────────────────────
// services/announcements.service.js
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAnnouncements() {
  const res = await client.get("/announcements/");
  return res.data;
}

export async function createAnnouncement({ title, details, priority, author }) {
  const res = await client.post("/announcements/", {
    title,
    details,
    priority: priority ?? "normal",
    author,
    timestamp: new Date().toISOString(),
  });
  return res.data;
}
export async function deleteAnnouncement(id) {
  const res = await client.delete(`/announcements/${id}`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// services/discussions.service.js
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchDiscussions() {
  const res = await client.get("/discussions/");
  return res.data;
}

export async function createDiscussion({ title, details, author }) {
  const res = await client.post("/discussions/", {
    title,
    details,
    author,
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