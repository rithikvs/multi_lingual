import React from 'react';
import SpeechTranscription from '../pages/SpeechTranscription';

const SpeechPage = ({ textScale, ttsLanguage }) => (
  <div className="p-6 glass">
    <h1 className="text-2xl font-bold mb-4 text-white">Speech Transcriber</h1>
    <SpeechTranscription textScale={textScale} ttsLanguage={ttsLanguage} />
  </div>
);

export default SpeechPage;
