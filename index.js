import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db.js";
import { Message } from "./Message.js";

// For __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await connectDB(); // Connect to MongoDB

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const ai = new GoogleGenAI({ apiKey: "" });

app.post("/gemini", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // Fetch last 5 messages from DB
    const previousMessages = await Message.find().sort({ timestamp: -1 }).limit(5).lean();
    const context = previousMessages.reverse().map(msg => `${msg.sender}: ${msg.text}`).join("\n");

    const fullPrompt = context + `\nuser: ${prompt}`;

    const responseObj = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
    });

    const text = responseObj.text || responseObj.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

    // Save both user and bot messages
    await Message.create({ sender: "user", text: prompt });
    await Message.create({ sender: "bot", text });

    res.send({ text });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send({ error: "Something went wrong." });
  }
});

app.listen(3000, () => console.log("✅ Server running at http://localhost:3000"));
