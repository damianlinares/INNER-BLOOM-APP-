import React from 'react';

const Sprout = () => <div className="text-5xl">🌱</div>;
const Sapling = () => <div className="text-6xl">🌳</div>;
const SmallTree = () => <div className="text-7xl">🌲</div>;
const GrowingTree = () => <div className="text-8xl">🌳<span className="text-4xl">🌿</span></div>;
const FlourishingTree = () => <div className="text-9xl">🌳<span className="text-5xl">🌸</span></div>;
const MajesticTree = () => <div className="text-9xl">🌳<span className="text-6xl">✨</span></div>;


const WellnessTree: React.FC<{ streak: number }> = ({ streak }) => {
    let TreeComponent;
    let description;

    if (streak <= 1) {
        TreeComponent = Sprout;
        description = "A new journey begins.";
    } else if (streak <= 4) {
        TreeComponent = Sapling;
        description = "Your consistency is taking root.";
    } else if (streak <= 9) {
        TreeComponent = SmallTree;
        description = "Growing stronger every day.";
    } else if (streak <= 19) {
        TreeComponent = GrowingTree;
        description = "Your dedication is branching out.";
    } else if (streak <= 29) {
        TreeComponent = FlourishingTree;
        description = "In full bloom with your commitment.";
    } else {
        TreeComponent = MajesticTree;
        description = "A testament to your self-care.";
    }
    
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-surface rounded-xl h-full">
            <div className="h-28 flex items-end animate-gentle-float">
                <TreeComponent />
            </div>
            <p className="mt-4 font-serif text-lg text-text-primary">{description}</p>
            <p className="text-sm text-text-secondary">Keep nurturing your growth.</p>
        </div>
    );
};

export default WellnessTree;