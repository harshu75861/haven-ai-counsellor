import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";

const defaultState = {
  users: [],
  leads: [],
  messages: [],
  insights: []
};

export async function createRepository() {
  const dataDir = path.resolve(process.env.DATA_DIR || "data");
  const filePath = path.join(dataDir, "haven.json");
  await mkdir(dataDir, { recursive: true });

  async function readState() {
    try {
      return JSON.parse(await readFile(filePath, "utf8"));
    } catch {
      await writeState(defaultState);
      return structuredClone(defaultState);
    }
  }

  async function writeState(state) {
    await writeFile(filePath, JSON.stringify(state, null, 2));
  }

  return {
    async createUser(profile) {
      const state = await readState();
      const user = {
        id: nanoid(),
        createdAt: new Date().toISOString(),
        ...profile
      };
      state.users.push(user);
      await writeState(state);
      return user;
    },
    async getUser(id) {
      const state = await readState();
      return state.users.find((user) => user.id === id);
    },
    async listUsers() {
      const state = await readState();
      return state.users;
    },
    async createLead(lead) {
      const state = await readState();
      const row = { id: nanoid(), createdAt: new Date().toISOString(), status: "new", ...lead };
      state.leads.push(row);
      await writeState(state);
      return row;
    },
    async listLeads() {
      const state = await readState();
      return state.leads;
    },
    async addMessage(userId, message) {
      const state = await readState();
      state.messages.push({ id: nanoid(), userId, createdAt: new Date().toISOString(), ...message });
      await writeState(state);
    },
    async saveInsights(userId, insights) {
      const state = await readState();
      const existing = state.insights.find((row) => row.userId === userId);
      if (existing) {
        existing.insights = insights;
        existing.updatedAt = new Date().toISOString();
      } else {
        state.insights.push({ id: nanoid(), userId, insights, updatedAt: new Date().toISOString() });
      }
      await writeState(state);
    },
    async listInsights() {
      const state = await readState();
      return state.insights;
    }
  };
}
