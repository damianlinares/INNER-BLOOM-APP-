import React, { useState, useEffect, useRef } from 'react';
import { BREATHING_EXERCISES, SOUNDSCAPES, MEDITATIONS } from '../constants';
import { useUser } from '../context/UserContext';
import type { BreathingExercise, Meditation, Soundscape } from '../types';
import { Play, Pause, Wind, Headphones, X, ArrowRight } from 'lucide-react';

const BreathingAnimation: React.FC<{ exercise: BreathingExercise; onComplete: () => void }> = ({ exercise, onComplete }) => {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [counter, setCounter] = useState(exercise.pattern[0].duration);
    const [scale, setScale] = useState(0.5);
    const [isExiting, setIsExiting] = useState(false);
    const phase = exercise.pattern[phaseIndex];

    useEffect(() => {
        const currentPhase = exercise.pattern[phaseIndex];
        setCounter(currentPhase.duration);

        if (currentPhase.name === 'Inhale') {
            setScale(1);
        } else if (currentPhase.name === 'Exhale') {
            setScale(0.5);
        }

        const counterInterval = setInterval(() => {
            setCounter(c => (c > 1 ? c - 1 : 1));
        }, 1000);

        const phaseTimeout = setTimeout(() => {
            setPhaseIndex(prev => (prev + 1) % exercise.pattern.length);
        }, currentPhase.duration * 1000);
        
        return () => {
            clearInterval(counterInterval);
            clearTimeout(phaseTimeout);
        };
    }, [phaseIndex, exercise.pattern]);
    
    const handleComplete = () => {
        setIsExiting(true);
        setTimeout(onComplete, 500);
    };
    
    return (
        <div className={`fixed inset-0 bg-background z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            <button onClick={handleComplete} className="absolute top-6 right-6 text-text-secondary hover:text-text-primary z-20">
                <X size={30} />
            </button>
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                <div 
                    className="absolute w-full h-full bg-secondary/20 rounded-full"
                    style={{ 
                        transition: `transform ${phase.duration}s cubic-bezier(0.65, 0, 0.35, 1)`,
                        transform: `scale(${scale})`,
                    }}
                />
                <div className="z-10 text-center">
                    <p className="text-3xl font-semibold text-text-primary">{phase.name}</p>
                    <p className="text-5xl font-mono mt-2">{counter}</p>
                </div>
            </div>
             <p className="text-lg text-text-secondary z-10">{exercise.description}</p>
        </div>
    );
};


const AudioItem: React.FC<{ item: Soundscape | Meditation }> = ({ item }) => {
    const { playSoundscape, toggleSoundscape, stopSoundscape, activeSoundscape, isSoundscapePlaying } = useUser();
    const isThisPlaying = activeSoundscape?.id === item.id && isSoundscapePlaying;
    const isThisActive = activeSoundscape?.id === item.id;
    const isMeditation = 'category' in item;

    const handlePlay = () => {
        if(isThisActive) {
            toggleSoundscape();
        } else {
            playSoundscape(item);
        }
    }

    return (
        <div className="flex items-center justify-between bg-surface p-4 rounded-xl shadow-soft w-full space-x-4 border border-border-color">
            <button 
                onClick={handlePlay} 
                className="flex-shrink-0 p-3 rounded-full bg-secondary text-white shadow-md hover:shadow-lg hover:bg-secondary/90 transition-all duration-200 transform hover:-translate-y-0.5"
                aria-label={isThisPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
            >
                {isThisPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
            </button>
            <div className="flex-grow min-w-0">
                <p className="font-semibold text-text-primary truncate">{item.title}</p>
                 {isMeditation && <p className="text-xs text-text-secondary">{item.category}</p>}
            </div>
            {isThisActive && (
                 <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="flex space-x-1">
                        <span className="w-1 h-4 bg-secondary/60 animate-[pulse_1.5s_ease-in-out_infinite]"/>
                        <span className="w-1 h-4 bg-secondary/60 animate-[pulse_1.5s_ease-in-out_0.2s_infinite]"/>
                        <span className="w-1 h-4 bg-secondary/60 animate-[pulse_1.5s_ease-in-out_0.4s_infinite]"/>
                    </div>
                    <button 
                        onClick={stopSoundscape} 
                        className="p-2 rounded-full text-text-secondary hover:bg-secondary/10 hover:text-secondary transition-colors"
                        aria-label="Stop soundscape"
                    >
                        <X size={20}/>
                    </button>
                </div>
            )}
        </div>
    )
};

const Tools: React.FC = () => {
    const [activeExercise, setActiveExercise] = useState<BreathingExercise | null>(null);

    return (
        <>
        {activeExercise && <BreathingAnimation exercise={activeExercise} onComplete={() => setActiveExercise(null)} />}
        <div className="space-y-12">
            <header>
                <h1 className="text-3xl md:text-4xl font-semibold text-text-primary">Wellness Tools</h1>
                <p className="text-lg text-text-secondary mt-2">Find your calm and focus with these guided practices.</p>
            </header>

            <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4 flex items-center"><Wind className="mr-3" />Guided Breathing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {BREATHING_EXERCISES.map(ex => (
                        <button
                            key={ex.id}
                            onClick={() => setActiveExercise(ex)}
                            className="group bg-surface p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out border border-border-color hover:border-secondary/30 text-left flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-xl font-semibold text-text-primary">{ex.title}</h3>
                                <p className="text-text-secondary my-2">{ex.description}</p>
                            </div>
                            <div className="mt-4 text-secondary font-semibold flex items-center">
                                <span>Start Practice</span>
                                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                            </div>
                        </button>
                    ))}
                </div>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4 flex items-center"><Headphones className="mr-3" />Meditations & Soundscapes</h2>
                 <div className="space-y-3">
                    {MEDITATIONS.map(med => <AudioItem key={med.id} item={med} />)}
                    {SOUNDSCAPES.map(scape => <AudioItem key={scape.id} item={scape} />)}
                </div>
            </section>
        </div>
        </>
    );
};

export default Tools;