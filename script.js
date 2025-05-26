class CharacterGenerator {
    constructor() {
        this.geminiApiKey = localStorage.getItem('geminiApiKey') || '';
        this.elevenLabsApiKey = localStorage.getItem('elevenLabsApiKey') || '';
        this.audioElement = document.getElementById('characterAudio');
        this.currentCharacter = null;
        this.isPlaying = false;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.elements = {
            generateBtn: document.getElementById('generateBtn'),
            characterPrompt: document.getElementById('characterPrompt'),
            characterCard: document.getElementById('characterCard'),
            errorMessage: document.getElementById('errorMessage'),
            apiKeysBtn: document.getElementById('apiKeysBtn'),
            apiKeysModal: document.getElementById('apiKeysModal'),
            closeModal: document.querySelector('.close'),
            saveKeysBtn: document.getElementById('saveKeys'),
            geminiKeyInput: document.getElementById('geminiKey'),
            elevenLabsKeyInput: document.getElementById('elevenLabsKey'),
            playVoiceBtn: document.getElementById('playVoiceBtn'),
            playIcon: document.querySelector('.play-icon'),
            pauseIcon: document.querySelector('.pause-icon'),
            voiceText: document.querySelector('.voice-text')
        };
    }

    attachEventListeners() {
        this.elements.generateBtn.addEventListener('click', () => this.generateCharacter());
        this.elements.characterPrompt.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateCharacter();
        });
        
        this.elements.apiKeysBtn.addEventListener('click', () => this.showApiModal());
        this.elements.closeModal.addEventListener('click', () => this.hideApiModal());
        this.elements.saveKeysBtn.addEventListener('click', () => this.saveApiKeys());
        
        this.elements.playVoiceBtn.addEventListener('click', () => this.toggleVoice());
        
        this.audioElement.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.apiKeysModal) {
                this.hideApiModal();
            }
        });
        
        // Load existing API keys
        this.elements.geminiKeyInput.value = this.geminiApiKey;
        this.elements.elevenLabsKeyInput.value = this.elevenLabsApiKey;
    }

    showApiModal() {
        this.elements.apiKeysModal.style.display = 'block';
    }

    hideApiModal() {
        this.elements.apiKeysModal.style.display = 'none';
    }

    saveApiKeys() {
        this.geminiApiKey = this.elements.geminiKeyInput.value.trim();
        this.elevenLabsApiKey = this.elements.elevenLabsKeyInput.value.trim();
        
        localStorage.setItem('geminiApiKey', this.geminiApiKey);
        localStorage.setItem('elevenLabsApiKey', this.elevenLabsApiKey);
        
        this.hideApiModal();
        this.showMessage('API keys saved successfully!', 'success');
    }

    showMessage(message, type = 'error') {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
        this.elements.errorMessage.style.background = type === 'success' 
            ? 'rgba(81, 207, 102, 0.1)' 
            : 'rgba(255, 107, 107, 0.1)';
        this.elements.errorMessage.style.borderColor = type === 'success' 
            ? '#51cf66' 
            : '#ff6b6b';
        this.elements.errorMessage.style.color = type === 'success' 
            ? '#51cf66' 
            : '#ff6b6b';
        
        setTimeout(() => {
            this.elements.errorMessage.classList.add('hidden');
        }, 5000);
    }

    async generateCharacter() {
        const prompt = this.elements.characterPrompt.value.trim();
        
        if (!prompt) {
            this.showMessage('Please enter a character description');
            return;
        }
        
        if (!this.geminiApiKey || !this.elevenLabsApiKey) {
            this.showMessage('Please configure your API keys first');
            this.showApiModal();
            return;
        }
        
        this.setLoading(true);
        this.elements.characterCard.classList.add('hidden');
        this.elements.errorMessage.classList.add('hidden');
        
        try {
            // Step 1: Refine character concept with Gemini
            console.log('Refining character concept...');
            const characterData = await this.refineCharacterConcept(prompt);
            
            // Validate character data
            if (!characterData) {
                throw new Error('Failed to generate character data');
            }
            
            console.log('Character data generated:', characterData);
            
            // Step 2: Generate image with Imagen 3
            console.log('Generating character image...');
            const imageUrl = await this.generateCharacterImage(characterData);
            
            // Step 3: Generate voice with ElevenLabs
            console.log('Generating character voice...');
            let audioUrl = null;
            try {
                audioUrl = await this.generateCharacterVoice(characterData);
            } catch (voiceError) {
                console.error('Voice generation failed:', voiceError);
                // Continue without voice - not critical
            }
            
            // Step 4: Display the character
            this.displayCharacter(characterData, imageUrl, audioUrl);
            
        } catch (error) {
            console.error('Error generating character:', error);
            this.showMessage(error.message || 'Failed to generate character. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async refineCharacterConcept(prompt) {
        const refinementPrompt = `
        Based on this character concept: "${prompt}"
        
        Create a detailed fantasy character profile with the following information in JSON format:
        {
            "name": "A unique fantasy name",
            "race": "The character's race",
            "class": "The character's class/profession",
            "age": "Their age",
            "alignment": "Their moral alignment",
            "description": "A vivid physical description (2-3 sentences)",
            "background": "A brief background story (2-3 sentences)",
            "personality": "Key personality traits",
            "quote": "A characteristic quote they might say (max 10 words)",
            "imagePrompt": "A detailed prompt for generating their portrait image, focusing on appearance, clothing, expression, and fantasy art style"
        }
        
        Make it creative and engaging. The quote should capture their essence.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: refinementPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to refine character concept');
        }

        const data = await response.json();
        console.log('Gemini raw response:', JSON.stringify(data, null, 2));
        
        let characterData;
        try {
            const textContent = data.candidates[0].content.parts[0].text;
            console.log('Gemini text content:', textContent);
            
            // Extract JSON from the response - it might be wrapped in code blocks
            let jsonStr = textContent;
            
            // Try to extract JSON from markdown code blocks
            const jsonMatch = textContent.match(/```(?:json)?\s*({[^`]+})\s*```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1];
            } else {
                // Try to find JSON object in the text
                const startIdx = textContent.indexOf('{');
                const endIdx = textContent.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1) {
                    jsonStr = textContent.substring(startIdx, endIdx + 1);
                }
            }
            
            console.log('Extracted JSON string:', jsonStr);
            characterData = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('Failed to parse character data:', parseError);
            console.error('Raw response:', data.candidates[0].content.parts[0].text);
            
            // Fallback: create default character data
            characterData = {
                name: "Grimbold Ironforge",
                race: "Dwarf",
                class: "Warrior",
                age: "147 years",
                alignment: "Lawful Good",
                description: "A stout dwarf with a magnificent braided beard, wearing battle-worn armor. His eyes gleam with determination beneath bushy eyebrows.",
                background: "Once a master blacksmith, Grimbold took up arms to defend his clan's mountain hold. He now wanders the realm, seeking to right wrongs with his ancestral warhammer.",
                personality: "Gruff but kind-hearted, values honor and loyalty above all",
                quote: "By my beard, justice will prevail!",
                imagePrompt: "Grizzled dwarf warrior with braided beard, battle-worn armor, holding a warhammer, determined expression, fantasy art style"
            };
        }
        
        // Ensure all required fields exist (silently add defaults)
        const requiredFields = ['name', 'race', 'class', 'age', 'alignment', 'description', 'background', 'quote', 'imagePrompt'];
        for (const field of requiredFields) {
            if (!characterData[field]) {
                characterData[field] = field === 'name' ? 'Unknown Hero' : 'Unknown';
            }
        }
        
        // Store for later use
        this.currentCharacter = characterData;
        
        return characterData;
    }

    async generateCharacterImage(characterData) {
        console.log('Generating character image with Imagen 3...');
        console.log('Character data received:', characterData);
        
        // Ensure we have valid character data
        if (!characterData || typeof characterData !== 'object') {
            console.error('Invalid character data provided to generateCharacterImage');
            return this.generatePlaceholderImage({ name: 'Unknown Hero' });
        }
        
        // Create a detailed prompt for the image generation
        const imagePrompt = `${characterData.imagePrompt || 'fantasy character'}, fantasy character portrait, digital art style, detailed, atmospheric lighting, high quality`;
        
        try {
            // Using the predict endpoint for imagen-3.0-generate-002
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instances: [
                        {
                            prompt: imagePrompt
                        }
                    ],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: "1:1",
                        sampleImageSize: "1024",
                        includeSafetyAttributes: false
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Imagen API error:', errorData);
                console.error('Response status:', response.status);
                throw new Error(`Imagen API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Imagen response:', data);
            
            // Handle the predictions response format
            if (!data.predictions || data.predictions.length === 0) {
                throw new Error('No predictions in response');
            }

            const prediction = data.predictions[0];
            let base64Image = prediction.bytesBase64Encoded || prediction.image || prediction;

            // If the image data includes a data URL prefix, remove it
            if (typeof base64Image === 'string' && base64Image.startsWith('data:')) {
                base64Image = base64Image.split(',')[1];
            }

            // Convert base64 to blob URL
            const byteCharacters = atob(base64Image);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            
            return URL.createObjectURL(blob);
            
        } catch (error) {
            console.error('Failed to generate image with Imagen 3:', error);
            // Fallback to placeholder
            try {
                return await this.generatePlaceholderImage(characterData);
            } catch (placeholderError) {
                console.error('Failed to generate placeholder:', placeholderError);
                // Final fallback - return a data URL of a simple colored square
                return 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                        <rect width="400" height="400" fill="#8B4513"/>
                        <text x="200" y="200" font-family="Arial" font-size="120" fill="#D4AF37" text-anchor="middle" dominant-baseline="middle">?</text>
                    </svg>
                `);
            }
        }
    }

    generatePlaceholderImage(characterData) {
        console.log('Generating placeholder image for:', characterData);
        
        // Create a canvas-based placeholder image
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // Generate a color based on the character name
        const colors = [
            ['#8B4513', '#D4AF37'], // Brown and gold
            ['#4B0082', '#9370DB'], // Indigo and purple
            ['#2F4F4F', '#708090'], // Dark slate gray and light slate gray
            ['#8B0000', '#DC143C'], // Dark red and crimson
            ['#006400', '#228B22'], // Dark green and forest green
            ['#000080', '#4169E1'], // Navy and royal blue
        ];
        
        // Safely get color index with multiple fallbacks
        let nameToUse = 'Unknown';
        try {
            if (characterData && characterData.name && typeof characterData.name === 'string') {
                nameToUse = characterData.name;
            }
        } catch (e) {
            console.error('Error accessing character name:', e);
        }
        
        const colorIndex = (nameToUse.charCodeAt(0) || 85) % colors.length; // 85 is 'U' for Unknown
        const [bgColor, textColor] = colors[colorIndex];

        // Create gradient background
        const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 200);
        gradient.addColorStop(0, bgColor + '88');
        gradient.addColorStop(1, bgColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);

        // Add some texture
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * 400,
                Math.random() * 400,
                Math.random() * 3,
                0,
                2 * Math.PI
            );
            ctx.fillStyle = textColor + '22';
            ctx.fill();
        }

        // Add character initials
        ctx.fillStyle = textColor;
        ctx.font = 'bold 120px Cinzel, serif'; // Fallback to serif if Cinzel not loaded
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let initials = '?';
        try {
            if (nameToUse && nameToUse !== 'Unknown') {
                initials = nameToUse.split(' ')
                    .map(word => word[0])
                    .filter(Boolean)
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || '?';
            }
        } catch (e) {
            console.error('Error generating initials:', e);
        }
        
        ctx.fillText(initials, 200, 200);

        // Add a border
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 380, 380);

        // Convert to blob URL
        return new Promise((resolve, reject) => {
            try {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(URL.createObjectURL(blob));
                    } else {
                        reject(new Error('Failed to create blob from canvas'));
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async generateCharacterVoice(characterData) {
        // ⭐ THIS IS THE KEY FEATURE: Using ElevenLabs SFX creatively for character voices!
        // Instead of traditional sound effects, we use prompts like "Say in the style of..."
        // to generate unique character voices through the sound-generation endpoint
        
        // Create voice prompt with safe access
        const characterDescription = characterData?.description || 'mysterious character';
        const characterQuote = characterData?.quote || 'Greetings, traveller';
        
        // This is the creative part - using SFX to generate character voices!
        const voicePrompt = `Say in the style of ${characterDescription.split('.')[0].toLowerCase()}: "${characterQuote}"`;
        console.log('Generating character voice with SFX:', voicePrompt);
        
        // The text-to-sound-effects endpoint is the key feature we're showcasing
        const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
            method: 'POST',
            headers: {
                'xi-api-key': this.elevenLabsApiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: voicePrompt,
                duration_seconds: 5  // Short form character voice
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('ElevenLabs SFX error:', error);
            throw new Error('Failed to generate character voice with SFX');
        }

        const audioBlob = await response.blob();
        return URL.createObjectURL(audioBlob);
    }

    displayCharacter(characterData, imageUrl, audioUrl) {
        console.log('Displaying character:', characterData);
        
        // Update character image
        const characterImage = document.getElementById('characterImage');
        if (characterImage) {
            characterImage.src = imageUrl;
            characterImage.onload = () => {
                characterImage.classList.add('loaded');
            };
        }

        // Update character info with safe access
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || 'Unknown';
            }
        };

        updateElement('characterName', characterData.name);
        updateElement('characterDescription', characterData.description);
        updateElement('characterBackground', characterData.background);
        updateElement('characterRace', characterData.race);
        updateElement('characterClass', characterData.class);
        updateElement('characterAge', characterData.age);
        updateElement('characterAlignment', characterData.alignment);
        updateElement('characterQuote', `"${characterData.quote || 'Silent but deadly'}"`);

        // Set up audio
        if (this.audioElement && audioUrl) {
            this.audioElement.src = audioUrl;
            this.elements.playVoiceBtn.disabled = false;
        } else {
            this.elements.playVoiceBtn.disabled = true;
        }

        // Show the character card
        this.elements.characterCard.classList.remove('hidden');
    }

    toggleVoice() {
        if (!this.audioElement || !this.audioElement.src) {
            console.log('No audio available');
            return;
        }
        
        if (this.isPlaying) {
            this.audioElement.pause();
            this.isPlaying = false;
        } else {
            this.audioElement.play().catch(err => {
                console.error('Failed to play audio:', err);
                this.isPlaying = false;
                this.updatePlayButton();
            });
            this.isPlaying = true;
        }
        this.updatePlayButton();
    }

    updatePlayButton() {
        if (this.isPlaying) {
            this.elements.playIcon.classList.add('hidden');
            this.elements.pauseIcon.classList.remove('hidden');
            this.elements.voiceText.textContent = 'Pause Voice';
        } else {
            this.elements.playIcon.classList.remove('hidden');
            this.elements.pauseIcon.classList.add('hidden');
            this.elements.voiceText.textContent = 'Play Voice';
        }
    }

    setLoading(isLoading) {
        this.elements.generateBtn.disabled = isLoading;
        if (isLoading) {
            this.elements.generateBtn.classList.add('loading');
        } else {
            this.elements.generateBtn.classList.remove('loading');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CharacterGenerator();
});
