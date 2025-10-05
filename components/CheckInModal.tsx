import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { X } from 'lucide-react';

const steps = ["Mood", "Energy", "Sleep", "Gratitude", "Summary"];
const moodEmojis = ['😔', '😕', '😐', '🙂', '😄'];
const levelLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];
const sleepLabels = ['Very Poor', 'Poor', 'Okay', 'Good', 'Great'];


const SegmentedControl = ({ value, setValue, labels, colors }: { value: number, setValue: (val: number) => void, labels: string[], colors: string[] }) => {
    return (
        <div className="flex justify-center space-x-2">
            {labels.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setValue(index + 1)}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-300 transform ${
                        value === index + 1 ? `${colors[0]} scale-110 shadow-lg` : `${colors[1]} hover:scale-105`
                    }`}
                >
                    <span className="text-2xl">{moodEmojis[index]}</span>
                </button>
            ))}
        </div>
    );
};


const CheckInModal: React.FC = () => {
  const { isCheckInModalOpen, closeCheckInModal, completeCheckIn } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [gratitude, setGratitude] = useState<[string, string, string]>(['', '', '']);
  
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
    if(currentStep < steps.length - 1) {
        setDirection('forward');
        setCurrentStep(s => s + 1);
    }
  };
  
  const handleBack = () => {
    if(currentStep > 0) {
        setDirection('backward');
        setCurrentStep(s => s - 1);
    }
  };

  const handleGratitudeChange = (index: number, value: string) => {
    const newGratitude = [...gratitude] as [string, string, string];
    newGratitude[index] = value;
    setGratitude(newGratitude);
  };

  const resetState = () => {
      setCurrentStep(0);
      setMood(3);
      setEnergy(3);
      setSleep(3);
      setGratitude(['', '', '']);
  }

  const handleComplete = () => {
      completeCheckIn({ mood, energy, sleep, gratitude });
      handleClose();
  }
  
  const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        closeCheckInModal();
        resetState();
        setIsExiting(false);
      }, 500);
  }

  if (!isCheckInModalOpen) return null;

  const renderStepContent = () => {
    const animationClass = direction === 'forward' ? 'animate-slide-in' : 'animate-slide-in'; // Simplified for consistency
    
    return (
        <div key={currentStep} className={`w-full ${animationClass}`}>
            {
                (() => {
                    switch (currentStep) {
                        case 0:
                            return (
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-center">How are you feeling today?</h3>
                                    <p className="text-center text-text-secondary mb-6">{levelLabels[mood-1]}</p>
                                    <SegmentedControl value={mood} setValue={setMood} labels={moodEmojis} colors={['bg-primary', 'bg-base']} />
                                </div>
                            );
                        case 1:
                            return (
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-center">What's your energy level?</h3>
                                    <p className="text-center text-text-secondary mb-6">{levelLabels[energy-1]}</p>
                                    <SegmentedControl value={energy} setValue={setEnergy} labels={moodEmojis} colors={['bg-secondary', 'bg-base']} />
                                </div>
                            );
                        case 2:
                            return (
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-center">How did you sleep?</h3>
                                    <p className="text-center text-text-secondary mb-6">{sleepLabels[sleep-1]}</p>
                                    <SegmentedControl value={sleep} setValue={setSleep} labels={moodEmojis} colors={['bg-accent', 'bg-base']} />
                                </div>
                            );
                        case 3:
                            return (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-center">What are three things you're grateful for?</h3>
                                    <div className="space-y-3">
                                        {[0, 1, 2].map(i => (
                                            <input key={i} type="text" placeholder={`${i + 1}.`} value={gratitude[i]} onChange={e => handleGratitudeChange(i, e.target.value)} className="w-full p-2 border border-text-primary/20 rounded-md bg-base focus:ring-secondary focus:border-secondary"/>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 4:
                            return (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-center">Ready to complete your check-in?</h3>
                                    <p className="text-center text-text-secondary">You'll earn 10 points and grow your Wellness Tree.</p>
                                </div>
                            );
                        default:
                            return null;
                    }
                })()
            }
        </div>
    );
  };

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`bg-surface rounded-lg shadow-xl p-8 w-full max-w-md relative border border-text-primary/10 transition-transform duration-300 ${isExiting ? 'scale-90' : 'scale-100'}`}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
          <X size={24} />
        </button>
        <div className="mb-6">
            <div className="w-full bg-base rounded-full h-1.5">
                <div className="bg-secondary h-1.5 rounded-full transition-all duration-500" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
            </div>
        </div>
        
        <div className="min-h-[200px] flex items-center justify-center overflow-hidden relative">
            {renderStepContent()}
        </div>

        <div className="flex justify-between mt-8">
          <button 
            onClick={handleBack} 
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-md bg-surface text-text-secondary hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed border border-text-primary/20">
            Back
          </button>
          {currentStep < steps.length - 1 ? (
             <button onClick={handleNext} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90">
                Next
            </button>
          ) : (
            <button onClick={handleComplete} className="px-4 py-2 rounded-md bg-secondary text-white hover:bg-secondary/90">
                Complete Check-in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;
