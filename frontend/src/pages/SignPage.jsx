import React from 'react';
import SignRecognition from '../pages/SignRecognition';

const SignPage = ({ textScale, ttsLanguage }) => (
  <div className="p-6 glass">
    <h1 className="text-2xl font-bold mb-4 text-white">Sign Detection</h1>
    <SignRecognition textScale={textScale} ttsLanguage={ttsLanguage} />
  </div>
);

export default SignPage;
