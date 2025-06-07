import { TranscriptEntry } from '@/lib/types/transcription';

// Helper function to generate unique IDs
let idCounter = 0;
function generateId(): string {
  return `transcript-entry-${Date.now()}-${idCounter++}`;
}

// Helper function to create transcript entries with incrementing timestamps
function createEntry(
  speaker: string,
  text: string,
  minutesFromStart: number,
  confidence: number = 0.95
): TranscriptEntry {
  const timestamp = new Date();
  timestamp.setMinutes(timestamp.getMinutes() - (20 - minutesFromStart));
  
  return {
    id: generateId(),
    timestamp: timestamp,
    speaker,
    speakerId: speaker === 'Dr. Sarah Johnson' ? 'provider-1' : 'patient-1',
    text,
    confidence,
    isFinal: true,
    isPartial: false,
    aiProcessed: false,
  };
}

export const mockTherapySessionTranscript: TranscriptEntry[] = [
  // Opening and check-in
  createEntry('Dr. Sarah Johnson', 'Good afternoon, John. It\'s good to see you again. How have you been since our last session two weeks ago?', 0),
  createEntry('John Doe', 'Hi Dr. Johnson. Um, it\'s been... it\'s been a mixed bag, honestly. Some days were better than others.', 0.5),
  createEntry('Dr. Sarah Johnson', 'I appreciate you being honest about that. Can you tell me more about what made some days better and what made others more challenging?', 1),
  createEntry('John Doe', 'Well, the days when I stuck to the routine we talked about - you know, getting up at the same time, taking my walks - those were definitely better. But there were a few days where I just couldn\'t get myself out of bed until noon.', 1.5),
  
  // Review of treatment plan progress
  createEntry('Dr. Sarah Johnson', 'Let\'s talk about those harder days. Were you able to use any of the coping strategies we\'ve been working on?', 2.5),
  createEntry('John Doe', 'I tried the breathing exercises when I felt the anxiety coming on. Sometimes it helped, but twice last week it felt like it was just too overwhelming.', 3),
  createEntry('Dr. Sarah Johnson', 'It sounds like you\'re making an effort to use the tools, which is really important. Even when they don\'t work perfectly, you\'re building that habit. Tell me about one of those overwhelming moments.', 3.5),
  createEntry('John Doe', 'Tuesday was the worst. I had that presentation at work, and the night before I barely slept. Maybe got three hours. My mind just kept racing, thinking about everything that could go wrong.', 4),
  
  // Current symptoms discussion
  createEntry('Dr. Sarah Johnson', 'Sleep disturbance before stressful events is something we\'ve seen in your pattern before. How has your sleep been overall these past two weeks?', 5),
  createEntry('John Doe', 'Actually, besides that Tuesday night, it\'s been better. I\'ve been taking the trazodone like we discussed, and most nights I\'m getting six to seven hours.', 5.5),
  createEntry('Dr. Sarah Johnson', 'That\'s a significant improvement from the four to five hours you were getting before. How about your mood during the day? Where would you rate it on our scale of one to ten?', 6),
  createEntry('John Doe', 'Most days I\'d say about a six. Before starting treatment I was at like a three or four, so that\'s progress, right? But I still have those dips, especially in the late afternoon.', 6.5),
  
  // Risk assessment
  createEntry('Dr. Sarah Johnson', 'That is definitely progress, and it\'s important to acknowledge that. Now, I want to check in about something we always discuss. Have you had any thoughts of hurting yourself or any suicidal thoughts?', 7.5),
  createEntry('John Doe', 'No, nothing like that. I mean, I\'ve had moments where I felt really hopeless, but no actual thoughts of... of doing anything.', 8),
  createEntry('Dr. Sarah Johnson', 'I\'m glad to hear that, and I appreciate you being open with me. You remember you can always reach out to me or use the crisis line if those thoughts ever do come up?', 8.5),
  createEntry('John Doe', 'Yes, I have the number saved in my phone. And actually, having that safety plan we made - just knowing it\'s there - that helps somehow.', 9),
  
  // Medication review
  createEntry('Dr. Sarah Johnson', 'Good. Now, let\'s talk about your medications. You mentioned the trazodone is helping with sleep. How about the sertraline? Any side effects?', 9.5),
  createEntry('John Doe', 'The first week I had some nausea like you warned me about, but that\'s gone now. I think... I think it might be helping? It\'s hard to tell, but I don\'t feel as on edge all the time.', 10),
  createEntry('Dr. Sarah Johnson', 'It can take several weeks to feel the full effects, so what you\'re describing sounds appropriate. Are you taking it consistently every morning?', 10.5),
  createEntry('John Doe', 'Yes, I set an alarm on my phone like you suggested. Haven\'t missed a dose.', 11),
  
  // Life stressors and relationships
  createEntry('Dr. Sarah Johnson', 'Excellent. That consistency is really important. Now, you mentioned the work presentation. How are things going at work in general?', 11.5),
  createEntry('John Doe', 'Better, actually. I finally talked to my supervisor about needing some flexibility with my workload, like we rehearsed. She was more understanding than I expected.', 12),
  createEntry('Dr. Sarah Johnson', 'That took a lot of courage. How did it feel to advocate for yourself like that?', 12.5),
  createEntry('John Doe', 'Terrifying at first, but... empowering? Is that the right word? Like I actually have some control over my situation.', 13, 0.92),
  createEntry('Dr. Sarah Johnson', 'That\'s exactly the right word. You\'re recognizing your own agency. How about things at home? How are things with Lisa?', 13.5),
  createEntry('John Doe', 'We\'re communicating better. I\'ve been more open about what I\'m going through, and she\'s been really supportive. We even went on a date night last Saturday - first time in months.', 14),
  
  // Coping strategies deep dive
  createEntry('Dr. Sarah Johnson', 'That\'s wonderful to hear. Maintaining those connections is so important for recovery. Let\'s go back to coping strategies for a moment. Besides the breathing exercises, what else have you been trying?', 15),
  createEntry('John Doe', 'The journaling has been hit or miss. Some days I write pages, other days I can barely manage a sentence. But the physical exercise - that\'s been huge. Even just a 20-minute walk makes a difference.', 15.5),
  createEntry('Dr. Sarah Johnson', 'What do you notice specifically after those walks?', 16),
  createEntry('John Doe', 'My head feels clearer. Less foggy. And the anxious energy - it\'s like it has somewhere to go instead of just building up inside me.', 16.5),
  
  // Treatment plan adjustments
  createEntry('Dr. Sarah Johnson', 'That\'s excellent insight. Your body and mind are connected, and you\'re learning to use that connection therapeutically. Based on what you\'re telling me, I think we should continue with the current medication regimen and maybe add some structure to the journaling.', 17),
  createEntry('John Doe', 'What do you mean by structure?', 17.5),
  createEntry('Dr. Sarah Johnson', 'Instead of free-writing, we could try prompts. For example, each evening writing down three things that went well that day, no matter how small. This can help train your brain to notice the positive.', 18),
  createEntry('John Doe', 'I like that idea. Sometimes I sit there with the blank page and just freeze up. Having a specific thing to write about would help.', 18.5, 0.93),
  
  // Closing and next steps
  createEntry('Dr. Sarah Johnson', 'Great. I\'ll email you a list of prompts you can try. Now, before we wrap up, what do you want to focus on between now and our next session?', 19),
  createEntry('John Doe', 'I want to be more consistent with the morning routine, even on the bad days. And maybe... maybe try to reach out to my brother. We haven\'t talked in a while, and I know isolation makes everything worse.', 19.5),
  createEntry('Dr. Sarah Johnson', 'Those are excellent goals. Remember, progress isn\'t always linear. You\'re doing important work here. Should we keep our appointment in two weeks, same time?', 20),
  createEntry('John Doe', 'Yes, that works for me. Thank you, Dr. Johnson. I know I have a long way to go, but I\'m starting to believe it\'s possible to feel better.', 20.5),
  createEntry('Dr. Sarah Johnson', 'That hope is so important, John. You\'re doing great work. I\'ll see you in two weeks. Remember, you can always reach out between sessions if you need to.', 21),
];

// Export a function that returns a fresh copy with current timestamps
export function getMockTherapyTranscript(): TranscriptEntry[] {
  const now = new Date();
  idCounter = 0; // Reset counter for fresh IDs
  
  return mockTherapySessionTranscript.map((entry, index) => ({
    ...entry,
    id: generateId(), // Generate fresh IDs
    timestamp: new Date(now.getTime() + (index * 30000)), // 30 seconds apart
  }));
}
