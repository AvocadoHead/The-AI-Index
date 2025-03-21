// Define default modules as a global variable
window.defaultModules = [
// List Degraded on 291024

// Large Language Models (LLM)
        { name: "ChatGPT", categories: ["LLM", "USE"], url: "https://chat.openai.com", scores: { "LLM": 0.90, "USE": 0.85 } },
        { name: "Claude", categories: ["LLM", "USE"], url: "https://claude.ai", scores: { "LLM": 0.95, "USE": 0.9 } },
        { name: "Groq", categories: ["LLM", "USE"], url: "https://groq.com/", scores: { "LLM": 0.98, "USE": 0.9 } },
        { name: "Bard", categories: ["LLM", "USE"], url: "https://bard.google.com", scores: { "LLM": 0.85, "USE": 0.75 } },
                
// AI Tools (USE)
        { name: "Grammarly", categories: ["LLM", "USE"], url: "https://www.grammarly.com/", scores: { "LLM": 0.95, "USE": 0.9 } },

// Text to Image (T2I)
        { name: "DALL-E 3", categories: ["T2I", "I2I", "DES"], url: "https://openai.com/dall-e-3", scores: { "T2I": 0.85, "I2I": 0.8, "DES": 0.85 } },
        { name: "Midjourney", categories: ["T2I", "I2I", "DES"], url: "https://www.midjourney.com", scores: { "T2I": 0.92, "I2I": 0.88, "DES": 0.90 } },
        { name: "Fooocus", categories: ["T2I", "I2I", "UPS"], url: "https://colab.research.google.com/github/lllyasviel/Fooocus/blob/main/fooocus_colab.ipynb", scores: { "T2I": 0.88, "I2I": 0.92, "UPS": 0.95 } },
        { name: "Artflow", categories: ["T2I", "FCE"], url: "https://app.artflow.ai/", scores: { "T2I": 0.78, "FCE": 0.94 } },
        { name: "Leonardo.ai", categories: ["T2I", "I2I", "ANI"], url: "https://leonardo.ai", scores: { "T2I": 0.86, "I2I": 0.84, "ANI": 0.78 } },
        { name: "Ideogram", categories: ["T2I", "DES"], url: "https://ideogram.ai", scores: { "T2I": 0.83, "DES": 0.85 } },
        { name: "Adobe Firefly", categories: ["T2I", "I2I", "DES"], url: "https://www.adobe.com/products/firefly", scores: { "T2I": 0.87, "I2I": 0.85, "DES": 0.89 } },
        { name: "Canva", categories: ["T2I", "DES", "ANI"], url: "https://www.canva.com/your-apps/text-to-image", scores: { "T2I": 0.80, "DES": 0.88, "ANI": 0.75 } },
        { name: "PhotoMaker", categories: ["T2I", "I2I", "FCE", ], url: "https://huggingface.co/spaces/TencentARC/PhotoMaker", scores: { "T2I": 0.82, "I2I": 0.84, "FCE": 0.86, } },
        { name: "Astria", categories: ["T2I", "I2I", "UPS"], url: "https://www.astria.ai", scores: { "T2I": 0.81, "I2I": 0.79, "UPS": 0.85 } },
        { name: "Sana", categories: ["T2I"], url: "https://sana-gen.mit.edu/", scores: { "T2I": 0.78 } },

// Image to Image (T2I)
        { name: "Krea.ai", categories: ["T2I", "I2I", "T2V", "FCE", "I2V", "V2V", "ANI", "UPS"], url: "https://www.krea.ai/", scores: { "T2I": 0.88, "I2I": 0.92, "T2V": 0.90, "FCE": 0.91, "I2V": 0.90, "V2V": 0.91, "ANI": 0.91, "UPS": 0.91 } },
        { name: "Vizcom", categories: ["I2I"], url: "https://www.vizcom.ai/", scores: { "I2I": 0.92 } },
        { name: "newarc", categories: ["I2I"], url: "https://www.newarc.ai/", scores: { "I2I": 0.94 } },

// Text to Video (T2V)
        { name: "HaliuoAI", categories: ["T2V", "I2V"], url: "https://hailuoai.com/video", scores: { "T2V": 0.82, "I2V": 0.80 } },
        { name: "Kling.ai", categories: ["T2V", "I2V"], url: "https://klingai.com", scores: { "T2V": 0.79, "I2V": 0.77 } },
        { name: "RunwayML", categories: ["T2I", "I2I", "T2V", "FCE", "I2V", "V2V", "ANI"], url: "https://runwayml.com", scores: { "T2I": 0.86, "I2I": 0.84, "T2V": 0.88, "FCE": 0.85, "I2V": 0.87, "V2V": 0.86, "ANI": 0.83 } },
        { name: "Pika Labs", categories: ["T2V", "I2V", "ANI"], url: "https://pika.art", scores: { "T2V": 0.85, "I2V": 0.83, "ANI": 0.81 } },
        { name: "Kaiber", categories: ["T2V", "I2V", "ANI", "MUS"], url: "https://kaiber.ai", scores: { "T2V": 0.84, "I2V": 0.82, "ANI": 0.80, "MUS": 0.78 } },
        { name: "Synthesia", categories: ["T2V", "ANI", "FCE"], url: "https://www.synthesia.io", scores: { "T2V": 0.86, "ANI": 0.84, "FCE": 0.87 } },
        { name: "Stable Video", categories: ["T2V", "I2V"], url: "https://www.stablevideo.com/", scores: { "T2V": 0.89, "I2V": 0.89 } },
        { name: "Veed.io", categories: ["T2V", "I2V", "VID", "V2V", "DES"], url: "https://www.veed.io", scores: { "T2V": 0.82, "I2V": 0.81, "VID": 0.83,"V2V": 0.84, "DES": 0.83 } },
        { name: "Kaps", categories: ["USE"], url: "https://kaps.co.il", scores: { "T2V": 0.79, "I2V": 0.77, "ANI": 0.78, "Face Swap": 0.80 } },
        
// Image to Video (I2V)
        { name: "Hedra", categories: ["FCE"], url: "https://www.hedra.com/", scores: { "FCE": 0.95 } },
        { name: "Pixverse", categories: ["T2V", "I2V", "ANI"], url: "https://pixverse.ai", scores: { "T2V": 0.81, "I2V": 0.88, "ANI": 0.89, } },
        { name: "D-ID", categories: ["I2V", "FCE"], url: "https://studio.d-id.com", scores: { "I2V": 0.85, "FCE": 0.87 } },
        { name: "Luma Labs", categories: ["T2V", "I2V", "ANI"], url: "https://lumalabs.ai", scores: { "T2V": 0.92, "I2V": 0.84, "ANI": 0.82 } },

// Video Repaint (V2V)
        { name: "Domo", categories: ["T2V", "ANI", "V2V", "FCE"], url: "https://domo.com", scores: { "T2V": 0.80, "ANI": 0.78, "V2V": 0.92, "FCE": 0.82 } },
        { name: "CapCut", categories: ["VID", "V2V", "DES", "ANI"], url: "https://www.capcut.com", scores: { "VID": 0.94, "V2V": 0.85, "DES": 0.83, "ANI": 0.81 } },
        { name: "Stable Video Diffusion", categories: ["V2V", "I2V", "ANI"], url: "https://huggingface.co/stabilityai/stable-video-diffusion-img2vid", scores: { "V2V": 0.87, "I2V": 0.86, "ANI": 0.84 } },

// 3D Tools (3D)
        { name: "Blender", categories: ["3D", "ANI", "DES"], url: "https://www.blender.org", scores: { "3D": 0.92, "ANI": 0.90, "DES": 0.88 } },
        { name: "Cinema 4D", categories: ["3D", "ANI", "DES"], url: "https://www.maxon.net/cinema-4d", scores: { "3D": 0.91, "ANI": 0.89, "DES": 0.87 } },

// Design (DES)
        { name: "Figma", categories: ["DES", "UI/UX"], url: "https://www.figma.com", scores: { "DES": 0.93, "UI/UX": 0.95 } },
        { name: "Sketch", categories: ["DES", "UI/UX"], url: "https://www.sketch.com", scores: { "DES": 0.88, "UI/UX": 0.90 } },
        { name: "InteriorAI", categories: ["DES", "I2I"], url: "https://interiorai.com/", scores: { "DES": 0.91, "I2I": 0.9 } },

//Upscale/Enhance (UPS)
        { name: "Magnific.ai", categories: ["I2I", "UPS"], url: "https://magnific.ai/", scores: { "I2I": 0.99, "UPS": 0.97 } },
        { name: "Upscayl", categories: ["UPS"], url: "https://upscayl.org/", scores: { "UPS": 0.88 } },

// Audio (AUD)
        { name: "Descript", categories: ["AUD", "V2V", "Voice Clone"], url: "https://www.descript.com", scores: { "AUD": 0.87, "V2V": 0.85, "VCL": 0.86 } },
        { name: "Adobe Podcast", categories: ["AUD" ], url: "https://podcast.adobe.com/", scores: { "AUD": 0.92 } },
        { name: "Fadr", categories: ["AUD", "MUS"], url: "https://fadr.com/", scores: { "AUD": 0.93, "MUS": 0.75 } },

// Video Tools (VID)
        { name: "Haiper", categories: ["T2V", "I2V", "VID"], url: "https://haiper.ai/", scores: { "T2V": 0.82, "I2V": 0.9, "VID": 0.92 } },

// User Interface/User Experience Design (UX/UI)
        { name: "Mobirise", categories: ["LLM", "USE", "UI/UX"], url: "https://mobirise.com/", scores: { "LLM": 0.95, "USE": 0.9, "UI/UX": 0.9 } },

// Animation (ANI)
        { name: "Live Portrait", categories: ["ANI", "FCE"], url: "https://liveportrait.app/", scores: { "ANI": 0.95, "FCE": 0.96 } },
                
//Face Editing (FCE)
        { name: "Advanced Live Portrait", categories: ["ANI", "FCE"], url: "https://github.com/PowerHouseMan/ComfyUI-AdvancedLivePortrait", scores: { "FCE": 0.96 } },
        { name: "FacePoke", categories: ["FCE"], url: "https://facepoke.org/", scores: { "FCE": 0.96 } },

// AI Search (SEA)
        { name: "Perplexity", categories: ["LLM", "USE", "SEA"], url: "https://perplexity.ai", scores: { "LLM": 0.97, "USE": 0.8, "SEA": 0.92 } },

// Content Generation (CON)
        { name: "Jasper", categories: ["CON", "LLM", "USE"], url: "https://www.jasper.ai/", scores: { "CON": 0.82, "LLM": 0.80, "USE": 0.79 } },
                
// Presentation Creation (PRE)
        { name: "Gamma", categories: ["PRE", "LLM", "USE"], url: "https://gamma.app/", scores: { "PRE": 0.92, "LLM": 0.88, "USE": 0.92 } },
                
// Image To 3D (I23)
        { name: "Meshy", categories: ["3D", "I23"], url: "http://www.meshy.ai", scores: { "3D": 0.83, "I23": 0.85 } },  
                
// Text To Speech (T2S)
        { name: "Narakeet", categories: ["T2S", "AUD"], url: "https://www.narakeet.com/", scores: { "T2S": 0.92, "AUD": 0.90 } },
        
// Speech To Text (S2T)
        { name: "OpenAI Whisper", categories: ["AUD", "S2T"], url: "https://github.com/openai/whisper", scores: { "AUD": 0.90, "S2T": 0.92 } },
        
// Voice Cloning (VCL)
        { name: "ElevenLabs", categories: ["AUD", "T2S", "VCL"], url: "https://elevenlabs.io", scores: { "AUD": 0.89, "T2S": 0.91, "VCL": 0.90 } },
        { name: "Play.ht", categories: ["AUD", "T2S", "VCL"], url: "https://play.ht", scores: { "AUD": 0.86, "T2S": 0.88, "VCL": 0.87 } },

//Music Generation (MUS)
        { name: "Suno.ai", categories: ["AUD", "MUS"], url: "https://www.suno.ai", scores: { "AUD": 0.86, "MUS": 0.88 } },
        { name: "Udio.ai", categories: ["AUD", "MUS"], url: "https://udio.com", scores: { "AUD": 0.83, "MUS": 0.85 } },
        { name: "Stable Audio", categories: ["AUD", "MUS"], url: "https://www.stableaudio.com", scores: { "AUD": 0.85, "MUS": 0.87 } }
];
