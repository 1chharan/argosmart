import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './services/i18n';
import Header from './components/Header';
import LanguageModal from './components/LanguageModal';
import LoginModal from './components/LoginModal';
import HomeScreen from './components/HomeScreen';
import UploadScreen from './components/UploadScreen';
import ResultScreen from './components/ResultScreen';
import MySightingsScreen from './components/MySightingsScreen';
import MapScreen from './components/MapScreen';
import PlantDoctorScreen from './components/PlantDoctorScreen';
import RiskScreen from './components/RiskScreen';
import AssistantScreen from './components/AssistantScreen';
import ExpertScreen from './components/ExpertScreen';
import VoiceChatbotWidget from './components/VoiceChatbotWidget';
import { Home, Camera, Map, Sprout, Mic, ListFilter, Bot } from 'lucide-react';
import { api } from './services/api';
import { getOfflineSightings, syncOfflineQueue } from './services/offlineSync';

function MainApp() {
  const { lang, hasChosenLang, t, stopSpeaking } = useLanguage();

  const [currentScreen, setCurrentScreen] = useState('home');
  const [isLangModalOpen, setIsLangModalOpen] = useState(!hasChosenLang);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVoiceChatbotOpen, setIsVoiceChatbotOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: 1, role: 'farmer', name: 'Ramesh Goud' });
  const [lastSighting, setLastSighting] = useState(null);
  const [lastAiResult, setLastAiResult] = useState(null);

  const [sightings, setSightings] = useState([]);
  const [offlineSightings, setOfflineSightings] = useState(getOfflineSightings());
  const [isSyncing, setIsSyncing] = useState(false);

  // Stop any active speech synthesis when navigating between screens
  useEffect(() => {
    stopSpeaking();
  }, [currentScreen]);

  // Sync listener
  useEffect(() => {
    const handleStorageUpdate = () => {
      setOfflineSightings(getOfflineSightings());
    };
    window.addEventListener('agrosmart_storage_update', handleStorageUpdate);
    window.addEventListener('kisanmitra_storage_update', handleStorageUpdate);
    window.addEventListener('online', handleSync);

    return () => {
      window.removeEventListener('agrosmart_storage_update', handleStorageUpdate);
      window.removeEventListener('kisanmitra_storage_update', handleStorageUpdate);
      window.removeEventListener('online', handleSync);
    };
  }, []);

  // Fetch initial sightings from backend
  useEffect(() => {
    loadSightings();
  }, []);

  const loadSightings = async () => {
    try {
      const data = await api.getSightings({ limit: 40 });
      setSightings(data || []);
    } catch (e) {
      console.warn('Backend not yet reachable, continuing with local data', e);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncOfflineQueue();
      await loadSightings();
    } catch (e) {
      console.error('Sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCompleteUpload = (sighting, aiAnalysis) => {
    setLastSighting(sighting);
    setLastAiResult(aiAnalysis);
    setCurrentScreen('result');
    loadSightings();
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    if (user.role === 'expert') {
      setCurrentScreen('expert');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col antialiased text-stone-900 pb-44">
      {/* Header */}
      <Header
        onOpenLangModal={() => setIsLangModalOpen(true)}
        pendingSyncCount={offlineSightings.filter(s => !s.is_synced).length}
        onSync={handleSync}
        currentRole={currentUser.role}
        onSwitchRole={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area with generous bottom padding so floating button never obscures text */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-6 pb-20">
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            stats={{ sightingsCount: sightings.length }}
            pendingSyncCount={offlineSightings.filter(s => !s.is_synced).length}
            onSync={handleSync}
            onOpenVoiceChatbot={() => setIsVoiceChatbotOpen(true)}
          />
        )}

        {currentScreen === 'upload' && (
          <UploadScreen
            onBack={() => setCurrentScreen('home')}
            onCompleteUpload={handleCompleteUpload}
          />
        )}

        {currentScreen === 'result' && (
          <ResultScreen
            sighting={lastSighting}
            aiResult={lastAiResult}
            onBackHome={() => setCurrentScreen('home')}
            onNavigateMap={() => setCurrentScreen('map')}
          />
        )}

        {currentScreen === 'sightings' && (
          <MySightingsScreen
            sightings={sightings}
            offlineSightings={offlineSightings}
            onBack={() => setCurrentScreen('home')}
            onSync={handleSync}
            onSelectSighting={(item) => {
              setLastSighting(item);
              setCurrentScreen('result');
            }}
          />
        )}

        {currentScreen === 'map' && (
          <MapScreen onBack={() => setCurrentScreen('home')} />
        )}

        {currentScreen === 'doctor' && (
          <PlantDoctorScreen onBack={() => setCurrentScreen('home')} />
        )}

        {currentScreen === 'risk' && (
          <RiskScreen onBack={() => setCurrentScreen('home')} />
        )}

        {currentScreen === 'assistant' && (
          <AssistantScreen onBack={() => setCurrentScreen('home')} />
        )}

        {currentScreen === 'expert' && (
          <ExpertScreen onBack={() => setCurrentScreen('home')} />
        )}
      </main>

      {/* Farmer Bottom Navigation Bar (Labels >= 12px, High contrast, 56px touch targets) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/98 backdrop-blur-md border-t-2 border-stone-300 z-30 max-w-4xl mx-auto shadow-2xl safe-area-pb">
        <div className="grid grid-cols-5 h-20 px-1">
          <button
            onClick={() => setCurrentScreen('home')}
            className={`flex flex-col items-center justify-center transition-all ${
              currentScreen === 'home' ? 'text-emerald-800 font-black' : 'text-stone-600 font-bold'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-black mt-1 tracking-tight leading-none">{t('nav.home')}</span>
          </button>

          <button
            onClick={() => setCurrentScreen('upload')}
            className={`flex flex-col items-center justify-center transition-all ${
              currentScreen === 'upload' ? 'text-emerald-800 font-black' : 'text-stone-600 font-bold'
            }`}
          >
            <div className="w-12 h-12 -mt-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <Camera className="w-7 h-7" />
            </div>
            <span className="text-xs font-black mt-0.5 tracking-tight leading-none">{t('nav.upload')}</span>
          </button>

          <button
            onClick={() => setCurrentScreen('doctor')}
            className={`flex flex-col items-center justify-center transition-all ${
              currentScreen === 'doctor' ? 'text-lime-800 font-black' : 'text-stone-600 font-bold'
            }`}
          >
            <Sprout className="w-6 h-6" />
            <span className="text-xs font-black mt-1 tracking-tight leading-none">{t('nav.doctor')}</span>
          </button>

          <button
            onClick={() => setCurrentScreen('map')}
            className={`flex flex-col items-center justify-center transition-all ${
              currentScreen === 'map' ? 'text-teal-800 font-black' : 'text-stone-600 font-bold'
            }`}
          >
            <Map className="w-6 h-6" />
            <span className="text-xs font-black mt-1 tracking-tight leading-none">{t('nav.map')}</span>
          </button>

          <button
            onClick={() => setCurrentScreen('assistant')}
            className={`flex flex-col items-center justify-center transition-all ${
              currentScreen === 'assistant' ? 'text-sky-800 font-black' : 'text-stone-600 font-bold'
            }`}
          >
            <Mic className="w-6 h-6" />
            <span className="text-xs font-black mt-1 tracking-tight leading-none">{t('nav.assistant')}</span>
          </button>
        </div>
      </nav>

      {/* Floating 1-Tap Voice AI Chatbot Button (Positioned above nav, does not obstruct advice) */}
      <button
        type="button"
        onClick={() => setIsVoiceChatbotOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-sky-600 to-indigo-700 text-white p-3.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
        title="AgroSmart Voice AI Chatbot"
      >
        <Mic className="w-6 h-6 animate-pulse" />
        <span className="text-xs font-black hidden xs:inline">🎙️ Voice AI</span>
      </button>

      {/* Interactive Voice Chatbot Widget Drawer */}
      <VoiceChatbotWidget
        isOpen={isVoiceChatbotOpen}
        onClose={() => setIsVoiceChatbotOpen(false)}
      />

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />

      {/* Quick Role & Login Switcher */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
