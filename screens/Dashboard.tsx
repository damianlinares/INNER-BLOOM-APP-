
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import WellnessTree from '../components/WellnessTree';
import { Flame, Star, CalendarCheck2, Compass, Lightbulb, X, GripVertical } from 'lucide-react';
import { JOURNEYS } from '../constants';
import type { DashboardComponent } from '../types';

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: 'accent' | 'primary' | 'secondary' }) => (
    <div className="bg-surface p-6 rounded-lg shadow-md flex items-center space-x-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
        <div className={`p-3 bg-${color}/20 rounded-full`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-text-secondary">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const CustomizeModal = ({ layout, onLayoutChange, onClose }: { layout: DashboardComponent[], onLayoutChange: (newLayout: DashboardComponent[]) => void, onClose: () => void }) => {
    const componentNames: Record<DashboardComponent, string> = {
        stats: 'My Stats',
        tree: 'Wellness Tree',
        journey: 'Active Journey',
        insight: 'AI Insight',
    };

    const move = (index: number, direction: 'up' | 'down') => {
        const newLayout = [...layout];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newLayout.length) return;
        [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
        onLayoutChange(newLayout);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-sm relative border border-text-primary/10">
                <h3 className="text-xl font-bold font-serif mb-4 text-center">Customize Dashboard</h3>
                <div className="space-y-2">
                    {layout.map((key, index) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-base rounded-md">
                            <GripVertical className="text-text-secondary cursor-grab" />
                            <span className="font-semibold">{componentNames[key]}</span>
                            <div className="flex space-x-1">
                                <button onClick={() => move(index, 'up')} disabled={index === 0} className="p-1 rounded-md hover:bg-white/10 disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg></button>
                                <button onClick={() => move(index, 'down')} disabled={index === layout.length - 1} className="p-1 rounded-md hover:bg-white/10 disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90">Done</button>
            </div>
        </div>
    );
};


const Dashboard: React.FC = () => {
    const { userData, openCheckInModal, updateDashboardLayout } = useUser();
    const [isCustomizeModalOpen, setCustomizeModalOpen] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const hasCheckedInToday = userData.lastCheckIn === today;
    
    const greeting = React.useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);
    
    const activeJourneyData = userData.activeJourney ? JOURNEYS.find(j => j.id === userData.activeJourney.journeyId) : null;
    
    const dashboardComponents: Record<DashboardComponent, React.ReactNode> = {
        stats: (
            <div className="md:col-span-1 flex flex-col gap-6">
                <StatCard icon={<Flame className="w-6 h-6 text-accent" />} label="Current Streak" value={`${userData.streak} Days`} color="accent" />
                <StatCard icon={<Star className="w-6 h-6 text-primary" />} label="Wellness Points" value={userData.points} color="primary" />
                <StatCard icon={<CalendarCheck2 className="w-6 h-6 text-secondary" />} label="Last Check-in" value={userData.lastCheckIn ? new Date(userData.lastCheckIn).toLocaleDateString(undefined, {month: 'long', day: 'numeric'}) : 'None yet'} color="secondary" />
            </div>
        ),
        tree: (
            <div className="md:col-span-2 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-slate-900 to-pink-900 bg-[length:200%_200%] animate-aurora opacity-30"/>
                <WellnessTree streak={userData.streak} />
            </div>
        ),
        journey: activeJourneyData && userData.activeJourney && (
            <div className="md:col-span-3 bg-surface p-6 rounded-lg shadow-md flex items-center space-x-4">
                <div className="p-3 bg-primary/20 rounded-full"><Compass className="w-8 h-8 text-primary" /></div>
                <div>
                    <p className="text-sm text-text-secondary">Active Journey</p>
                    <h3 className="text-xl font-semibold text-text-primary">{activeJourneyData.title}</h3>
                    <p className="text-text-secondary mt-1">{`Step ${userData.activeJourney.currentStep + 1} of ${activeJourneyData.steps.length}: ${activeJourneyData.steps[userData.activeJourney.currentStep].title}`}</p>
                </div>
            </div>
        ),
        insight: userData.insights.length > 0 && (
            <div className="md:col-span-3 bg-surface p-6 rounded-lg shadow-md flex items-center space-x-4">
                <div className="p-3 bg-secondary/20 rounded-full"><Lightbulb className="w-8 h-8 text-secondary" /></div>
                <div>
                    <p className="text-sm text-text-secondary">AI Insight for Today</p>
                    <p className="text-text-primary italic">"{userData.insights[0]}"</p>
                </div>
            </div>
        )
    };
    
    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold font-serif text-text-primary">{greeting}</h1>
                    <p className="text-lg text-text-secondary mt-2">Ready to continue your journey inward?</p>
                </div>
                <button onClick={() => setCustomizeModalOpen(true)} className="bg-surface text-text-secondary px-4 py-2 rounded-lg hover:bg-white/5 text-sm">Customize</button>
            </header>
            
            {!hasCheckedInToday && (
                <div className="bg-surface p-6 rounded-lg shadow-lg flex items-center justify-between border border-primary/50">
                    <div>
                        <h2 className="text-xl font-semibold">Time for your daily check-in?</h2>
                        <p className="text-text-secondary mt-1">A few moments of reflection can shape your entire day.</p>
                    </div>
                    <button onClick={openCheckInModal} className="bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/20 hover:shadow-primary/40 animate-pulse">
                        Check In Now
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {userData.dashboardLayout.map(key => dashboardComponents[key]).filter(Boolean)}
            </div>
            
            {isCustomizeModalOpen && (
                <CustomizeModal
                    layout={userData.dashboardLayout}
                    onLayoutChange={updateDashboardLayout}
                    onClose={() => setCustomizeModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;