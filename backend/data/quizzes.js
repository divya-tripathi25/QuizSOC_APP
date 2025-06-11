const quizzes = [
  {
    title: 'Numerical Reasoning',
    description: 'Test your mathematical and analytical abilities with number-based problems.',
    time_limit: 45,
    questions: [
      {
        question: 'What is 15% of 200?',
        options: ['20', '25', '30', '35'],
        correct_answer: '30',
        explanation: '15% of 200 is calculated as (15/100) * 200 = 30.'
      },
      {
        question: 'If a shirt costs $25 and is discounted by 20%, what is the new price?',
        options: ['$15', '$18', '$20', '$22'],
        correct_answer: '$20',
        explanation: '20% of $25 is $5, so the new price is $25 - $5 = $20.'
      },
      {
        question: 'If 6 workers can complete a task in 12 days, how many days would it take 8 workers to complete the same task?',
        options: ['6', '8', '9', '16'],
        correct_answer: '9',
        explanation: 'If 6 workers take 12 days, then the total work = 6 × 12 = 72 worker-days. If 8 workers do the job, they will take 72 ÷ 8 = 9 days.'
      },
      {
        question: 'A train travels at 60 mph. How far will it travel in 2.5 hours?',
        options: ['120 miles', '140 miles', '150 miles', '180 miles'],
        correct_answer: '150 miles',
        explanation: 'Distance = Speed × Time = 60 mph × 2.5 hours = 150 miles.'
      },
      {
        question: 'If x² = 49, what is the value of x?',
        options: ['±5', '±6', '±7', '±8'],
        correct_answer: '±7',
        explanation: 'x² = 49 means x can be either 7 or -7, since 7² = 49 and (-7)² = 49.'
      }
      // Add 20 more questions for a total of 25
    ],
    is_active: true
  },
  {
    title: 'Verbal Reasoning',
    description: 'Test your comprehension and language skills with verbal puzzles and problems.',
    time_limit: 45,
    questions: [
      {
        question: 'Choose the word that is most opposite in meaning to "Benevolent":',
        options: ['Generous', 'Malevolent', 'Beneficial', 'Benign'],
        correct_answer: 'Malevolent',
        explanation: 'Benevolent means well-meaning and kindly, while Malevolent means having or showing a wish to do evil to others.'
      },
      {
        question: 'Complete the analogy: Book is to Read as Food is to:',
        options: ['Cook', 'Eat', 'Taste', 'Recipe'],
        correct_answer: 'Eat',
        explanation: 'A book is read, and food is eaten. The relationship is that of an object and the action performed with it.'
      },
      {
        question: 'Which word does NOT belong in the group?',
        options: ['Apple', 'Banana', 'Cherry', 'Potato'],
        correct_answer: 'Potato',
        explanation: 'Apple, Banana, and Cherry are all fruits, while Potato is a vegetable.'
      },
      {
        question: 'If "CHAIR" is coded as "DIBJS", how would "TABLE" be coded?',
        options: ['UBCMF', 'UFCMA', 'ELBAT', 'UBAKD'],
        correct_answer: 'UBCMF',
        explanation: 'Each letter in "CHAIR" is replaced with the next letter in the alphabet to get "DIBJS". Applying the same rule to "TABLE" gives "UBCMF".'
      },
      {
        question: 'Choose the statement that is logically equivalent to "All roses are flowers":',
        options: ['All flowers are roses', 'If something is not a flower, then it is not a rose', 'If something is a rose, then it is a flower', 'No roses are flowers'],
        correct_answer: 'If something is a rose, then it is a flower',
        explanation: '"All roses are flowers" means that if something is a rose, then it must be a flower.'
      }
      // Add 20 more questions for a total of 25
    ],
    is_active: true
  },
  {
    title: 'Mechanical Aptitude',
    description: 'Test your understanding of mechanical concepts and physical principles.',
    time_limit: 45,
    questions: [
      {
        question: 'Which simple machine is a wheel with a grooved rim for a rope?',
        options: ['Lever', 'Inclined plane', 'Pulley', 'Wedge'],
        correct_answer: 'Pulley',
        explanation: 'A pulley is a simple machine consisting of a wheel with a grooved rim in which a rope runs.'
      },
      {
        question: 'What happens to the pressure in a fluid when its speed increases?',
        options: ['Increases', 'Decreases', 'Remains the same', 'Cannot be determined'],
        correct_answer: 'Decreases',
        explanation: 'According to Bernoulli\'s principle, as the speed of a fluid increases, the pressure within the fluid decreases.'
      },
      {
        question: 'Which of the following is an example of potential energy?',
        options: ['A car moving on a highway', 'A pendulum at its lowest point', 'A book on a high shelf', 'A fan blades rotating'],
        correct_answer: 'A book on a high shelf',
        explanation: 'Potential energy is the energy possessed by an object due to its position. A book on a high shelf has gravitational potential energy.'
      },
      {
        question: 'If two gears are meshed together and one turns clockwise, the other will turn:',
        options: ['Clockwise', 'Counterclockwise', 'In the same direction', 'Will not turn'],
        correct_answer: 'Counterclockwise',
        explanation: 'When two meshed gears interact, they rotate in opposite directions. If one turns clockwise, the other must turn counterclockwise.'
      },
      {
        question: 'What is the mechanical advantage of a lever when the effort arm is 2m and the load arm is 0.5m?',
        options: ['0.25', '2', '4', '8'],
        correct_answer: '4',
        explanation: 'Mechanical advantage of a lever = effort arm / load arm = 2m / 0.5m = 4.'
      }
      // Add 20 more questions for a total of 25
    ],
    is_active: true
  },
  {
    title: 'Logical Reasoning',
    description: 'Test your problem-solving and pattern recognition abilities.',
    time_limit: 45,
    questions: [
      {
        question: 'If all Zorks are Morks, and some Morks are Lorks, which of the following must be true?',
        options: ['All Zorks are Lorks', 'Some Zorks are Lorks', 'Some Lorks are Zorks', 'No Zorks are Lorks'],
        correct_answer: 'None of the above',
        explanation: 'From the given statements, we cannot definitively conclude any of the options. Some Zorks might or might not be Lorks.'
      },
      {
        question: 'What comes next in the sequence: 2, 6, 12, 20, 30, __?',
        options: ['36', '40', '42', '56'],
        correct_answer: '42',
        explanation: 'The pattern is the difference between consecutive numbers increases by 2. The differences are 4, 6, 8, 10, so the next difference is 12. 30 + 12 = 42.'
      },
      {
        question: 'If A > B and B > C, which of the following must be true?',
        options: ['A < C', 'A = C', 'A > C', 'A ≤ C'],
        correct_answer: 'A > C',
        explanation: 'If A > B and B > C, then by transitive property, A > C must be true.'
      },
      {
        question: 'Which figure completes the pattern?',
        options: ['A: Triangle', 'B: Square', 'C: Pentagon', 'D: Hexagon'],
        correct_answer: 'C: Pentagon',
        explanation: 'The pattern follows an increase in the number of sides: Triangle (3 sides), Square (4 sides), so the next shape should have 5 sides, which is a Pentagon.'
      },
      {
        question: 'If "APPLE" is coded as "1-16-16-12-5", how would "ORANGE" be coded?',
        options: ['15-18-1-14-7-5', '16-19-2-15-8-6', '14-17-0-13-6-4', '12-15-0-12-5-3'],
        correct_answer: '15-18-1-14-7-5',
        explanation: 'Each letter is replaced with its position in the alphabet. O=15, R=18, A=1, N=14, G=7, E=5.'
      }
      // Add 20 more questions for a total of 25
    ],
    is_active: true
  }
];

module.exports = quizzes; 