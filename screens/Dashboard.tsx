import React from 'react';
import { useUser } from '../context/UserContext';
import { Leaf, Moon, Wind, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ToolCard = ({ icon, title, subtitle, to }: { icon: React.ReactNode; title: string; subtitle: string, to: string }) => (
    <Link 
        to={to}
        className="bg-surface p-4 rounded-xl flex items-center space-x-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out border border-border-color hover:border-secondary/30"
    >
        {icon}
        <div>
            <p className="font-semibold text-text-primary">{title}</p>
            <p className="text-sm text-text-secondary">{subtitle}</p>
        </div>
    </Link>
);

const Dashboard: React.FC = () => {
    const { openCheckInModal } = useUser();
    
    const greeting = React.useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);
    
    const heroImage = "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    return (
        <div className="space-y-6">
            <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-soft">
                <img src={heroImage} alt="Serene lake at sunrise" className="absolute inset-0 w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/30"/>
                <div className="relative h-full flex flex-col justify-end p-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-white shadow-lg">{greeting}</h1>
                    <p className="text-lg text-white/90 mt-1 shadow-md">Ready to continue your journey inward?</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1 bg-secondary/90 p-6 rounded-xl shadow-soft text-white flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">Daily Reflection</h2>
                        <p className="mt-2 opacity-90">How your feeling today?</p>
                    </div>
                    <button 
                        onClick={openCheckInModal}
                        className="mt-4 bg-primary text-text-primary font-semibold w-full py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-border-color">
                        Check In Now
                    </button>
                </div>
                
                <div className="md:col-span-1 grid grid-rows-2 gap-6">
                    <ToolCard 
                        to="/tools"
                        icon={<Leaf className="w-8 h-8 text-secondary"/>} 
                        title="Guided Meditation" 
                        subtitle="5-20 min"
                    />
                    <ToolCard 
                        to="/tools"
                        icon={<Moon className="w-8 h-8 text-secondary"/>} 
                        title="Sleep Stories" 
                        subtitle="15-45 min"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <ToolCard 
                    to="/tools"
                    icon={<Wind className="w-8 h-8 text-secondary"/>} 
                    title="Breathing Exercise" 
                    subtitle="2-10 min"
                />
                 <ToolCard 
                    to="/affirmations"
                    icon={<Heart className="w-8 h-8 text-accent-pink"/>} 
                    title="Daily Affirmations" 
                    subtitle="1-2 min"
                />
            </div>
        </div>
    );
};

export default Dashboard;