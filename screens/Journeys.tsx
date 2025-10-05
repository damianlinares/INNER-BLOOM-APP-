
import React from 'react';
import { useUser } from '../context/UserContext';
import { CheckCircle, Lock, Compass, BookText, Wind, BrainCircuit } from 'lucide-react';
import { JOURNEYS, ACHIEVEMENTS, MEDITATIONS, BREATHING_EXERCISES } from '../constants';
import { useNavigate } from 'react-router-dom';

const Journeys: React.FC = () => {
    const { userData, startJourney } = useUser();
    const { activeJourney, completedJourneys, unlockedAchievements } = userData;
    const navigate = useNavigate();

    const activeJourneyData = activeJourney ? JOURNEYS.find(j => j.id === activeJourney.journeyId) : null;

    const stepIcons = {
        journal: <BookText className="w-8 h-8 text-primary" />,
        meditation: <BrainCircuit className="w-8 h-8 text-secondary" />,
        breathing: <Wind className="w-8 h-8 text-accent" />,
    };

    const stepActions = {
        journal: { text: 'Go to Journal', path: '/journal' },
        meditation: { text: 'Go to Tools', path: '/tools' },
        breathing: { text: 'Go to Tools', path: '/tools' },
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold font-serif text-text-primary">Journeys & Achievements</h1>
                <p className="text-lg text-text-secondary mt-2">Follow guided paths and celebrate your milestones.</p>
            </header>
            
            {activeJourneyData && activeJourney && (
                 <section className="bg-surface p-6 rounded-lg shadow-md border-l-4 border-primary">
                    <div className="mb-4">
                        <div className="flex justify-between items-baseline">
                            <h2 className="text-2xl font-bold font-serif text-primary">Current Journey</h2>
                            <span className="font-semibold text-text-secondary">
                                Step {activeJourney.currentStep + 1} of {activeJourneyData.steps.length}
                            </span>
                        </div>
                        <p className="text-text-secondary">{activeJourneyData.title}</p>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-full bg-base rounded-full h-3 flex-1">
                            <div 
                                className="bg-gradient-to-r from-secondary to-primary h-3 rounded-full transition-all duration-500 ease-out" 
                                style={{ width: `${(activeJourney.currentStep / activeJourneyData.steps.length) * 100}%` }}
                            ></div>
                        </div>
                        <span className="font-bold text-lg text-primary w-16 text-right">
                            {Math.round((activeJourney.currentStep / activeJourneyData.steps.length) * 100)}%
                        </span>
                    </div>
                    
                    {(() => {
                        const currentStep = activeJourneyData.steps[activeJourney.currentStep];
                        const action = stepActions[currentStep.type];

                        let detailText = '';
                        if (currentStep.type === 'journal') {
                            detailText = `Prompt: "${currentStep.prompt}"`;
                        } else if (currentStep.type === 'meditation') {
                            const target = MEDITATIONS.find(m => m.id === currentStep.targetId);
                            detailText = `Practice: "${target?.title || 'Meditation'}"`;
                        } else if (currentStep.type === 'breathing') {
                            const target = BREATHING_EXERCISES.find(b => b.id === currentStep.targetId);
                            detailText = `Practice: "${target?.title || 'Breathing'}"`;
                        }
                        
                        return (
                            <div className="bg-base/50 p-4 rounded-lg border-l-4 border-primary/70 flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    {stepIcons[currentStep.type]}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-text-secondary">
                                        Next Step: <span className="font-semibold text-text-primary">{currentStep.title}</span>
                                    </p>
                                    <p className="text-text-secondary text-sm mt-1 italic">{detailText}</p>
                                </div>
                                <button
                                    onClick={() => navigate(action.path)}
                                    className="self-center bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 text-sm transition-colors"
                                >
                                    {action.text}
                                </button>
                            </div>
                        );
                    })()}
                </section>
            )}

            <section>
                <h2 className="text-2xl font-bold font-serif text-secondary mb-4">Available Journeys</h2>
                <div className="space-y-4">
                {JOURNEYS.map(journey => {
                    const isCompleted = completedJourneys.includes(journey.id);
                    const isActive = activeJourney?.journeyId === journey.id;
                    const isLocked = !!activeJourney && !isActive;

                    return (
                        <div key={journey.id} className={`bg-surface p-6 rounded-lg shadow-md transition-opacity ${isLocked ? 'opacity-50' : ''}`}>
                            <h3 className="text-xl font-semibold">{journey.title}</h3>
                            <p className="text-text-secondary my-2">{journey.description}</p>
                            {isCompleted ? <p className="font-semibold text-secondary flex items-center gap-2"><CheckCircle size={18}/> Completed</p> :
                             isActive ? <p className="font-semibold text-primary flex items-center gap-2"><Compass size={18}/> In Progress...</p> :
                             <button onClick={() => startJourney(journey.id)} disabled={isLocked} className="bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed">
                                Start Journey
                             </button>
                            }
                        </div>
                    );
                })}
                </div>
            </section>
            <section>
                <h2 className="text-2xl font-bold font-serif text-accent mb-4">My Achievements</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {ACHIEVEMENTS.map(ach => {
                        const isUnlocked = unlockedAchievements.includes(ach.id);
                        return (
                            <div key={ach.id} className={`bg-surface p-4 rounded-lg text-center flex flex-col items-center justify-center transition-all duration-300 ${isUnlocked ? 'opacity-100 border-b-4 border-secondary' : 'opacity-40'}`}>
                                <p className="text-4xl mb-2">{ach.icon}</p>
                                <h4 className="font-semibold text-sm">{ach.title}</h4>
                                <p className="text-xs text-text-secondary mt-1">{ach.description}</p>
                                {!isUnlocked && <Lock className="w-4 h-4 text-text-secondary mt-2"/>}
                            </div>
                        )
                    })}
                </div>
            </section>
        </div>
    );
};

export default Journeys;
