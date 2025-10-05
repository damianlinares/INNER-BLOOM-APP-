
import React, { useState, useEffect, useRef } from 'react';
import { BREATHING_EXERCISES, SOUNDSCAPES, MEDITATIONS } from '../constants';
import { useUser } from '../context/UserContext';
import type { BreathingExercise, Meditation, Soundscape } from '../types';
import { Play, Pause, Wind, Headphones, BrainCircuit, X } from 'lucide-react';

const BreathingAnimation: React.FC<{ exercise: BreathingExercise; onComplete: () => void }> = ({ exercise, onComplete }) => {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [counter, setCounter] = useState(exercise.pattern[0].duration);
    const [scale, setScale] = useState(0.5);
    const [isExiting, setIsExiting] = useState(false);
    const phase = exercise.pattern[phaseIndex];

    useEffect(() => {
        const currentPhase = exercise.pattern[phaseIndex];
        setCounter(currentPhase.duration);

        // Set the target scale for the current phase. The CSS transition handles the animation.
        // For 'Hold' phases, we don't change the scale; it remains at its previous value.
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
        <div className={`fixed inset-0 bg-base z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-slate-900 to-pink-900 bg-[length:200%_200%] animate-aurora opacity-40"/>
            <button onClick={handleComplete} className="absolute top-6 right-6 text-text-secondary hover:text-text-primary z-20">
                <X size={30} />
            </button>
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                <div 
                    className="absolute w-full h-full bg-secondary/30 rounded-full"
                    style={{ 
                        transition: `transform ${phase.duration}s cubic-bezier(0.65, 0, 0.35, 1)`,
                        transform: `scale(${scale})`,
                    }}
                />
                <div className="z-10 text-center">
                    <p className="text-3xl font-bold text-text-primary">{phase.name}</p>
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
        <div className="flex items-center justify-between bg-surface p-4 rounded-lg shadow-sm w-full space-x-4">
            <button onClick={handlePlay} className="p-3 rounded-full bg-base text-primary hover:bg-primary/20">
                {isThisPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="flex-grow">
                <p className="font-semibold text-text-primary">{item.title}</p>
                 {isMeditation && <p className="text-xs text-text-secondary">{item.category}</p>}
            </div>
            {isThisActive && (
                 <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        <span className="w-1 h-4 bg-secondary/60 animate-[pulse_1.5s_ease-in-out_infinite]"/>
                        <span className="w-1 h-4 bg-secondary/60 animate-[pulse_1.5s_ease-in-out_0.2s_infinite]"/>
                        <span className="w-1 h-4 bg-secondary/60 animate-[pulse_1.5s_ease-in-out_0.4s_infinite]"/>
                    </div>
                    <button onClick={stopSoundscape} className="text-text-secondary hover:text-accent">
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
                <h1 className="text-4xl font-bold font-serif text-text-primary">Wellness Tools</h1>
                <p className="text-lg text-text-secondary mt-2">Find your calm and focus with these guided practices.</p>
            </header>

            <section>
                <h2 className="text-2xl font-bold font-serif text-primary mb-4 flex items-center"><Wind className="mr-3" />Guided Breathing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {BREATHING_EXERCISES.map(ex => (
                        <div key={ex.id} className="bg-surface p-6 rounded-lg shadow-sm group transition-all hover:shadow-lg hover:shadow-secondary/10">
                            <h3 className="text-xl font-semibold text-text-primary">{ex.title}</h3>
                            <p className="text-text-secondary my-2 h-10">{ex.description}</p>
                            <button onClick={() => setActiveExercise(ex)} className="mt-2 text-secondary font-semibold group-hover:text-primary transition-colors">Enter Zen Mode</button>
                        </div>
                    ))}
                </div>
            </section>
            
            <section>
                <h2 className="text-2xl font-bold font-serif text-primary mb-4 flex items-center"><Headphones className="mr-3" />Meditations & Soundscapes</h2>
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
