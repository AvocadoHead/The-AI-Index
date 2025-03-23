// Premium modules for AI Module Cloud
// This file contains premium modules that are only accessible to premium users

// Define premium modules if not already defined
window.premiumModules = [
    {
        name: "Claude 3 Opus",
        categories: ["LLM", "USE"],
        url: "https://claude.ai/",
        scores: { "LLM": 0.98, "USE": 0.95 }
    },
    {
        name: "GPT-4o",
        categories: ["LLM", "USE"],
        url: "https://chat.openai.com/",
        scores: { "LLM": 0.97, "USE": 0.96 }
    },
    {
        name: "Midjourney V6",
        categories: ["T2I"],
        url: "https://www.midjourney.com/",
        scores: { "T2I": 0.98 }
    },
    {
        name: "DALL-E 3",
        categories: ["T2I"],
        url: "https://openai.com/dall-e-3",
        scores: { "T2I": 0.95 }
    },
    {
        name: "Runway Gen-3",
        categories: ["T2V", "I2V"],
        url: "https://runwayml.com/",
        scores: { "T2V": 0.96, "I2V": 0.95 }
    },
    {
        name: "Pika Labs",
        categories: ["T2V", "I2V"],
        url: "https://pika.art/",
        scores: { "T2V": 0.94, "I2V": 0.93 }
    },
    {
        name: "Stable Diffusion 3",
        categories: ["T2I", "I2I"],
        url: "https://stability.ai/",
        scores: { "T2I": 0.93, "I2I": 0.92 }
    },
    {
        name: "Anthropic Claude API",
        categories: ["LLM", "DEV"],
        url: "https://www.anthropic.com/api",
        scores: { "LLM": 0.96, "DEV": 0.94 }
    },
    {
        name: "OpenAI API",
        categories: ["LLM", "DEV"],
        url: "https://platform.openai.com/",
        scores: { "LLM": 0.95, "DEV": 0.95 }
    },
    {
        name: "ElevenLabs",
        categories: ["T2S", "VCL"],
        url: "https://elevenlabs.io/",
        scores: { "T2S": 0.97, "VCL": 0.98 }
    },
    // Add more premium modules here
    {
        name: "Gemini Pro",
        categories: ["LLM", "USE"],
        url: "https://gemini.google.com/",
        scores: { "LLM": 0.94, "USE": 0.92 }
    },
    {
        name: "Stability AI",
        categories: ["T2I", "I2I", "T2V"],
        url: "https://stability.ai/",
        scores: { "T2I": 0.92, "I2I": 0.91, "T2V": 0.89 }
    },
    {
        name: "Hugging Face",
        categories: ["LLM", "DEV", "ML"],
        url: "https://huggingface.co/",
        scores: { "LLM": 0.93, "DEV": 0.96, "ML": 0.97 }
    },
    {
        name: "Replicate",
        categories: ["T2I", "I2I", "T2V", "ML"],
        url: "https://replicate.com/",
        scores: { "T2I": 0.91, "I2I": 0.90, "T2V": 0.88, "ML": 0.92 }
    },
    {
        name: "Civitai",
        categories: ["T2I", "I2I", "3D"],
        url: "https://civitai.com/",
        scores: { "T2I": 0.89, "I2I": 0.88, "3D": 0.85 }
    }
];

console.log(`Loaded ${window.premiumModules.length} premium modules`);
