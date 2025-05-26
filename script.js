class CharacterGenerator {
    constructor() {
        this.geminiApiKey = localStorage.getItem('geminiApiKey') || '';
        this.elevenLabsApiKey = localStorage.getItem('elevenLabsApiKey') || '';
        this.audioElement = document.getElementById('characterAudio');
        this.currentCharacter = null;
        this.currentAudioBlob = null;
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
            regenerateVoiceBtn: document.getElementById('regenerateVoiceBtn'),
            downloadVoiceBtn: document.getElementById('downloadVoiceBtn'),
            exportPdfBtn: document.getElementById('exportPdfBtn'),
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
        this.elements.regenerateVoiceBtn.addEventListener('click', () => this.regenerateVoice());
        this.elements.downloadVoiceBtn.addEventListener('click', () => this.downloadVoice());
        this.elements.exportPdfBtn.addEventListener('click', () => this.exportToPDF());
        
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
            "gender": "The character's gender (male, female, or non-binary)",
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
        const requiredFields = ['name', 'gender', 'race', 'class', 'age', 'alignment', 'description', 'background', 'quote', 'imagePrompt'];
        for (const field of requiredFields) {
            if (!characterData[field]) {
                if (field === 'name') {
                    characterData[field] = 'Unknown Hero';
                } else if (field === 'gender') {
                    // Try to detect gender from description or name if not provided
                    characterData[field] = this.detectGender(characterData);
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
            
            // Temporarily hide buttons for cleaner PDF
            const exportSection = document.querySelector('.export-section');
            exportSection.style.display = 'none';
            
            // Capture the character card
            const characterCard = document.getElementById('characterCard');
            const canvas = await html2canvas(characterCard, {
                backgroundColor: '#1a1a1a',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            });
            
            // Restore export section
            exportSection.style.display = 'block';
            
            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Calculate dimensions to fit A4
            const imgWidth = 190; // A4 width minus margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add title
            pdf.setFontSize(24);
            pdf.setTextColor(212, 175, 55);
            pdf.text('Fantasy Character Sheet', 105, 20, { align: 'center' });
            
            // Add subtitle
            pdf.setFontSize(12);
            pdf.setTextColor(150, 150, 150);
            pdf.text('Generated with ElevenLabs SFX Character Voice', 105, 30, { align: 'center' });
            
            // Add the character card image
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
            
            // Add generation date
            pdf.setFontSize(10);
            pdf.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 105, 280, { align: 'center' });
            
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CharacterGenerator();
});
