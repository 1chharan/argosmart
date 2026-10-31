import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, ArrowLeft, Volume2, Sparkles, Bot, User, RefreshCw } from 'lucide-react';
import { useLanguage } from '../services/i18n';
import VoiceButton from './VoiceButton';
import { api } from '../services/api';

export default function AssistantScreen({ onBack }) {
  const { t, lang, speakText, isSpeaking, stopSpeaking, speechRecognitionSupported, speechSynthesisSupported } = useLanguage();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [micError, setMicError] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Stop speaking when navigating away
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Initialize SpeechRecognition if supported
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
        handleSendMessage(transcript);
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
    const welcomeTexts = {
      te: 'నమస్కారం! నేను మీ అగ్రోస్మార్ట్ ఏఐ (AgroSmart AI) సహాయకుడిని. మీరు నన్ను వాయిస్ లేదా టైపింగ్ ద్వారా ఏదైనా పంట లేదా పురుగుల ప్రశ్న అడగవచ్చు.',
      hi: 'नमस्ते! मैं आपका एग्रोस्मार्ट एआई (AgroSmart AI) सहायक हूं। आप मुझसे फसल, कीट या छिड़काव पर बोलकर या लिखकर सवाल पूछ सकते हैं।',
      en: 'Hello! I am your AgroSmart AI Farm Assistant. You can speak or type questions about insects, crops, or spraying advice.'
    };
    const welcome = welcomeTexts[lang] || welcomeTexts.en;
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'bot',
        text: welcome,
        actions: ['ఈ రోజు మందు చల్లవచ్చా?', 'తేనెటీగలను ఎలా కాపాడుకోవాలి?', 'పంట రోగం తనిఖీ చేయండి']
      }
    ]);
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSendMessage = async (textToSend = inputMessage) => {
    const query = (textToSend || '').trim();
    if (!query) return;

    // Add user message to thread
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await api.askAssistant(query, lang);
      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: res.reply_text,
        actions: res.suggested_actions || []
      };
      setMessages(prev => [...prev, botMsg]);

      // Automatically speak out response for farmer convenience
      speakText(res.audio_tts_text || res.reply_text);
    } catch (err) {
      console.error('Assistant error', err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: 'సమాధానం పొందడంలో సమస్య ఎదురైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
          actions: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('home')}</span>
        </button>
        <VoiceButton
          text="రైతు వాయిస్ సహాయకుడికి స్వాగతం. మైక్రోఫోన్ బటన్ నొక్కి మీ ప్రశ్న మాట్లాడండి."
        />
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-stone-200 flex flex-col h-[560px]">
        {/* Chat Title */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-700 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900 leading-tight">
                {t('assistantScreen.title')}
              </h2>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active in {lang.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Browser Unsupported or Mic Error Notice */}
        {(!speechRecognitionSupported || micError) && (
          <div className="bg-amber-50 border-b border-amber-200 p-2.5 rounded-xl my-2 flex items-center justify-between text-xs text-amber-900 font-bold shrink-0">
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
                className="p-1 hover:bg-amber-200 rounded text-amber-800 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 scrollbar-thin">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                  isBot
                    ? 'bg-stone-100 text-stone-900 border border-stone-200'
                    : 'bg-emerald-700 text-white'
                }`}>
                  <p className="text-sm font-bold leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>

                  {/* Read Aloud Button on Bot Message */}
                  {isBot && (
                    <div className="mt-2 pt-2 border-t border-stone-200/80 flex items-center justify-between">
                      <button
                        onClick={() => speakText(msg.text)}
                        className="flex items-center gap-1 text-[11px] font-black text-emerald-800 hover:text-emerald-900"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>వినండి / Listen</span>
                      </button>
                    </div>
                  )}

                  {/* Quick Action Suggestion Pills */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(act)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-50 shadow-2xs"
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
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Thinking & localizing reply...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Giant Microphone button (min 56px height) */}
        <div className="pt-3 border-t border-stone-200 shrink-0">
          <div className="flex items-center gap-2">
            {/* Giant Microphone button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 border-2 ${
                isListening
                  ? 'bg-red-600 text-white border-red-700 animate-bounce'
                  : 'bg-sky-700 hover:bg-sky-800 text-white border-sky-900'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? 'Listening to voice...' : t('assistantScreen.placeholder')}
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-stone-200 text-sm font-bold text-stone-800 focus:border-sky-600 focus:outline-hidden"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="w-14 h-14 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-md border-2 border-emerald-900 disabled:opacity-40"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
