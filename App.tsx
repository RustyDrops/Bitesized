
import React, { useState, useEffect } from 'react';
import { AppState, User, LearningPlan, Depth, LearningMode } from './types';
import { generateLearningPlan } from './services/geminiService';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TopicInput from './components/TopicInput';
import PlanGenerator from './components/PlanGenerator';
import BiteViewer from './components/BiteViewer';
import PlanList from './components/PlanList';
import QuizModule from './components/QuizModule';
import BadgeScreen from './components/BadgeScreen';

const GUEST_USER: User = {
  id: 'guest-user',
  name: 'Guest Learner',
  email: 'guest@example.com'
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: GUEST_USER,
    plans: [],
    activePlanId: null,
    loading: false,
    loadingMessage: '',
  });

  const [view, setView] = useState<'input' | 'generating' | 'dashboard' | 'bite' | 'plans-list' | 'quiz' | 'badge'>('input');
  const [activeBiteId, setActiveBiteId] = useState<string | null>(null);

  useEffect(() => {
    const savedPlans = localStorage.getItem('bsl_plans');
    const savedActivePlanId = localStorage.getItem('bsl_active_plan_id');

    const plans = savedPlans ? JSON.parse(savedPlans) : [];
    const activePlanId = savedActivePlanId;

    setState(prev => ({
      ...prev,
      plans,
      activePlanId,
    }));

    if (activePlanId) {
      setView('dashboard');
    } else {
      setView('input');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setState({
      user: GUEST_USER,
      plans: [],
      activePlanId: null,
      loading: false,
      loadingMessage: '',
    });
    setView('input');
  };

  const startGeneration = async (topic: string, depth: Depth, mode: LearningMode, dailyTime: number) => {
    setView('generating');
    setState(prev => ({ ...prev, loading: true, loadingMessage: 'Gathering insights...' }));
    
    try {
      const plan = await generateLearningPlan(topic, depth, mode, dailyTime);
      const updatedPlans = [plan, ...state.plans];
      
      localStorage.setItem('bsl_plans', JSON.stringify(updatedPlans));
      localStorage.setItem('bsl_active_plan_id', plan.id);
      
      setState(prev => ({
        ...prev,
        plans: updatedPlans,
        activePlanId: plan.id,
        loading: false,
      }));
      setView('dashboard');
    } catch (error) {
      console.error("Failed to generate plan:", error);
      alert("Something went wrong generating your plan.");
      setView('input');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const updatePlans = (updatedPlans: LearningPlan[]) => {
    localStorage.setItem('bsl_plans', JSON.stringify(updatedPlans));
    setState(prev => ({ ...prev, plans: updatedPlans }));
  };

  const handleUpdateTimeSpent = (planId: string, biteId: string, seconds: number) => {
    const updatedPlans = state.plans.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          bites: p.bites.map(b => 
            b.id === biteId ? { ...b, timeSpentSeconds: (b.timeSpentSeconds || 0) + seconds } : b
          )
        };
      }
      return p;
    });
    updatePlans(updatedPlans);
  };

  const handleMarkComplete = (planId: string, biteId: string) => {
    const updatedPlans = state.plans.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          bites: p.bites.map(b => b.id === biteId ? { ...b, completed: true, completedAt: new Date().toISOString() } : b)
        };
      }
      return p;
    });
    updatePlans(updatedPlans);
  };

  const handleQuizComplete = (planId: string, score: number) => {
    const updatedPlans = state.plans.map(p => {
      if (p.id === planId) {
        return { ...p, quizPassed: true, quizScore: score };
      }
      return p;
    });
    updatePlans(updatedPlans);
    setView('badge');
  };

  const activePlan = state.plans.find(p => p.id === state.activePlanId);

  return (
    <Layout 
      user={state.user} 
      onLogout={handleLogout} 
      onHome={() => setView('plans-list')}
    >
      {view === 'plans-list' && (
        <PlanList 
          plans={state.plans} 
          onSelectPlan={(id) => {
            setState(prev => ({ ...prev, activePlanId: id }));
            localStorage.setItem('bsl_active_plan_id', id);
            setView('dashboard');
          }}
          onNewPlan={() => setView('input')}
        />
      )}

      {view === 'input' && (
        <TopicInput 
          onSubmit={startGeneration} 
          hasPlans={state.plans.length > 0}
          onViewPlans={() => setView('plans-list')}
        />
      )}

      {view === 'generating' && <PlanGenerator message={state.loadingMessage} />}

      {view === 'dashboard' && activePlan && (
        <Dashboard 
          plan={activePlan} 
          onOpenBite={(biteId) => {
            setActiveBiteId(biteId);
            setView('bite');
          }}
          onBack={() => setView('plans-list')}
          onStartQuiz={() => setView('quiz')}
          onViewBadge={() => setView('badge')}
        />
      )}

      {view === 'bite' && activePlan && activeBiteId && (
        <BiteViewer 
          plan={activePlan}
          biteId={activeBiteId}
          onBack={() => setView('dashboard')}
          onComplete={(biteId) => handleMarkComplete(activePlan.id, biteId)}
          onNavigate={(biteId) => setActiveBiteId(biteId)}
          onUpdateTimeSpent={(biteId, seconds) => handleUpdateTimeSpent(activePlan.id, biteId, seconds)}
        />
      )}

      {view === 'quiz' && activePlan && (
        <QuizModule 
          plan={activePlan}
          onBack={() => setView('dashboard')}
          onComplete={(score) => handleQuizComplete(activePlan.id, score)}
        />
      )}

      {view === 'badge' && activePlan && (
        <BadgeScreen 
          plan={activePlan}
          onBack={() => setView('dashboard')}
          onShare={() => {
            const text = `I just earned the "${activePlan.depth === Depth.OVERVIEW ? 'Introductory to ' : ''}${activePlan.topic}${activePlan.depth === Depth.DETAILED ? ' Practitioner' : ''}" badge on Bite Sized Learning! 🧠✨`;
            navigator.clipboard.writeText(text);
            alert("Share summary copied to clipboard!");
          }}
        />
      )}
    </Layout>
  );
};

export default App;
