class CharacterGenerator {
    constructor() {
        this.geminiApiKey = localStorage.getItem('geminiApiKey') || '';
        this.elevenLabsApiKey = localStorage.getItem('elevenLabsApiKey') || '';
        this.audioElement = document.getElementById('characterAudio');
        this.dmAudioElement = document.getElementById('dmNarrationAudio');
        this.ambientAudioElement = document.getElementById('ambientAudio');
        this.currentCharacter = null;
        this.currentAudioBlob = null;
        this.isPlaying = false;
        this.isDMNarrating = false;
        this.isPlayingAmbient = false;
        this.currentAmbientBlob = null;
        
        // User preferences
        this.imageStyle = localStorage.getItem('imageStyle') || 'fantasy art';
        this.dmVoice = localStorage.getItem('dmVoice') || '21m00Tcm4TlvDq8ikWAM';
        
        // Multiple character management
        this.characters = [];
        this.currentCharacterIndex = -1;
        this.maxCharacters = 10;
        
        // Random character prompts for "Surprise Me!"
        this.randomPrompts = [
            'mysterious shadow assassin',
            'cheerful halfling bard',
            'ancient dragon sage',
            'battle-scarred orc chieftain',
            'ethereal elven archmage',
            'grizzled dwarf blacksmith',
            'cunning goblin merchant',
            'noble human paladin',
            'wild forest druid',
            'enigmatic tiefling warlock',
            'jovial tavern keeper',
            'wise monastery monk',
            'dashing pirate captain',
            'scholarly wizard librarian',
            'fierce barbarian warrior',
            'charming rogue thief',
            'mystical fortune teller',
            'veteran mercenary captain',
            'young apprentice mage',
            'legendary beast hunter',
            'peaceful nature cleric',
            'dark necromancer lord',
            'skilled elven ranger',
            'mighty storm giant',
            'clever gnome inventor',
            'vengeful vampire countess',
            'jovial halfling chef',
            'mysterious planar traveler',
            'battle-worn gladiator champion',
            'scheming devil merchant',
            'wise turtle monk',
            'flamboyant bard entertainer',
            'gruff mountain hermit',
            'ethereal fey princess',
            'clockwork automaton butler',
            'seafaring minotaur captain',
            'desert nomad mystic',
            'young street urchin rogue',
            'ancient tree spirit guardian',
            'crystal dragon scholar'
        ];
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadCharacters();
        
        // Ensure regenerate buttons are disabled on startup
        this.elements.regenerateImageBtn.disabled = true;
        this.elements.regenerateVoiceBtn.disabled = true;
        this.elements.downloadVoiceBtn.disabled = true;
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
            regenerateVoiceBtn: document.getElementById('regenerateVoiceBtn'),
            downloadVoiceBtn: document.getElementById('downloadVoiceBtn'),
            exportPdfBtn: document.getElementById('exportPdfBtn'),
            playIcon: document.querySelector('.play-icon'),
            pauseIcon: document.querySelector('.pause-icon'),
            voiceText: document.querySelector('.voice-text'),
            surpriseBtn: document.getElementById('surpriseBtn'),
            characterSelector: document.getElementById('characterSelector'),
            characterTabs: document.getElementById('characterTabs'),
            newCharacterBtn: document.getElementById('newCharacterBtn'),
            dmNarrateBtn: document.getElementById('dmNarrateBtn'),
            regenerateImageBtn: document.getElementById('regenerateImageBtn'),
            imageStyleSelect: document.getElementById('imageStyle'),
            dmVoiceSelect: document.getElementById('dmVoice'),
            tabBtns: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content'),
            ambientSoundBtn: document.getElementById('ambientSoundBtn'),
            editQuoteBtn: document.getElementById('editQuoteBtn'),
            quoteEditContainer: document.getElementById('quoteEditContainer'),
            customQuoteInput: document.getElementById('customQuoteInput'),
            saveQuoteBtn: document.getElementById('saveQuoteBtn'),
            cancelQuoteBtn: document.getElementById('cancelQuoteBtn')
        };
    }

    attachEventListeners() {
        this.elements.generateBtn.addEventListener('click', () => this.generateCharacter());
        this.elements.characterPrompt.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateCharacter();
        });
        
        this.elements.surpriseBtn.addEventListener('click', () => this.generateRandomCharacter());
        this.elements.newCharacterBtn.addEventListener('click', () => this.createNewCharacter());
        
        this.elements.apiKeysBtn.addEventListener('click', () => this.showApiModal());
        this.elements.closeModal.addEventListener('click', () => this.hideApiModal());
        this.elements.saveKeysBtn.addEventListener('click', () => this.saveApiKeys());
        
        this.elements.playVoiceBtn.addEventListener('click', () => this.toggleVoice());
        this.elements.regenerateVoiceBtn.addEventListener('click', () => this.regenerateVoice());
        this.elements.downloadVoiceBtn.addEventListener('click', () => this.downloadVoice());
        this.elements.exportPdfBtn.addEventListener('click', () => this.exportToPDF());
        this.elements.dmNarrateBtn.addEventListener('click', () => this.generateDMNarration());
        this.elements.regenerateImageBtn.addEventListener('click', () => this.regenerateImage());
        this.elements.ambientSoundBtn.addEventListener('click', () => this.toggleAmbientSound());
        
        // Custom quote editing
        this.elements.editQuoteBtn.addEventListener('click', () => this.startEditingQuote());
        this.elements.saveQuoteBtn.addEventListener('click', () => this.saveCustomQuote());
        this.elements.cancelQuoteBtn.addEventListener('click', () => this.cancelEditingQuote());
        
        this.audioElement.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });
        
        // Tab switching
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.apiKeysModal) {
                this.hideApiModal();
            }
        });
        
        // Load existing API keys
        this.elements.geminiKeyInput.value = this.geminiApiKey;
        this.elements.elevenLabsKeyInput.value = this.elevenLabsApiKey;
        
        // Load preferences
        this.elements.imageStyleSelect.value = this.imageStyle;
        this.elements.dmVoiceSelect.value = this.dmVoice;
        
        // Log current settings for debugging
        console.log('Loaded image style:', this.imageStyle);
        console.log('Image style select value:', this.elements.imageStyleSelect.value);
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
        
        // Update the image style and DM voice from the selects
        const newImageStyle = this.elements.imageStyleSelect.value;
        const newDmVoice = this.elements.dmVoiceSelect.value;
        
        // Check if image style changed
        const styleChanged = this.imageStyle !== newImageStyle;
        
        this.imageStyle = newImageStyle;
        this.dmVoice = newDmVoice;
        
        localStorage.setItem('geminiApiKey', this.geminiApiKey);
        localStorage.setItem('elevenLabsApiKey', this.elevenLabsApiKey);
        localStorage.setItem('imageStyle', this.imageStyle);
        localStorage.setItem('dmVoice', this.dmVoice);
        
        this.hideApiModal();
        
        if (styleChanged) {
            this.showMessage('Settings saved! New image style will be used for future generations.', 'success');
        } else {
            this.showMessage('Settings saved successfully!', 'success');
        }
    }
    
    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Remove active class from all tabs and contents
        this.elements.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.elements.tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.querySelector(`.${tabName}-tab`);
        
        if (selectedTab) {
            selectedTab.classList.add('active');
            console.log('Activated tab button:', tabName);
        } else {
            console.error('Tab button not found:', tabName);
        }
        
        if (selectedContent) {
            selectedContent.classList.add('active');
            console.log('Activated tab content:', tabName);
        } else {
            console.error('Tab content not found:', tabName);
        }
    }

    showMessage(message, type = 'error') {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
        
        let bgColor, borderColor, textColor;
        
        switch (type) {
            case 'success':
                bgColor = 'rgba(81, 207, 102, 0.1)';
                borderColor = '#51cf66';
                textColor = '#51cf66';
                break;
            case 'info':
                bgColor = 'rgba(52, 152, 219, 0.1)';
                borderColor = '#3498db';
                textColor = '#3498db';
                break;
            default: // error
                bgColor = 'rgba(255, 107, 107, 0.1)';
                borderColor = '#ff6b6b';
                textColor = '#ff6b6b';
                break;
        }
        
        this.elements.errorMessage.style.background = bgColor;
        this.elements.errorMessage.style.borderColor = borderColor;
        this.elements.errorMessage.style.color = textColor;
        
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
        
        // Reset character index for new generation
        this.currentCharacterIndex = -1;
        
        // Disable regenerate buttons until character is loaded
        this.elements.regenerateImageBtn.disabled = true;
        
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
            
            // Always enable regenerate buttons
            this.elements.regenerateImageBtn.disabled = false;
            
        } catch (error) {
            console.error('Error generating character:', error);
            this.showMessage(error.message || 'Failed to generate character. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }
    
    async regenerateImage() {
        // Only regenerate the image, nothing else
        if (!this.currentCharacter) {
            this.showMessage('No character to regenerate image for');
            return;
        }
        
        if (!this.geminiApiKey) {
            this.showMessage('Gemini API key required for image generation');
            return;
        }
        
        // Disable button and show loading state
        this.elements.regenerateImageBtn.disabled = true;
        this.elements.regenerateImageBtn.classList.add('loading');
        
        // Add loading state to image
        const characterImage = document.getElementById('characterImage');
        characterImage.classList.remove('loaded');
        
        try {
            console.log('Regenerating character image...');
            console.log('Current image style setting:', this.imageStyle);
            const imageUrl = await this.generateCharacterImage(this.currentCharacter);
            
            if (imageUrl) {
                // Update the image
                characterImage.src = imageUrl;
                characterImage.onload = () => {
                    characterImage.classList.add('loaded');
                };
                
                // Update the stored character image if we're working with a saved character
                if (this.currentCharacterIndex >= 0 && this.currentCharacterIndex < this.characters.length) {
                    this.characters[this.currentCharacterIndex].imageUrl = imageUrl;
                }
                
                this.showMessage('Image regenerated successfully!', 'success');
            } else {
                this.showMessage('Failed to regenerate image');
                characterImage.classList.add('loaded'); // Remove loading state
            }
        } catch (error) {
            console.error('Image regeneration failed:', error);
            this.showMessage('Failed to regenerate image');
            characterImage.classList.add('loaded'); // Remove loading state
        } finally {
            // Re-enable button and remove loading state
            this.elements.regenerateImageBtn.disabled = false;
            this.elements.regenerateImageBtn.classList.remove('loading');
        }
    }
    
    generateRandomCharacter() {
        // Pick a random prompt
        const randomIndex = Math.floor(Math.random() * this.randomPrompts.length);
        const randomPrompt = this.randomPrompts[randomIndex];
        
        // Set the prompt in the input field
        this.elements.characterPrompt.value = randomPrompt;
        
        // Add a little dice roll animation to the button
        this.elements.surpriseBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.elements.surpriseBtn.style.transform = 'rotate(0deg)';
        }, 300);
        
        // Generate the character
        this.generateCharacter();
    }
    
    createNewCharacter() {
        // Clear current character and reset the form
        this.currentCharacter = null;
        this.currentAudioBlob = null;
        this.currentCharacterIndex = -1;
        
        // Stop and clear ambient audio
        if (this.isPlayingAmbient) {
            this.ambientAudioElement.pause();
            this.isPlayingAmbient = false;
            this.updateAmbientButton();
        }
        this.ambientAudioElement.src = '';
        this.currentAmbientBlob = null;
        
        // Clear the input
        this.elements.characterPrompt.value = '';
        
        // Hide the character card
        this.elements.characterCard.classList.add('hidden');
        
        // Disable regenerate buttons
        this.elements.regenerateImageBtn.disabled = true;
        
        // Update tabs to show no selection
        this.updateCharacterTabs();
        
        // Focus on the input
        this.elements.characterPrompt.focus();
    }
    
    addCharacter(characterData, imageUrl, audioUrl) {
        // Check if we've reached the max
        if (this.characters.length >= this.maxCharacters) {
            this.showMessage(`Maximum of ${this.maxCharacters} characters reached. Delete one to create more.`);
            return false;
        }
        
        // Add the new character
        const newCharacter = {
            data: characterData,
            imageUrl: imageUrl,
            audioUrl: audioUrl,
            audioBlob: this.currentAudioBlob,
            id: Date.now() // Simple unique ID
        };
        
        this.characters.push(newCharacter);
        this.currentCharacterIndex = this.characters.length - 1;
        
        // Save to localStorage
        this.saveCharacters();
        
        // Update the UI
        this.updateCharacterTabs();
        
        // Show the selector if it was hidden
        this.elements.characterSelector.classList.remove('hidden');
        
        return true;
    }
    
    selectCharacter(index) {
        if (index < 0 || index >= this.characters.length) return;
        
        this.currentCharacterIndex = index;
        const character = this.characters[index];
        
        // Stop and clear ambient audio for previous character
        if (this.isPlayingAmbient) {
            this.ambientAudioElement.pause();
            this.isPlayingAmbient = false;
            this.updateAmbientButton();
        }
        this.ambientAudioElement.src = '';
        this.currentAmbientBlob = null;
        
        // Restore the character data
        this.currentCharacter = character.data;
        this.currentAudioBlob = character.audioBlob;
        
        // Display the character
        this.displayCharacter(character.data, character.imageUrl, character.audioUrl);
        
        // Enable regenerate buttons
        this.elements.regenerateImageBtn.disabled = false;
        
        // Update tabs to show selection
        this.updateCharacterTabs();
        
        // Clear the input prompt when selecting an existing character
        this.elements.characterPrompt.value = '';
    }
    
    deleteCharacter(index) {
        if (index < 0 || index >= this.characters.length) return;
        
        // Confirm deletion
        const character = this.characters[index];
        if (!confirm(`Delete ${character.data.name}?`)) return;
        
        // Remove the character
        this.characters.splice(index, 1);
        
        // Adjust current index if needed
        if (this.currentCharacterIndex === index) {
            // Select the previous character or clear if none
            if (this.characters.length > 0) {
                this.selectCharacter(Math.max(0, index - 1));
            } else {
                this.createNewCharacter();
                this.elements.characterSelector.classList.add('hidden');
            }
        } else if (this.currentCharacterIndex > index) {
            this.currentCharacterIndex--;
        }
        
        // Save and update UI
        this.saveCharacters();
        this.updateCharacterTabs();
    }
    
    updateCharacterTabs() {
        this.elements.characterTabs.innerHTML = '';
        
        this.characters.forEach((character, index) => {
            const tab = document.createElement('div');
            tab.className = 'character-tab';
            if (index === this.currentCharacterIndex) {
                tab.classList.add('active');
            }
            
            tab.innerHTML = `
                <div class="character-tab-name">${character.data.name}</div>
                <div class="character-tab-info">${character.data.race} ${character.data.class}</div>
                <div class="character-tab-delete" title="Delete character">×</div>
            `;
            
            // Click to select
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('character-tab-delete')) {
                    this.selectCharacter(index);
                }
            });
            
            // Delete button
            tab.querySelector('.character-tab-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCharacter(index);
            });
            
            this.elements.characterTabs.appendChild(tab);
        });
    }
    
    saveCharacters() {
        // Save character data to localStorage (without blob URLs which can't be serialized)
        const saveData = this.characters.map(char => ({
            data: char.data,
            id: char.id
            // Note: We can't save blob URLs or audio blobs, they'll be lost on refresh
        }));
        
        localStorage.setItem('fantasyCharacters', JSON.stringify(saveData));
    }
    
    loadCharacters() {
        const savedData = localStorage.getItem('fantasyCharacters');
        if (savedData) {
            try {
                const characters = JSON.parse(savedData);
                // Note: We can only restore the character data, not images/audio
                characters.forEach(char => {
                    this.characters.push({
                        data: char.data,
                        id: char.id,
                        imageUrl: null, // Lost on refresh
                        audioUrl: null, // Lost on refresh
                        audioBlob: null // Lost on refresh
                    });
                });
                
                if (this.characters.length > 0) {
                    this.elements.characterSelector.classList.remove('hidden');
                    this.updateCharacterTabs();
                    
                    // Show a note about lost media
                    this.showMessage('Note: Character data restored, but images and voices need to be regenerated', 'info');
                }
            } catch (e) {
                console.error('Failed to load saved characters:', e);
            }
        }
    }

    async refineCharacterConcept(prompt) {
        const refinementPrompt = `
        Based on this character concept: "${prompt}"
        
        Create a detailed fantasy character profile with the following information in JSON format:
        {
            "name": "A unique fantasy name",
            "gender": "The character's gender (male, female, or non-binary)",
            "race": "The character's race",
            "class": "The character's class/profession",
            "age": "Their age",
            "alignment": "Their moral alignment",
            "description": "A vivid physical description (2-3 sentences)",
            "background": "A brief background story (2-3 sentences)",
            "personality": "Key personality traits",
            "quote": "A characteristic quote they might say (max 10 words)",
            "imagePrompt": "A detailed prompt for generating their portrait image, focusing on appearance, clothing, expression, and fantasy art style",
            "location": "Where they might be found (tavern, forest, castle, dungeon, etc)"
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
                gender: "male",
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
        const requiredFields = ['name', 'gender', 'race', 'class', 'age', 'alignment', 'description', 'background', 'quote', 'imagePrompt', 'location'];
        for (const field of requiredFields) {
            if (!characterData[field]) {
                if (field === 'name') {
                    characterData[field] = 'Unknown Hero';
                } else if (field === 'gender') {
                    // Try to detect gender from description or name if not provided
                    characterData[field] = this.detectGender(characterData);
                } else if (field === 'location') {
                    characterData[field] = 'tavern';
                } else {
                    characterData[field] = 'Unknown';
                }
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
        // Always use the current imageStyle setting
        const styleToUse = this.imageStyle || 'fantasy art';
        console.log('Using image style:', styleToUse);
        
        const imagePrompt = `${characterData.imagePrompt || 'fantasy character'}, ${styleToUse} style, detailed, atmospheric lighting, high quality, character portrait`;
        console.log('Full image prompt:', imagePrompt);
        
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

    detectGender(characterData) {
        // Try to detect gender from description or name
        const description = (characterData.description || '').toLowerCase();
        const name = (characterData.name || '').toLowerCase();
        const background = (characterData.background || '').toLowerCase();
        
        // Common male indicators
        const maleIndicators = ['he ', 'his ', 'him ', 'himself', 'man ', 'boy ', 'male ', 'son ', 'father', 'brother', 'king ', 'lord ', 'sir '];
        const femaleIndicators = ['she ', 'her ', 'hers ', 'herself', 'woman ', 'girl ', 'female ', 'daughter', 'mother', 'sister', 'queen ', 'lady ', 'maiden'];
        
        // Check description and background
        const textToCheck = description + ' ' + background;
        
        let maleCount = 0;
        let femaleCount = 0;
        
        maleIndicators.forEach(indicator => {
            if (textToCheck.includes(indicator)) maleCount++;
        });
        
        femaleIndicators.forEach(indicator => {
            if (textToCheck.includes(indicator)) femaleCount++;
        });
        
        // Common gendered name endings (very rough heuristic)
        if (name.endsWith('a') || name.endsWith('ia') || name.endsWith('ina') || name.endsWith('ella')) {
            femaleCount++;
        }
        if (name.endsWith('us') || name.endsWith('os') || name.endsWith('or') || name.endsWith('ion')) {
            maleCount++;
        }
        
        // Determine gender based on counts
        if (maleCount > femaleCount) {
            return 'male';
        } else if (femaleCount > maleCount) {
            return 'female';
        } else {
            // Default to neutral if unclear
            return 'non-binary';
        }
    }

    async generateCharacterVoice(characterData) {
        // ⭐ THIS IS THE KEY FEATURE: Using ElevenLabs SFX creatively for character voices!
        // The exact format is crucial: speaking in the style of <gender> <age> <race> <class> "<words>"
        // THE WORDS MUST BE IN DOUBLE QUOTES!
        // Example: speaking in the style of male old dwarf warrior "By my beard, justice will prevail!"
        
        // Extract key descriptors from the character
        const gender = characterData?.gender || 'mysterious';
        const race = characterData?.race || 'mysterious';
        const characterClass = characterData?.class || 'warrior';
        const age = characterData?.age || 'ancient';
        const characterQuote = characterData?.quote || 'Greetings, traveller';
        
        // Build the character description including gender
        let shortDescription = '';
        
        // Add gender (male/female/non-binary)
        if (gender.toLowerCase() !== 'non-binary' && gender.toLowerCase() !== 'unknown') {
            shortDescription += `${gender.toLowerCase()} `;
        }
        
        // Add age descriptor if it's descriptive
        if (age.toLowerCase().includes('young')) shortDescription += 'young ';
        else if (age.toLowerCase().includes('old') || age.toLowerCase().includes('ancient')) shortDescription += 'old ';
        else if (age.toLowerCase().includes('middle')) shortDescription += 'middle aged ';
        
        // Add race and class
        shortDescription += `${race.toLowerCase()} ${characterClass.toLowerCase()}`;
        shortDescription = shortDescription.trim();
        
        // Create the exact format: speaking in the style of <description> "<quote>"
        // CRITICAL: The quote MUST be wrapped in double quotes!
        const voicePrompt = `speaking in the style of ${shortDescription} "${characterQuote}"`;
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
        this.currentAudioBlob = audioBlob; // Store for download
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
        updateElement('characterGender', characterData.gender ? characterData.gender.charAt(0).toUpperCase() + characterData.gender.slice(1) : 'Unknown');
        updateElement('characterRace', characterData.race);
        updateElement('characterClass', characterData.class);
        updateElement('characterAge', characterData.age);
        updateElement('characterAlignment', characterData.alignment);
        updateElement('characterQuote', `"${characterData.quote || 'Silent but deadly'}"`);

        // Set up audio
        if (this.audioElement && audioUrl) {
            this.audioElement.src = audioUrl;
            this.elements.playVoiceBtn.disabled = false;
            this.elements.regenerateVoiceBtn.disabled = false;
            this.elements.downloadVoiceBtn.disabled = false;
        } else {
            this.elements.playVoiceBtn.disabled = true;
            this.elements.regenerateVoiceBtn.disabled = false; // Can still try to generate
            this.elements.downloadVoiceBtn.disabled = true;
        }

        // Show the character card
        this.elements.characterCard.classList.remove('hidden');
        
        // Add to character collection if this is a new character (not selected from tabs)
        if (this.currentCharacterIndex === -1) {
            if (this.addCharacter(characterData, imageUrl, audioUrl)) {
                this.showMessage(`${characterData.name} added to your collection!`, 'success');
            }
        }
    }

    async regenerateVoice() {
        // Only regenerate the voice, nothing else
        if (!this.currentCharacter) {
            this.showMessage('No character to regenerate voice for');
            return;
        }
        
        if (!this.elevenLabsApiKey) {
            this.showMessage('ElevenLabs API key required');
            return;
        }
        
        // Disable buttons and show loading state
        this.elements.regenerateVoiceBtn.disabled = true;
        this.elements.regenerateVoiceBtn.classList.add('loading');
        this.elements.playVoiceBtn.disabled = true;
        
        // Stop any playing audio
        if (this.isPlaying) {
            this.audioElement.pause();
            this.isPlaying = false;
            this.updatePlayButton();
        }
        
        try {
            console.log('Regenerating character voice...');
            const audioUrl = await this.generateCharacterVoice(this.currentCharacter);
            
            if (audioUrl) {
                // Update the audio element with new URL
                this.audioElement.src = audioUrl;
                this.elements.playVoiceBtn.disabled = false;
                this.elements.downloadVoiceBtn.disabled = false;
                
                // Update the stored character audio if we're working with a saved character
                if (this.currentCharacterIndex >= 0 && this.currentCharacterIndex < this.characters.length) {
                    this.characters[this.currentCharacterIndex].audioUrl = audioUrl;
                    this.characters[this.currentCharacterIndex].audioBlob = this.currentAudioBlob;
                }
                
                this.showMessage('Voice regenerated successfully!', 'success');
            } else {
                this.showMessage('Failed to regenerate voice');
            }
        } catch (error) {
            console.error('Voice regeneration failed:', error);
            this.showMessage('Failed to regenerate voice');
        } finally {
            // Re-enable buttons and remove loading state
            this.elements.regenerateVoiceBtn.disabled = false;
            this.elements.regenerateVoiceBtn.classList.remove('loading');
        }
    }
    
    async toggleAmbientSound() {
        if (!this.currentCharacter) {
            this.showMessage('No character to generate ambient sound for');
            return;
        }
        
        if (!this.elevenLabsApiKey) {
            this.showMessage('ElevenLabs API key required for ambient sounds');
            return;
        }
        
        // If already playing, stop it
        if (this.isPlayingAmbient) {
            this.ambientAudioElement.pause();
            this.isPlayingAmbient = false;
            this.updateAmbientButton();
            return;
        }
        
        // If we already have ambient audio for this character, just play it
        if (this.ambientAudioElement.src) {
            this.ambientAudioElement.play();
            this.isPlayingAmbient = true;
            this.updateAmbientButton();
            return;
        }
        
        // Generate new ambient sound
        this.elements.ambientSoundBtn.disabled = true;
        this.elements.ambientSoundBtn.classList.add('loading');
        
        try {
            const location = this.currentCharacter.location || 'tavern';
            const ambientPrompt = `ambient sounds of a ${location}, background atmosphere, environmental sounds`;
            
            console.log('Generating ambient sound:', ambientPrompt);
            
            const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
                method: 'POST',
                headers: {
                    'xi-api-key': this.elevenLabsApiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: ambientPrompt,
                    duration_seconds: 10  // Longer duration for ambient
                })
            });
            
            if (!response.ok) {
                const error = await response.text();
                console.error('ElevenLabs SFX error:', error);
                throw new Error('Failed to generate ambient sound');
            }
            
            const audioBlob = await response.blob();
            this.currentAmbientBlob = audioBlob;
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Set up and play the ambient sound
            this.ambientAudioElement.src = audioUrl;
            this.ambientAudioElement.volume = 0.3; // Lower volume for background
            this.ambientAudioElement.play();
            this.isPlayingAmbient = true;
            this.updateAmbientButton();
            
            this.showMessage(`Playing ${location} ambient sounds`, 'success');
            
        } catch (error) {
            console.error('Failed to generate ambient sound:', error);
            this.showMessage('Failed to generate ambient sound');
        } finally {
            this.elements.ambientSoundBtn.disabled = false;
            this.elements.ambientSoundBtn.classList.remove('loading');
        }
    }
    
    updateAmbientButton() {
        if (this.isPlayingAmbient) {
            this.elements.ambientSoundBtn.classList.add('playing');
            this.elements.ambientSoundBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <span>Stop Ambient</span>
            `;
        } else {
            this.elements.ambientSoundBtn.classList.remove('playing');
            this.elements.ambientSoundBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
                </svg>
                <span>Ambient Sound</span>
            `;
        }
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
    
    startEditingQuote() {
        const currentQuote = this.currentCharacter?.quote || '';
        this.elements.customQuoteInput.value = currentQuote;
        this.elements.quoteEditContainer.classList.remove('hidden');
        this.elements.customQuoteInput.focus();
    }
    
    cancelEditingQuote() {
        this.elements.quoteEditContainer.classList.add('hidden');
        this.elements.customQuoteInput.value = '';
    }
    
    async saveCustomQuote() {
        const newQuote = this.elements.customQuoteInput.value.trim();
        
        if (!newQuote) {
            this.showMessage('Please enter a quote');
            return;
        }
        
        if (!this.currentCharacter) {
            this.showMessage('No character loaded');
            return;
        }
        
        // Update the character's quote
        this.currentCharacter.quote = newQuote;
        
        // Update the displayed quote
        const quoteElement = document.getElementById('characterQuote');
        if (quoteElement) {
            quoteElement.textContent = `"${newQuote}"`;
        }
        
        // Hide the edit container
        this.elements.quoteEditContainer.classList.add('hidden');
        
        // Update saved character if applicable
        if (this.currentCharacterIndex >= 0 && this.currentCharacterIndex < this.characters.length) {
            this.characters[this.currentCharacterIndex].data.quote = newQuote;
            this.saveCharacters();
        }
        
        this.showMessage('Quote updated! You can now regenerate the voice with the new quote.', 'success');
        
        // Optionally auto-regenerate voice
        if (confirm('Would you like to regenerate the voice with the new quote?')) {
            await this.regenerateVoice();
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
    
    downloadVoice() {
        if (!this.currentAudioBlob || !this.currentCharacter) {
            this.showMessage('No voice available to download');
            return;
        }
        
        // Create a download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(this.currentAudioBlob);
        link.download = `${this.currentCharacter.name.replace(/[^a-z0-9]/gi, '_')}_voice.mp3`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        
        this.showMessage('Voice downloaded successfully!', 'success');
    }
    
    async exportToPDF() {
        if (!this.currentCharacter) {
            this.showMessage('No character to export');
            return;
        }
        
        try {
            // Show loading state
            this.elements.exportPdfBtn.disabled = true;
            this.elements.exportPdfBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
                    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.364 6.364l-2.828-2.828M8.464 8.464L5.636 5.636m12.728 0l-2.828 2.828m-7.072 7.072l-2.828 2.828"/>
                </svg>
                <span>Generating PDF...</span>
            `;
            
            // Create PDF with print-friendly design
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // PDF dimensions
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            let yPos = margin;
            
            // Helper function to add wrapped text
            const addWrappedText = (text, x, y, maxWidth, lineHeight = 5) => {
                const lines = pdf.splitTextToSize(text, maxWidth);
                lines.forEach((line, i) => {
                    pdf.text(line, x, y + (i * lineHeight));
                });
                return y + (lines.length * lineHeight);
            };
            
            // Add decorative border
            pdf.setDrawColor(139, 69, 19); // Brown color
            pdf.setLineWidth(1);
            pdf.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (margin * 2) + 10);
            
            // Add inner border
            pdf.setLineWidth(0.5);
            pdf.rect(margin - 3, margin - 3, contentWidth + 6, pageHeight - (margin * 2) + 6);
            
            // Title
            pdf.setFontSize(28);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont(undefined, 'bold');
            pdf.text('Fantasy Character Sheet', pageWidth / 2, yPos + 10, { align: 'center' });
            yPos += 20;
            
            // Character name
            pdf.setFontSize(22);
            pdf.setTextColor(139, 69, 19); // Brown color for name
            pdf.text(this.currentCharacter.name, pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;
            
            // Add horizontal line
            pdf.setDrawColor(212, 175, 55); // Gold color
            pdf.setLineWidth(0.5);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
            
            // Character Image (if available)
            const characterImage = document.getElementById('characterImage');
            let imageAdded = false;
            const imgSize = 60;
            const imageSpace = imgSize + 10; // Space reserved for image + padding
            
            if (characterImage && characterImage.src) {
                try {
                    // Check if it's a blob URL or base64 (these should work)
                    if (characterImage.src.startsWith('blob:') || characterImage.src.startsWith('data:')) {
                        // Add image on the right side
                        pdf.addImage(characterImage.src, 'PNG', pageWidth - margin - imgSize, yPos, imgSize, imgSize);
                        imageAdded = true;
                    } else if (!characterImage.src.includes('data:image/svg')) {
                        // For other URLs, try to convert to canvas (might fail due to CORS)
                        const imgCanvas = document.createElement('canvas');
                        const ctx = imgCanvas.getContext('2d');
                        imgCanvas.width = characterImage.naturalWidth || 400;
                        imgCanvas.height = characterImage.naturalHeight || 400;
                        
                        // Create a new image to bypass potential CORS issues
                        const tempImg = new Image();
                        tempImg.crossOrigin = 'anonymous';
                        tempImg.onload = function() {
                            ctx.drawImage(tempImg, 0, 0, imgCanvas.width, imgCanvas.height);
                            const imgData = imgCanvas.toDataURL('image/png');
                            
                            // Add image on the right side
                            pdf.addImage(imgData, 'PNG', pageWidth - margin - imgSize, yPos, imgSize, imgSize);
                        };
                        tempImg.src = characterImage.src;
                        imageAdded = true;
                    }
                } catch (imgError) {
                    console.log('Could not add character image to PDF:', imgError.message);
                }
            }
            
            // Basic Information Section
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont(undefined, 'bold');
            pdf.text('Basic Information', margin, yPos);
            yPos += 8;
            
            // Basic stats - single column if image present, two columns otherwise
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            let statsY = yPos;
            
            if (imageAdded) {
                // Single column layout when image is present
                const maxTextWidth = contentWidth - imageSpace - 10;
                
                // Gender
                pdf.setFont(undefined, 'bold');
                pdf.text('Gender:', margin, statsY);
                pdf.setFont(undefined, 'normal');
                pdf.text(this.currentCharacter.gender || 'Unknown', margin + 20, statsY);
                statsY += 7;
                
                // Race
                pdf.setFont(undefined, 'bold');
                pdf.text('Race:', margin, statsY);
                pdf.setFont(undefined, 'normal');
                pdf.text(this.currentCharacter.race || 'Unknown', margin + 20, statsY);
                statsY += 7;
                
                // Class
                pdf.setFont(undefined, 'bold');
                pdf.text('Class:', margin, statsY);
                pdf.setFont(undefined, 'normal');
                pdf.text(this.currentCharacter.class || 'Unknown', margin + 20, statsY);
                statsY += 7;
                
                // Age
                pdf.setFont(undefined, 'bold');
                pdf.text('Age:', margin, statsY);
                pdf.setFont(undefined, 'normal');
                const ageText = this.currentCharacter.age || 'Unknown';
                const ageLines = pdf.splitTextToSize(ageText, maxTextWidth - 20);
                pdf.text(ageLines[0], margin + 15, statsY);
                if (ageLines.length > 1) {
                    statsY += 5;
                    pdf.text(ageLines[1], margin + 15, statsY);
                }
                statsY += 7;
                
                // Alignment
                pdf.setFont(undefined, 'bold');
                pdf.text('Alignment:', margin, statsY);
                pdf.setFont(undefined, 'normal');
                pdf.text(this.currentCharacter.alignment || 'Unknown', margin + 30, statsY);
            } else {
                // Two column layout when no image
                const col1X = margin;
                const col2X = margin + (contentWidth / 2);
                
                // Column 1
                pdf.setFont(undefined, 'bold');
                pdf.text('Gender:', col1X, statsY);
                pdf.setFont(undefined, 'normal');
                pdf.text(this.currentCharacter.gender || 'Unknown', col1X + 20, statsY);
                statsY += 7;
                
                pdf.setFont(undefined, 'bold');
                pdf.text('Race:', col1X, statsY);
                pdf.setFont(undefined, 'normal');
                pdf.text(this.currentCharacter.race || 'Unknown', col1X + 20, statsY);
                statsY += 7;
                
                pdf.setFont(undefined, 'bold');
                pdf.text('Class:', col1X, statsY);
                pdf.setFont(undefined, 'normal');
                pdf.text(this.currentCharacter.class || 'Unknown', col1X + 20, statsY);
                
                // Column 2
                statsY = yPos;
                pdf.setFont(undefined, 'bold');
                pdf.text('Age:', col2X, statsY);
                pdf.setFont(undefined, 'normal');
                pdf.text(this.currentCharacter.age || 'Unknown', col2X + 15, statsY);
                statsY += 7;
                
                pdf.setFont(undefined, 'bold');
                pdf.text('Alignment:', col2X, statsY);
                pdf.setFont(undefined, 'normal');
                pdf.text(this.currentCharacter.alignment || 'Unknown', col2X + 25, statsY);
            }
            
            yPos = statsY + 15;
            
            // Move yPos below image if image was added
            if (imageAdded && yPos < (statsY - 15 + imgSize)) {
                yPos = statsY - 15 + imgSize + 10;
            }
            
            // Add a stats box for RPG use
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.5);
            pdf.rect(margin, yPos, contentWidth, 30);
            
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('Character Stats (for RPG use)', margin + 5, yPos + 7);
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            pdf.text('STR: ___  DEX: ___  CON: ___  INT: ___  WIS: ___  CHA: ___', margin + 5, yPos + 15);
            pdf.text('HP: ___/___  AC: ___  Initiative: ___  Speed: ___', margin + 5, yPos + 23);
            yPos += 35;
            
            // Description Section
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text('Physical Description', margin, yPos);
            yPos += 8;
            
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            yPos = addWrappedText(
                this.currentCharacter.description || 'No description available',
                margin, yPos, contentWidth // Use full width since image should be above this section now
            );
            yPos += 10;
            
            // Background Section
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text('Background', margin, yPos);
            yPos += 8;
            
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            yPos = addWrappedText(
                this.currentCharacter.background || 'No background available',
                margin, yPos, contentWidth
            );
            yPos += 10;
            
            // Personality Section
            if (this.currentCharacter.personality) {
                pdf.setFontSize(14);
                pdf.setFont(undefined, 'bold');
                pdf.text('Personality', margin, yPos);
                yPos += 8;
                
                pdf.setFontSize(11);
                pdf.setFont(undefined, 'normal');
                yPos = addWrappedText(this.currentCharacter.personality, margin, yPos, contentWidth);
                yPos += 10;
            }
            
            // Character Quote
            if (this.currentCharacter.quote) {
                pdf.setFontSize(14);
                pdf.setFont(undefined, 'bold');
                pdf.text('Signature Quote', margin, yPos);
                yPos += 8;
                
                pdf.setFontSize(12);
                pdf.setFont(undefined, 'italic');
                pdf.setTextColor(139, 69, 19);
                pdf.text(`"${this.currentCharacter.quote}"`, pageWidth / 2, yPos, { align: 'center' });
                pdf.setFont(undefined, 'normal');
                pdf.setTextColor(0, 0, 0);
                yPos += 15;
            }
            
            // Abilities & Skills Section (empty for player use)
            if (yPos < pageHeight - 100) {
                pdf.setFontSize(14);
                pdf.setFont(undefined, 'bold');
                pdf.text('Abilities & Skills', margin, yPos);
                yPos += 8;
                
                // Draw lines for abilities
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.1);
                const lineSpacing = 8;
                const numAbilityLines = 5;
                
                for (let i = 0; i < numAbilityLines; i++) {
                    pdf.line(margin, yPos + (i * lineSpacing), pageWidth - margin, yPos + (i * lineSpacing));
                }
                yPos += (numAbilityLines * lineSpacing) + 10;
            }
            
            // Notes Section (empty for player use)
            if (yPos < pageHeight - 60) {
                pdf.setFontSize(14);
                pdf.setFont(undefined, 'bold');
                pdf.text('Additional Notes', margin, yPos);
                yPos += 8;
                
                // Draw lines for notes
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.1);
                const lineSpacing = 8;
                const numLines = Math.floor((pageHeight - yPos - 30) / lineSpacing);
                
                for (let i = 0; i < numLines; i++) {
                    pdf.line(margin, yPos + (i * lineSpacing), pageWidth - margin, yPos + (i * lineSpacing));
                }
            }
            
            // Footer
            pdf.setFontSize(9);
            pdf.setTextColor(150, 150, 150);
            pdf.text(
                `Generated on ${new Date().toLocaleDateString('en-GB')} • Created with ElevenLabs SFX Character Voice Generator`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
            
            // Save the PDF
            pdf.save(`${this.currentCharacter.name.replace(/[^a-z0-9]/gi, '_')}_character_sheet.pdf`);
            
            this.showMessage('Character sheet exported successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to export PDF:', error);
            this.showMessage('Failed to export character sheet');
        } finally {
            // Restore button state
            this.elements.exportPdfBtn.disabled = false;
            this.elements.exportPdfBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19L8,14H10L11.43,17.59L13,14H15L13,19H10Z"/>
                </svg>
                <span>Export Character as PDF</span>
            `;
        }
    }
    
    async generateDMNarration() {
        if (!this.currentCharacter) {
            this.showMessage('No character to narrate');
            return;
        }
        
        if (!this.elevenLabsApiKey) {
            this.showMessage('ElevenLabs API key required for narration');
            return;
        }
        
        // Stop any existing narration
        if (this.isDMNarrating) {
            this.dmAudioElement.pause();
            this.isDMNarrating = false;
            this.updateDMButton();
            return;
        }
        
        // Show loading state
        this.elements.dmNarrateBtn.disabled = true;
        this.elements.dmNarrateBtn.classList.add('loading');
        
        try {
            // Create the narration text
            const narrationText = this.createDMNarrationText(this.currentCharacter);
            console.log('DM Narration text:', narrationText);
            
            // Use ElevenLabs text-to-speech with selected narrator voice
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.dmVoice}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': this.elevenLabsApiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: narrationText,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.75,
                        similarity_boost: 0.75,
                        style: 0.0,
                        use_speaker_boost: true
                    }
                })
            });
            
            if (!response.ok) {
                const error = await response.text();
                console.error('ElevenLabs TTS error:', error);
                throw new Error('Failed to generate narration');
            }
            
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Set up and play the narration
            this.dmAudioElement.src = audioUrl;
            this.dmAudioElement.play();
            this.isDMNarrating = true;
            this.updateDMButton();
            
            // Handle narration end
            this.dmAudioElement.onended = () => {
                this.isDMNarrating = false;
                this.updateDMButton();
                URL.revokeObjectURL(audioUrl);
            };
            
        } catch (error) {
            console.error('Failed to generate DM narration:', error);
            this.showMessage('Failed to generate narration');
        } finally {
            this.elements.dmNarrateBtn.disabled = false;
            this.elements.dmNarrateBtn.classList.remove('loading');
        }
    }
    
    createDMNarrationText(characterData) {
        // Create a natural-sounding narration for the DM to read
        const { name, gender, race, characterClass, age, alignment, description, background, personality, quote } = characterData;
        
        let narration = `You encounter ${name}, `;
        
        // Add gender if not non-binary
        if (gender && gender.toLowerCase() !== 'non-binary' && gender.toLowerCase() !== 'unknown') {
            narration += `a ${gender} `;
        } else {
            narration += `a `;
        }
        
        // Add age descriptor
        if (age && age.toLowerCase().includes('young')) {
            narration += `young `;
        } else if (age && (age.toLowerCase().includes('old') || age.toLowerCase().includes('ancient'))) {
            narration += `venerable `;
        }
        
        // Add race and class
        narration += `${race} ${characterData.class}.\n\n`;
        
        // Add description
        narration += `${description}\n\n`;
        
        // Add background
        narration += `${background}\n\n`;
        
        // Add personality
        if (personality) {
            narration += `This ${race} is ${personality}.\n\n`;
        }
        
        // Add alignment
        if (alignment && alignment.toLowerCase() !== 'unknown') {
            narration += `${name} follows the path of ${alignment}.\n\n`;
        }
        
        // Add the character's signature quote
        if (quote) {
            narration += `As you approach, you hear them say: \"${quote}\"\n`;
        }
        
        return narration;
    }
    
    updateDMButton() {
        if (this.isDMNarrating) {
            this.elements.dmNarrateBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <span>Stop Narration</span>
            `;
        } else {
            this.elements.dmNarrateBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                </svg>
                <span>DM Narration</span>
            `;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CharacterGenerator();
});
