import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { INITIAL_COMMUNITY_POSTS, INITIAL_INTENTIONS } from '../constants';
import type { CommunityPost, SharedIntention } from '../types';
import { User, Send, Plus, Loader2, Users, Sparkles } from 'lucide-react';

const reactions = ['🤗', '🙏', '❤️', '⭐'];

const Ripple: React.FC<{ onAnimationEnd: () => void }> = ({ onAnimationEnd }) => (
    <div className="absolute inset-0 border-2 border-secondary rounded-full animate-ripple-effect" onAnimationEnd={onAnimationEnd} />
);

const Community: React.FC = () => {
  const [posts, setPosts] = useLocalStorage<CommunityPost[]>('community-posts', INITIAL_COMMUNITY_POSTS);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [intentions, setIntentions] = useLocalStorage<SharedIntention[]>('community-intentions', INITIAL_INTENTIONS);
  const [newIntention, setNewIntention] = useState('');
  const [ripples, setRipples] = useState<string[]>([]);

  const handleAddPost = () => {
    if (!newPost.trim() || isPosting) return;
    setIsPosting(true);
    setTimeout(() => { // Simulate network delay
        const post: CommunityPost = {
          id: Date.now().toString(),
          author: 'You',
          content: newPost,
          reactions: { '🤗': 0, '🙏': 0, '❤️': 0, '⭐': 0 },
        };
        setPosts([post, ...posts]);
        setNewPost('');
        setIsPosting(false);
    }, 700);
  };

  const handleReaction = (postId: string, reaction: string, e: React.MouseEvent) => {
    const button = e.currentTarget;
    button.classList.add('animate-pop');
    button.addEventListener('animationend', () => button.classList.remove('animate-pop'), { once: true });

    setPosts(
      posts.map(p =>
        p.id === postId ? { ...p, reactions: { ...p.reactions, [reaction]: p.reactions[reaction] + 1 } } : p
      )
    );
  };
  
  const handleAddIntention = () => {
      if(!newIntention.trim()) return;
      const intention: SharedIntention = {
          id: Date.now().toString(),
          text: newIntention,
          author: 'You',
          energy: 1,
      };
      setIntentions([intention, ...intentions]);
      setNewIntention('');
  };
  
  const handleAddEnergy = (intentionId: string) => {
    setIntentions(
      intentions.map(i => i.id === intentionId ? { ...i, energy: i.energy + 1 } : i)
    );
    const rippleId = `${intentionId}-${Date.now()}`;
    setRipples(prev => [...prev, rippleId]);
  };
  
  const [timeToSunset, setTimeToSunset] = useState('00:00:00');
  const [isRitualActive, setIsRitualActive] = useState(false);
  const [participants, setParticipants] = useState(137);

  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        const sunset = new Date();
        sunset.setUTCHours(18, 0, 0, 0); 
        if (now.getTime() > sunset.getTime()) sunset.setUTCDate(sunset.getUTCDate() + 1);
        
        const diff = sunset.getTime() - now.getTime();
        setIsRitualActive(diff < 5 * 60 * 1000 && diff > 0);

        const h = Math.floor(diff / 1000 / 60 / 60).toString().padStart(2, '0');
        const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
        const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
        setTimeToSunset(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (isRitualActive) {
        const interval = setInterval(() => setParticipants(p => p + (Math.random() > 0.5 ? 1 : -1)), 2000);
        return () => clearInterval(interval);
    }
  }, [isRitualActive]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-text-primary">Support Circle</h1>
            <p className="text-lg text-text-secondary mt-2">A safe, anonymous space to share and connect.</p>
        </header>

        <div className="bg-surface p-6 rounded-xl shadow-soft mb-8 border border-border-color">
          <textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Share a thought, a feeling, a moment..."
            className="w-full h-24 p-3 border border-border-color rounded-xl bg-background focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-shadow duration-200"
          ></textarea>
          <div className="flex justify-end mt-4">
            <button onClick={handleAddPost} disabled={isPosting} className="bg-primary text-text-primary font-semibold px-6 py-2 rounded-xl hover:bg-gray-100 flex items-center gap-2 disabled:bg-gray-200 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border border-border-color">
                {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16}/>} 
                {isPosting ? 'Sharing...' : 'Share Anonymously'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-surface p-4 rounded-xl shadow-soft flex space-x-4 border border-border-color">
               <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center text-text-secondary">
                 <User size={20} />
               </div>
               <div className="flex-1">
                  <p className="text-sm text-text-secondary font-medium">{post.author}</p>
                  <p className="my-2 text-text-primary">{post.content}</p>
                  <div className="flex items-center space-x-2 pt-2 border-t border-border-color">
                    {reactions.map(r => (
                      <button key={r} onClick={(e) => handleReaction(post.id, r, e)} className="flex items-center space-x-1 px-3 py-1 rounded-full bg-background hover:bg-secondary/10 transition-colors group">
                        <span>{r}</span>
                        <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary">{post.reactions[r]}</span>
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className={`bg-surface p-6 rounded-xl shadow-soft lg:sticky lg:top-8 border border-border-color ${isRitualActive ? 'animate-subtle-glow' : ''}`}>
            
            <div className="text-center">
                <h2 className="text-xl font-semibold text-secondary">Collective Healing Ritual</h2>
                <p className="text-text-secondary mt-2 text-sm">Join others in a synchronized moment of peace at sunset (UTC).</p>
                {isRitualActive ? (
                    <div className="mt-4 p-4 rounded-xl bg-secondary/10">
                        <p className="text-lg font-semibold text-secondary">The ritual is happening now!</p>
                        <p className="text-5xl font-semibold my-4 text-secondary animate-pulse">Breathe...</p>
                        <div className="flex items-center justify-center text-text-secondary text-sm">
                            <Users size={16} className="mr-2"/>
                            <span>{participants} people are breathing with you.</span>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4">
                        <p className="text-sm font-medium text-text-secondary">Next ritual begins in:</p>
                        <p className="text-4xl font-mono font-semibold text-secondary my-2">{timeToSunset}</p>
                    </div>
                )}
            </div>

            <div className="text-center mt-8 pt-8 border-t border-border-color">
                <h2 className="text-xl font-semibold text-secondary">Shared Intentions</h2>
                <div className="space-y-3 mt-4 text-left">
                    {intentions.map(intention => (
                        <div key={intention.id} className="bg-background p-3 rounded-xl flex items-center justify-between transition-all hover:shadow-md">
                            <p className="text-text-primary text-sm italic">"{intention.text}"</p>
                            <button onClick={() => handleAddEnergy(intention.id)} className="relative flex items-center gap-1.5 text-xs text-secondary font-medium px-3 py-2 rounded-full hover:bg-secondary/10 transition-colors">
                                <Sparkles size={14}/> {intention.energy}
                                {ripples.filter(r => r.startsWith(intention.id)).map(r => <Ripple key={r} onAnimationEnd={() => setRipples(current => current.filter(id => id !== r))} />)}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex space-x-2">
                    <input 
                        value={newIntention} 
                        onChange={e => setNewIntention(e.target.value)} 
                        onKeyPress={e => e.key === 'Enter' && handleAddIntention}
                        placeholder="Share an intention..." 
                        className="flex-1 text-sm p-2 border border-border-color rounded-xl bg-background focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-shadow min-w-0"
                    />
                    <button onClick={handleAddIntention} className="p-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"><Plus size={18}/></button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Community;