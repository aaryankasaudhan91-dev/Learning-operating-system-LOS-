import { Router } from "express";
import { sanitizeInput, cleanAiResponse } from "./utils";

export const focusAgent = Router();

focusAgent.post("/focus", async (req, res) => {
  try {
    const { topic, contentMode, analogyMode, complexitySteppedDown } = req.body;
    const cleanTopic = sanitizeInput(topic || "Dijkstra's algorithm");

    let instruction = `You are a cognitive learning assistant. The user is currently studying the topic specified in <topic> tags.\n<topic>${cleanTopic}</topic>\n`;
    
    if (analogyMode) {
      instruction += `The user has requested a real-world analogy. Please explain the core concept of the topic using a simple, relatable real-world analogy. Keep it strictly under 30 words.\n`;
    } else if (complexitySteppedDown) {
      instruction += `The user has requested a simplified, stepped-down explanation. Explain the core concept of the topic in very simple, plain English. Keep it strictly under 30 words.\n`;
    } else if (contentMode === 'audio') {
      instruction += `The user is in audio mode. Provide a short, punchy script (under 20 words) that summarizes the topic that would sound good when read aloud by text-to-speech.\n`;
    } else if (contentMode === 'visual') {
      instruction += `The user is in visual mode. Provide a very brief (under 15 words) description of what a visual diagram for the topic would look like.\n`;
    } else {
      instruction += `The user is in standard text mode. Provide a concise, highly technical summary of the topic. Keep it strictly under 30 words.\n`;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    let reply = "";

    if (apiKey) {
      // Call ChatGPT / OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: instruction }],
          max_tokens: 100,
          temperature: 0.7
        })
      });
      if (response.ok) {
        const data: any = await response.json();
        reply = data.choices?.[0]?.message?.content || "";
      } else {
        const errorText = await response.text();
        console.error("[ChatGPT Agent] API Error:", errorText);
        throw new Error(`OpenAI API responded with status ${response.status}`);
      }
    } else {
      // Fallback Mock response for ChatGPT
      console.warn("[ChatGPT Agent] OPENAI_API_KEY is missing. Using local mock response.");
      if (analogyMode) {
        reply = `Like a postman finding the shortest path to deliver mail efficiently.`;
      } else if (complexitySteppedDown) {
        reply = `It finds the shortest path between nodes in a graph, step-by-step.`;
      } else if (contentMode === 'audio') {
        reply = `Dijkstra's algorithm finds the shortest path in a network.`;
      } else if (contentMode === 'visual') {
        reply = `A diagram showing nodes connected by weighted lines with paths highlighted.`;
      } else {
        reply = `An optimal pathfinding algorithm that finds the shortest path between nodes in a weighted graph.`;
      }
    }

    res.json({ content: cleanAiResponse(reply) });
  } catch (err: any) {
    console.error("Error in ChatGPT Focus Agent:", err);
    res.status(500).json({ error: "Failed to generate AI content from ChatGPT Focus Agent." });
  }
});
