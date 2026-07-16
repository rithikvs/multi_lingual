import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Videocam as CameraOnIcon, 
  VideocamOff as CameraOffIcon, 
  VolumeUp as SpeakIcon, 
  Delete as ClearIcon, 
  Backspace as BackspaceIcon,
  Send as SendIcon,
  Translate as LangIcon
} from '@mui/icons-material';

const SignDetector = ({ textScale, ttsLanguage, onCompiledTextSend, onEmergencyGesture, onShareMessage }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [model, setModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [languageMode, setLanguageMode] = useState('ISL'); // ISL or ASL
  
  const [prediction, setPrediction] = useState('None');
  const [confidence, setConfidence] = useState(0);
  const [compiledText, setCompiledText] = useState('');
  
  // Track consecutive predictions to avoid jittery outputs
  const [sequenceBuffer, setSequenceBuffer] = useState([]);
  const lastPredictionsRef = useRef([]);
  const cameraHelperRef = useRef(null);
  const lastEmergencyRef = useRef(0);

  // Load the TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      setModelLoading(true);
      try {
        // Look for model in public folder /model/model.json
        const loadedModel = await tf.loadLayersModel('/model/model.json');
        setModel(loadedModel);
        console.log('TensorFlow.js CNN-LSTM model loaded successfully!');
      } catch (err) {
        console.warn('TF.js Model not found/failed to load. Running on high-fidelity heuristics engine...');
      } finally {
        setModelLoading(false);
      }
    };
    loadModel();
  }, []);

  // Set up MediaPipe hands detector
  useEffect(() => {
    let active = true;
    
    // Inject MediaPipe Scripts from window if available
    const setupMediaPipe = () => {
      if (!window.Hands || !window.Camera) {
        // Poll for script loading
        setTimeout(setupMediaPipe, 500);
        return;
      }
      
      const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onHandResults);

      if (videoRef.current && cameraActive) {
        cameraHelperRef.current = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        cameraHelperRef.current.start();
      }
    };

    if (cameraActive) {
      setupMediaPipe();
    }

    return () => {
      active = false;
      if (cameraHelperRef.current) {
        cameraHelperRef.current.stop();
      }
    };
  }, [cameraActive]);

  // Handle predictions on hand landmarks results
  const onHandResults = async (results) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvasCtx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    // Clear canvas
    canvasCtx.clearRect(0, 0, width, height);

    // Draw camera frame mirroring inside canvas
    canvasCtx.save();
    canvasCtx.translate(width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, width, height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // Draw hand meshes/connectors
      if (window.drawConnectors && window.drawLandmarks) {
        window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
        window.drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 4 });
      }

      // 1. Core Coordinates extraction
      const rawCoords = landmarks.map(lm => [lm.x, lm.y, lm.z]);
      
      // Center relative to Wrist (landmark 0)
      const wrist = rawCoords[0];
      const centered = rawCoords.map(c => [c[0] - wrist[0], c[1] - wrist[1], c[2] - wrist[2]]);
      
      // Normalize scaling factor (using landmark 0 to 9 distance)
      const mcp = centered[9];
      const handSpan = Math.sqrt(mcp[0]**2 + mcp[1]**2 + mcp[2]**2);
      const normalizedCoords = centered.map(c => handSpan > 0 ? [c[0]/handSpan, c[1]/handSpan, c[2]/handSpan] : c);
      const flatNormalized = normalizedCoords.flat(); // 63 features

      let predClass = 'None';
      let predConf = 0.0;

      // 2. RUN CLASSIFICATION
      if (model) {
        // TF.JS Inference
        // Accumulate a temporal sequence buffer of length 5
        let currentBuffer = [...sequenceBuffer, flatNormalized];
        if (currentBuffer.length > 5) {
          currentBuffer.shift();
        }
        setSequenceBuffer(currentBuffer);

        if (currentBuffer.length === 5) {
          const inputTensor = tf.tensor3d([currentBuffer]); // Shape [1, 5, 63]
          const outputTensor = model.predict(inputTensor);
          const probabilities = await outputTensor.data();
          
          let maxIdx = 0;
          let maxProb = 0;
          for (let i = 0; i < probabilities.length; i++) {
            if (probabilities[i] > maxProb) {
              maxProb = probabilities[i];
              maxIdx = i;
            }
          }
          
          // Map to class labels
          const classLabels = ["A","B","C","D","E","F","G","I","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Z"];
          predClass = classLabels[maxIdx] || 'Unknown';
          predConf = maxProb;
          
          inputTensor.dispose();
          outputTensor.dispose();
        }
      } else {
        // Fallback to high-quality geometrical heuristic engine
        const heuristicResult = runHeuristicClassification(landmarks);
        predClass = heuristicResult.class;
        predConf = heuristicResult.confidence;
      }

      // Update state
      setPrediction(predClass);
      setConfidence(predConf);

      // 3. Noise Filter and Compiler trigger
      if (predClass !== 'None' && predConf > 0.75) {
        const lastPreds = lastPredictionsRef.current;
        lastPreds.push(predClass);
        if (lastPreds.length > 15) {
          lastPreds.shift();
        }

        // Trigger character compiler if we detect the same class 10 times consecutively
        const consecutiveCount = lastPreds.filter(p => p === predClass).length;
        if (consecutiveCount === 12 && lastPreds[lastPreds.length - 1] === predClass) {
          if (['HELP', 'SOS'].includes(predClass)) {
            const now = Date.now();
            const emergencyCooldownMs = 15000;
            if (now - lastEmergencyRef.current > emergencyCooldownMs) {
              lastEmergencyRef.current = now;
              onEmergencyGesture?.(predClass);
            }
            lastPredictionsRef.current = [];
            return;
          }

          // Check if this character is different from the last compiler character
          const lastChar = compiledText[compiledText.length - 1];
          if (lastChar !== predClass) {
            setCompiledText(prev => prev + predClass);
            logRecognitionEvent(predClass, predConf);
            // Flash feedback text synthesis if preferred or small beep
            lastPredictionsRef.current = []; // Reset buffer
          }
        }
      }
    } else {
      setPrediction('None');
      setConfidence(0);
    }
    
    canvasCtx.restore();
  };

  // Log recognition events to MongoDB backend logs API
  const logRecognitionEvent = async (char, conf) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post('http://localhost:5000/api/logs', {
        signRecognized: char,
        confidence: conf,
        signLanguageType: languageMode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Failed to log recognition event to database:', e.message);
    }
  };

  // Heuristics Engine for hand gestures (angle calculations)
  const runHeuristicClassification = (lm) => {
    // lm is an array of 21 landmark structures: {x, y, z}
    
    // Check if fingers are extended by comparing tips y-coordinates to knuckle joint y-coordinates
    // Since camera coordinates are 0 at top and 1 at bottom, lower y means higher up.
    // However, the canvas is mirrored. We check y-differences.
    const isExtended = (tip, pip, mcp) => {
      // Finger is extended if tip is higher than joint pip and mcp
      return tip.y < pip.y && pip.y < mcp.y;
    };

    const indexExtended = isExtended(lm[8], lm[7], lm[5]);
    const middleExtended = isExtended(lm[12], lm[11], lm[9]);
    const ringExtended = isExtended(lm[16], lm[15], lm[13]);
    const pinkyExtended = isExtended(lm[20], lm[19], lm[17]);
    
    // Thumb: checks x coordinate distances since it moves horizontally
    // Wrist is lm[0], Thumb MCP is lm[2], Tip is lm[4]
    const thumbExtended = Math.abs(lm[4].x - lm[0].x) > Math.abs(lm[2].x - lm[0].x);

    // Heuristics for dynamic or specific alphabets
    // 1. Peace Sign ("V" or "2")
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return { class: 'V', confidence: 0.95 };
    }
    
    // 2. Alphabet "L"
    if (indexExtended && thumbExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return { class: 'L', confidence: 0.92 };
    }

    // 3. Alphabet "Y" (Shaka sign)
    if (thumbExtended && pinkyExtended && !indexExtended && !middleExtended && !ringExtended) {
      return { class: 'Y', confidence: 0.90 };
    }

    // 4. Alphabet "W" (Three fingers)
    if (indexExtended && middleExtended && ringExtended && !pinkyExtended) {
      return { class: 'W', confidence: 0.94 };
    }

    // 5. Alphabet "I" (Pinky only)
    if (pinkyExtended && !indexExtended && !middleExtended && !ringExtended) {
      return { class: 'I', confidence: 0.89 };
    }

    // 6. Emergency HELP gesture: flat open palm.
    if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
      return { class: 'HELP', confidence: 0.96 };
    }

    // 7. Emergency SOS gesture: closed fist.
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && lm[4].y < lm[10].y) {
      return { class: 'SOS', confidence: 0.94 };
    }

    // 8. Alphabet "C" (Curved hand shape)
    // Checking if wrist and fingers are curved
    const isCurved = !indexExtended && !middleExtended && !ringExtended && !pinkyExtended && 
                     lm[8].x > lm[6].x && lm[12].x > lm[10].x;
    if (isCurved) {
      return { class: 'C', confidence: 0.80 };
    }

    // 9. Alphabet "F" (OK sign - Index & Thumb tips close)
    const indexThumbDist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
    if (indexThumbDist < 0.05 && middleExtended && ringExtended && pinkyExtended) {
      return { class: 'F', confidence: 0.91 };
    }

    return { class: 'Searching...', confidence: 0.5 };
  };

  // Convert compiled text into speech using Browser Web Speech Synthesis API
  const handleTextToSpeech = () => {
    if (!compiledText) return;
    
    const synth = window.speechSynthesis;
    if (!synth) {
      alert('Speech Synthesis API is not supported in this browser.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(compiledText);
    utterance.lang = ttsLanguage;
    
    // Attempt to locate native voice configurations
    const voices = synth.getVoices();
    const targetVoice = voices.find(v => v.lang.includes(ttsLanguage));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    synth.speak(utterance);
  };

  // Append letters & export to main chat box
  const handleSendToChat = () => {
    if (!compiledText.trim()) return;
    onCompiledTextSend(compiledText);
    setCompiledText('');
  };

  const handleSendMessage = () => {
    if (!compiledText.trim()) return;
    onShareMessage?.(compiledText, 'sign');
  };

  const handleBackspace = () => {
    setCompiledText(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCompiledText('');
  };

  const handleSpace = () => {
    setCompiledText(prev => prev + ' ');
  };

  return (
    <Box className="flex flex-col gap-4">
      {/* Title Controls Header */}
      <Box className="page-header flex justify-between items-center">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Sign Language Interpreter
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {model ? 'TensorFlow.js CNN-LSTM Model active' : 'Rule-Based Heuristic Parser active'}
          </Typography>
        </Box>

        <Box className="flex items-center gap-2">
          <Button variant="outlined" size="small" startIcon={<LangIcon />} onClick={() => setLanguageMode(prev => prev === 'ISL' ? 'ASL' : 'ISL')}>
            Mode: {languageMode}
          </Button>
          <Button variant="contained" color={cameraActive ? 'error' : 'primary'} startIcon={cameraActive ? <CameraOffIcon /> : <CameraOnIcon />} onClick={() => setCameraActive(prev => !prev)} sx={{ px: 3 }}>
            {cameraActive ? 'Stop' : 'Start'}
          </Button>
        </Box>
      </Box>

      <Box className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 shadow-card flex items-center justify-center">
        
        {/* Hidden video element for MediaPipe stream */}
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          width="640"
          height="480"
          playsInline
          muted
        />

        {/* Live Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
          width="640"
          height="480"
          style={{ display: cameraActive ? 'block' : 'none' }}
        />

        {/* Camera inactive overlay */}
        {!cameraActive && (
          <Box className="text-center p-6 space-y-4">
            <Box className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
              <CameraOffIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>Camera is Off</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 280, mx: 'auto' }}>
                Click the Start button above to activate your webcam and begin sign recognition.
              </Typography>
            </Box>
          </Box>
        )}

        {modelLoading && (
          <Box className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <CircularProgress color="primary" />
            <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 600 }}>
              Loading AI Interpreter model...
            </Typography>
          </Box>
        )}

        {cameraActive && (
          <Box className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
            <Chip label={`Sign: ${prediction}`} color={prediction === 'None' || prediction.includes('Searching') ? 'default' : 'primary'} sx={{ fontWeight: 700, boxShadow: 1 }} />
            <Chip label={`Conf: ${(confidence * 100).toFixed(0)}%`} color={confidence > 0.75 ? 'success' : 'warning'} sx={{ fontWeight: 700, boxShadow: 1 }} />
          </Box>
        )}
      </Box>

      <Box className="surface-card p-4 space-y-4">
        <Box className="flex justify-between items-center">
          <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Text Compiler
          </Typography>
          <Box className="flex items-center gap-1">
            <Tooltip title="Backspace">
              <IconButton onClick={handleBackspace} color="inherit" disabled={!compiledText}>
                <BackspaceIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear Text">
              <IconButton onClick={handleClear} color="error" disabled={!compiledText}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[80px] flex items-center">
          <Typography sx={{ color: '#0f172a', fontWeight: 500 }} className={textScale === 'sm' ? 'text-size-sm' : textScale === 'base' ? 'text-size-base' : textScale === 'lg' ? 'text-size-lg' : textScale === 'xl' ? 'text-size-xl' : 'text-size-2xl'}>
            {compiledText || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Recognized letters will form words here...</span>}
          </Typography>
        </Box>

        <Box className="flex flex-wrap gap-2 justify-between">
          <Box className="flex gap-2">
            <Button variant="outlined" onClick={handleSpace}>Add Space</Button>
            <Button variant="outlined" startIcon={<SpeakIcon />} onClick={handleTextToSpeech} disabled={!compiledText} color="primary">Speak Aloud</Button>
          </Box>
          <Button variant="contained" color="primary" endIcon={<SendIcon />} onClick={handleSendToChat} disabled={!compiledText.trim()} sx={{ px: 4 }}>Send to Chat</Button>
          <Button variant="outlined" color="secondary" endIcon={<SendIcon />} onClick={handleSendMessage} disabled={!compiledText.trim()} sx={{ px: 3 }}>Send Message</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SignDetector;
