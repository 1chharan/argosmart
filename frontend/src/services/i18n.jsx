import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import en from '../locales/en.json';
import te from '../locales/te.json';
import hi from '../locales/hi.json';

const translations = { en, te, hi };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('agrosmart_lang') || 'te'; // Telugu default for regional heartland
  });

  const [hasChosenLang, setHasChosenLang] = useState(() => {
    return Boolean(localStorage.getItem('agrosmart_lang_selected'));
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(true);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);

  // Check Web Speech API capabilities
  useEffect(() => {
    const hasSynth = 'speechSynthesis' in window;
    setSpeechSynthesisSupported(hasSynth);

    const hasRecognition = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    setSpeechRecognitionSupported(hasRecognition);

    if (hasSynth) {
      const updateVoices = () => {
        const v = window.speechSynthesis.getVoices();
        setAvailableVoices(v || []);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('agrosmart_lang', newLang);
    localStorage.setItem('agrosmart_lang_selected', 'true');
    setHasChosenLang(true);
    stopSpeaking();
  };

  const t = (path) => {
    const keys = path.split('.');
    let current = translations[lang] || translations.en;
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English
        let fallback = translations.en;
        for (const fbKey of keys) {
          if (fallback && fallback[fbKey] !== undefined) {
            fallback = fallback[fbKey];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }
    return current;
  };

  const speakText = (text, targetLang = lang) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Clear and understandable rate for farmers
    utterance.pitch = 1.0;

    // Pick appropriate BCP-47 language tag
    if (targetLang === 'te') {
      utterance.lang = 'te-IN';
    } else if (targetLang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    // Try finding matching voice specifically for the language
    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    let match = null;

    if (targetLang === 'te') {
      match = voices.find(v => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu'));
    } else if (targetLang === 'hi') {
      match = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
    } else {
      match = voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en'));
    }

    if (match) {
      utterance.voice = match;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      changeLanguage,
      hasChosenLang,
      t,
      speakText,
      stopSpeaking,
      isSpeaking,
      speechSynthesisSupported,
      speechRecognitionSupported
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
