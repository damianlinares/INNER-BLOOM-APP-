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
        journal: <BookText className="w-8 h-8 text-secondary" />,
        meditation: <BrainCircuit className="w-8 h-8 text-secondary" />,
        breathing: <Wind className="w-8 h-8 text-secondary/70" />,
    };

    const stepActions = {
        journal: { text: 'Go to Journal', path: '/journal' },
        meditation: { text: 'Go to Tools', path: '/tools' },
        breathing: { text: 'Go to Tools', path: '/tools' },
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl md:text-4xl font-semibold text-text-primary">Journeys & Achievements</h1>
                <p className="text-lg text-text-secondary mt-2">Follow guided paths and celebrate your milestones.</p>
            </header>
            
            {activeJourneyData && activeJourney && (
                 <section className="bg-surface p-6 rounded-xl shadow-soft border-l-4 border-secondary border border-border-color">
                    <div className="mb-4">
                        <div className="flex justify-between items-baseline">
                            <h2 className="text-2xl font-semibold text-secondary">Current Journey</h2>
                            <span className="font-medium text-text-secondary">
                                Step {activeJourney.currentStep + 1} of {activeJourneyData.steps.length}
                            </span>
                        </div>
                        <p className="text-text-secondary">{activeJourneyData.title}</p>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-full bg-background rounded-full h-3 flex-1">
                            <div 
                                className="bg-gradient-to-r from-secondary/70 to-secondary h-3 rounded-full transition-all duration-500 ease-out" 
                                style={{ width: `${(activeJourney.currentStep / activeJourneyData.steps.length) * 100}%` }}
                            ></div>
                        </div>
                        <span className="font-semibold text-lg text-secondary w-16 text-right">
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
                            <div className="bg-background p-4 rounded-xl border-l-4 border-secondary/70 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="flex-shrink-0">
                                    {stepIcons[currentStep.type]}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-text-secondary">
                                        Next Step: <span className="font-medium text-text-primary">{currentStep.title}</span>
                                    </p>
                                    <p className="text-text-secondary text-sm mt-1 italic">{detailText}</p>
                                </div>
                                <button
                                    onClick={() => navigate(action.path)}
                                    className="self-start sm:self-center bg-primary text-text-primary font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-border-color"
                                >
                                    {action.text}
                                </button>
                            </div>
                        );
                    })()}
                </section>
            )}

            <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Available Journeys</h2>
                <div className="space-y-4">
                {JOURNEYS.map(journey => {
                    const isCompleted = completedJourneys.includes(journey.id);
                    const isActive = activeJourney?.journeyId === journey.id;
                    const isLocked = !!activeJourney && !isActive;

                    return (
                        <div key={journey.id} className={`bg-surface p-6 rounded-xl shadow-soft transition-opacity border border-border-color ${isLocked ? 'opacity-50' : ''}`}>
                            <h3 className="text-xl font-semibold">{journey.title}</h3>
                            <p className="text-text-secondary my-2">{journey.description}</p>
                            {isCompleted ? <p className="font-semibold text-secondary flex items-center gap-2"><CheckCircle size={18}/> Completed</p> :
                             isActive ? <p className="font-semibold text-secondary flex items-center gap-2"><Compass size={18}/> In Progress...</p> :
                             <button onClick={() => startJourney(journey.id)} disabled={isLocked} className="bg-primary text-text-primary font-semibold px-6 py-2 rounded-xl hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border border-border-color">
                                Start Journey
                             </button>
                            }
                        </div>
                    );
                })}
                </div>
            </section>
            <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4">My Achievements</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {ACHIEVEMENTS.map(ach => {
                        const isUnlocked = unlockedAchievements.includes(ach.id);
                        return (
                            <div key={ach.id} className={`bg-surface p-4 rounded-xl text-center flex flex-col items-center justify-center transition-all duration-300 shadow-soft border border-border-color ${isUnlocked ? 'opacity-100 border-b-4 border-secondary' : 'opacity-40'}`}>
                                <p className="text-4xl mb-2">{ach.icon}</p>
                                <h4 className="font-medium text-sm">{ach.title}</h4>
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