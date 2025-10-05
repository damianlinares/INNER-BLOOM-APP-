
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { UserData, JournalEntry, Session, CheckInData, Soundscape, DashboardComponent } from '../types';
import { getJournalReflection, getAIInsight } from '../services/geminiService';
import { ACHIEVEMENTS, JOURNEYS } from '../constants';


const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const triggerHaptic = () => {
    if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
    }
};

interface UserContextType {
    userData: UserData;
    isCheckInModalOpen: boolean;
    openCheckInModal: () => void;
    closeCheckInModal: () => void;
    addJournalEntry: (content: string, journeyStep?: any) => void;
    updateJournalEntry: (entry: JournalEntry) => void;
    addSession: (session: Session) => void;
    completeCheckIn: (checkInData: Omit<CheckInData, 'date'>) => void;
    processSyncQueue: () => void;

    // Journeys & Achievements
    startJourney: (journeyId: string) => void;
    completeJourneyStep: () => void;
    
    // Soundscapes
    activeSoundscape: Soundscape | null;
    isSoundscapePlaying: boolean;
    playSoundscape: (scape: Soundscape) => void;
    toggleSoundscape: () => void;
    stopSoundscape: () => void;

    // Dashboard Customization
    updateDashboardLayout: (layout: DashboardComponent[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userData, setUserData] = useLocalStorage<UserData>('inner-bloom-data', {
        lastCheckIn: null,
        streak: 0,
        points: 0,
        journal: [],
        sessions: [],
        checkIns: [],
        activeJourney: null,
        completedJourneys: [],
        unlockedAchievements: [],
        insights: [],
        lastInsightDate: null,
        dashboardLayout: ['stats', 'tree', 'journey', 'insight'],
    });

    const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
    const [activeSoundscape, setActiveSoundscape] = useState<Soundscape | null>(null);
    const [isSoundscapePlaying, setIsSoundscapePlaying] = useState(false);

    const openCheckInModal = () => setCheckInModalOpen(true);
    const closeCheckInModal = () => setCheckInModalOpen(false);
    
    const unlockAchievement = useCallback((achievementId: string) => {
        setUserData(prev => {
            if (prev.unlockedAchievements.includes(achievementId)) {
                return prev;
            }
            console.log(`Unlocking achievement: ${achievementId}`);
            return {
                ...prev,
                unlockedAchievements: [...prev.unlockedAchievements, achievementId],
                points: prev.points + 50, // Reward for achievement
            };
        });
    }, [setUserData]);

    const addJournalEntry = (content: string, journeyStep: any = null) => {
        const newEntry: JournalEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          content: content,
          synced: navigator.onLine,
          needsReflection: navigator.onLine,
        };
        
        if(userData.journal.length === 0) unlockAchievement('first_entry');
        if(userData.journal.length === 9) unlockAchievement('10_entries');
        
        setUserData(prev => ({ ...prev, journal: [newEntry, ...prev.journal] }));

        if (journeyStep) {
            completeJourneyStep();
        }
    };

    const updateJournalEntry = (updatedEntry: JournalEntry) => {
        setUserData(prev => ({
            ...prev,
            journal: prev.journal.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
        }));
    };

    const addSession = (session: Session) => {
        setUserData(prev => ({ ...prev, sessions: [session, ...prev.sessions] }));
    };

    const completeCheckIn = (checkInData: Omit<CheckInData, 'date'>) => {
        triggerHaptic();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const newCheckInData: CheckInData = { ...checkInData, date: todayStr };

        setUserData(prev => {
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const lastCheckInDate = prev.lastCheckIn ? new Date(prev.lastCheckIn) : null;
            
            let newStreak = prev.streak;
            if (lastCheckInDate && isSameDay(lastCheckInDate, yesterday)) {
                newStreak += 1; // Continue streak
            } else if (!lastCheckInDate || !isSameDay(lastCheckInDate, today)) {
                newStreak = 1; // Start a new streak
            }
            if(newStreak >= 7 && !prev.unlockedAchievements.includes('7_day_streak')) {
                unlockAchievement('7_day_streak');
            }

            return {
                ...prev,
                lastCheckIn: todayStr,
                streak: newStreak,
                points: prev.points + 10,
                checkIns: [newCheckInData, ...prev.checkIns],
            };
        });
        closeCheckInModal();
    };
    
    // --- New Feature Logic ---

    // Offline Sync
    const processSyncQueue = useCallback(async () => {
        const unsyncedEntries = userData.journal.filter(entry => !entry.synced || entry.needsReflection);
        if (unsyncedEntries.length === 0) return;

        for (const entry of unsyncedEntries) {
            if(entry.needsReflection) {
                updateJournalEntry({ ...entry, isLoadingReflection: true });
                const reflection = await getJournalReflection(entry.content);
                updateJournalEntry({ ...entry, reflection, isLoadingReflection: false, needsReflection: false, synced: true });
            }
        }
    }, [userData.journal]);

    // Journeys
    const startJourney = (journeyId: string) => {
        setUserData(prev => ({ ...prev, activeJourney: { journeyId, currentStep: 0 }}));
    };
    
    const completeJourneyStep = () => {
        setUserData(prev => {
            if (!prev.activeJourney) return prev;
            const journey = JOURNEYS.find(j => j.id === prev.activeJourney.journeyId);
            if (!journey) return prev;

            const nextStep = prev.activeJourney.currentStep + 1;
            if (nextStep >= journey.steps.length) {
                // Journey Complete
                unlockAchievement(journey.achievementId);
                return {
                    ...prev,
                    activeJourney: null,
                    completedJourneys: [...prev.completedJourneys, journey.id],
                    points: prev.points + 100, // Journey completion bonus
                };
            } else {
                return {
                    ...prev,
                    activeJourney: { ...prev.activeJourney, currentStep: nextStep },
                };
            }
        });
    };

    // Soundscapes
    const playSoundscape = (scape: Soundscape) => {
        setActiveSoundscape(scape);
        setIsSoundscapePlaying(true);
    };

    const toggleSoundscape = () => {
        if(activeSoundscape) {
            setIsSoundscapePlaying(prev => !prev);
        }
    };
    
    const stopSoundscape = () => {
        setIsSoundscapePlaying(false);
        setActiveSoundscape(null);
    }

    // Dashboard Customization
    const updateDashboardLayout = (layout: DashboardComponent[]) => {
        setUserData(prev => ({ ...prev, dashboardLayout: layout }));
    };

    // AI Insights (run once per day on load)
    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        if (userData.lastInsightDate !== todayStr && userData.checkIns.length > 3) {
            const generateInsight = async () => {
                const insight = await getAIInsight(userData.checkIns.slice(0, 14), userData.journal.slice(0, 5));
                setUserData(prev => ({ ...prev, insights: [insight, ...prev.insights.slice(0,4)], lastInsightDate: todayStr }));
            };
            generateInsight();
        }
    }, [userData.checkIns, userData.journal, userData.lastInsightDate, setUserData]);


    const value = {
        userData,
        isCheckInModalOpen,
        openCheckInModal,
        closeCheckInModal,
        addJournalEntry,
        updateJournalEntry,
        addSession,
        completeCheckIn,
        processSyncQueue,
        startJourney,
        completeJourneyStep,
        activeSoundscape,
        isSoundscapePlaying,
        playSoundscape,
        toggleSoundscape,
        stopSoundscape,
        updateDashboardLayout,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
