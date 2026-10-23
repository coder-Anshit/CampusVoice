import client from "./client.js";

export async function fetchUsers() {
  const { data } = await client.get("/users/");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function createPilotUser(payload) {
  const { data } = await client.post("/users/pilot", payload);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await client.patch(`/users/${id}`, payload);
  return data;
}

export async function provisionUsers(role, count, category = {}) {
  const { data } = await client.post("/users/provision", { role, count: Number(count), ...category });
  return data;
}
