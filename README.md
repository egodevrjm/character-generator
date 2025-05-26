# 🎭 Fantasy Character Generator - ElevenLabs SFX Showcase

> A creative demonstration of using **ElevenLabs' text-to-sound-effects API** to generate character voices

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![ElevenLabs](https://img.shields.io/badge/Powered%20by-ElevenLabs-black)](https://elevenlabs.io)
[![Google AI](https://img.shields.io/badge/Google%20AI-Gemini%20%26%20Imagen-blue)](https://ai.google.dev)

## 🌟 Overview

This web application showcases how the ElevenLabs SFX endpoint can be used beyond traditional sound effects to create unique character voices using creative prompt engineering. By using prompts like `speaking in the style of <character> "<quote>"`, we can generate distinctive character voices that bring fantasy characters to life.

## ✨ Features

- **🤖 AI Character Creation**: Uses Google Gemini to expand simple prompts into detailed character profiles
- **🎨 Portrait Generation**: Creates character portraits using Google's Imagen 3
- **🎤 Creative Voice Synthesis**: **The key feature** - Uses ElevenLabs text-to-sound-effects API creatively to generate character voices
- **🔄 Voice Regeneration**: Regenerate button allows creating new voice variations without regenerating the entire character
- **✏️ Custom Quote Editing**: Edit character quotes and regenerate voices with your own text
- **🎵 Ambient Soundscapes**: Generate location-based ambient sounds for immersive character environments
- **📊 Character Collection**: Save and manage up to 10 characters
- **🗣️ DM Narration**: Generate narrator voices for character introductions
- **📄 PDF Export**: Create printable character sheets with improved layout
- **🃏 Animated Character Cards**: Beautiful presentation with character stats, background, and playable voice clips

## 🚀 Quick Start

### Prerequisites

You'll need API keys from:
- **Google AI Studio** (Free) - [Get API Key](https://aistudio.google.com/app/apikey)
- **ElevenLabs** (Free tier available) - [Get API Key](https://elevenlabs.io)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/egodevrjm/character-generator.git
   cd character-generator
   ```

2. Start a local web server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server -p 8000
   ```

3. Open http://localhost:8000 in your browser

4. Click the ⚙️ button to add your API keys

## 🎮 Usage

1. Enter a character concept (e.g., "grizzled dwarf warrior")
2. Click "Generate Character" or press Enter
3. Watch as AI creates:
   - A detailed character profile
   - A unique portrait
   - A character voice speaking their signature quote
4. Use the "Regenerate" button next to the play button to create new voice variations

### New Features

- **🎵 Ambient Sounds**: Click "Ambient Sound" to generate background atmosphere based on the character's location
- **✏️ Edit Quotes**: Click the edit icon next to the quote to customize what your character says
- **📊 Multiple Characters**: Save up to 10 characters and switch between them using tabs
- **📄 Export to PDF**: Create a printable character sheet with all details and space for notes

### Example Prompts

- 🧙‍♂️ "Ancient wizard with cosmic knowledge"
- 🗡️ "Battle-scarred orc shaman"  
- 🏹 "Mysterious dark elf assassin"
- ⚔️ "Noble paladin of the sun god"
- 🎵 "Cheerful halfling bard"

## 🎯 The Creative SFX Approach

### How It Works

1. **Character Analysis**: Gemini creates a detailed character with a signature quote
2. **SFX Prompt Engineering**: The app constructs prompts using the exact format:
   - `speaking in the style of <character description> "<quote>"`
   - Example: `speaking in the style of middle aged dwarf warrior "By my beard, justice will prevail!"`
   - Example: `speaking in the style of young elf mage "Magic flows through all things"`
3. **Voice Generation**: The SFX API interprets these prompts to create unique character voices
4. **Voice Regeneration**: Click the regenerate button to create a new variation of the character's voice

### Why This Works

The text-to-sound-effects endpoint is remarkably versatile. While designed for sound effects, it can interpret prompts with the exact format `speaking in the style of <description> "<words>"` to generate speech with character-appropriate voice qualities. The specific format is crucial for optimal results.

Perfect for:
- 🎮 Game development voice prototypes
- 📚 Storytelling applications
- ✍️ Creative writing aids
- 🎭 Character concept development

## 🛠️ Technical Details

- **Character AI**: Gemini 2.0 Flash for character concept refinement
- **Image Generation**: Imagen 3 (model: imagen-3.0-generate-002) via predict API
- **Voice Generation**: ElevenLabs text-to-sound-effects API with exact prompt format: `speaking in the style of <description> "<words>"`
- **Voice Regeneration**: Regenerate button allows creating voice variations without regenerating the entire character
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Data**: All processing client-side, no server storage

## 📁 Project Structure

```
character-generator/
├── index.html          # Main application
├── style.css           # Fantasy-themed styling
├── script.js           # Core functionality
├── README.md           # Documentation
├── LICENSE             # MIT License
└── test-*.html         # API testing utilities
```

## 🐛 Troubleshooting

### "Failed to generate character image"
- Ensure your Google AI Studio API key has Imagen 3 access
- Check browser console for specific errors
- Try a different character description

### "Failed to generate character voice"
- Verify your ElevenLabs API key
- Check your ElevenLabs credit balance
- Ensure you're online
- Try clicking the regenerate button for a new variation
- The exact prompt format is crucial: `speaking in the style of <description> "<words>"`

### CORS Issues
- Run from a local web server, not file://
- APIs are configured for localhost access

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- ⭐ Star the repository

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Created by **Ryan Morrison** to showcase creative uses of:
- **ElevenLabs text-to-sound-effects API** for character voice generation
- Google Gemini API for character refinement
- Google Imagen 3 for AI portrait generation

This project demonstrates how the ElevenLabs SFX endpoint can be creatively used beyond traditional sound effects to generate unique character voices through clever prompt engineering.

---

<p align="center">
  Made with ❤️ using <a href="https://elevenlabs.io">ElevenLabs</a> | <a href="https://github.com/egodevrjm/character-generator">Star on GitHub</a>
</p>
