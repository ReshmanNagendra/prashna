// src/pages/AdminPage/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar/Navbar.jsx';
import { getFilterMetaData } from '../../services/questionService.js';
import { Loader2, Plus, Check, AlertCircle, ShieldAlert, Key, Upload, Trash2, Sparkles, RefreshCw, Save, Image } from 'lucide-react';
import MathText from '../../components/MathText/MathText.jsx';
import './AdminPage.css';

export default function AdminPage() {
  const [userRole, setUserRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'chapters' | 'papers' | 'questions' | 'bulk'

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

  // Bulk Import Form states
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLogs, setBulkLogs] = useState([]);
  const [bulkProgress, setBulkProgress] = useState(0);

  // AI Screenshot Scanner states
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('prashna_gemini_key') || '');
  const [saveApiKey, setSaveApiKey] = useState(!!localStorage.getItem('prashna_gemini_key'));
  const [scannerFile, setScannerFile] = useState(null);
  const [scannerPreview, setScannerPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedQuestion, setScannedQuestion] = useState(null);

  // Scanner metadata selections
  const [scanExamId, setScanExamId] = useState('');
  const [scanSubId, setScanSubId] = useState('');
  const [scanChapId, setScanChapId] = useState('');
  const [scanTopicId, setScanTopicId] = useState('');
  const [scanPaperId, setScanPaperId] = useState('');
  const [scanNumber, setScanNumber] = useState('1');

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

  // Sync scanner dropdown selections
  const scanAvailableSubjects = meta?.subjects.filter(s => s.exam_id === scanExamId) || [];
  const scanAvailableChapters = meta?.chapters.filter(c => c.subject_id === scanSubId) || [];
  const scanAvailableTopics = meta?.topics.filter(t => t.chapter_id === scanChapId) || [];
  const scanAvailablePapers = meta?.papers.filter(p => p.exam_id === scanExamId) || [];

  useEffect(() => {
    if (meta) {
      if (meta.exams.length > 0 && !scanExamId) {
        setScanExamId(meta.exams[0].id);
      }
    }
  }, [meta]);

  useEffect(() => {
    if (scanAvailableSubjects.length > 0) {
      setScanSubId(scanAvailableSubjects[0].id);
    } else {
      setScanSubId('');
    }
  }, [scanExamId, meta]);

  useEffect(() => {
    if (scanAvailableChapters.length > 0) {
      setScanChapId(scanAvailableChapters[0].id);
    } else {
      setScanChapId('');
    }
  }, [scanSubId, meta]);

  useEffect(() => {
    if (scanAvailableTopics.length > 0) {
      setScanTopicId(scanAvailableTopics[0].id);
    } else {
      setScanTopicId('');
    }
  }, [scanChapId, meta]);

  useEffect(() => {
    if (scanAvailablePapers.length > 0) {
      setScanPaperId(scanAvailablePapers[0].id);
    } else {
      setScanPaperId('');
    }
  }, [scanExamId, meta]);

  // Clipboard Paste Listener for screenshots
  useEffect(() => {
    const handlePaste = (e) => {
      if (activeTab !== 'ai-scanner') return;
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setScannerFile(file);
            const url = URL.createObjectURL(file);
            setScannerPreview(url);
            setScannedQuestion(null);
            flashSuccess('Image pasted from clipboard successfully!');
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab]);

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

  // AI Scanner Scan Executer
  const runGeminiScan = async (base64Data, mimeType, apiKey) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const systemPrompt = `You are a high-fidelity data entry scanner. Analyze the question paper screenshot and convert it into a structured JSON representation.
Strictly adhere to the JSON schema. Use LaTeX for mathematical formatting (use single dollars $...$ for inline math and double dollars $$...$$ for block equations). Ensure that math symbols and expressions inside question content, options, and explanation are fully wrapped in standard LaTeX format.`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            content: { type: "STRING", description: "The question text, retaining LaTeX formatting." },
            type: { type: "STRING", enum: ["mcq_single", "mcq_multiple", "numerical"], description: "The type of question" },
            difficulty: { type: "STRING", enum: ["easy", "medium", "hard"], description: "Difficulty level" },
            options: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  letter: { type: "STRING", description: "Option letter like A, B, C, D" },
                  content: { type: "STRING", description: "Option text, retaining LaTeX." },
                  is_correct: { type: "BOOLEAN", description: "Whether this option is correct." }
                },
                required: ["letter", "content", "is_correct"]
              }
            },
            numerical_answer: { type: "NUMBER", description: "Numeric answer value if type is numerical." },
            numerical_tolerance: { type: "NUMBER", description: "Allowed tolerance (defaults to 0)." },
            solution: { type: "STRING", description: "Step-by-step solution / explanation, retaining LaTeX." }
          },
          required: ["content", "type", "difficulty", "solution"]
        }
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errText}`);
    }

    const result = await response.json();
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("No response content from Gemini API.");
    }

    return JSON.parse(textResponse);
  };

  const handleScanFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setScannerFile(file);
      const url = URL.createObjectURL(file);
      setScannerPreview(url);
      setScannedQuestion(null);
      flashSuccess('Image loaded successfully.');
    } else if (file) {
      flashError('Please select a valid image file (PNG, JPG, WebP).');
    }
  };

  const handleScannerDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setScannerFile(file);
      const url = URL.createObjectURL(file);
      setScannerPreview(url);
      setScannedQuestion(null);
      flashSuccess('Image dropped successfully.');
    } else if (file) {
      flashError('Please drop a valid image file.');
    }
  };

  const handleStartScan = async () => {
    if (!scannerFile) return flashError('Please upload or paste a screenshot first.');
    if (!geminiKey.trim()) return flashError('Please enter a Gemini API Key.');
    
    setScanning(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (saveApiKey) {
        localStorage.setItem('prashna_gemini_key', geminiKey.trim());
      } else {
        localStorage.removeItem('prashna_gemini_key');
      }

      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.readAsDataURL(scannerFile);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (err) => reject(err);
      });

      const base64Data = await base64Promise;
      const parsedData = await runGeminiScan(base64Data, scannerFile.type, geminiKey.trim());

      // Format options to ensure we have standard MCQ indexes (default to 4 options if returned fewer)
      if (parsedData.type !== 'numerical' && parsedData.options) {
        const letters = ['A', 'B', 'C', 'D'];
        const filledOptions = letters.map(letter => {
          const parsedOpt = parsedData.options.find(o => o.letter.toUpperCase() === letter);
          return parsedOpt || { letter, content: '', is_correct: false };
        });
        parsedData.options = filledOptions;
      }

      setScannedQuestion(parsedData);
      flashSuccess('AI scanning complete! Please review and save the question.');
    } catch (err) {
      console.error(err);
      flashError(err.message || 'AI Scan failed. Please check your API key and try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleClearScanner = () => {
    setScannerFile(null);
    setScannerPreview(null);
    setScannedQuestion(null);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleScannedFieldChange = (field, value) => {
    setScannedQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScannedOptionChange = (index, field, value) => {
    setScannedQuestion(prev => {
      const updatedOpts = [...prev.options];
      updatedOpts[index] = { ...updatedOpts[index], [field]: value };
      
      if (prev.type === 'mcq_single' && field === 'is_correct' && value === true) {
        updatedOpts.forEach((opt, idx) => {
          if (idx !== index) opt.is_correct = false;
        });
      }
      return { ...prev, options: updatedOpts };
    });
  };

  const handleSaveScannedQuestion = async (e) => {
    e.preventDefault();
    if (!scannedQuestion) return;
    
    if (!scanExamId || !scanSubId || !scanChapId || !scanTopicId || !scanPaperId || !scannedQuestion.content.trim()) {
      return flashError('Please fill in all core question metadata fields and content.');
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Insert Core Question
      const questionPayload = {
        exam_id: scanExamId,
        subject_id: scanSubId,
        chapter_id: scanChapId,
        topic_id: scanTopicId,
        paper_id: scanPaperId,
        question_number: parseInt(scanNumber, 10) || 1,
        type: scannedQuestion.type,
        content: scannedQuestion.content.trim(),
        difficulty: scannedQuestion.difficulty,
        marks: 4,
        negative_marks: scannedQuestion.type === 'numerical' ? 0 : 1,
        status: 'published'
      };

      if (scannedQuestion.type === 'numerical') {
        questionPayload.numerical_answer = parseFloat(scannedQuestion.numerical_answer);
        questionPayload.numerical_tolerance = parseFloat(scannedQuestion.numerical_tolerance) || 0;
      }

      const { data: qData, error: qErr } = await supabase
        .from('questions')
        .insert([questionPayload])
        .select('id')
        .single();

      if (qErr) throw qErr;
      const questionId = qData.id;

      // 2. Insert Options if MCQ type
      if (scannedQuestion.type === 'mcq_single' || scannedQuestion.type === 'mcq_multiple') {
        const optionsPayload = (scannedQuestion.options || [])
          .filter(opt => opt.content && opt.content.trim() !== '')
          .map(opt => ({
            question_id: questionId,
            option_letter: opt.letter,
            content: opt.content.trim(),
            is_correct: opt.is_correct || false
          }));

        if (optionsPayload.length > 0) {
          const { error: optErr } = await supabase
            .from('question_options')
            .insert(optionsPayload);
          if (optErr) throw optErr;
        }
      }

      // 3. Insert Solution if present
      if (scannedQuestion.solution && scannedQuestion.solution.trim()) {
        const { error: solErr } = await supabase
          .from('question_solutions')
          .insert([{
            question_id: questionId,
            content: scannedQuestion.solution.trim(),
            video_url: null
          }]);
        if (solErr) throw solErr;
      }

      flashSuccess(`Scanned Question #${scanNumber} saved successfully!`);
      setScanNumber(prev => (parseInt(prev, 10) + 1).toString());
      
      setScannerFile(null);
      setScannerPreview(null);
      setScannedQuestion(null);
      loadFreshMeta();
    } catch (err) {
      console.error(err);
      flashError(err.message || 'Failed to save scanned question.');
    } finally {
      setSubmitting(false);
    }
  };

  // 7. Bulk Upload actions
  const handleBulkFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBulkFile(file);
      flashSuccess(`Loaded file "${file.name}" successfully. Ready to import.`);
    }
  };

  const handleStartBulkImport = async () => {
    if (!bulkFile) return flashError('Please select a JSON file first.');
    setSubmitting(true);
    setBulkLogs([]);
    setBulkProgress(0);

    const log = (type, message) => {
      setBulkLogs((prev) => [...prev, { type, message, timestamp: new Date().toLocaleTimeString() }]);
    };

    try {
      log('info', 'Reading and parsing JSON file...');
      const text = await bulkFile.text();
      const items = JSON.parse(text);

      if (!Array.isArray(items)) {
        throw new Error('JSON root must be an array of questions.');
      }

      log('info', `Found ${items.length} questions in JSON. Beginning ID resolution...`);

      // Reload fresh metadata cache to avoid any outdated cache references
      log('info', 'Fetching fresh database metadata...');
      const currentMeta = await getFilterMetaData(true);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const progressPct = Math.round(((i + 1) / items.length) * 100);
        setBulkProgress(progressPct);

        const qRef = `Q#${item.question_number || '?'}`;
        log('info', `[${progressPct}%] Processing ${qRef} for exam code "${item.exam_code}"...`);

        try {
          // 1. Resolve Exam
          const exam = currentMeta.exams.find(e => e.code === item.exam_code);
          if (!exam) {
            log('error', `Skipping ${qRef}: Exam with code "${item.exam_code}" not found in database.`);
            continue;
          }

          // 2. Resolve Subject
          const subject = currentMeta.subjects.find(s => 
            s.exam_id === exam.id && 
            s.name.toLowerCase() === item.subject_name.toLowerCase()
          );
          if (!subject) {
            log('error', `Skipping ${qRef}: Subject "${item.subject_name}" not found for exam "${exam.name}".`);
            continue;
          }

          // 3. Resolve or Create Chapter
          let chapter = currentMeta.chapters.find(c => 
            c.subject_id === subject.id && 
            c.name.toLowerCase() === item.chapter_name.toLowerCase()
          );
          if (!chapter) {
            log('info', `Creating chapter "${item.chapter_name}"...`);
            const { data: newChap, error: chapErr } = await supabase
              .from('chapters')
              .insert([{ name: item.chapter_name, subject_id: subject.id, sequence_order: 1 }])
              .select('id, name, subject_id')
              .single();
            if (chapErr) throw new Error(`Chapter create failed: ${chapErr.message}`);
            chapter = newChap;
            currentMeta.chapters.push(chapter);
          }

          // 4. Resolve or Create Topic
          let topic = currentMeta.topics.find(t => 
            t.chapter_id === chapter.id && 
            t.name.toLowerCase() === item.topic_name.toLowerCase()
          );
          if (!topic) {
            log('info', `Creating topic "${item.topic_name}"...`);
            const { data: newTopic, error: topErr } = await supabase
              .from('topics')
              .insert([{ name: item.topic_name, chapter_id: chapter.id }])
              .select('id, name, chapter_id')
              .single();
            if (topErr) throw new Error(`Topic create failed: ${topErr.message}`);
            topic = newTopic;
            currentMeta.topics.push(topic);
          }

          // 5. Resolve or Create Paper
          let paper = currentMeta.papers.find(p => 
            p.exam_id === exam.id && 
            p.year === parseInt(item.paper_year, 10) && 
            (p.session || null) === (item.paper_session || null) && 
            (p.shift || null) === (item.paper_shift || null)
          );
          if (!paper) {
            log('info', `Creating paper sitting: ${item.paper_year} ${item.paper_session || ''} ${item.paper_shift || ''}...`);
            const { data: newPaper, error: papErr } = await supabase
              .from('papers')
              .insert([{ 
                exam_id: exam.id, 
                year: parseInt(item.paper_year, 10), 
                session: item.paper_session || null, 
                shift: item.paper_shift || null 
              }])
              .select('id, year, session, shift, exam_id')
              .single();
            if (papErr) throw new Error(`Paper create failed: ${papErr.message}`);
            paper = newPaper;
            currentMeta.papers.push(paper);
          }

          // 6. Insert Question
          const questionPayload = {
            exam_id: exam.id,
            subject_id: subject.id,
            chapter_id: chapter.id,
            topic_id: topic.id,
            paper_id: paper.id,
            question_number: parseInt(item.question_number, 10) || 1,
            type: item.type || 'mcq_single',
            content: item.content.trim(),
            difficulty: item.difficulty || 'medium',
            marks: parseFloat(item.marks) || 4,
            negative_marks: parseFloat(item.negative_marks) || 1,
            status: 'published'
          };

          if (item.type === 'numerical') {
            questionPayload.numerical_answer = parseFloat(item.numerical_answer);
            questionPayload.numerical_tolerance = parseFloat(item.numerical_tolerance) || 0;
          }

          const { data: qData, error: qErr } = await supabase
            .from('questions')
            .insert([questionPayload])
            .select('id')
            .single();

          if (qErr) throw new Error(`Question insert failed: ${qErr.message}`);
          const questionId = qData.id;

          // 7. Insert Options (if MCQ)
          if (item.options && (item.type === 'mcq_single' || item.type === 'mcq_multiple')) {
            const optionsPayload = item.options.map(opt => ({
              question_id: questionId,
              option_letter: opt.letter,
              content: opt.content.trim(),
              is_correct: opt.is_correct || false
            }));
            const { error: optErr } = await supabase
              .from('question_options')
              .insert(optionsPayload);
            if (optErr) throw new Error(`Options insert failed: ${optErr.message}`);
          }

          // 8. Insert Solution
          if (item.solution || item.video_url) {
            const { error: solErr } = await supabase
              .from('question_solutions')
              .insert([{
                question_id: questionId,
                content: item.solution ? item.solution.trim() : '',
                video_url: item.video_url ? item.video_url.trim() : null
              }]);
            if (solErr) throw new Error(`Solution insert failed: ${solErr.message}`);
          }

          log('success', `[Success] Successfully imported question ${qRef}`);
        } catch (itemErr) {
          log('error', `Error importing ${qRef}: ${itemErr.message}`);
        }
      }

      log('success', 'Bulk import process completed.');
      flashSuccess('Bulk import finished. Check logs below for details.');
      loadFreshMeta(); // Refresh local list dropdowns
    } catch (err) {
      console.error(err);
      log('error', `Fatal process error: ${err.message}`);
      flashError(`Fatal error during import: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
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
          <button
            onClick={() => { setActiveTab('bulk'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`admin-tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
          >
            Bulk Import (JSON)
          </button>
          <button
            onClick={() => { setActiveTab('ai-scanner'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`admin-tab-btn ${activeTab === 'ai-scanner' ? 'active' : ''}`}
          >
            AI Screenshot Scanner
          </button>
        </div>

        {/* Tab Contents */}
        {loadingMeta && activeTab !== 'exams' && activeTab !== 'bulk' ? (
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

            {/* 5. BULK IMPORT TAB */}
            {activeTab === 'bulk' && (
              <div className="space-y-6">
                <div className="admin-card-form w-full">
                  <h2 className="admin-form-title">Bulk Import Questions from JSON</h2>
                  
                  <div className="admin-field">
                    <label>Select JSON File</label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleBulkFileChange}
                      className="cursor-pointer"
                    />
                  </div>

                  <button 
                    onClick={handleStartBulkImport} 
                    className="admin-submit-btn max-w-xs" 
                    type="button" 
                    disabled={submitting || !bulkFile}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Start Bulk Import
                  </button>

                  {/* Progress Bar */}
                  {submitting && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>Import Progress</span>
                        <span>{bulkProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${bulkProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Live Logs console */}
                  {bulkLogs.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-850">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3">Process Logs</h3>
                      <div className="admin-logs-console">
                        {bulkLogs.map((log, index) => (
                          <div key={index} className={`admin-log-line ${log.type}`}>
                            <span className="admin-log-time">[{log.timestamp}]</span>
                            <span className="admin-log-msg">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Schema Documentation guide */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-850">
                  <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-3">Expected JSON Format Schema</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Prepare a JSON file containing an array of question objects. Existing Exams and Subjects are matched by code and name respectively, while Chapters, Topics, and Paper Sittings will be created automatically if they do not exist.
                  </p>
                  <pre className="admin-schema-pre">
{`[
  {
    "exam_code": "jee_main",
    "subject_name": "Physics",
    "chapter_name": "Mechanics",
    "topic_name": "Circular Motion",
    "paper_year": 2020,
    "paper_session": "January",
    "paper_shift": "Shift 1",
    "question_number": 1,
    "type": "mcq_single",
    "difficulty": "medium",
    "marks": 4,
    "negative_marks": 1,
    "content": "A body of mass $m$ is moving in a circle...",
    "options": [
      { "letter": "A", "content": "10 m/s", "is_correct": false },
      { "letter": "B", "content": "20 m/s", "is_correct": true }
    ],
    "solution": "Using formula $v = \\\\omega r$...",
    "video_url": "https://youtube.com/... (optional)"
  }
]`}
                  </pre>
                </div>
              </div>
            )}

            {/* 6. AI SCREENSHOT SCANNER TAB */}
            {activeTab === 'ai-scanner' && (
              <div className="space-y-6">
                
                {/* Dashboard Metadata Targets Selection */}
                <div className="admin-card-form w-full">
                  <h2 className="admin-form-title">AI Scanner Configuration Target</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="admin-field">
                      <label>Exam Target</label>
                      <select value={scanExamId} onChange={(e) => setScanExamId(e.target.value)} required>
                        {meta?.exams.map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-field">
                      <label>Subject Target</label>
                      <select value={scanSubId} onChange={(e) => setScanSubId(e.target.value)} required>
                        {scanAvailableSubjects.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                        {scanAvailableSubjects.length === 0 && <option value="">No Subjects Found</option>}
                      </select>
                    </div>

                    <div className="admin-field">
                      <label>Chapter Target</label>
                      <select value={scanChapId} onChange={(e) => setScanChapId(e.target.value)} required>
                        {scanAvailableChapters.map(ch => (
                          <option key={ch.id} value={ch.id}>{ch.name}</option>
                        ))}
                        {scanAvailableChapters.length === 0 && <option value="">No Chapters Found</option>}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="admin-field">
                      <label>Topic Target</label>
                      <select value={scanTopicId} onChange={(e) => setScanTopicId(e.target.value)} required>
                        {scanAvailableTopics.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                        {scanAvailableTopics.length === 0 && <option value="">No Topics Found</option>}
                      </select>
                    </div>

                    <div className="admin-field">
                      <label>Paper Sitting Target</label>
                      <select value={scanPaperId} onChange={(e) => setScanPaperId(e.target.value)} required>
                        {scanAvailablePapers.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.year} {p.session ? `(${p.session})` : ''} {p.shift ? `— ${p.shift}` : ''}
                          </option>
                        ))}
                        {scanAvailablePapers.length === 0 && <option value="">No Paper Sittings Found</option>}
                      </select>
                    </div>

                    <div className="admin-field">
                      <label>Question Number Start</label>
                      <input
                        type="number"
                        value={scanNumber}
                        onChange={(e) => setScanNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* API Key settings banner */}
                <div className="admin-api-key-banner p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-850">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Key size={16} className="text-emerald-500" />
                        Configure Gemini API Key
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        To use the Screenshot Scanner, enter a Gemini API Key. Your key is stored locally in your browser storage and is never sent to our servers. Get a free key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-500 font-bold hover:underline">Google AI Studio</a>.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        className="px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-500 select-none">
                        <input
                          type="checkbox"
                          checked={saveApiKey}
                          onChange={(e) => setSaveApiKey(e.target.checked)}
                          className="accent-emerald-500"
                        />
                        Remember API Key
                      </label>
                    </div>
                  </div>
                </div>

                {/* Image Upload Dropzone */}
                {!scannedQuestion && (
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleScannerDrop}
                    className="admin-scanner-uploader p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900/10 hover:border-emerald-500/50 transition-colors"
                  >
                    {scannerPreview ? (
                      <div className="relative group max-w-md w-full">
                        <img 
                          src={scannerPreview} 
                          alt="Screenshot Preview" 
                          className="w-full h-auto max-h-64 object-contain rounded-2xl border border-slate-200 dark:border-slate-800"
                        />
                        <button 
                          onClick={handleClearScanner}
                          className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer shadow-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                          <Upload size={32} />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Paste a screenshot directly (Cmd+V / Ctrl+V)
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            or drag and drop an image file here
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScanFileChange}
                          id="scanner-file-picker"
                          className="hidden"
                        />
                        <label 
                          htmlFor="scanner-file-picker"
                          className="px-5 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                        >
                          Browse Files
                        </label>
                      </>
                    )}

                    {scannerFile && !scanning && (
                      <button
                        onClick={handleStartScan}
                        disabled={!geminiKey}
                        className="admin-submit-btn max-w-xs mt-2"
                        type="button"
                      >
                        <Sparkles size={16} />
                        Scan with Gemini AI
                      </button>
                    )}

                    {scanning && (
                      <div className="flex flex-col items-center gap-3 py-4">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-500">Gemini OCR is analyzing the screenshot...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Parsed Scanned Question Preview & Editor */}
                {scannedQuestion && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* Left: Interactive Editor */}
                    <form onSubmit={handleSaveScannedQuestion} className="admin-card-form w-full space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Sparkles size={16} className="text-emerald-500" />
                          Verify Scanned Question
                        </h3>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={handleClearScanner}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Discard Scan"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button 
                            type="button"
                            onClick={handleStartScan}
                            className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                            title="Rescan Image"
                          >
                            <RefreshCw size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="admin-field">
                          <label>Question Type</label>
                          <select 
                            value={scannedQuestion.type} 
                            onChange={(e) => handleScannedFieldChange('type', e.target.value)} 
                            required
                          >
                            <option value="mcq_single">Single Choice (MCQ)</option>
                            <option value="mcq_multiple">Multiple Choice (MCQ)</option>
                            <option value="numerical">Numerical Input</option>
                          </select>
                        </div>

                        <div className="admin-field">
                          <label>Difficulty</label>
                          <select 
                            value={scannedQuestion.difficulty} 
                            onChange={(e) => handleScannedFieldChange('difficulty', e.target.value)} 
                            required
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-field">
                        <label>Question Content (Markdown + LaTeX)</label>
                        <textarea
                          value={scannedQuestion.content}
                          onChange={(e) => handleScannedFieldChange('content', e.target.value)}
                          rows={6}
                          required
                        />
                      </div>

                      {/* Options fields if MCQ */}
                      {(scannedQuestion.type === 'mcq_single' || scannedQuestion.type === 'mcq_multiple') && scannedQuestion.options && (
                        <div className="admin-mcq-options-container">
                          <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-wide mb-3">Options</h4>
                          {scannedQuestion.options.map((opt, index) => (
                            <div key={opt.letter} className="flex gap-3 items-center mb-3">
                              <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-extrabold flex items-center justify-center">
                                {opt.letter}
                              </span>
                              <input
                                type="text"
                                value={opt.content}
                                onChange={(e) => handleScannedOptionChange(index, 'content', e.target.value)}
                                className="flex-1"
                                placeholder={`Option ${opt.letter} content`}
                                required={index < 2}
                              />
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-extrabold shrink-0 select-none">
                                <input
                                  type="checkbox"
                                  checked={opt.is_correct}
                                  onChange={(e) => handleScannedOptionChange(index, 'is_correct', e.target.checked)}
                                />
                                Correct
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Numerical field if Numerical */}
                      {scannedQuestion.type === 'numerical' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="admin-field">
                            <label>Numerical Answer</label>
                            <input
                              type="number"
                              step="any"
                              value={scannedQuestion.numerical_answer || ''}
                              onChange={(e) => handleScannedFieldChange('numerical_answer', e.target.value)}
                              required
                            />
                          </div>
                          <div className="admin-field">
                            <label>Tolerance margin</label>
                            <input
                              type="number"
                              step="any"
                              value={scannedQuestion.numerical_tolerance || 0}
                              onChange={(e) => handleScannedFieldChange('numerical_tolerance', e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="admin-field">
                        <label>Solution & Explanation</label>
                        <textarea
                          value={scannedQuestion.solution}
                          onChange={(e) => handleScannedFieldChange('solution', e.target.value)}
                          rows={4}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="admin-submit-btn"
                      >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save & Import Question
                      </button>
                    </form>

                    {/* Right: Premium Live Question Preview Card */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          Live Render Preview
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Active Rendering
                        </span>
                      </div>

                      {/* Card rendering preview mock */}
                      <div className="p-6 sm:p-8 rounded-3xl border text-left bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-md">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                        
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              {meta?.subjects.find(s => s.id === scanSubId)?.name || 'Subject'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-455">
                              {meta?.exams.find(e => e.id === scanExamId)?.name || 'Exam'} • {meta?.papers.find(p => p.id === scanPaperId)?.year || '2020'}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                            Q#{scanNumber}
                          </span>
                        </div>

                        {/* Scanned Question Text */}
                        <MathText as="p" className="text-lg sm:text-xl font-bold leading-relaxed tracking-tight text-slate-850 dark:text-slate-50 mb-6">
                          {scannedQuestion.content || <span className="opacity-40 italic">Question content will show here...</span>}
                        </MathText>

                        {/* Options if MCQ */}
                        {scannedQuestion.type !== 'numerical' && scannedQuestion.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {scannedQuestion.options.map((opt, idx) => (
                              <div 
                                key={idx}
                                className={`p-4 rounded-2xl border text-sm sm:text-base text-left font-semibold flex items-center gap-3.5 w-full bg-slate-50 dark:bg-slate-950/50 ${
                                  opt.is_correct 
                                    ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5' 
                                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className={`text-xs uppercase shrink-0 font-bold ${opt.is_correct ? 'text-emerald-500' : 'text-slate-400'}`}>
                                  {opt.letter.toLowerCase()}.
                                </span>
                                <MathText as="span">{opt.content || <span className="opacity-30 italic">empty option</span>}</MathText>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Numerical preview if numerical */}
                        {scannedQuestion.type === 'numerical' && (
                          <div className="mb-4 p-4 rounded-2xl border border-dashed border-emerald-500/25 bg-emerald-500/5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            Numerical Type • Answer: {scannedQuestion.numerical_answer || '—'} (±{scannedQuestion.numerical_tolerance || 0})
                          </div>
                        )}

                        {/* Explanation block preview */}
                        {scannedQuestion.solution && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                              Solution & Explanation
                            </h4>
                            <MathText className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#fbfdfc] dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-line">
                              {scannedQuestion.solution}
                            </MathText>
                          </div>
                        )}
                      </div>

                      {/* Original image reference check */}
                      {scannerPreview && (
                        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Original Screenshot Reference</span>
                          <img 
                            src={scannerPreview} 
                            alt="Reference" 
                            className="w-full h-auto max-h-48 object-contain rounded-xl border border-slate-200 dark:border-slate-800"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
