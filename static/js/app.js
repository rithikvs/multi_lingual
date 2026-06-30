// Sign Language Translator Web Client
document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const webcam = document.getElementById('webcam');
    const captureCanvas = document.getElementById('capture-canvas');
    const cameraPlaceholder = document.getElementById('camera-placeholder');
    const toggleCameraBtn = document.getElementById('toggle-camera-btn');
    const cameraSelect = document.getElementById('camera-select');
    const boxGuide = document.getElementById('box-guide');
    const systemStatusDot = document.getElementById('system-status-dot');
    const systemStatusText = document.getElementById('system-status-text');
    
    const predictedLetter = document.getElementById('predicted-letter');
    const confidencePct = document.getElementById('confidence-pct');
    const confidenceBar = document.getElementById('confidence-bar');
    const fpsBadge = document.getElementById('fps-badge');
    
    const timerIndicatorContainer = document.getElementById('timer-indicator-container');
    const timerBar = document.getElementById('timer-bar');
    
    const accumulatedText = document.getElementById('accumulated-text');
    const suggestionsList = document.getElementById('suggestions-list');
    
    const speakBtn = document.getElementById('speak-btn');
    const copyBtn = document.getElementById('copy-btn');
    const btnSpace = document.getElementById('btn-space');
    const btnBackspace = document.getElementById('btn-backspace');
    const btnClear = document.getElementById('btn-clear');
    const referenceGrid = document.getElementById('reference-grid');

    // State Variables
    let stream = null;
    let isPredicting = false;
    let predictInterval = null;
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 0;
    
    // Auto-accumulation state
    let stableLetter = null;
    let stableStartTime = null;
    let alreadyLockedThisGesture = false;
    const STABLE_DURATION_MS = 1200; // Hold gesture for 1.2s to lock
    const CONFIDENCE_THRESHOLD = 0.70; // 70% confidence minimum to lock

    // Supported classes (ISL Alphabet, excluding J and Y)
    const islAlphabet = [
        "A", "B", "C", "D", "E", "F", "G", "I", "K", "L", "M", 
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Z"
    ];

    // Word Dictionary for Autocomplete
    const commonWords = [
        "hello", "help", "thank you", "thanks", "name", "good", "morning", "afternoon", "night", 
        "please", "sorry", "welcome", "friend", "happy", "sad", "sign", "language", "india", 
        "indian", "home", "family", "work", "school", "water", "food", "yes", "no", "how", 
        "are", "you", "fine", "what", "where", "when", "why", "who", "meet", "nice", "love", 
        "like", "deaf", "hearing", "understand", "again", "slowly", "name", "teacher", "student"
    ];

    // Initialize Reference Chart
    function buildReferenceChart() {
        referenceGrid.innerHTML = '';
        islAlphabet.forEach(letter => {
            const card = document.createElement('div');
            card.className = 'ref-card';
            card.id = `ref-card-${letter}`;
            card.innerHTML = `
                <div class="ref-letter">${letter}</div>
                <div class="ref-sub">ISL Sign</div>
            `;
            // If they click on card, speak the letter
            card.addEventListener('click', () => speakText(letter));
            referenceGrid.appendChild(card);
        });
    }
    buildReferenceChart();

    // Check system status (connected to backend)
    async function checkBackendStatus() {
        try {
            const response = await fetch('/');
            if (response.ok) {
                systemStatusDot.className = 'dot online';
                systemStatusText.innerText = 'Connected';
            } else {
                throw new Error();
            }
        } catch (e) {
            systemStatusDot.className = 'dot offline';
            systemStatusText.innerText = 'Server Offline';
        }
    }
    checkBackendStatus();
    setInterval(checkBackendStatus, 10000); // Check every 10s

    // Get list of cameras
    async function getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            cameraSelect.innerHTML = '';
            
            if (videoDevices.length === 0) {
                cameraSelect.innerHTML = '<option value="">No camera found</option>';
                return;
            }
            
            videoDevices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${index + 1}`;
                cameraSelect.appendChild(option);
            });
        } catch (e) {
            console.error('Error enumerating cameras:', e);
        }
    }
    getCameras();

    // Camera toggle action
    toggleCameraBtn.addEventListener('click', async () => {
        if (stream) {
            stopWebcam();
        } else {
            await startWebcam();
        }
    });

    // Start Webcam
    async function startWebcam() {
        const deviceId = cameraSelect.value;
        const constraints = {
            video: {
                deviceId: deviceId ? { exact: deviceId } : undefined,
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        };

        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            webcam.srcObject = stream;
            webcam.classList.remove('hidden');
            cameraPlaceholder.classList.add('hidden');
            boxGuide.classList.add('active');
            
            toggleCameraBtn.innerHTML = '<i class="fa-solid fa-square"></i> Stop Camera';
            toggleCameraBtn.className = 'btn btn-secondary';
            
            // Start Prediction loop once metadata is loaded
            webcam.onloadedmetadata = () => {
                startPredicting();
            };
        } catch (err) {
            alert('Could not access camera: ' + err.message);
            console.error('Camera access error:', err);
        }
    }

    // Stop Webcam
    function stopWebcam() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        webcam.srcObject = null;
        webcam.classList.add('hidden');
        cameraPlaceholder.classList.remove('hidden');
        boxGuide.classList.remove('active');
        
        toggleCameraBtn.innerHTML = '<i class="fa-solid fa-power-off"></i> Start Camera';
        toggleCameraBtn.className = 'btn btn-primary';
        
        stopPredicting();
        resetPredictionUI();
    }

    // Prediction controls
    function startPredicting() {
        if (isPredicting) return;
        isPredicting = true;
        
        // Loop prediction every 160ms (approx 6 FPS)
        predictInterval = setInterval(captureAndPredict, 160);
        lastFrameTime = performance.now();
        frameCount = 0;
    }

    function stopPredicting() {
        if (!isPredicting) return;
        isPredicting = false;
        clearInterval(predictInterval);
        predictInterval = null;
    }

    function resetPredictionUI() {
        predictedLetter.innerText = '-';
        predictedLetter.className = 'letter-char';
        confidencePct.innerText = '0%';
        confidenceBar.style.width = '0%';
        fpsBadge.innerText = '0 FPS';
        
        // Clear highlights in reference chart
        document.querySelectorAll('.ref-card').forEach(c => c.classList.remove('highlight'));
        
        // Reset timer
        resetLockTimer();
    }

    function resetLockTimer() {
        stableLetter = null;
        stableStartTime = null;
        alreadyLockedThisGesture = false;
        timerIndicatorContainer.classList.remove('active');
        timerBar.style.width = '0%';
    }

    // Capture Canvas Frame and Post to API
    async function captureAndPredict() {
        if (!stream || webcam.paused || webcam.ended) return;

        // Compute scaling factor if video differs from canvas aspect ratio
        const vWidth = webcam.videoWidth;
        const vHeight = webcam.videoHeight;
        
        if (vWidth === 0 || vHeight === 0) return;

        // Compute Bounding Box Coordinates matching Python crop
        const boxSize = 250; // Size of crop square
        const cx = vWidth / 2;
        const cy = vHeight / 2;
        const x1 = cx - boxSize / 2;
        const y1 = cy - boxSize / 2;

        // Draw cropped ROI onto canvas
        const ctx = captureCanvas.getContext('2d');
        captureCanvas.width = 224;
        captureCanvas.height = 224;
        
        // Draw cropped center of video onto canvas resized to 224x224
        ctx.drawImage(webcam, x1, y1, boxSize, boxSize, 0, 0, 224, 224);
        
        // Convert to base64 JPEG
        const base64Data = captureCanvas.toDataURL('image/jpeg', 0.85);

        try {
            const start = performance.now();
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: base64Data })
            });

            if (!response.ok) throw new Error('API Error');
            
            const data = await response.json();
            
            // Calculate FPS
            const now = performance.now();
            frameCount++;
            if (now - lastFrameTime >= 1000) {
                fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
                fpsBadge.innerText = `${fps} FPS`;
                frameCount = 0;
                lastFrameTime = now;
            }

            if (data.error) {
                systemStatusDot.className = 'dot offline';
                systemStatusText.innerText = 'Error: Model not trained';
                return;
            }

            // Update UI with predictions
            updatePredictionUI(data.predicted_class, data.confidence);
            
        } catch (e) {
            console.error('Prediction failed:', e);
            systemStatusDot.className = 'dot offline';
            systemStatusText.innerText = 'Prediction Error';
        }
    }

    // Update UI Elements with results
    function updatePredictionUI(letter, confidence) {
        const confPct = Math.round(confidence * 100);
        predictedLetter.innerText = letter;
        predictedLetter.className = 'letter-char detected';
        confidencePct.innerText = `${confPct}%`;
        confidenceBar.style.width = `${confPct}%`;

        // Highlight matching letter card in reference grid
        document.querySelectorAll('.ref-card').forEach(c => c.classList.remove('highlight'));
        const activeCard = document.getElementById(`ref-card-${letter}`);
        if (activeCard) {
            activeCard.classList.add('highlight');
        }

        // Logic for Locking Letter (Auto-Accumulator)
        if (confidence >= CONFIDENCE_THRESHOLD) {
            if (stableLetter === letter) {
                // Same letter detected! Check duration
                if (!alreadyLockedThisGesture) {
                    const elapsed = Date.now() - stableStartTime;
                    const percent = Math.min(100, (elapsed / STABLE_DURATION_MS) * 100);
                    
                    timerIndicatorContainer.classList.add('active');
                    timerBar.style.width = `${percent}%`;
                    
                    if (elapsed >= STABLE_DURATION_MS) {
                        appendLetter(letter);
                        alreadyLockedThisGesture = true;
                        timerBar.style.width = '100%';
                        // Flash green background temporarily on lock
                        predictedLetter.style.background = 'rgba(16, 185, 129, 0.2)';
                        setTimeout(() => {
                            predictedLetter.style.background = '';
                        }, 200);
                    }
                }
            } else {
                // Different letter - reset timer
                stableLetter = letter;
                stableStartTime = Date.now();
                alreadyLockedThisGesture = false;
                timerIndicatorContainer.classList.add('active');
                timerBar.style.width = '0%';
            }
        } else {
            // Low confidence - slow/stop timer progress
            if (Date.now() - stableStartTime > 500) {
                resetLockTimer();
            }
        }
    }

    // Append Letter to text display and update suggestions
    function appendLetter(letter) {
        let text = accumulatedText.innerText;
        
        // If content is empty placeholder, remove placeholder spacing
        if (accumulatedText.innerHTML === '<br>' || text.trim() === '') {
            accumulatedText.innerText = '';
            text = '';
        }

        accumulatedText.innerText = text + letter;
        
        // Scroll to bottom
        accumulatedText.scrollTop = accumulatedText.scrollHeight;
        
        // Update word recommendations
        updateSuggestions();
    }

    // Text builder helpers
    btnSpace.addEventListener('click', () => {
        accumulatedText.innerText += ' ';
        updateSuggestions();
    });

    btnBackspace.addEventListener('click', () => {
        const text = accumulatedText.innerText;
        if (text.length > 0) {
            accumulatedText.innerText = text.slice(0, -1);
            updateSuggestions();
        }
    });

    btnClear.addEventListener('click', () => {
        accumulatedText.innerText = '';
        resetLockTimer();
        updateSuggestions();
    });

    copyBtn.addEventListener('click', () => {
        const text = accumulatedText.innerText;
        if (text.trim()) {
            navigator.clipboard.writeText(text);
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: var(--success)"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
            }, 1500);
        }
    });

    // Speak accumulated text
    speakBtn.addEventListener('click', () => {
        const text = accumulatedText.innerText;
        if (text.trim()) {
            speakText(text);
        }
    });

    function speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // stop current speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }

    // Autocomplete / Suggestions Engine
    function updateSuggestions() {
        const text = accumulatedText.innerText;
        
        // Find the last word being typed
        const words = text.split(/\s+/);
        const lastWord = words[words.length - 1].toLowerCase();
        
        suggestionsList.innerHTML = '';
        
        if (lastWord.length === 0) {
            suggestionsList.innerHTML = '<span class="suggestion-placeholder">Type letters to see suggestions</span>';
            return;
        }

        // Filter dictionary words by prefix match
        const matches = commonWords.filter(word => word.startsWith(lastWord));
        
        if (matches.length === 0) {
            suggestionsList.innerHTML = '<span class="suggestion-placeholder">No suggestions found</span>';
            return;
        }

        // Take top 4 suggestions
        matches.slice(0, 4).forEach(match => {
            const chip = document.createElement('span');
            chip.className = 'suggestion-chip';
            chip.innerText = match;
            chip.addEventListener('click', () => {
                // Replace the last word in the text with the complete suggestion
                words[words.length - 1] = match;
                accumulatedText.innerText = words.join(' ') + ' ';
                // Speak the matched word
                speakText(match);
                // Reset suggestions
                updateSuggestions();
            });
            suggestionsList.appendChild(chip);
        });
    }

    // Listen to manual typing edit changes
    accumulatedText.addEventListener('input', updateSuggestions);
});
