// src/pages/AdminPage/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar/Navbar.jsx';
import { getFilterMetaData } from '../../services/questionService.js';
import { Loader2, Plus, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import './AdminPage.css';

export default function AdminPage() {
  const [userRole, setUserRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'chapters' | 'papers' | 'questions'

  // Metadata dropdown options
  const [meta, setMeta] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Status banners
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  // 1. Exam Form
  const [examName, setExamName] = useState('');
  const [examCode, setExamCode] = useState('');
  const [examDesc, setExamDesc] = useState('');

  // 2. Subject Form
  const [subExamId, setSubExamId] = useState('');
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');

  // 3. Chapter Form
  const [chapSubId, setChapSubId] = useState('');
  const [chapName, setChapName] = useState('');
  const [chapSeq, setChapSeq] = useState('1');

  // 4. Topic Form
  const [topicChapId, setTopicChapId] = useState('');
  const [topicName, setTopicName] = useState('');

  // 5. Paper Form
  const [paperExamId, setPaperExamId] = useState('');
  const [paperYear, setPaperYear] = useState(new Date().getFullYear().toString());
  const [paperSession, setPaperSession] = useState('');
  const [paperShift, setPaperShift] = useState('');

  // 6. Question Form
  const [qExamId, setQExamId] = useState('');
  const [qSubId, setQSubId] = useState('');
  const [qChapId, setQChapId] = useState('');
  const [qTopicId, setQTopicId] = useState('');
  const [qPaperId, setQPaperId] = useState('');
  const [qNumber, setQNumber] = useState('1');
  const [qType, setQType] = useState('mcq_single');
  const [qDifficulty, setQDifficulty] = useState('medium');
  const [qMarks, setQMarks] = useState('4');
  const [qNegMarks, setQNegMarks] = useState('1');
  const [qContent, setQContent] = useState('');
  
  // MCQ Options state (4 options default)
  const [options, setOptions] = useState([
    { letter: 'A', content: '', isCorrect: false },
    { letter: 'B', content: '', isCorrect: false },
    { letter: 'C', content: '', isCorrect: false },
    { letter: 'D', content: '', isCorrect: false },
  ]);

  // Numerical Answer state
  const [numericalAns, setNumericalAns] = useState('');
  const [numericalTol, setNumericalTol] = useState('0');

  // Solution state
  const [solContent, setSolContent] = useState('');
  const [solVideoUrl, setSolVideoUrl] = useState('');

  const navigate = useNavigate();

  // 1. Verify User Role on Mount
  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) {
          setUserRole('user');
          setCheckingRole(false);
          return;
        }

        supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          .then(({ data, error }) => {
            if (error || !data) {
              setUserRole('user');
            } else {
              setUserRole(data.role);
            }
            setCheckingRole(false);
          });
      })
      .catch(() => {
        setUserRole('user');
        setCheckingRole(false);
      });
  }, []);

  // 2. Fetch fresh filter metadata for dropdown lists
  const loadFreshMeta = () => {
    setLoadingMeta(true);
    getFilterMetaData(true)
      .then((data) => {
        setMeta(data);
        // Prepopulate default selection IDs if data exists
        if (data.exams.length > 0) {
          setSubExamId(data.exams[0].id);
          setPaperExamId(data.exams[0].id);
          setQExamId(data.exams[0].id);
        }
        if (data.subjects.length > 0) {
          setChapSubId(data.subjects[0].id);
        }
        if (data.chapters.length > 0) {
          setTopicChapId(data.chapters[0].id);
        }
      })
      .catch((err) => console.error('Metadata load error:', err))
      .finally(() => setLoadingMeta(false));
  };

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'moderator') {
      loadFreshMeta();
    }
  }, [userRole]);

  // Helper alert reset
  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const flashError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg('');
  };

  // Dynamic filter lists for Question Page dropdowns
  const availableSubjects = meta?.subjects.filter(s => s.exam_id === qExamId) || [];
  const availableChapters = meta?.chapters.filter(c => c.subject_id === qSubId) || [];
  const availableTopics = meta?.topics.filter(t => t.chapter_id === qChapId) || [];
  const availablePapers = meta?.papers.filter(p => p.exam_id === qExamId) || [];

  // Sync sub selections when exam or subject changes in Question Form
  useEffect(() => {
    if (availableSubjects.length > 0) {
      setQSubId(availableSubjects[0].id);
    } else {
      setQSubId('');
    }
  }, [qExamId, meta]);

  useEffect(() => {
    if (availableChapters.length > 0) {
      setQChapId(availableChapters[0].id);
    } else {
      setQChapId('');
    }
  }, [qSubId, meta]);

  useEffect(() => {
    if (availableTopics.length > 0) {
      setQTopicId(availableTopics[0].id);
    } else {
      setQTopicId('');
    }
  }, [qChapId, meta]);

  useEffect(() => {
    if (availablePapers.length > 0) {
      setQPaperId(availablePapers[0].id);
    } else {
      setQPaperId('');
    }
  }, [qExamId, meta]);

  // ── Form Submissions ──
  
  // 1. Create Exam
  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!examName || !examCode) return flashError('Name and Code are required.');
    setSubmitting(true);
    const { error } = await supabase
      .from('exams')
      .insert([{ name: examName, code: examCode.trim().toLowerCase(), description: examDesc }]);
    
    setSubmitting(false);
    if (error) {
      flashError(error.message);
    } else {
      flashSuccess(`Exam "${examName}" created successfully!`);
      setExamName(''); setExamCode(''); setExamDesc('');
      loadFreshMeta();
    }
  };

  // 2. Create Subject
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subName || !subSlug || !subExamId) return flashError('Subject Name, Slug and Exam are required.');
    setSubmitting(true);
    const { error } = await supabase
      .from('subjects')
      .insert([{ name: subName, slug: subSlug.trim().toLowerCase(), exam_id: subExamId }]);
    
    setSubmitting(false);
    if (error) {
      flashError(error.message);
    } else {
      flashSuccess(`Subject "${subName}" created successfully!`);
      setSubName(''); setSubSlug('');
      loadFreshMeta();
    }
  };

  // 3. Create Chapter
  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!chapName || !chapSubId) return flashError('Chapter Name and Subject are required.');
    setSubmitting(true);
    const { error } = await supabase
      .from('chapters')
      .insert([{ name: chapName, subject_id: chapSubId, sequence_order: parseInt(chapSeq, 10) || 1 }]);
    
    setSubmitting(false);
    if (error) {
      flashError(error.message);
    } else {
      flashSuccess(`Chapter "${chapName}" created successfully!`);
      setChapName('');
      loadFreshMeta();
    }
  };

  // 4. Create Topic
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!topicName || !topicChapId) return flashError('Topic Name and Chapter are required.');
    setSubmitting(true);
    const { error } = await supabase
      .from('topics')
      .insert([{ name: topicName, chapter_id: topicChapId }]);
    
    setSubmitting(false);
    if (error) {
      flashError(error.message);
    } else {
      flashSuccess(`Topic "${topicName}" created successfully!`);
      setTopicName('');
      loadFreshMeta();
    }
  };

  // 5. Create Paper
  const handleCreatePaper = async (e) => {
    e.preventDefault();
    if (!paperExamId || !paperYear) return flashError('Exam and Year are required.');
    setSubmitting(true);
    const { error } = await supabase
      .from('papers')
      .insert([{ 
        exam_id: paperExamId, 
        year: parseInt(paperYear, 10), 
        session: paperSession || null, 
        shift: paperShift || null 
      }]);
    
    setSubmitting(false);
    if (error) {
      flashError(error.message);
    } else {
      flashSuccess(`Sitting/Paper created successfully!`);
      setPaperSession(''); setPaperShift('');
      loadFreshMeta();
    }
  };

  // 6. Create Question (Complex insert transaction)
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!qExamId || !qSubId || !qChapId || !qTopicId || !qPaperId || !qContent.trim()) {
      return flashError('Please fill in all core question metadata fields and content.');
    }
    
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Insert Core Question
      const questionPayload = {
        exam_id: qExamId,
        subject_id: qSubId,
        chapter_id: qChapId,
        topic_id: qTopicId,
        paper_id: qPaperId,
        question_number: parseInt(qNumber, 10) || 1,
        type: qType,
        content: qContent.trim(),
        difficulty: qDifficulty,
        marks: parseFloat(qMarks) || 4,
        negative_marks: parseFloat(qNegMarks) || 1,
        status: 'published'
      };

      if (qType === 'numerical') {
        questionPayload.numerical_answer = parseFloat(numericalAns);
        questionPayload.numerical_tolerance = parseFloat(numericalTol) || 0;
      }

      const { data: qData, error: qErr } = await supabase
        .from('questions')
        .insert([questionPayload])
        .select('id')
        .single();

      if (qErr) throw qErr;
      const questionId = qData.id;

      // 2. Insert Options if MCQ type
      if (qType === 'mcq_single' || qType === 'mcq_multiple') {
        const optionsPayload = options
          .filter(opt => opt.content.trim() !== '')
          .map(opt => ({
            question_id: questionId,
            option_letter: opt.letter,
            content: opt.content.trim(),
            is_correct: opt.isCorrect
          }));

        if (optionsPayload.length > 0) {
          const { error: optErr } = await supabase
            .from('question_options')
            .insert(optionsPayload);
          if (optErr) throw optErr;
        }
      }

      // 3. Insert Solution if present
      if (solContent.trim() || solVideoUrl.trim()) {
        const { error: solErr } = await supabase
          .from('question_solutions')
          .insert([{
            question_id: questionId,
            content: solContent.trim(),
            video_url: solVideoUrl.trim() || null
          }]);
        if (solErr) throw solErr;
      }

      flashSuccess(`Question #${qNumber} added successfully!`);
      
      // Reset input fields
      setQContent('');
      setQNumber((prev) => (parseInt(prev, 10) + 1).toString());
      setNumericalAns('');
      setSolContent('');
      setSolVideoUrl('');
      setOptions([
        { letter: 'A', content: '', isCorrect: false },
        { letter: 'B', content: '', isCorrect: false },
        { letter: 'C', content: '', isCorrect: false },
        { letter: 'D', content: '', isCorrect: false },
      ]);
    } catch (err) {
      console.error(err);
      flashError(err.message || 'Failed to insert question.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to handle MCQ option editing
  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index][field] = value;
    
    // For single-choice MCQ, ensure only one option is checked correct
    if (qType === 'mcq_single' && field === 'isCorrect' && value === true) {
      updated.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false;
      });
    }
    setOptions(updated);
  };

  // Checking Authentication state
  if (checkingRole) {
    return (
      <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Access Denied if user role is not admin or moderator
  if (userRole !== 'admin' && userRole !== 'moderator') {
    return (
      <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] text-slate-900 dark:text-emerald-50 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-md w-full mx-auto px-6 py-20 text-center flex-1 flex flex-col justify-center items-center gap-6">
          <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20 text-red-500">
            <ShieldAlert size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Access Denied</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Only authenticated administrators and moderators are permitted to access this dashboard.
            </p>
          </div>
          <Link to="/" className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors">
            Return to Home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] text-slate-900 dark:text-emerald-50 transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6 text-left">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Admin & Moderator Panel
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Create and manage examinations, subjects, topics, and past year questions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 capitalize">
              Role: {userRole}
            </span>
          </div>
        </div>

        {/* Global Success / Error Messages */}
        {successMsg && (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
            <Check size={18} className="shrink-0" />
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <span className="text-sm font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Tab Selector */}
        <div className="admin-tab-row">
          <button
            onClick={() => { setActiveTab('exams'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`admin-tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
          >
            Exams & Subjects
          </button>
          <button
            onClick={() => { setActiveTab('chapters'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`admin-tab-btn ${activeTab === 'chapters' ? 'active' : ''}`}
          >
            Chapters & Topics
          </button>
          <button
            onClick={() => { setActiveTab('papers'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`admin-tab-btn ${activeTab === 'papers' ? 'active' : ''}`}
          >
            Papers / Sittings
          </button>
          <button
            onClick={() => { setActiveTab('questions'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`admin-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          >
            Insert Questions
          </button>
        </div>

        {/* Tab Contents */}
        {loadingMeta && activeTab !== 'exams' ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="admin-tab-content">
            
            {/* 1. EXAMS & SUBJECTS TAB */}
            {activeTab === 'exams' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Exam Card */}
                <form onSubmit={handleCreateExam} className="admin-card-form">
                  <h2 className="admin-form-title">Create New Examination</h2>
                  
                  <div className="admin-field">
                    <label>Exam Name</label>
                    <input
                      type="text"
                      placeholder="e.g. JEE Main, NEET UG"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-field">
                    <label>Exam Code</label>
                    <input
                      type="text"
                      placeholder="e.g. jee_main, neet"
                      value={examCode}
                      onChange={(e) => setExamCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-field">
                    <label>Description</label>
                    <textarea
                      placeholder="Enter exam description..."
                      value={examDesc}
                      onChange={(e) => setExamDesc(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <button className="admin-submit-btn" type="submit" disabled={submitting}>
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Create Exam
                  </button>
                </form>

                {/* Create Subject Card */}
                <form onSubmit={handleCreateSubject} className="admin-card-form">
                  <h2 className="admin-form-title">Create New Subject</h2>
                  
                  <div className="admin-field">
                    <label>Exam Category</label>
                    <select
                      value={subExamId}
                      onChange={(e) => setSubExamId(e.target.value)}
                      required
                    >
                      {meta?.exams.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                      ))}
                      {(!meta || meta.exams.length === 0) && <option value="">No Exams Available</option>}
                    </select>
                  </div>

                  <div className="admin-field">
                    <label>Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Physics, Chemistry, Biology"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-field">
                    <label>Subject Slug (lowercase)</label>
                    <input
                      type="text"
                      placeholder="e.g. physics, chemistry"
                      value={subSlug}
                      onChange={(e) => setSubSlug(e.target.value)}
                      required
                    />
                  </div>

                  <button className="admin-submit-btn" type="submit" disabled={submitting || !subExamId}>
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Create Subject
                  </button>
                </form>
              </div>
            )}

            {/* 2. CHAPTERS & TOPICS TAB */}
            {activeTab === 'chapters' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Chapter Form */}
                <form onSubmit={handleCreateChapter} className="admin-card-form">
                  <h2 className="admin-form-title">Create New Chapter</h2>
                  
                  <div className="admin-field">
                    <label>Subject Category</label>
                    <select
                      value={chapSubId}
                      onChange={(e) => setChapSubId(e.target.value)}
                      required
                    >
                      {meta?.subjects.map(s => {
                        const exam = meta.exams.find(e => e.id === s.exam_id);
                        return (
                          <option key={s.id} value={s.id}>
                            {s.name} ({exam ? exam.name : 'Unknown Exam'})
                          </option>
                        );
                      })}
                      {(!meta || meta.subjects.length === 0) && <option value="">No Subjects Available</option>}
                    </select>
                  </div>

                  <div className="admin-field">
                    <label>Chapter Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mechanics, Electrostatics"
                      value={chapName}
                      onChange={(e) => setChapName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-field">
                    <label>Sequence Order</label>
                    <input
                      type="number"
                      placeholder="e.g. 1"
                      value={chapSeq}
                      onChange={(e) => setChapSeq(e.target.value)}
                      required
                    />
                  </div>

                  <button className="admin-submit-btn" type="submit" disabled={submitting || !chapSubId}>
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Create Chapter
                  </button>
                </form>

                {/* Create Topic Form */}
                <form onSubmit={handleCreateTopic} className="admin-card-form">
                  <h2 className="admin-form-title">Create New Topic</h2>
                  
                  <div className="admin-field">
                    <label>Chapter Parent</label>
                    <select
                      value={topicChapId}
                      onChange={(e) => setTopicChapId(e.target.value)}
                      required
                    >
                      {meta?.chapters.map(c => {
                        const sub = meta.subjects.find(s => s.id === c.subject_id);
                        const exam = sub ? meta.exams.find(e => e.id === sub.exam_id) : null;
                        return (
                          <option key={c.id} value={c.id}>
                            {c.name} ({sub ? sub.name : 'Unknown Sub'} — {exam ? exam.name : 'Unknown Exam'})
                          </option>
                        );
                      })}
                      {(!meta || meta.chapters.length === 0) && <option value="">No Chapters Available</option>}
                    </select>
                  </div>

                  <div className="admin-field">
                    <label>Topic Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Circular Motion, Coulomb's Law"
                      value={topicName}
                      onChange={(e) => setTopicName(e.target.value)}
                      required
                    />
                  </div>

                  <button className="admin-submit-btn" type="submit" disabled={submitting || !topicChapId}>
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Create Topic
                  </button>
                </form>
              </div>
            )}

            {/* 3. PAPERS / SITTINGS TAB */}
            {activeTab === 'papers' && (
              <form onSubmit={handleCreatePaper} className="admin-card-form max-w-xl mx-auto">
                <h2 className="admin-form-title text-center">Create Exam Paper Sitting</h2>
                
                <div className="admin-field">
                  <label>Exam Category</label>
                  <select
                    value={paperExamId}
                    onChange={(e) => setPaperExamId(e.target.value)}
                    required
                  >
                    {meta?.exams.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-field">
                  <label>Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2026"
                    value={paperYear}
                    onChange={(e) => setPaperYear(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-field">
                  <label>Session (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. January Session, Phase 2"
                    value={paperSession}
                    onChange={(e) => setPaperSession(e.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <label>Shift / Sitting (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Shift 1, Evening Shift"
                    value={paperShift}
                    onChange={(e) => setPaperShift(e.target.value)}
                  />
                </div>

                <button className="admin-submit-btn" type="submit" disabled={submitting || !paperExamId}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create Paper Sitting
                </button>
              </form>
            )}

            {/* 4. QUESTIONS INSERTION TAB */}
            {activeTab === 'questions' && (
              <form onSubmit={handleCreateQuestion} className="admin-card-form w-full">
                <h2 className="admin-form-title">Insert Question Paper Query</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Select Exam */}
                  <div className="admin-field">
                    <label>Exam</label>
                    <select value={qExamId} onChange={(e) => setQExamId(e.target.value)} required>
                      {meta?.exams.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Subject */}
                  <div className="admin-field">
                    <label>Subject</label>
                    <select value={qSubId} onChange={(e) => setQSubId(e.target.value)} required>
                      {availableSubjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                      {availableSubjects.length === 0 && <option value="">No Subjects Found</option>}
                    </select>
                  </div>

                  {/* Select Chapter */}
                  <div className="admin-field">
                    <label>Chapter</label>
                    <select value={qChapId} onChange={(e) => setQChapId(e.target.value)} required>
                      {availableChapters.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.name}</option>
                      ))}
                      {availableChapters.length === 0 && <option value="">No Chapters Found</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  {/* Select Topic */}
                  <div className="admin-field">
                    <label>Topic</label>
                    <select value={qTopicId} onChange={(e) => setQTopicId(e.target.value)} required>
                      {availableTopics.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                      {availableTopics.length === 0 && <option value="">No Topics Found</option>}
                    </select>
                  </div>

                  {/* Select Paper Sitting */}
                  <div className="admin-field">
                    <label>Paper Sitting</label>
                    <select value={qPaperId} onChange={(e) => setQPaperId(e.target.value)} required>
                      {availablePapers.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.year} {p.session ? `(${p.session})` : ''} {p.shift ? `— ${p.shift}` : ''}
                        </option>
                      ))}
                      {availablePapers.length === 0 && <option value="">No Paper Sittings Found</option>}
                    </select>
                  </div>

                  {/* Question Number */}
                  <div className="admin-field">
                    <label>Question Number</label>
                    <input
                      type="number"
                      value={qNumber}
                      onChange={(e) => setQNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                  {/* Question Type */}
                  <div className="admin-field">
                    <label>Question Type</label>
                    <select value={qType} onChange={(e) => setQType(e.target.value)} required>
                      <option value="mcq_single">Single Choice (MCQ)</option>
                      <option value="mcq_multiple">Multiple Choice (MCQ)</option>
                      <option value="numerical">Numerical Input</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="admin-field">
                    <label>Difficulty</label>
                    <select value={qDifficulty} onChange={(e) => setQDifficulty(e.target.value)} required>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  {/* Marks */}
                  <div className="admin-field">
                    <label>Positive Marks</label>
                    <input
                      type="number"
                      step="0.5"
                      value={qMarks}
                      onChange={(e) => setQMarks(e.target.value)}
                      required
                    />
                  </div>

                  {/* Negative Marks */}
                  <div className="admin-field">
                    <label>Negative Marks</label>
                    <input
                      type="number"
                      step="0.5"
                      value={qNegMarks}
                      onChange={(e) => setQNegMarks(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Content Input (Supports LaTeX) */}
                <div className="admin-field mt-4">
                  <label>Question Content (Supports LaTeX / Markdown)</label>
                  <textarea
                    placeholder="Enter question text. Use $$...$$ or $...$ for LaTeX equations."
                    value={qContent}
                    onChange={(e) => setQContent(e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                {/* Conditional Inputs: Options for MCQ */}
                {(qType === 'mcq_single' || qType === 'mcq_multiple') && (
                  <div className="admin-mcq-options-container mt-6">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Question Options</h3>
                    {options.map((opt, index) => (
                      <div key={opt.letter} className="flex gap-4 items-center mb-3">
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-sm font-bold flex items-center justify-center">
                          {opt.letter}
                        </span>
                        <input
                          type="text"
                          placeholder={`Enter content for option ${opt.letter}`}
                          value={opt.content}
                          className="flex-1"
                          onChange={(e) => handleOptionChange(index, 'content', e.target.value)}
                          required={index < 2} // Option A & B are always required
                        />
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold select-none shrink-0">
                          <input
                            type="checkbox"
                            checked={opt.isCorrect}
                            onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                          />
                          Correct
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Conditional Inputs: Numerical parameters */}
                {qType === 'numerical' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="admin-field">
                      <label>Correct Answer Value</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 15.25"
                        value={numericalAns}
                        onChange={(e) => setNumericalAns(e.target.value)}
                        required
                      />
                    </div>
                    <div className="admin-field">
                      <label>Tolerance Range (Optional)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 0.05"
                        value={numericalTol}
                        onChange={(e) => setNumericalTol(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Solution Block */}
                <div className="admin-solution-container mt-6 pt-6 border-t border-slate-200 dark:border-slate-850">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Step-by-step Solution</h3>
                  
                  <div className="admin-field">
                    <label>Solution Explanation (LaTeX / Markdown)</label>
                    <textarea
                      placeholder="Explain the step-by-step resolution of this question..."
                      value={solContent}
                      onChange={(e) => setSolContent(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="admin-field mt-3">
                    <label>Video Solution Link (YouTube or Vimeo URL)</label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      value={solVideoUrl}
                      onChange={(e) => setSolVideoUrl(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  className="admin-submit-btn mt-6" 
                  type="submit" 
                  disabled={submitting || !qSubId || !qChapId || !qTopicId || !qPaperId}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Publish Question to Platform
                </button>
              </form>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
