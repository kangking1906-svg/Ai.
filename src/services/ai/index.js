const config = require("../../config");
const {
  getDb,
  ensureGuild
} = require("../../database");

const {
  normalizeRomanizedKhmer
} = require("../../utils/khmer");

async function chat({
  guildId,
  userId,
  prompt
}) {
  ensureGuild(guildId);

  if (config.ai.provider === "none") {
    throw new Error(
      "AI is not configured. Set AI_PROVIDER and AI_API_KEY."
    );
  }

  if (!config.ai.key) {
    throw new Error(
      "AI_API_KEY is missing."
    );
  }

  const db = getDb();

  const settings = db
    .prepare(
      "SELECT ai_enabled FROM guild_settings WHERE guild_id=?"
    )
    .get(guildId);

  if (settings && settings.ai_enabled === 0) {
    throw new Error(
      "AI is disabled for this server."
    );
  }

  const limit = Math.max(
    0,
    Math.min(
      Number(config.ai.contextMessages) || 12,
      20
    )
  );

  const memory = db
    .prepare(
      `SELECT role, content
       FROM ai_memory
       WHERE guild_id=? AND user_id=?
       ORDER BY id DESC
       LIMIT ?`
    )
    .all(
      guildId,
      userId,
      limit
    )
    .reverse();

  const systemPrompt = [
    "You are a helpful Discord AI assistant.",
    "Answer accurately and safely.",
    "Help with coding, configuration, translation,",
    "Discord administration guidance, and general questions.",
    "Understand Khmer Unicode and common romanized Khmer.",
    "Never claim that the bot has permissions it does not have.",
    "Never bypass Discord permissions, limits, or safety rules."
  ].join(" ");

  const messages = [
    {
      role: "system",
      content: systemPrompt
    },
    ...memory,
    {
      role: "user",
      content: normalizeRomanizedKhmer(
        String(prompt)
      ).slice(0, 6000)
    }
  ];

  let answer;

  if (config.ai.provider === "groq") {
    answer = await compatible(
      "https://api.groq.com/openai/v1/chat/completions",
      config.ai.key,
      config.ai.model,
      messages
    );
  } else if (
    config.ai.provider === "openrouter"
  ) {
    answer = await compatible(
      config.ai.baseUrl ||
        "https://openrouter.ai/api/v1/chat/completions",
      config.ai.key,
      config.ai.model,
      messages
    );
  } else if (
    config.ai.provider === "gemini"
  ) {
    answer = await gemini(
      config.ai.key,
      config.ai.model,
      messages
    );
  } else {
    throw new Error(
      `Unsupported AI provider: ${config.ai.provider}`
    );
  }

  db.prepare(
    `INSERT INTO ai_memory
     (guild_id,user_id,role,content,created_at)
     VALUES (?,?,?,?,?)`
  ).run(
    guildId,
    userId,
    "user",
    String(prompt),
    Date.now()
  );

  db.prepare(
    `INSERT INTO ai_memory
     (guild_id,user_id,role,content,created_at)
     VALUES (?,?,?,?,?)`
  ).run(
    guildId,
    userId,
    "assistant",
    answer,
    Date.now()
  );

  db.prepare(
    `DELETE FROM ai_memory
     WHERE guild_id=?
       AND user_id=?
       AND id NOT IN (
         SELECT id
         FROM ai_memory
         WHERE guild_id=?
           AND user_id=?
         ORDER BY id DESC
         LIMIT 40
       )`
  ).run(
    guildId,
    userId,
    guildId,
    userId
  );

  return answer;
}

async function compatible(
  url,
  key,
  model,
  messages
) {
  if (!model) {
    throw new Error(
      "AI_MODEL is required for this provider."
    );
  }

  const response = await fetch(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: config.ai.temperature,
        max_tokens: config.ai.maxTokens
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      `AI provider HTTP ${response.status}: ${(
        await response.text()
      ).slice(0, 400)}`
    );
  }

  const json = await response.json();

  return (
    json.choices?.[0]?.message?.content?.trim() ||
    "No response."
  );
}

async function gemini(
  key,
  model,
  messages
) {
  if (!model) {
    throw new Error(
      "AI_MODEL is required for Gemini."
    );
  }

  const system =
    messages.find(
      message => message.role === "system"
    )?.content || "";

  const contents = messages
    .filter(
      message => message.role !== "system"
    )
    .map(message => ({
      role:
        message.role === "assistant"
          ? "model"
          : "user",
      parts: [
        {
          text: message.content
        }
      ]
    }));

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent?key=` +
    `${encodeURIComponent(key)}`;

  const response = await fetch(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: system
            }
          ]
        },
        contents,
        generationConfig: {
          temperature:
            config.ai.temperature,
          maxOutputTokens:
            config.ai.maxTokens
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      `Gemini HTTP ${response.status}: ${(
        await response.text()
      ).slice(0, 400)}`
    );
  }

  const json = await response.json();

  return (
    json.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim() ||
    "No response."
  );
}

module.exports = {
  chat
};
