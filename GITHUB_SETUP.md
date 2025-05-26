# 🚀 Pushing to GitHub

Follow these steps to push your Character Generator to GitHub:

## 1. Create a New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `character-generator` (or `elevenlabs-character-generator`)
3. Description: "Creative showcase of ElevenLabs text-to-sound-effects API for character voice generation"
4. Set to **Public** (to showcase your work!)
5. **DON'T** initialize with README, .gitignore, or license (we already have them)
6. Click "Create repository"

## 2. Initialize Git and Push

In your terminal, navigate to the project folder and run:

```bash
cd /Users/ryanmorrison/Code/character-generator

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: ElevenLabs SFX Character Voice Generator"

# Add your GitHub repository as origin (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/character-generator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 3. Enable GitHub Pages (Optional)

To host the demo directly from GitHub:

1. Go to your repository Settings
2. Scroll to "Pages" section
3. Source: Deploy from a branch
4. Branch: main, folder: / (root)
5. Save

Your app will be live at: `https://YOUR_USERNAME.github.io/character-generator/`

## 4. Update the README

Replace `yourusername` in README.md with your actual GitHub username:
- Clone URL
- Issues URL
- Repository links

## 5. Add Topics

In your GitHub repo, click the gear icon next to "About" and add topics:
- `elevenlabs`
- `text-to-speech`
- `sound-effects`
- `ai`
- `character-generator`
- `voice-synthesis`

## 6. Security Note

The app stores API keys in localStorage (client-side only). For production use, consider:
- Using environment variables
- Implementing a backend proxy
- Adding rate limiting

## 🎉 Done!

Your ElevenLabs SFX showcase is now on GitHub! Share it with the community and tag @elevenlabs on social media!

---

## Useful Git Commands

```bash
# Check status
git status

# Add specific files
git add filename.js

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature/new-feature

# Push updates
git add .
git commit -m "Your commit message"
git push
```
