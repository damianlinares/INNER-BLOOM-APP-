
import React, { useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface p-2 border border-text-primary/20 rounded-md shadow-lg">
                <p className="label text-sm text-text-secondary">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color }} className="text-sm">{`${pld.name}: ${pld.value}`}</p>
                ))}
            </div>
        );
    }
    return null;
};

const ConsistencyHeatmap = () => {
    const { userData } = useUser();

    const data = useMemo(() => {
        const checkInDates = new Set(userData.checkIns.map(ci => ci.date));
        const today = new Date();
        const days = Array.from({ length: 90 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            return {
                date: date,
                checkedIn: checkInDates.has(dateString),
            };
        }).reverse();
        return days;
    }, [userData.checkIns]);

    return (
        <div className="grid grid-cols-7 gap-1.5 md:grid-cols-15 lg:grid-cols-30">
             {data.map(({ date, checkedIn }, index) => (
                <div key={index} className="relative group">
                    <div className={`w-full aspect-square rounded ${checkedIn ? 'bg-primary' : 'bg-base'}`} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-surface p-2 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {checkedIn ? 'Checked In' : 'No Check-in'}
                    </div>
                </div>
            ))}
        </div>
    );
};


const Progress: React.FC = () => {
    const { userData } = useUser();
    
    const chartData = useMemo(() => {
        return userData.checkIns.slice(0, 30).reverse().map(ci => ({
            date: new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            Mood: ci.mood,
            Energy: ci.energy,
            Sleep: ci.sleep,
        }));
    }, [userData.checkIns]);

    const correlationData = useMemo(() => {
        const data: { sleep: number, mood: number }[] = [];
        for (let i = 0; i < userData.checkIns.length - 1; i++) {
            const currentCheckIn = userData.checkIns[i];
            const previousCheckIn = userData.checkIns[i + 1];
            data.push({ sleep: previousCheckIn.sleep, mood: currentCheckIn.mood });
        }
        return data;
    }, [userData.checkIns]);
    
    const wordCloudData = useMemo(() => {
        const text = userData.journal.map(j => j.content).join(' ');
        const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
        const freq: { [key: string]: number } = {};
        const stopWords = new Set(['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']);

        words.forEach(word => {
            if (word.length > 2 && !stopWords.has(word)) {
                freq[word] = (freq[word] || 0) + 1;
            }
        });

        return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([text, value]) => ({ text, value }));
    }, [userData.journal]);
    
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold font-serif text-text-primary">Your Progress</h1>
                <p className="text-lg text-text-secondary mt-2">Track your trends, consistency, and correlations over time.</p>
            </header>

            {userData.checkIns.length > 0 ? (
                <>
                    <section className="bg-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold font-serif text-primary mb-4">Check-in Consistency</h2>
                        <ConsistencyHeatmap />
                    </section>

                    <section className="bg-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold font-serif text-primary mb-4">Check-in Trends (Last 30 Days)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F9FAFB/10" />
                                <XAxis dataKey="date" stroke="#9CA3AF" />
                                <YAxis domain={[1, 5]} stroke="#9CA3AF" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: '#F9FAFB' }} />
                                <Line type="monotone" dataKey="Mood" stroke="#818CF8" strokeWidth={2} name="Mood" />
                                <Line type="monotone" dataKey="Energy" stroke="#A78BFA" strokeWidth={2} name="Energy"/>
                                <Line type="monotone" dataKey="Sleep" stroke="#F472B6" strokeWidth={2} name="Sleep"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        <section className="md:col-span-3 bg-surface p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold font-serif text-secondary mb-4">Sleep vs. Mood Correlation</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F9FAFB/10" />
                                    <XAxis type="number" dataKey="sleep" name="Sleep Quality (Previous Night)" domain={[1, 5]} tickCount={5} stroke="#9CA3AF" />
                                    <YAxis type="number" dataKey="mood" name="Mood (Next Day)" domain={[1, 5]} tickCount={5} stroke="#9CA3AF" />
                                    <ZAxis range={[60, 400]} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                                    <Scatter name="Check-ins" data={correlationData} fill="#A78BFA" fillOpacity={0.6}/>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </section>
                        <section className="md:col-span-2 bg-surface p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold font-serif text-accent mb-4">Journal Themes</h2>
                            <div className="flex flex-wrap gap-2 items-center text-text-secondary h-[280px] content-center justify-center p-4">
                                {wordCloudData.length > 0 ? wordCloudData.map(({ text, value }) => (
                                    <span key={text} style={{ fontSize: `${12 + value * 2.5}px`, opacity: 0.6 + value / 15 }} className="hover:text-text-primary transition-colors cursor-default leading-none">
                                        {text}
                                    </span>
                                )) : <p className="text-center">Your journal themes will appear here as you write.</p>}
                            </div>
                        </section>
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-surface rounded-lg">
                    <p className="text-lg text-text-secondary">No progress data yet.</p>
                    <p className="text-text-primary mt-2">Complete your daily check-in to start tracking your progress.</p>
                </div>
            )}
        </div>
    );
};

export default Progress;
