// Define premium modules as a global variable
window.premiumModules = [
  {
    "name": "AIVA",
    "categories": ["AUD", "MUS"],
    "url": "https://www.aiva.ai",
    "scores": { "AUD": 0.85, "MUS": 0.87 },
    "is_premium": true
  },
  {
    "name": "Ace Studio",
    "categories": ["AUD", "MUS"],
    "url": "https://acestudio.ai/",
    "scores": { "AUD": 0.91, "MUS": 0.90 },
    "is_premium": true
  },
  {
    "name": "Adobe Firefly",
    "categories": ["T2I", "I2I", "DES"],
    "url": "https://www.adobe.com/products/firefly",
    "scores": { "T2I": 0.87, "I2I": 0.85, "DES": 0.89 },
    "is_premium": true
  },
  {
    "name": "Adobe Podcast",
    "categories": ["AUD"],
    "url": "https://podcast.adobe.com/",
    "scores": { "AUD": 0.92 },
    "is_premium": true
  },
  {
    "name": "Adobe Premiere",
    "categories": ["VID", "V2V"],
    "url": "https://www.adobe.com/products/premiere",
    "scores": { "VID": 0.94, "V2V": 0.80 },
    "is_premium": true
  },
  {
    "name": "Adobe XD",
    "categories": ["DES", "UI/UX"],
    "url": "https://www.adobe.com/products/xd",
    "scores": { "DES": 0.87, "UI/UX": 0.89 },
    "is_premium": true
  },
  {
    "name": "Advanced Live Portrait",
    "categories": ["ANI", "FCE"],
    "url": "https://github.com/PowerHouseMan/ComfyUI-AdvancedLivePortrait",
    "scores": { "ANI": 0.95, "FCE": 0.96 },
    "is_premium": true
  },
  {
    "name": "Anthropic Claude",
    "categories": ["LLM", "USE"],
    "url": "https://www.anthropic.com/claude",
    "scores": { "LLM": 0.96, "USE": 0.92 },
    "is_premium": true
  },
  {
    "name": "Artflow",
    "categories": ["T2I", "FCE"],
    "url": "https://app.artflow.ai/",
    "scores": { "T2I": 0.78, "FCE": 0.94 },
    "is_premium": true
  },
  {
    "name": "Astria",
    "categories": ["T2I", "I2I", "UPS"],
    "url": "https://www.astria.ai",
    "scores": { "T2I": 0.81, "I2I": 0.79, "UPS": 0.85 },
    "is_premium": true
  },
  {
    "name": "Audacity",
    "categories": ["AUD"],
    "url": "https://www.audacityteam.org/",
    "scores": { "AUD": 0.85 },
    "is_premium": true
  },
  {
    "name": "AudioPen",
    "categories": ["AUD", "T2S"],
    "url": "https://audiopen.ai/",
    "scores": { "AUD": 0.88, "T2S": 0.87 },
    "is_premium": true
  },
  {
    "name": "Bard",
    "categories": ["LLM", "USE"],
    "url": "https://bard.google.com",
    "scores": { "LLM": 0.85, "USE": 0.75 },
    "is_premium": true
  },
  {
    "name": "Blender",
    "categories": ["3D", "ANI", "DES"],
    "url": "https://www.blender.org",
    "scores": { "3D": 0.92, "ANI": 0.90, "DES": 0.88 },
    "is_premium": true
  },
  {
    "name": "Canva",
    "categories": ["T2I", "DES", "ANI"],
    "url": "https://www.canva.com/your-apps/text-to-image",
    "scores": { "T2I": 0.80, "DES": 0.88, "ANI": 0.75 },
    "is_premium": true
  },
  {
    "name": "CapCut",
    "categories": ["VID", "V2V", "DES", "ANI"],
    "url": "https://www.capcut.com",
    "scores": { "VID": 0.94, "V2V": 0.85, "DES": 0.83, "ANI": 0.81 },
    "is_premium": true
  },
  {
    "name": "ChatGPT",
    "categories": ["LLM", "USE"],
    "url": "https://chat.openai.com",
    "scores": { "LLM": 0.90, "USE": 0.85 },
    "is_premium": true
  },
  {
    "name": "Cinema 4D",
    "categories": ["3D", "ANI", "DES"],
    "url": "https://www.maxon.net/cinema-4d",
    "scores": { "3D": 0.91, "ANI": 0.89, "DES": 0.87 },
    "is_premium": true
  },
  {
    "name": "Claude",
    "categories": ["LLM", "USE"],
    "url": "https://claude.ai",
    "scores": { "LLM": 0.95, "USE": 0.9 },
    "is_premium": true
  },
  {
    "name": "D-ID",
    "categories": ["I2V", "FCE"],
    "url": "https://studio.d-id.com",
    "scores": { "I2V": 0.85, "FCE": 0.87 },
    "is_premium": true
  },
  {
    "name": "DALL-E 3",
    "categories": ["T2I", "I2I", "DES"],
    "url": "https://openai.com/dall-e-3",
    "scores": { "T2I": 0.85, "I2I": 0.8, "DES": 0.85 },
    "is_premium": true
  },
  {
    "name": "Descript",
    "categories": ["AUD", "V2V", "VCL"],
    "url": "https://www.descript.com",
    "scores": { "AUD": 0.87, "V2V": 0.85, "VCL": 0.86 },
    "is_premium": true
  },
  {
    "name": "Domo",
    "categories": ["T2V", "ANI", "V2V", "FCE"],
    "url": "https://domo.com",
    "scores": { "T2V": 0.80, "ANI": 0.78, "V2V": 0.92, "FCE": 0.82 },
    "is_premium": true
  },
  {
    "name": "ElevenLabs",
    "categories": ["AUD", "T2S", "VCL"],
    "url": "https://elevenlabs.io",
    "scores": { "AUD": 0.89, "T2S": 0.91, "VCL": 0.90 },
    "is_premium": true
  },
  {
    "name": "FacePoke",
    "categories": ["FCE"],
    "url": "https://facepoke.org/",
    "scores": { "FCE": 0.96 },
    "is_premium": true
  },
  {
    "name": "Fadr",
    "categories": ["AUD", "MUS"],
    "url": "https://fadr.com/",
    "scores": { "AUD": 0.93, "MUS": 0.75 },
    "is_premium": true
  },
  {
    "name": "Figma",
    "categories": ["DES", "UI/UX"],
    "url": "https://www.figma.com",
    "scores": { "DES": 0.93, "UI/UX": 0.95 },
    "is_premium": true
  },
  {
    "name": "Fooocus",
    "categories": ["T2I", "I2I", "UPS"],
    "url": "https://colab.research.google.com/github/lllyasviel/Fooocus/blob/main/fooocus_colab.ipynb",
    "scores": { "T2I": 0.88, "I2I": 0.92, "UPS": 0.95 },
    "is_premium": true
  },
  {
    "name": "Gamma",
    "categories": ["PRE", "LLM", "USE"],
    "url": "https://gamma.app/",
    "scores": { "PRE": 0.92, "LLM": 0.88, "USE": 0.92 },
    "is_premium": true
  },
  {
    "name": "Grammarly",
    "categories": ["LLM", "USE"],
    "url": "https://www.grammarly.com/",
    "scores": { "LLM": 0.95, "USE": 0.9 },
    "is_premium": true
  },
  {
    "name": "Groq",
    "categories": ["LLM", "USE"],
    "url": "https://groq.com/",
    "scores": { "LLM": 0.98, "USE": 0.9 },
    "is_premium": true
  },
  {
    "name": "HaliuoAI",
    "categories": ["T2V", "I2V"],
    "url": "https://hailuoai.com/video",
    "scores": { "T2V": 0.82, "I2V": 0.80 },
    "is_premium": true
  },
  {
    "name": "Haiper",
    "categories": ["T2V", "I2V", "VID"],
    "url": "https://haiper.ai/",
    "scores": { "T2V": 0.82, "I2V": 0.9, "VID": 0.92 },
    "is_premium": true
  },
  {
    "name": "Hedra",
    "categories": ["FCE"],
    "url": "https://www.hedra.com/",
    "scores": { "FCE": 0.95 },
    "is_premium": true
  },
  {
    "name": "Ideogram",
    "categories": ["T2I", "DES"],
    "url": "https://ideogram.ai",
    "scores": { "T2I": 0.83, "DES": 0.85 },
    "is_premium": true
  },
  {
    "name": "InteriorAI",
    "categories": ["DES", "I2I"],
    "url": "https://interiorai.com/",
    "scores": { "DES": 0.91, "I2I": 0.9 },
    "is_premium": true
  },
  {
    "name": "Jasper",
    "categories": ["CON", "LLM", "USE"],
    "url": "https://www.jasper.ai/",
    "scores": { "CON": 0.82, "LLM": 0.80, "USE": 0.79 },
    "is_premium": true
  },
  {
    "name": "Kaiber",
    "categories": ["T2V", "I2V", "ANI", "MUS"],
    "url": "https://kaiber.ai",
    "scores": { "T2V": 0.84, "I2V": 0.82, "ANI": 0.80, "MUS": 0.78 },
    "is_premium": true
  },
  {
    "name": "Kaps",
    "categories": ["USE"],
    "url": "https://kaps.co.il",
    "scores": { "T2V": 0.79, "I2V": 0.77, "ANI": 0.78, "Face Swap": 0.80 },
    "is_premium": true
  },
  {
    "name": "Kling.ai",
    "categories": ["T2V", "I2V"],
    "url": "https://klingai.com",
    "scores": { "T2V": 0.79, "I2V": 0.77 },
    "is_premium": true
  },
  {
    "name": "Krea.ai",
    "categories": ["T2I", "I2I", "T2V", "FCE", "I2V", "V2V", "ANI", "UPS"],
    "url": "https://www.krea.ai/",
    "scores": { "T2I": 0.88, "I2I": 0.92, "T2V": 0.90, "FCE": 0.91, "I2V": 0.90, "V2V": 0.91, "ANI": 0.91, "UPS": 0.91 },
    "is_premium": true
  },
  {
    "name": "Leonardo.ai",
    "categories": ["T2I", "I2I", "ANI"],
    "url": "https://leonardo.ai",
    "scores": { "T2I": 0.86, "I2I": 0.84, "ANI": 0.78 },
    "is_premium": true
  },
  {
    "name": "Live Portrait",
    "categories": ["ANI", "FCE"],
    "url": "https://liveportrait.app/",
    "scores": { "ANI": 0.95, "FCE": 0.96 },
    "is_premium": true
  },
  {
    "name": "Luma Labs",
    "categories": ["T2V", "I2V", "ANI"],
    "url": "https://lumalabs.ai",
    "scores": { "T2V": 0.92, "I2V": 0.84, "ANI": 0.82 },
    "is_premium": true
  },
  {
    "name": "Magnific.ai",
    "categories": ["I2I", "UPS"],
    "url": "https://magnific.ai/",
    "scores": { "I2I": 0.99, "UPS": 0.97 },
    "is_premium": true
  },
  {
    "name": "Meshy",
    "categories": ["3D", "I23"],
    "url": "http://www.meshy.ai",
    "scores": { "3D": 0.83, "I23": 0.85 },
    "is_premium": true
  },
  {
    "name": "Midjourney",
    "categories": ["T2I", "I2I", "DES"],
    "url": "https://www.midjourney.com",
    "scores": { "T2I": 0.92, "I2I": 0.88, "DES": 0.90 },
    "is_premium": true
  },
  {
    "name": "Mobirise",
    "categories": ["LLM", "USE", "UI/UX"],
    "url": "https://mobirise.com/",
    "scores": { "LLM": 0.95, "USE": 0.9, "UI/UX": 0.9 },
    "is_premium": true
  },
  {
    "name": "Narakeet",
    "categories": ["T2S", "AUD"],
    "url": "https://www.narakeet.com/",
    "scores": { "T2S": 0.92, "AUD": 0.90 },
    "is_premium": true
  },
  {
    "name": "OpenAI Whisper",
    "categories": ["AUD", "S2T"],
    "url": "https://github.com/openai/whisper",
    "scores": { "AUD": 0.90, "S2T": 0.92 },
    "is_premium": true
  },
  {
    "name": "Perplexity",
    "categories": ["LLM", "USE", "SEA"],
    "url": "https://perplexity.ai",
    "scores": { "LLM": 0.97, "USE": 0.8, "SEA": 0.92 },
    "is_premium": true
  },
  {
    "name": "PhotoMaker",
    "categories": ["T2I", "I2I", "FCE"],
    "url": "https://huggingface.co/spaces/TencentARC/PhotoMaker",
    "scores": { "T2I": 0.82, "I2I": 0.84, "FCE": 0.86 },
    "is_premium": true
  },
  {
    "name": "Pika Labs",
    "categories": ["T2V", "I2V", "ANI"],
    "url": "https://pika.art",
    "scores": { "T2V": 0.85, "I2V": 0.83, "ANI": 0.81 },
    "is_premium": true
  },
  {
    "name": "Pixverse",
    "categories": ["T2V", "I2V", "ANI"],
    "url": "https://pixverse.ai",
    "scores": { "T2V": 0.81, "I2V": 0.88, "ANI": 0.89 },
    "is_premium": true
  },
  {
    "name": "Play.ht",
    "categories": ["AUD", "T2S", "VCL"],
    "url": "https://play.ht",
    "scores": { "AUD": 0.86, "T2S": 0.88, "VCL": 0.87 },
    "is_premium": true
  },
  {
    "name": "RunwayML",
    "categories": ["T2I", "I2I", "T2V", "FCE", "I2V", "V2V", "ANI"],
    "url": "https://runwayml.com",
    "scores": { "T2I": 0.86, "I2I": 0.84, "T2V": 0.88, "FCE": 0.85, "I2V": 0.87, "V2V": 0.86, "ANI": 0.83 },
    "is_premium": true
  },
  {
    "name": "Sana",
    "categories": ["T2I"],
    "url": "https://sana-gen.mit.edu/",
    "scores": { "T2I": 0.78 },
    "is_premium": true
  },
  {
    "name": "Sketch",
    "categories": ["DES", "UI/UX"],
    "url": "https://www.sketch.com",
    "scores": { "DES": 0.88, "UI/UX": 0.90 },
    "is_premium": true
  },
  {
    "name": "Stable Audio",
    "categories": ["AUD", "MUS"],
    "url": "https://www.stableaudio.com",
    "scores": { "AUD": 0.85, "MUS": 0.87 },
    "is_premium": true
  },
  {
    "name": "Stable Video",
    "categories": ["T2V", "I2V"],
    "url": "https://www.stablevideo.com/",
    "scores": { "T2V": 0.89, "I2V": 0.89 },
    "is_premium": true
  },
  {
    "name": "Stable Video Diffusion",
    "categories": ["V2V", "I2V", "ANI"],
    "url": "https://huggingface.co/stabilityai/stable-video-diffusion-img2vid",
    "scores": { "V2V": 0.87, "I2V": 0.86, "ANI": 0.84 },
    "is_premium": true
  },
  {
    "name": "Suno.ai",
    "categories": ["AUD", "MUS"],
    "url": "https://www.suno.ai",
    "scores": { "AUD": 0.86, "MUS": 0.88 },
    "is_premium": true
  },
  {
    "name": "Synthesia",
    "categories": ["T2V", "ANI", "FCE"],
    "url": "https://www.synthesia.io",
    "scores": { "T2V": 0.86, "ANI": 0.84, "FCE": 0.87 },
    "is_premium": true
  },
  {
    "name": "Udio.ai",
    "categories": ["AUD", "MUS"],
    "url": "https://udio.com",
    "scores": { "AUD": 0.83, "MUS": 0.85 },
    "is_premium": true
  },
  {
    "name": "Upscayl",
    "categories": ["UPS"],
    "url": "https://upscayl.org/",
    "scores": { "UPS": 0.88 },
    "is_premium": true
  },
  {
    "name": "Veed.io",
    "categories": ["T2V", "I2V", "VID", "V2V", "DES"],
    "url": "https://www.veed.io",
    "scores": { "T2V": 0.82, "I2V": 0.81, "VID": 0.83, "V2V": 0.84, "DES": 0.83 },
    "is_premium": true
  },
  {
    "name": "Vizcom",
    "categories": ["I2I"],
    "url": "https://www.vizcom.ai/",
    "scores": { "I2I": 0.92 },
    "is_premium": true
  },
  {
    "name": "newarc",
    "categories": ["I2I"],
    "url": "https://www.newarc.ai/",
    "scores": { "I2I": 0.94 },
    "is_premium": true
  }
];
