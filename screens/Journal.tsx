import React, { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { getJournalReflection, getJournalPrompt } from '../services/geminiService';
import { Sparkles, Loader2, Cloud, CloudCheck, Wand2 } from 'lucide-react';
import type { JournalEntry } from '../types';

const groupEntriesByDate = (entries: JournalEntry[]) => {
    const groups: { [key: string]: JournalEntry[] } = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    entries.forEach(entry => {
        const entryDate = new Date(entry.date);
        let key: string;

        if (isSameDay(entryDate, today)) {
            key = 'Today';
        } else if (isSameDay(entryDate, yesterday)) {
            key = 'Yesterday';
        } else {
            key = entryDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
        }

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(entry);
    });
    return groups;
};


const Journal: React.FC = () => {
  const { userData, addJournalEntry, updateJournalEntry } = useUser();
  const [newEntryContent, setNewEntryContent] = useState('');
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  
  const groupedEntries = useMemo(() => groupEntriesByDate(userData.journal), [userData.journal]);

  const handleAddEntry = () => {
    if (newEntryContent.trim() === '') return;
    addJournalEntry(newEntryContent);
    setNewEntryContent('');
  };

  const handleGetReflection = async (entry: JournalEntry) => {
    if (!navigator.onLine) {
        updateJournalEntry({...entry, needsReflection: true, synced: false });
        return;
    }
    updateJournalEntry({ ...entry, isLoadingReflection: true });
    const reflection = await getJournalReflection(entry.content);
    updateJournalEntry({ ...entry, reflection, isLoadingReflection: false, needsReflection: false, synced: true });
  };
  
  const handleGetPrompt = async () => {
    setIsPromptLoading(true);
    const prompt = await getJournalPrompt(userData.checkIns);
    setNewEntryContent(prompt);
    setIsPromptLoading(false);
  };

  const EntryStatus = ({ entry }: { entry: JournalEntry }) => {
    if(entry.isLoadingReflection) return <Loader2 className="w-4 h-4 text-text-secondary animate-spin" title="Generating reflection..." />;
    if(entry.synced === false || entry.needsReflection === true) return <Cloud className="w-4 h-4 text-text-secondary" title="Saved locally. Will sync when online."/>;
    if(entry.synced === true && entry.reflection) return <CloudCheck className="w-4 h-4 text-secondary" title="Synced with reflection."/>;
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-text-primary">My Journal</h1>
        <p className="text-lg text-text-secondary mt-2">A private space for your thoughts and feelings.</p>
      </header>

      <div className="bg-surface p-6 rounded-xl shadow-soft mb-8 border border-border-color">
        <textarea
          value={newEntryContent}
          onChange={(e) => setNewEntryContent(e.target.value)}
          placeholder="What's on your mind today?"
          className="w-full h-40 p-3 border border-border-color rounded-xl bg-background focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-shadow duration-200"
        ></textarea>
        <div className="flex justify-between items-center mt-4">
           <button
            onClick={handleGetPrompt}
            disabled={isPromptLoading || userData.checkIns.length === 0}
            className="flex items-center space-x-2 text-sm text-secondary font-medium hover:text-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            title={userData.checkIns.length === 0 ? "Complete a check-in to get personalized prompts" : "Get a personalized prompt"}
          >
            {isPromptLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            <span>{isPromptLoading ? 'Thinking...' : 'Need a spark?'}</span>
          </button>
          <button
            onClick={handleAddEntry}
            className="bg-primary text-text-primary font-semibold px-6 py-2 rounded-xl hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border border-border-color"
          >
            Save Entry
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-text-primary">Past Entries</h2>
        {userData.journal.length === 0 ? (
          <div className="text-center py-10 bg-surface rounded-xl shadow-soft border border-border-color">
            <p className="text-text-secondary">Your journal is empty.</p>
            <p className="text-text-primary mt-1">Write your first entry above to begin your journey.</p>
          </div>
        ) : (
          Object.entries(groupedEntries).map(([groupTitle, entries]: [string, JournalEntry[]]) => (
            <div key={groupTitle}>
                <h3 className="text-lg font-medium text-text-secondary mb-4 sticky top-0 bg-background/80 backdrop-blur-sm py-2">{groupTitle}</h3>
                <div className="space-y-4">
                {entries.map((entry) => (
                    <div key={entry.id} className="bg-surface p-6 rounded-xl shadow-soft border border-border-color">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-text-secondary mb-2">{new Date(entry.date).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: 'numeric' })}</p>
                        <EntryStatus entry={entry} />
                    </div>
                    <p className="text-text-primary whitespace-pre-wrap">{entry.content}</p>
                    <div className="mt-4 pt-4 border-t border-border-color">
                        {entry.reflection ? (
                        <div className="bg-secondary/10 p-4 rounded-xl">
                            <p className="font-semibold text-secondary flex items-center"><Sparkles className="w-4 h-4 mr-2" /> AI Reflection</p>
                            <p className="text-text-secondary italic mt-1">{entry.reflection}</p>
                        </div>
                        ) : (
                        <button
                            onClick={() => handleGetReflection(entry)}
                            disabled={entry.isLoadingReflection}
                            className="flex items-center space-x-2 text-sm text-secondary font-medium hover:text-secondary/80 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {entry.isLoadingReflection ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            <span>{entry.isLoadingReflection ? 'Generating...' : 'Get Reflection'}</span>
                        </button>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Journal;