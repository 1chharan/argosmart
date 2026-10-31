import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Send, Bot, MessageSquare } from 'lucide-react';
import { useLanguage } from '../services/i18n';
import { api } from '../services/api';

export default function VoiceChatbotWidget({ isOpen, onClose }) {
  const { t, lang, speakText, isSpeaking, stopSpeaking, speechRecognitionSupported, speechSynthesisSupported } = useLanguage();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [micError, setMicError] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Stop speaking when widget unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Initialize SpeechRecognition with language auto-switch
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        setMicError('');
        handleSend(transcript);
      };

      recognition.onerror = (e) => {
        setIsListening(false);
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          setMicError(
            lang === 'te' ? 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్‌లో మైక్ ఆన్ చేయండి లేదా క్రింద టైప్ చేయండి.' :
            lang === 'hi' ? 'माइक्रोफोन अनुमति अस्वीकृत है। कृपया ब्राउज़र में अनुमति दें या नीचे लिखें।' :
            'Microphone permission denied. Please allow microphone access or type your question below.'
          );
        } else {
          setMicError('Audio not detected. Please try tapping mic again.');
        }
      };
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [lang]);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeTexts = {
        te: 'నమస్కారం! నేను అగ్రోస్మార్ట్ ఏఐ (AgroSmart AI) వాయిస్ అసిస్టెంట్. పంట సమస్యలు లేదా స్ప్రేయింగ్ సమయం గురించి నేరుగా మాట్లాడండి.',
        hi: 'नमस्ते! मैं एग्रोस्मार्ट एआई (AgroSmart AI) वॉयस सहायक हूं। फसल या छिड़काव पर कोई भी सवाल बोलकर पूछें।',
        en: 'Hello! I am your AgroSmart AI Voice Assistant. Speak or type your question about crops, bees, or spraying advice.'
      };
      const text = welcomeTexts[lang] || welcomeTexts.en;
      setMessages([
        {
          id: 'msg_welcome',
          sender: 'bot',
          text,
          actions: ['ఈ రోజు మందు చల్లవచ్చా?', 'తేనెటీగలను ఎలా కాపాడుకోవాలి?', 'మిశ్రమ పురుగులను ఎలా గుర్తించాలి?']
        }
      ]);
      speakText(text);
    }
  }, [isOpen, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const toggleMic = () => {
    if (!speechRecognitionSupported) {
      setMicError(
        lang === 'te' ? 'ఈ బ్రౌజర్‌లో మైక్రోఫోన్ వాయిస్ గుర్తించడం లేదు. దయచేసి క్రింద టైప్ చేయండి.' :
        lang === 'hi' ? 'इस ब्राउज़र में वॉयस पहचान समर्थित नहीं है। कृपया नीचे लिखकर पूछें।' :
        'Speech recognition is not supported in this browser. Please type your query below.'
      );
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setMicError('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Speech recognition start failed', e);
        setIsListening(false);
      }
    }
  };

  const handleSend = async (queryToSend = inputMessage) => {
    const text = (queryToSend || '').trim();
    if (!text) return;

    const userMsg = { id: `u_${Date.now()}`, sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await api.askAssistant(text, lang);
      const botMsg = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: res.reply_text,
        actions: res.suggested_actions || []
      };
      setMessages(prev => [...prev, botMsg]);
      speakText(res.audio_tts_text || res.reply_text);
    } catch (err) {
      console.error('Chat error', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-4 border-emerald-600 flex flex-col h-[85vh] sm:h-[620px] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-2xl shadow-inner">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">{t('voiceChatbotTitle')}</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                  Live Voice
                </span>
              </div>
              <p className="text-xs text-emerald-200">{t('voiceChatbotSub')}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Unsupported or Mic Error Notice */}
        {(!speechRecognitionSupported || micError) && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 font-bold shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base shrink-0">⚠️</span>
              <span>
                {micError || (
                  lang === 'te' ? 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ లేదు. క్రింద టైప్ చేయండి.' :
                  lang === 'hi' ? 'इस ब्राउज़र में वॉयस पहचान उपलब्ध नहीं है। नीचे टाइप करें।' :
                  'Voice recognition not supported in this browser. Please type below.'
                )}
              </span>
            </div>
            {micError && (
              <button
                onClick={() => setMicError('')}
                className="p-1 hover:bg-amber-200 rounded text-amber-800"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50 scrollbar-thin">
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                    isBot
                      ? 'bg-white text-stone-900 border-2 border-stone-200'
                      : 'bg-emerald-700 text-white font-bold'
                  }`}
                >
                  <p className="text-sm font-bold leading-relaxed whitespace-pre-line">
                    {m.text}
                  </p>

                  {isBot && (
                    <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => speakText(m.text)}
                        className="flex items-center gap-1 text-[11px] font-black text-emerald-800 hover:text-emerald-900"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{t('listen')}</span>
                      </button>
                    </div>
                  )}

                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(act)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100 shadow-2xs"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-center gap-2 text-stone-500 text-xs font-bold py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>AgroSmart AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Big Bottom Mic & Input Bar */}
        <div className="p-3 bg-white border-t-2 border-stone-200 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMic}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 border-2 ${
                isListening
                  ? 'bg-red-600 text-white border-red-700 animate-bounce'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-900'
              }`}
              title="Tap to speak"
            >
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? '🎙️ వింటున్నాము... / Listening...' : t('assistantScreen.placeholder')}
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-stone-200 text-sm font-bold text-stone-900 focus:border-emerald-600 focus:outline-hidden"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isLoading || !inputMessage.trim()}
              className="w-14 h-14 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center shrink-0 shadow-md border-2 border-emerald-950 disabled:opacity-40"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
