import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, Clock, BarChart3, Target, PlayCircle, FileText, Brain, ArrowLeft, X } from 'lucide-react';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState({ name: 'Student', email: 'default@sat.com' });
  const [selectedSection, setSelectedSection] = useState(null as any);
  const [selectedCategory, setSelectedCategory] = useState(null as any);
  const [sessionConfig, setSessionConfig] = useState({
    difficulty: 'medium',
    confidence: 'moderate',
    questionCount: 10,
    timerEnabled: false
  });
  const [sessionData, setSessionData] = useState({
    currentQuestion: null,
    questionIndex: 0,
    answers: [],
    showExplanation: false,
    userAnswer: null,
    sessionType: null,
    timerEnabled: false,
    timeRemaining: 0,
    isTimerRunning: false,
    totalQuestions: 0
  });
  const [progress, setProgress] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    byTopic: {} as any
  });
  const [uploadedTests, setUploadedTests] = useState([] as any[]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const result = await window.storage.get('sat-progress');
      if (result) {
        setProgress(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No previous progress found');
    }
  };

  const saveProgress = async (newProgress) => {
    try {
      await window.storage.set('sat-progress', JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const sampleQuestions = {
    reading: [
      {
        id: 'r1',
        topic: 'Main Idea',
        difficulty: 'medium',
        passage: "The Industrial Revolution, which began in Britain in the late 18th century, fundamentally transformed society. While it brought unprecedented economic growth and technological advancement, it also created new social challenges. Factory workers endured long hours in dangerous conditions for minimal pay, and rapid urbanization led to overcrowded, unsanitary living conditions in cities.",
        question: "Which choice best describes the function of the underlined sentence in the text as a whole?",
        choices: [
          "It elaborates on the economic benefits mentioned in the previous sentence.",
          "It introduces a contrasting perspective to the previous sentence's claim.",
          "It provides specific examples of technological advancements.",
          "It explains why the Industrial Revolution began in Britain."
        ],
        correct: 1,
        skill: "Understanding Text Structure",
        explanation: "The correct answer is B. The passage begins by stating the Industrial Revolution 'brought unprecedented economic growth and technological advancement' (positive), and the underlined sentence introduces the negative aspects with 'it also created new social challenges.' This is a classic contrast transition. Strategy: Look for transition words like 'while,' 'however,' or 'also' that signal a shift in perspective."
      },
      {
        id: 'r2',
        topic: 'Vocabulary in Context',
        difficulty: 'easy',
        passage: "Marine biologists have observed that octopuses demonstrate remarkable problem-solving abilities. In laboratory settings, they can navigate complex mazes, open containers to retrieve food, and even recognize individual human researchers.",
        question: "As used in the text, what does 'navigate' most nearly mean?",
        choices: [
          "Sail through",
          "Find one's way through",
          "Direct the course of",
          "Chart on a map"
        ],
        correct: 1,
        skill: "Context Clues",
        explanation: "The correct answer is B. In this context, 'navigate' means to find one's way through the mazes. While 'navigate' can mean to sail or direct a course (often with boats), the context of octopuses in mazes makes 'find one's way through' the best fit. Strategy: Always replace the word with each answer choice in the sentence to see which makes the most sense in context."
      }
    ],
    math: [
      {
        id: 'm1',
        topic: 'Linear Equations',
        difficulty: 'medium',
        question: "If 3x + 7 = 22, what is the value of 6x + 14?",
        choices: ["30", "44", "50", "58"],
        correct: 1,
        skill: "Recognizing Patterns in Algebra",
        explanation: "The correct answer is B (44). Instead of solving for x first, notice that 6x + 14 is exactly double the left side of the original equation (2 × (3x + 7)). Since 3x + 7 = 22, then 2 × 22 = 44. This is faster than solving: 3x = 15, x = 5, then 6(5) + 14 = 44. Strategy: Look for relationships between expressions before solving algebraically. The SAT rewards pattern recognition."
      }
    ]
  };

  const generateQuestion = (subject, topic = null) => {
    const questions = subject === 'math' ? sampleQuestions.math : sampleQuestions.reading;
    const filtered = topic ? questions.filter(q => q.topic === topic) : questions;
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const startSession = (categoryData) => {
    setSelectedCategory(categoryData);
    setCurrentView('config');
  };

  const startPractice = () => {
    const isMath = selectedCategory.id.includes('algebra') || 
                   selectedCategory.id.includes('math') || 
                   selectedCategory.id.includes('geometry') || 
                   selectedCategory.id.includes('problem');
    
    const question = generateQuestion(isMath ? 'math' : 'reading');

    // Calculate timer: 1:11 (71 seconds) for Reading, 1:35 (95 seconds) for Math
    const timePerQuestion = isMath ? 95 : 71;
    const totalTime = timePerQuestion * sessionConfig.questionCount;

    setSessionData({
      currentQuestion: question,
      questionIndex: 0,
      answers: [],
      showExplanation: false,
      userAnswer: null,
      sessionType: selectedCategory.id,
      timerEnabled: sessionConfig.timerEnabled,
      timeRemaining: sessionConfig.timerEnabled ? totalTime : 0,
      isTimerRunning: sessionConfig.timerEnabled,
      totalQuestions: sessionConfig.questionCount
    });
    setCurrentView('session');
  };

  const handleAnswer = (choiceIndex) => {
    setSessionData(prev => ({
      ...prev,
      userAnswer: choiceIndex,
      showExplanation: true,
      isTimerRunning: false
    }));

    const isCorrect = choiceIndex === sessionData.currentQuestion.correct;
    const newProgress = {
      ...progress,
      totalQuestions: progress.totalQuestions + 1,
      correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
      byTopic: {
        ...progress.byTopic,
        [sessionData.currentQuestion.topic]: {
          total: (progress.byTopic[sessionData.currentQuestion.topic]?.total || 0) + 1,
          correct: (progress.byTopic[sessionData.currentQuestion.topic]?.correct || 0) + (isCorrect ? 1 : 0)
        }
      }
    };
    saveProgress(newProgress);
  };

  const nextQuestion = () => {
    // Check if we've completed all questions
    if (sessionData.questionIndex + 1 >= sessionData.totalQuestions) {
      // Session complete
      alert(`Session complete! You answered ${sessionData.totalQuestions} questions.`);
      setCurrentView('home');
      return;
    }

    const subject = Math.random() > 0.8 ? 'math' : 'reading';
    const question = generateQuestion(subject);
    
    setSessionData(prev => ({
      ...prev,
      currentQuestion: question,
      questionIndex: prev.questionIndex + 1,
      showExplanation: false,
      userAnswer: null
    }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedTests(prev => [...prev, { name: file.name, date: new Date().toLocaleDateString() }]);
      alert('PDF uploaded! In a full implementation, questions would be extracted from this PDF.');
    }
  };

  useEffect(() => {
    let interval;
    if (sessionData.isTimerRunning && sessionData.timeRemaining > 0) {
      interval = setInterval(() => {
        setSessionData(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionData.isTimerRunning, sessionData.timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const HomeView = () => (
    <div className="min-h-screen" style={{ backgroundColor: '#324dc7' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center mb-8">
            <div className="inline-block mb-6">
              <div className="text-sm font-black uppercase tracking-widest mb-2" style={{ color: '#fedb02' }}>
                Welcome Back
              </div>
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-none" style={{ color: 'white' }}>
                I'M GONNA
              </h1>
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-none mb-4" style={{ color: '#fedb02' }}>
                HURT SAT
              </h1>
            </div>
            <p className="text-white text-2xl font-bold mb-8">
              Ready to dominate, <span style={{ color: '#fedb02' }}>{user?.name}</span>?
            </p>
          </div>

          {/* Stats Bar */}
          {progress.totalQuestions > 0 && (
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                <div className="grid grid-cols-3 divide-x-4" style={{ borderColor: '#324dc7' }}>
                  <div className="text-center px-4">
                    <div className="text-5xl font-black mb-2" style={{ color: '#324dc7' }}>
                      {progress.totalQuestions}
                    </div>
                    <div className="text-xs font-black uppercase tracking-wider text-gray-600">
                      Questions Crushed
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-5xl font-black mb-2" style={{ color: '#fedb02' }}>
                      {Math.round((progress.correctAnswers / progress.totalQuestions) * 100)}%
                    </div>
                    <div className="text-xs font-black uppercase tracking-wider text-gray-600">
                      Accuracy Rate
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-5xl font-black mb-2" style={{ color: '#324dc7' }}>
                      {Object.keys(progress.byTopic).length}
                    </div>
                    <div className="text-xs font-black uppercase tracking-wider text-gray-600">
                      Topics Mastered
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        {/* Primary Practice Cards */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">
              Choose Your Weapon
            </h2>
            <div className="h-1 flex-1 ml-8" style={{ backgroundColor: '#fedb02' }}></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Reading & Writing Card */}
            <div
              onClick={() => {
                setSelectedSection('reading');
                setCurrentView('categories');
              }}
              className="group relative bg-white border-4 border-white overflow-hidden cursor-pointer hover:shadow-[16px_16px_0px_0px_rgba(254,219,2,0.6)] transition-all duration-300"
            >
              {/* Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-3" style={{ backgroundColor: '#fedb02' }}></div>
              
              <div className="p-10 pt-16 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="bg-white border-4 p-4 group-hover:scale-110 transition-transform" style={{ borderColor: '#324dc7' }}>
                    <BookOpen className="w-12 h-12" style={{ color: '#324dc7' }} />
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-black mb-1" style={{ color: '#324dc7' }}>4</div>
                    <div className="text-xs font-black uppercase tracking-wider text-gray-600">Categories</div>
                  </div>
                </div>

                <h3 className="text-5xl font-black mb-6 uppercase tracking-tight leading-none" style={{ color: '#324dc7' }}>
                  Reading &<br/>Writing
                </h3>

                <div className="space-y-2 mb-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fedb02' }}></div>
                    <span className="text-sm font-bold text-gray-700">Information & Ideas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fedb02' }}></div>
                    <span className="text-sm font-bold text-gray-700">Expression of Ideas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fedb02' }}></div>
                    <span className="text-sm font-bold text-gray-700">Craft & Structure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fedb02' }}></div>
                    <span className="text-sm font-bold text-gray-700">Standard English</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t-4 mt-6" style={{ borderColor: '#324dc7' }}>
                  <span className="text-sm font-black uppercase tracking-wider" style={{ color: '#324dc7' }}>
                    Start Practice
                  </span>
                  <ArrowLeft className="w-6 h-6 rotate-180 group-hover:translate-x-2 transition-transform" style={{ color: '#fedb02' }} />
                </div>
              </div>
            </div>

            {/* Math Card */}
            <div
              onClick={() => {
                setSelectedSection('math');
                setCurrentView('categories');
              }}
              className="group relative bg-white border-4 border-white overflow-hidden cursor-pointer hover:shadow-[16px_16px_0px_0px_rgba(254,219,2,0.6)] transition-all duration-300"
            >
              {/* Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-3" style={{ backgroundColor: '#fedb02' }}></div>
              
              <div className="p-10 pt-16 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="bg-white border-4 p-4 group-hover:scale-110 transition-transform" style={{ borderColor: '#324dc7' }}>
                    <Brain className="w-12 h-12" style={{ color: '#324dc7' }} />
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-black mb-1" style={{ color: '#324dc7' }}>4</div>
                    <div className="text-xs font-black uppercase tracking-wider text-gray-600">Categories</div>
                  </div>
                </div>

                <h3 className="text-5xl font-black mb-6 uppercase tracking-tight leading-none" style={{ color: '#324dc7' }}>
                  Math
                </h3>

                <div className="space-y-2 mb-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fedb02' }}></div>
                    <span className="text-sm font-bold text-gray-700">Algebra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fedb02' }}></div>
                    <span className="text-sm font-bold text-gray-700">Advanced Math</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fedb02' }}></div>
                    <span className="text-sm font-bold text-gray-700">Problem Solving & Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fedb02' }}></div>
                    <span className="text-sm font-bold text-gray-700">Geometry & Trig</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t-4 mt-6" style={{ borderColor: '#324dc7' }}>
                  <span className="text-sm font-black uppercase tracking-wider" style={{ color: '#324dc7' }}>
                    Start Practice
                  </span>
                  <ArrowLeft className="w-6 h-6 rotate-180 group-hover:translate-x-2 transition-transform" style={{ color: '#fedb02' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Section - Now Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">
              Power Tools
            </h2>
            <div className="h-1 flex-1 ml-8" style={{ backgroundColor: '#fedb02' }}></div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <button
              onClick={() => startSession('diagnostic')}
              className="bg-white border-4 border-white p-8 text-left hover:shadow-[8px_8px_0px_0px_rgba(254,219,2,0.5)] transition-all group flex-1"
            >
              <div className="bg-white border-4 p-3 inline-block mb-4 group-hover:scale-110 transition-transform" style={{ borderColor: '#324dc7' }}>
                <Target className="w-8 h-8" style={{ color: '#324dc7' }} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2" style={{ color: '#324dc7' }}>
                Diagnostic
              </h3>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Find Your Weak Spots
              </p>
            </button>

            <button
              onClick={() => setCurrentView('progress')}
              className="bg-white border-4 border-white p-8 text-left hover:shadow-[8px_8px_0px_0px_rgba(254,219,2,0.5)] transition-all group flex-1"
            >
              <div className="bg-white border-4 p-3 inline-block mb-4 group-hover:scale-110 transition-transform" style={{ borderColor: '#324dc7' }}>
                <BarChart3 className="w-8 h-8" style={{ color: '#324dc7' }} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2" style={{ color: '#324dc7' }}>
                Progress
              </h3>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Track Your Growth
              </p>
            </button>

            <label className="bg-white border-4 border-white p-8 text-left hover:shadow-[8px_8px_0px_0px_rgba(254,219,2,0.5)] transition-all group cursor-pointer flex-1">
              <div className="bg-white border-4 p-3 inline-block mb-4 group-hover:scale-110 transition-transform" style={{ borderColor: '#324dc7' }}>
                <Upload className="w-8 h-8" style={{ color: '#324dc7' }} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2" style={{ color: '#324dc7' }}>
                Upload
              </h3>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Add Practice Tests
              </p>
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setCurrentView('ai-teacher')}
              className="bg-white border-4 border-white p-8 text-left hover:shadow-[8px_8px_0px_0px_rgba(254,219,2,0.5)] transition-all group flex-1"
            >
              <div className="bg-white border-4 p-3 inline-block mb-4 group-hover:scale-110 transition-transform" style={{ borderColor: '#324dc7' }}>
                <FileText className="w-8 h-8" style={{ color: '#324dc7' }} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2" style={{ color: '#324dc7' }}>
                AI Teacher
              </h3>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Get Instant Help
              </p>
            </button>
          </div>
        </div>

        {/* Uploaded Tests */}
        {uploadedTests.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                Your Tests
              </h2>
              <div className="h-1 flex-1 ml-8" style={{ backgroundColor: '#fedb02' }}></div>
            </div>
            <div className="bg-white border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
              <div className="grid md:grid-cols-2 gap-4">
                {uploadedTests.map((test, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border-4" style={{ borderColor: '#324dc7' }}>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5" style={{ color: '#fedb02' }} />
                      <span className="font-black text-sm" style={{ color: '#324dc7' }}>{test.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{test.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const CategoriesView = () => {
    const categories = selectedSection === 'reading' ? [
      { id: 'info-ideas', name: 'Information and Ideas', percent: '26%', questions: '12-14 questions', icon: BookOpen },
      { id: 'expression', name: 'Expression of Ideas', percent: '20%', questions: '8-12 questions', icon: FileText },
      { id: 'craft-structure', name: 'Craft and Structure', percent: '28%', questions: '13-15 questions', icon: Brain },
      { id: 'conventions', name: 'Standard English Conventions', percent: '26%', questions: '11-15 questions', icon: Target }
    ] : [
      { id: 'algebra', name: 'Algebra', percent: '35%', questions: '13-15 questions', icon: Brain },
      { id: 'advanced-math', name: 'Advanced Math', percent: '35%', questions: '13-15 questions', icon: Target },
      { id: 'problem-solving', name: 'Problem-Solving and Data Analysis', percent: '15%', questions: '5-7 questions', icon: BarChart3 },
      { id: 'geometry', name: 'Geometry and Trigonometry', percent: '15%', questions: '5-7 questions', icon: Clock }
    ];

    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#324dc7' }}>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className="mb-8 text-white hover:opacity-80 flex items-center gap-2 font-black uppercase tracking-wider text-sm transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight uppercase">
              {selectedSection === 'reading' ? 'Reading and Writing' : 'Math'}
            </h1>
            <div className="w-24 h-2 mx-auto mb-6" style={{ backgroundColor: '#fedb02' }}></div>
            <p className="text-white text-lg font-bold uppercase tracking-wider">Choose a category</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => startSession(cat)}
                  className="bg-white border-4 border-white p-8 hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] transition-all"
                >
                  <Icon className="w-12 h-12 mb-4" style={{ color: '#324dc7' }} />
                  <h3 className="text-3xl font-black mb-3 uppercase tracking-tight leading-tight" style={{ color: '#324dc7' }}>
                    {cat.name}
                  </h3>
                  <p className="text-gray-600 font-bold text-sm mb-1">{cat.percent} of test</p>
                  <p className="text-gray-500 text-sm">{cat.questions}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const ConfigView = () => {
    const getTips = () => {
      if (!selectedCategory) return [];
      
      const tipsByCategory = {
        'info-ideas': [
          'Focus on identifying the main purpose and central claims',
          'Look for evidence that supports the author\'s argument',
          'Pay attention to how ideas connect across paragraphs'
        ],
        'expression': [
          'Consider clarity, precision, and conciseness',
          'Think about logical flow and organization',
          'Evaluate transitions between ideas'
        ],
        'craft-structure': [
          'Analyze word choice and tone',
          'Understand how structure supports meaning',
          'Consider rhetorical devices and their effects'
        ],
        'conventions': [
          'Review grammar rules and punctuation',
          'Check for subject-verb agreement',
          'Ensure proper sentence structure'
        ],
        'algebra': [
          'Isolate variables systematically',
          'Look for patterns before solving',
          'Check your answer by substituting back'
        ],
        'advanced-math': [
          'Recognize function transformations',
          'Factor before solving when possible',
          'Remember special formulas and identities'
        ],
        'problem-solving': [
          'Organize data before calculating',
          'Look for relationships in charts and graphs',
          'Use estimation to check reasonableness'
        ],
        'geometry': [
          'Draw diagrams when not provided',
          'Label all known values',
          'Use Pythagorean theorem and special triangles'
        ]
      };
      
      return tipsByCategory[selectedCategory.id] || [];
    };

    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#324dc7' }}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setCurrentView('categories')}
            className="mb-8 text-white hover:opacity-80 flex items-center gap-2 font-black uppercase tracking-wider text-sm transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight uppercase">
              {selectedCategory?.name}
            </h1>
            <div className="w-24 h-2 mx-auto mb-6" style={{ backgroundColor: '#fedb02' }}></div>
            <p className="text-white text-lg font-bold uppercase tracking-wider">Configure Your Practice</p>
          </div>

          <div className="bg-white border-4 border-white p-8 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] mb-6">
            <div className="mb-8">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight" style={{ color: '#324dc7' }}>
                Difficulty Level
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSessionConfig({ ...sessionConfig, difficulty: level })}
                    className={`py-4 px-6 font-black uppercase tracking-wider border-4 transition-all ${
                      sessionConfig.difficulty === level
                        ? 'shadow-[6px_6px_0px_0px_rgba(254,219,2,0.4)]'
                        : 'hover:shadow-[4px_4px_0px_0px_rgba(50,77,199,0.2)]'
                    }`}
                    style={{
                      backgroundColor: sessionConfig.difficulty === level ? '#fedb02' : 'white',
                      color: '#324dc7',
                      borderColor: sessionConfig.difficulty === level ? '#fedb02' : '#324dc7'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight" style={{ color: '#324dc7' }}>
                Number of Questions
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {[5, 10, 15, 20, 25].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSessionConfig({ ...sessionConfig, questionCount: count })}
                    className={`py-4 px-4 font-black uppercase tracking-wider text-lg border-4 transition-all ${
                      sessionConfig.questionCount === count
                        ? 'shadow-[6px_6px_0px_0px_rgba(254,219,2,0.4)]'
                        : 'hover:shadow-[4px_4px_0px_0px_rgba(50,77,199,0.2)]'
                    }`}
                    style={{
                      backgroundColor: sessionConfig.questionCount === count ? '#fedb02' : 'white',
                      color: '#324dc7',
                      borderColor: sessionConfig.questionCount === count ? '#fedb02' : '#324dc7'
                    }}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight" style={{ color: '#324dc7' }}>
                Timer
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSessionConfig({ ...sessionConfig, timerEnabled: false })}
                  className={`py-4 px-6 font-black uppercase tracking-wider border-4 transition-all ${
                    !sessionConfig.timerEnabled
                      ? 'shadow-[6px_6px_0px_0px_rgba(254,219,2,0.4)]'
                      : 'hover:shadow-[4px_4px_0px_0px_rgba(50,77,199,0.2)]'
                  }`}
                  style={{
                    backgroundColor: !sessionConfig.timerEnabled ? '#fedb02' : 'white',
                    color: '#324dc7',
                    borderColor: !sessionConfig.timerEnabled ? '#fedb02' : '#324dc7'
                  }}
                >
                  No Timer
                </button>
                <button
                  onClick={() => setSessionConfig({ ...sessionConfig, timerEnabled: true })}
                  className={`py-4 px-6 font-black uppercase tracking-wider border-4 transition-all ${
                    sessionConfig.timerEnabled
                      ? 'shadow-[6px_6px_0px_0px_rgba(254,219,2,0.4)]'
                      : 'hover:shadow-[4px_4px_0px_0px_rgba(50,77,199,0.2)]'
                  }`}
                  style={{
                    backgroundColor: sessionConfig.timerEnabled ? '#fedb02' : 'white',
                    color: '#324dc7',
                    borderColor: sessionConfig.timerEnabled ? '#fedb02' : '#324dc7'
                  }}
                >
                  Timed Practice
                </button>
              </div>
              {sessionConfig.timerEnabled && (
                <div className="mt-4 p-4 bg-white border-4" style={{ borderColor: '#fedb02' }}>
                  <p className="text-gray-700 font-bold text-sm">
                    ⏱️ Total time: {Math.floor(((selectedCategory?.id.includes('algebra') || selectedCategory?.id.includes('math') || selectedCategory?.id.includes('geometry') || selectedCategory?.id.includes('problem')) ? 95 : 71) * sessionConfig.questionCount / 60)} minutes {((selectedCategory?.id.includes('algebra') || selectedCategory?.id.includes('math') || selectedCategory?.id.includes('geometry') || selectedCategory?.id.includes('problem')) ? 95 : 71) * sessionConfig.questionCount % 60} seconds
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {(selectedCategory?.id.includes('algebra') || selectedCategory?.id.includes('math') || selectedCategory?.id.includes('geometry') || selectedCategory?.id.includes('problem')) ? '1:35 per question (Math)' : '1:11 per question (Reading & Writing)'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={startPractice}
              className="w-full py-6 font-black text-2xl uppercase tracking-wider border-4 hover:shadow-[8px_8px_0px_0px_rgba(254,219,2,0.3)] transition-all"
              style={{ backgroundColor: '#fedb02', color: '#324dc7', borderColor: '#fedb02' }}
            >
              Start Practice →
            </button>
          </div>

          <div className="bg-white border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
            <h4 className="font-black uppercase tracking-wider mb-4 text-xl" style={{ color: '#324dc7' }}>
              💡 Tips for {selectedCategory?.name}
            </h4>
            <ul className="space-y-3">
              {getTips().map((tip, idx) => (
                <li key={idx} className="text-gray-700 font-medium flex items-start gap-3">
                  <span className="font-black" style={{ color: '#fedb02' }}>•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const SessionView = () => {
    const q = sessionData.currentQuestion;
    if (!q) return null;

    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#324dc7' }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-4 border-white p-8 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-2 font-black uppercase tracking-wider text-sm transition-colors hover:opacity-80"
                  style={{ color: '#324dc7' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="font-black text-gray-600 uppercase tracking-wider text-sm">
                  Question {sessionData.questionIndex + 1} of {sessionData.totalQuestions || '?'}
                </span>
                <span className="px-4 py-2 font-black text-sm uppercase tracking-wider border-4" style={{ backgroundColor: '#fedb02', color: '#324dc7', borderColor: '#fedb02' }}>
                  {q.topic}
                </span>
              </div>
              {sessionData.timerEnabled && (
                <div className="flex items-center gap-3 px-6 py-3 bg-white border-4" style={{ color: sessionData.timeRemaining < 60 ? '#ef4444' : '#324dc7', borderColor: '#fedb02' }}>
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-black font-mono">
                    {formatTime(sessionData.timeRemaining)}
                  </span>
                </div>
              )}
            </div>

            {q.passage && (
              <div className="mb-8 p-6 bg-white border-4" style={{ borderColor: '#324dc7' }}>
                <p className="text-gray-800 leading-relaxed font-medium">{q.passage}</p>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tight" style={{ color: '#324dc7' }}>{q.question}</h3>
              <div className="space-y-4">
                {q.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => !sessionData.showExplanation && handleAnswer(idx)}
                    disabled={sessionData.showExplanation}
                    className={`w-full text-left p-6 border-4 transition-all font-bold ${
                      sessionData.showExplanation
                        ? idx === q.correct
                          ? 'border-green-500 bg-green-50 shadow-[6px_6px_0px_0px_rgba(34,197,94,0.3)]'
                          : idx === sessionData.userAnswer
                          ? 'border-red-500 bg-red-50 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.3)]'
                          : 'border-gray-300 bg-gray-50'
                        : 'hover:shadow-[6px_6px_0px_0px_rgba(37,150,190,0.3)]'
                    }`}
                    style={!sessionData.showExplanation ? { borderColor: '#324dc7' } : {}}
                  >
                    <span className="font-black text-lg mr-4" style={{ color: '#324dc7' }}>{String.fromCharCode(65 + idx)}.</span>
                    {choice}
                  </button>
                ))}
              </div>
            </div>

            {sessionData.showExplanation && (
              <div className="space-y-6">
                <div className="p-6 border-4" style={{ backgroundColor: 'rgba(254, 219, 2, 0.2)', borderColor: '#fedb02' }}>
                  <h4 className="font-black mb-3 text-lg uppercase tracking-wider flex items-center gap-2" style={{ color: '#324dc7' }}>
                    <Brain className="w-6 h-6" />
                    Skill: {q.skill}
                  </h4>
                  <p className="text-gray-800 font-medium leading-relaxed">{q.explanation}</p>
                </div>

                <button
                  onClick={nextQuestion}
                  className="w-full py-5 font-black text-lg uppercase tracking-wider border-4 hover:shadow-[6px_6px_0px_0px_rgba(254,219,2,0.3)] transition-all"
                  style={{ backgroundColor: '#fedb02', color: '#324dc7', borderColor: '#fedb02' }}
                >
                  Next Question →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ProgressView = () => {
    const accuracy = progress.totalQuestions > 0 
      ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100) 
      : 0;

    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#324dc7' }}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className="mb-8 text-white hover:opacity-80 flex items-center gap-2 font-black uppercase tracking-wider text-sm transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="bg-white border-4 border-white p-8 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)]">
            <h2 className="text-4xl font-black mb-8 uppercase tracking-tight" style={{ color: '#324dc7' }}>Your Progress</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="p-8 border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.4)]" style={{ backgroundColor: 'white', color: '#324dc7' }}>
                <div className="text-5xl font-black mb-3">{progress.totalQuestions}</div>
                <div className="font-bold uppercase tracking-wider text-sm text-gray-600">Questions</div>
              </div>
              <div className="p-8 border-4 shadow-[6px_6px_0px_0px_rgba(254,219,2,0.4)]" style={{ backgroundColor: '#fedb02', borderColor: '#fedb02', color: '#324dc7' }}>
                <div className="text-5xl font-black mb-3">{progress.correctAnswers}</div>
                <div className="font-bold uppercase tracking-wider text-sm">Correct</div>
              </div>
              <div className="bg-white border-4 border-white p-8 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)]">
                <div className="text-5xl font-black mb-3" style={{ color: '#324dc7' }}>{accuracy}%</div>
                <div className="font-bold uppercase tracking-wider text-sm text-gray-600">Accuracy</div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tight" style={{ color: '#324dc7' }}>By Topic</h3>
              {Object.keys(progress.byTopic).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(progress.byTopic).map(([topic, data]: [string, any]) => {
                    const topicAccuracy = Math.round((data.correct / data.total) * 100);
                    return (
                      <div key={topic} className="p-6 border-4 border-white bg-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-black text-lg uppercase tracking-tight" style={{ color: '#324dc7' }}>{topic}</span>
                          <span className="font-black text-gray-600">
                            {data.correct}/{data.total} ({topicAccuracy}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-4 border-2 border-gray-200">
                          <div
                            className="h-full transition-all"
                            style={{ width: `${topicAccuracy}%`, backgroundColor: '#fedb02' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 border-4 border-dashed" style={{ borderColor: '#324dc7' }}>
                  <BarChart3 className="w-16 h-16 mx-auto mb-4" style={{ color: '#324dc7' }} />
                  <p className="text-gray-600 font-bold uppercase tracking-wider">Start practicing to see progress</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AITeacherView = () => {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([
      {
        role: 'assistant',
        content: 'Hi! I\'m your AI SAT tutor. Ask me anything about SAT strategies, specific questions, or concepts you\'re struggling with!'
      }
    ]);

    const handleAskQuestion = () => {
      if (!question.trim()) return;

      setMessages(prev => [
        ...prev,
        { role: 'user', content: question },
        {
          role: 'assistant',
          content: 'This is a demo placeholder. In a full implementation, this would connect to an AI service to provide personalized help with your SAT questions and strategies.'
        }
      ]);
      setQuestion('');
    };

    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#324dc7' }}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className="mb-8 text-white hover:opacity-80 flex items-center gap-2 font-black uppercase tracking-wider text-sm transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight uppercase">
              AI Teacher
            </h1>
            <div className="w-24 h-2 mx-auto mb-6" style={{ backgroundColor: '#fedb02' }}></div>
            <p className="text-white text-lg font-bold uppercase tracking-wider">Get Instant Help</p>
          </div>

          <div className="bg-white border-4 border-white p-8 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] mb-6">
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 border-4 ${
                    msg.role === 'assistant'
                      ? 'bg-white'
                      : 'bg-white'
                  }`}
                  style={{
                    borderColor: msg.role === 'assistant' ? '#fedb02' : '#324dc7'
                  }}
                >
                  <div className="font-black text-sm uppercase tracking-wider mb-2" style={{ color: '#324dc7' }}>
                    {msg.role === 'assistant' ? '🤖 AI Tutor' : '👤 You'}
                  </div>
                  <p className="text-gray-800 font-medium">{msg.content}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about SAT strategies, specific problems, or concepts..."
                className="w-full p-4 border-4 font-medium resize-none focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(254,219,2,0.3)] transition-all"
                style={{ borderColor: '#324dc7', minHeight: '120px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskQuestion();
                  }
                }}
              />
              <button
                onClick={handleAskQuestion}
                className="w-full py-4 font-black text-lg uppercase tracking-wider border-4 hover:shadow-[6px_6px_0px_0px_rgba(254,219,2,0.3)] transition-all"
                style={{ backgroundColor: '#fedb02', color: '#324dc7', borderColor: '#fedb02' }}
              >
                Ask Question
              </button>
            </div>
          </div>

          <div className="bg-white border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
            <h4 className="font-black uppercase tracking-wider mb-4 text-lg" style={{ color: '#324dc7' }}>
              💡 Example Questions
            </h4>
            <ul className="space-y-2">
              <li className="text-gray-700 font-medium flex items-start gap-3">
                <span className="font-black" style={{ color: '#fedb02' }}>•</span>
                <span>What's the best strategy for tackling reading comprehension questions?</span>
              </li>
              <li className="text-gray-700 font-medium flex items-start gap-3">
                <span className="font-black" style={{ color: '#fedb02' }}>•</span>
                <span>How do I approach quadratic equations on the SAT?</span>
              </li>
              <li className="text-gray-700 font-medium flex items-start gap-3">
                <span className="font-black" style={{ color: '#fedb02' }}>•</span>
                <span>Can you explain the difference between mean, median, and mode?</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {currentView === 'home' && <HomeView />}
      {currentView === 'categories' && <CategoriesView />}
      {currentView === 'config' && <ConfigView />}
      {currentView === 'session' && <SessionView />}
      {currentView === 'progress' && <ProgressView />}
      {currentView === 'ai-teacher' && <AITeacherView />}
    </>
  );
};

export default App;