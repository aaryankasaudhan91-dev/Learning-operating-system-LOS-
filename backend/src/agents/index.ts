import express from "express";
import { GoogleGenAI } from "@google/genai";
import { focusAgent } from "./focusAgent";
import { insightsAgent } from "./insightsAgent";
import { interventionAgent } from "./interventionAgent";
import { createSosAgent } from "./sosAgent";
import { taskHintAgent } from "./taskHintAgent";
import { taskGeneratorAgent } from "./taskGeneratorAgent";

export function setupAgentRoutes(app: express.Express, ai: GoogleGenAI | null) {
  app.use("/api/agent", focusAgent);
  app.use("/api/agent", insightsAgent);
  app.use("/api/agent", interventionAgent);
  app.use("/api/agent", createSosAgent(ai));
  app.use("/api/agent", taskHintAgent);
  app.use("/api/agent", taskGeneratorAgent);
}
