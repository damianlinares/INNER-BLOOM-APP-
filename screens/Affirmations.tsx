import React, { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { Plus, Star, X, Quote as QuoteIcon } from 'lucide-react';
import type { Affirmation } from '../types';

const AffirmationCard: React.FC<{
    affirmation: Affirmation;
    onToggleFavorite: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ affirmation, onToggleFavorite, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="bg-surface p-4 rounded-xl shadow-md flex flex-col justify-between h-36 relative transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-border-color"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <p className="text-text-primary">{affirmation.text}</p>
            <div className="flex justify-end">
                <button
                    onClick={() => onToggleFavorite(affirmation.id)}
                    className="p-1 text-text-secondary hover:text-yellow-400"
                    aria-label="Toggle favorite"
                >
                    <Star size={18} className={`transition-colors ${affirmation.isFavorite ? 'fill-current text-yellow-400' : ''}`} />
                </button>
            </div>
             {isHovered && (
                <button
                    onClick={() => onDelete(affirmation.id)}
                    className="absolute top-2 right-2 p-1 bg-background rounded-full text-text-secondary hover:text-secondary"
                    aria-label="Delete affirmation"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
};


const Affirmations: React.FC = () => {
    const { userData, addAffirmation, toggleAffirmationFavorite, deleteAffirmation } = useUser();
    const [newAffirmationText, setNewAffirmationText] = useState('');

    const handleAddAffirmation = () => {
        if (newAffirmationText.trim() === '') return;
        addAffirmation(newAffirmationText);
        setNewAffirmationText('');
    };
    
    const favoriteAffirmations = useMemo(() => userData.affirmations.filter(a => a.isFavorite), [userData.affirmations]);
    
    const featuredAffirmation = useMemo(() => {
        if (favoriteAffirmations.length > 0) {
            return favoriteAffirmations[Math.floor(Math.random() * favoriteAffirmations.length)];
        }
        if (userData.affirmations.length > 0) {
            return userData.affirmations[Math.floor(Math.random() * userData.affirmations.length)];
        }
        return null;
    }, [userData.affirmations, favoriteAffirmations]);

    const sortedAffirmations = useMemo(() => {
        return [...userData.affirmations].sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return 0;
        });
    }, [userData.affirmations]);


    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl md:text-4xl font-semibold text-text-primary">Daily Affirmations</h1>
                <p className="text-lg text-text-secondary mt-2">Empower your mindset with positive statements.</p>
            </header>
            
            {featuredAffirmation && (
                 <section className="bg-surface p-6 rounded-xl shadow-soft border-l-4 border-secondary border border-border-color">
                     <h2 className="text-xl font-semibold text-secondary mb-2 flex items-center">
                         <QuoteIcon className="w-6 h-6 mr-3 -scale-x-100" />
                         Thought for the Moment
                     </h2>
                     <p className="text-2xl text-text-primary italic">"{featuredAffirmation.text}"</p>
                 </section>
            )}

            <section className="bg-surface p-6 rounded-xl shadow-soft border border-border-color">
                <h2 className="text-2xl font-semibold text-secondary mb-4">Add Your Own</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <textarea
                        value={newAffirmationText}
                        onChange={(e) => setNewAffirmationText(e.target.value)}
                        placeholder="e.g., I am resilient and can handle whatever comes my way."
                        className="w-full h-20 sm:h-auto p-3 border border-border-color rounded-xl bg-background focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-shadow duration-200"
                    />
                    <button
                        onClick={handleAddAffirmation}
                        className="flex items-center justify-center gap-2 bg-primary text-text-primary font-semibold px-6 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 sm:h-fit border border-border-color"
                    >
                        <Plus size={18} />
                        Add Affirmation
                    </button>
                </div>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4">My Affirmations</h2>
                {sortedAffirmations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedAffirmations.map(affirmation => (
                            <AffirmationCard
                                key={affirmation.id}
                                affirmation={affirmation}
                                onToggleFavorite={toggleAffirmationFavorite}
                                onDelete={deleteAffirmation}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-surface rounded-xl shadow-soft border border-border-color">
                        <p className="text-text-secondary">Your collection is empty.</p>
                        <p className="text-text-primary mt-1">Add your first affirmation above to get started.</p>
                    </div>
                )}
            </section>

        </div>
    );
};

export default Affirmations;