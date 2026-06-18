import { Router } from "express";
import { sanitizeInput, cleanAiResponse } from "./utils";

export const taskGeneratorAgent = Router();

taskGeneratorAgent.post("/generate-task", async (req, res) => {
  try {
    const { topic, type } = req.body;
    const cleanTopic = sanitizeInput(topic);
    const cleanType = sanitizeInput(type) || "task";

    if (!cleanTopic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    let typeName = "task";
    let detailsInstruction = "";

    switch (cleanType) {
      case "homework":
        typeName = "homework assignment";
        detailsInstruction = "Include 2-3 specific homework questions or problems for the student to solve and submit.";
        break;
      case "custom-homework":
        typeName = "interactive homework questions list";
        detailsInstruction = "You MUST return a JSON object with exactly two keys: 'title' (a string) and 'questions' (an array of 3 string questions/problems). Do not return markdown. Return raw JSON.";
        break;
      case "test":
        typeName = "test / quiz";
        detailsInstruction = "Include a 3-question quiz (multiple-choice or short answer) with questions clearly formulated.";
        break;
      case "quiz":
        typeName = "multiple-choice quiz";
        detailsInstruction = "You MUST return a JSON object with exactly two keys: 'title' (a string) and 'questions' (an array of objects, where each object has: 'question' (string), 'options' (array of 4 strings), and 'correctOptionIndex' (number from 0 to 3)). Do not return markdown. Return raw JSON.";
        break;
      case "study":
        typeName = "structured study roadmap / plan";
        detailsInstruction = "Include a step-by-step roadmap, key resources to read, and topics to cover.";
        break;
      default:
        typeName = "general practical task";
        detailsInstruction = "Include clear instructions, objectives, and a hands-on activity for the student.";
        break;
    }

    const instruction = `You are a curriculum developer and mentor assistant.
Generate a structured learning activity of type "${typeName}" on the topic "${cleanTopic}".

For custom multiple-choice quiz (type "quiz"), return EXACTLY a JSON structure of:
{
  "title": "quiz title",
  "questions": [
    { "question": "question text", "options": ["opt1", "opt2", "opt3", "opt4"], "correctOptionIndex": 0 }
  ]
}

For custom homework (type "custom-homework"), return EXACTLY a JSON structure of:
{
  "title": "homework title",
  "questions": ["q1 text", "q2 text", "q3 text"]
}

Otherwise:
You MUST return a JSON object with exactly two keys:
1. "title": a concise, premium, and professional title for the ${typeName}.
2. "description": a highly detailed, beautifully structured description. Use clean formatting. ${detailsInstruction}

Ensure the output is ONLY a valid JSON object. Do not include any intro, outro, or wrapper text. Do not wrap the JSON in markdown code blocks like \`\`\`json. Just the raw JSON object.`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let reply = "";

    if (apiKey) {
      // Call Claude / Anthropic API
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 500,
          messages: [{ role: "user", content: instruction }]
        })
      });
      if (response.ok) {
        const data: any = await response.json();
        reply = data.content?.[0]?.text || "";
      } else {
        const errorText = await response.text();
        console.error("[Claude Agent] API Error:", errorText);
        throw new Error(`Anthropic API responded with status ${response.status}`);
      }
    } else {
      // Fallback Mock response for Claude
      console.warn("[Claude Agent] ANTHROPIC_API_KEY is missing. Using local mock response.");
      if (cleanType === "quiz") {
        reply = JSON.stringify({
          title: `${cleanTopic} Practice Quiz`,
          questions: [
            {
              question: `Which of the following best describes the core concept of ${cleanTopic}?`,
              options: [
                "The optimal solution under standard constraints",
                "A random walk through parameter spaces",
                "An inefficient brute-force comparison method",
                "None of the above"
              ],
              correctOptionIndex: 0
            },
            {
              question: `What is a common real-world application of ${cleanTopic}?`,
              options: [
                "Network routing and pathfinding optimization",
                "Text formatting and document styling",
                "Basic array key sorting",
                "Database indexing ONLY"
              ],
              correctOptionIndex: 0
            },
            {
              question: `What is the typical time complexity associated with an optimized implementation of ${cleanTopic}?`,
              options: [
                "Logarithmic or linearithmic time complexity",
                "Exponential time complexity",
                "Constant time complexity",
                "Quadratic time complexity"
              ],
              correctOptionIndex: 0
            }
          ]
        });
      } else if (cleanType === "custom-homework") {
        reply = JSON.stringify({
          title: `${cleanTopic} Homework Assignment`,
          questions: [
            `Describe the primary constraints of ${cleanTopic} and how you would handle edge cases.`,
            `Provide a step-by-step trace of ${cleanTopic} using a simple custom dataset.`,
            `Explain the performance tradeoffs of using ${cleanTopic} compared to an alternative approach.`
          ]
        });
      } else {
        reply = JSON.stringify({
          title: `Comprehensive Guide: ${cleanTopic} (${cleanType.toUpperCase()})`,
          description: `Here is a custom learning resource tailored to help you master ${cleanTopic}. \n\n1. Overview & Core Concepts: A structured breakdown of the most critical elements. \n2. Hands-on Practice Exercise: A series of questions and prompts to solidify your theoretical knowledge. \n3. Recommended Self-Assessment: Key reflection points to evaluate your proficiency.`
        });
      }
    }

    // Parse the reply JSON
    let parsed;
    try {
      let cleaned = reply.trim();
      // Remove markdown formatting if any
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.substring(7);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.substring(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }
      cleaned = cleaned.trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse JSON reply:", reply, parseErr);
      parsed = {
        title: `AI Generated: ${cleanTopic} (${cleanType})`,
        description: reply
      };
    }

    // If it's quiz or custom-homework, send the whole parsed JSON back directly!
    if (cleanType === "quiz" || cleanType === "custom-homework") {
      return res.json(parsed);
    }

    res.json({
      title: cleanAiResponse(parsed.title || `AI Generated: ${cleanTopic}`),
      description: cleanAiResponse(parsed.description || reply)
    });
  } catch (err: any) {
    console.error("Error in Claude Task Generator Agent:", err);
    res.status(500).json({ error: "AI Service temporarily unavailable." });
  }
});
