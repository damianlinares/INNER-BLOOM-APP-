
import type { BreathingExercise, Soundscape, Meditation, CommunityPost, Journey, Achievement, SharedIntention } from './types';

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: 'box',
    title: 'Box Breathing',
    description: 'A simple technique to calm your nervous system.',
    pattern: [
      { name: 'Inhale', duration: 4 },
      { name: 'Hold', duration: 4 },
      { name: 'Exhale', duration: 4 },
      { name: 'Hold', duration: 4 },
    ],
  },
  {
    id: '478',
    title: '4-7-8 Breathing',
    description: 'Known as the "relaxing breath," it helps with anxiety and sleep.',
    pattern: [
      { name: 'Inhale', duration: 4 },
      { name: 'Hold', duration: 7 },
      { name: 'Exhale', duration: 8 },
    ],
  },
];

export const SOUNDSCAPES: Soundscape[] = [
    { id: 'rain', title: 'Gentle Rain', file: 'https://cdn.pixabay.com/audio/2022/10/18/audio_b2890bd39d.mp3' },
    { id: 'forest', title: 'Forest Ambience', file: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde64313a.mp3' },
    { id: 'waves', title: 'Ocean Waves', file: 'https://cdn.pixabay.com/audio/2023/09/23/audio_63044b769f.mp3' },
];

export const MEDITATIONS: Meditation[] = [
    { id: 'anxiety', title: 'Reducing Anxiety', category: 'Anxiety', duration: 300, file: 'https://cdn.pixabay.com/audio/2024/05/20/audio_2476b7b719.mp3' },
    { id: 'sleep', title: 'Preparing for Sleep', category: 'Sleep', duration: 420, file: 'https://cdn.pixabay.com/audio/2023/11/24/audio_332a673d36.mp3' },
    { id: 'gratitude', title: 'Cultivating Gratitude', category: 'Gratitude', duration: 240, file: 'https://cdn.pixabay.com/audio/2024/01/24/audio_6527582b13.mp3' },
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
    { id: '1', author: 'A fellow traveler', content: "Feeling a bit overwhelmed today, but reminding myself that this feeling will pass. Sending strength to anyone who needs it.", reactions: { '🤗': 5, '🙏': 3, '❤️': 7, '⭐': 2 } },
    { id: '2', author: 'A quiet observer', content: "Took a walk in nature this morning and it really helped clear my head. It's the small things.", reactions: { '🤗': 8, '🙏': 2, '❤️': 12, '⭐': 4 } },
];

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'gratitude_journey_comp', title: 'Grateful Heart', description: 'Completed the 7-Day Gratitude Journey.', icon: '💖' },
    { id: 'first_entry', title: 'The First Step', description: 'Wrote your first journal entry.', icon: '✍️' },
    { id: '10_entries', title: 'Reflective Mind', description: 'Wrote 10 journal entries.', icon: '📚' },
    { id: '7_day_streak', title: 'Consistent Care', description: 'Maintained a 7-day check-in streak.', icon: '🗓️' },
];

export const JOURNEYS: Journey[] = [
    {
        id: 'gratitude_7_day',
        title: '7-Day Gratitude Challenge',
        description: 'Cultivate a deeper sense of gratitude and joy by focusing on the good things in your life for one week.',
        achievementId: 'gratitude_journey_comp',
        steps: [
            { id: 'd1', title: 'Day 1: Simple Pleasures', type: 'journal', prompt: 'Write about three simple things that brought you a moment of pleasure today.' },
            { id: 'd2', title: 'Day 2: A Person of Gratitude', type: 'journal', prompt: 'Think of someone you are grateful for. Write a short note of appreciation to them (you don\'t have to send it).' },
            { id: 'd3', title: 'Day 3: Mindful Gratitude', type: 'meditation', targetId: 'gratitude' },
            { id: 'd4', title: 'Day 4: Overcoming a Challenge', type: 'journal', prompt: 'Reflect on a past challenge you overcame. What strengths did you discover in yourself?' },
            { id: 'd5', title: 'Day 5: The Body\'s Wisdom', type: 'journal', prompt: 'Write about three things you are grateful for about your body today.' },
            { id: 'd6', title: 'Day 6: Calm Breathing', type: 'breathing', targetId: 'box' },
            { id: 'd7', title: 'Day 7: Looking Forward', type: 'journal', prompt: 'What are you grateful for in anticipation of the week ahead?' },
        ]
    }
];

export const INITIAL_INTENTIONS: SharedIntention[] = [
    { id: '1', text: 'To be kind to myself today.', author: 'anonymous', energy: 15 },
    { id: '2', text: 'To find a moment of quiet.', author: 'anonymous', energy: 22 },
];