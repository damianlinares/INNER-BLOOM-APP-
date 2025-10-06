import React, { useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import Journal from './screens/Journal';
import Session from './screens/Session';
import Tools from './screens/Tools';
import Community from './screens/Community';
import Progress from './screens/Progress';
import CheckInModal from './components/CheckInModal';
import Journeys from './screens/Journeys';
import Affirmations from './screens/Affirmations';

const GlobalAudioPlayer = () => {
    const { activeSoundscape, isSoundscapePlaying } = useUser();
    const audioRef = React.useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audioElement = audioRef.current;
        if (audioElement) {
            if (isSoundscapePlaying && activeSoundscape) {
                // When the src prop changes on the <audio> element, the browser
                // handles loading. We just need to ensure we call play().
                const playPromise = audioElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // The AbortError is expected if the user quickly switches songs,
                        // which interrupts the previous play() promise. We can safely ignore it.
                        if (error.name !== 'AbortError') {
                            console.error("Audio play failed", error);
                        }
                    });
                }
            } else {
                audioElement.pause();
            }
        }
    }, [isSoundscapePlaying, activeSoundscape]);
    

    if (!activeSoundscape) return null;

    return <audio ref={audioRef} src={activeSoundscape.file} loop />;
};

const SyncManager = () => {
    const { processSyncQueue } = useUser();
    
    useEffect(() => {
        const handleOnline = () => {
            console.log('Back online, processing sync queue...');
            processSyncQueue();
        };
        
        window.addEventListener('online', handleOnline);
        // Initial check
        if(navigator.onLine) {
            handleOnline();
        }
        
        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, [processSyncQueue]);
    
    return null;
}


function App() {
  return (
    <UserProvider>
      <HashRouter>
        <div className="bg-base min-h-screen text-text-primary font-sans">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/session" element={<Session />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/community" element={<Community />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/journeys" element={<Journeys />} />
              <Route path="/affirmations" element={<Affirmations />} />
            </Route>
          </Routes>
          <CheckInModal />
          <GlobalAudioPlayer />
          <SyncManager />
        </div>
      </HashRouter>
    </UserProvider>
  );
}

export default App;