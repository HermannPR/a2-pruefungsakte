export const instructionTranslations = {
  r1: { question: 'What should the residents do on Tuesday morning?' },
  r2: { question: 'Why is Nora arriving later?' },
  r3: { question: 'Which statement is correct?' },
  r4: { question: 'What does Karim want?' },
  r5: { question: 'When can a book not be renewed?' },
  r6: { question: 'Which day is probably better for a hike?' },
  r7: { question: 'What is different on Friday?' },
  r8: { question: 'Mina studies in the mornings and can only work on two evenings. Which advertisement fits?' },
  r9: { question: 'How does Mr Öztürk get into his room when he arrives?' },
  r10: { question: 'What is possible today?' },
  l1: { question: 'What changes for the train to Bonn?' },
  l2: { question: 'Why should the person call back?' },
  l3: { question: 'What is still unclear?' },
  l4: { question: 'What is free on Sunday morning?' },
  l5: { question: 'What should Ms Santos do first?' },
  l6: { question: 'Which means of transport are running without changes?' },
  l7: { question: 'When will the medication probably arrive?' },
  l8: { question: 'How are the people travelling to the lake?' },
  l9: { question: 'What does the person especially like doing?' },
  l10: { question: 'What should Mr Chen do?' },
  w1: {
    prompt: 'You cannot attend your German course tomorrow. Write to your course teacher, Ms Klein.',
    bullets: ['Why can you not attend?', 'Ask for the homework.', 'Say when you will return.']
  },
  w2: {
    prompt: 'Your friend Max invites you to his birthday party on Saturday. Reply to him.',
    bullets: ['Thank him.', 'Accept or decline and give a reason.', 'Ask whether you should bring anything.']
  },
  w3: {
    prompt: 'The heating in your apartment has not worked for two days. Write to the property management.',
    bullets: ['Describe the problem.', 'Explain why it is urgent.', 'Ask for an appointment.']
  },
  w4: {
    prompt: 'You are interested in a computer course but still have questions. Write to the course office.',
    bullets: ['Ask about the course times.', 'Ask about the price.', 'Briefly explain your previous knowledge.']
  },
  w5: {
    prompt: 'You are meeting your friend Lea, but your bus is delayed. Write a short message.',
    bullets: ['Apologize.', 'Say why you will arrive later.', 'Suggest a new time.']
  },
  w6: {
    prompt: 'You would like to spend a weekend at a guesthouse in September. Write to the guesthouse.',
    bullets: ['Ask for an available double room.', 'Ask for the price including breakfast.', 'Explain when you will arrive.']
  },
  w7: {
    prompt: 'You cannot work on Saturday. Write to your colleague Daniel and ask to swap shifts.',
    bullets: ['Give the reason.', 'Suggest another working day.', 'Ask for a quick reply.']
  },
  s1: {
    prompt: 'Briefly introduce yourself.',
    bullets: ['Name and country of origin', 'Place of residence', 'Work or course', 'One hobby']
  },
  s2: {
    prompt: 'You would like to do something with a friend at the weekend. Make a suggestion.',
    bullets: ['Activity', 'Day and time', 'Meeting point', 'Alternative in bad weather']
  },
  s3: {
    prompt: 'You are new in the city and are looking for the library. Politely ask for help.',
    bullets: ['Ask for directions', 'Ask about public transport', 'Say thank you']
  },
  s4: {
    prompt: 'Talk about a course or training program that you liked.',
    bullets: ['What and when?', 'What did you learn?', 'What was good or difficult?', 'Would you recommend the course?']
  },
  s5: {
    prompt: 'Ask and answer questions about free time.',
    bullets: ['What do you like doing?', 'With whom?', 'How often?', 'Where?']
  },
  s6: {
    prompt: 'Talk about a trip that you remember well.',
    bullets: ['Destination and travel time', 'Means of transport', 'Activities', 'What was special?']
  },
  s7: {
    prompt: 'Plan a small course celebration with another person. Make suggestions and respond.',
    bullets: ['Day and time', 'Place', 'Food and drinks', 'Who brings what?']
  }
};

export function getInstructionTranslation(itemId, field, index) {
  const value = instructionTranslations[itemId]?.[field];
  return Array.isArray(value) ? value[index] : value;
}
