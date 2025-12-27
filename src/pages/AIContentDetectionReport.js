import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { 
  Cpu, 
  Download, 
  Send,
  User,
  BarChart3,
  RefreshCw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowLeft
} from "lucide-react";

const AIContentDetectionReport = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isSavedReport, setIsSavedReport] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // Toggle section expansion
  const toggleSection = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  // Helper function to ensure score is between 0-100
  const normalizeScore = (score) => {
    if (score === undefined || score === null) return 0;
    if (score >= 0 && score <= 100) return score;
    if (score >= 0 && score <= 1) return score * 100;
    return Math.max(0, Math.min(100, score));
  };

  useEffect(() => {
    console.log('🚀 AI Content Detection Report Component Mounted');
    console.log('📌 URL Parameters - id:', id);
    loadReportData();
  }, [id, location]);

  const loadReportData = async () => {
    try {
      console.log('🔍 === STARTING AI DETECTION REPORT DATA LOAD ===');
      console.log('URL ID:', id);

      setLoading(true);
      setMessage('');

      // Check if this is a temporary report ID (starts with ai_)
      if (id && id.startsWith('ai_')) {
        console.log('🆕 Loading TEMPORARY AI detection report');
        await loadTemporaryReport();
      } else if (id && id.startsWith('temp_')) {
        console.log('🆕 Loading TEMPORARY report from localStorage');
        await loadFromLocalStorage();
      } else {
        console.log('💾 Loading SAVED report from database');
        await loadSavedReport();
      }

    } catch (error) {
      console.error('❌ Error loading report data:', error);
      setMessage('Error loading report: ' + error.message);
      setLoading(false);
    }
  };

  const loadTemporaryReport = async () => {
    try {
      console.log('🌐 Fetching from backend temporary storage...');
      
      const response = await fetch(`http://localhost:5000/api/temporary-reports/ai/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('❌ Temporary report not found in backend, checking localStorage...');
          await loadFromLocalStorage();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📡 Backend temporary storage response:', result);
      
      if (result.success && result.data) {
        console.log('✅ Backend temporary data loaded successfully');
        processReportData(result.data);
      } else {
        throw new Error(result.message || 'No data found in temporary storage');
      }
    } catch (error) {
      console.error('❌ Error loading from temporary storage:', error);
      // Fallback to localStorage
      await loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = async () => {
    try {
      console.log('📦 Checking localStorage for temporary report...');
      
      // Try localStorage first
      const localStorageKey = `report_${id}`;
      const reportData = localStorage.getItem(localStorageKey);
      
      if (reportData) {
        console.log('✅ Found temporary report in localStorage');
        const parsedData = JSON.parse(reportData);
        processReportData(parsedData);
        localStorage.removeItem(localStorageKey);
        return;
      }

      // Try URL parameters as fallback
      const urlParams = new URLSearchParams(location.search);
      const encodedData = urlParams.get('data');
      
      if (encodedData) {
        console.log('✅ Found temporary report in URL parameters');
        try {
          const decodedData = JSON.parse(atob(encodedData));
          processReportData(decodedData);
          return;
        } catch (error) {
          console.error('❌ Error decoding URL data:', error);
        }
      }

      // Try location state
      if (location.state?.analysisData) {
        console.log('✅ Found temporary report in location state');
        processReportData(location.state);
        return;
      }

      console.error('❌ No temporary report data found anywhere');
      setMessage('No report data found. Please generate the report again.');
      setLoading(false);

    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
      setMessage('Error loading temporary report: ' + error.message);
      setLoading(false);
    }
  };

  const loadSavedReport = async () => {
    try {
      console.log('📡 Fetching saved report from database API...');
      
      const response = await fetch(`http://localhost:5000/api/reports/report/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Database API response:', result);
      
      if (result.success && result.data) {
        console.log('📊 Saved report data loaded successfully');
        setIsSavedReport(true);
        
        // Format the saved report data for display
        const savedReport = result.data;
        const formattedReport = {
          reportData: savedReport.reportData || {},
          filename: savedReport.filename,
          studentName: savedReport.studentName,
          studentId: savedReport.studentId,
          thesisTitle: savedReport.thesisTitle,
          timestamp: savedReport.createdAt,
          status: savedReport.status,
          reportType: savedReport.reportType
        };
        
        setReport(formattedReport);
        setStudentInfo({
          studentName: savedReport.studentName,
          registrationNumber: savedReport.studentId,
          thesisTitle: savedReport.thesisTitle,
          submittedDate: savedReport.createdAt
        });
      } else {
        throw new Error(result.message || 'No report data found in response');
      }
    } catch (error) {
      console.error('❌ Error loading saved report:', error);
      
      // If it's a 404 and the ID looks like a temporary ID, try temporary storage
      if (error.message.includes('404') && id && (id.startsWith('ai_') || id.startsWith('temp_'))) {
        console.log('🔄 404 error for temporary-looking ID, trying temporary storage...');
        await loadTemporaryReport();
        return;
      }
      
      setMessage('Error loading saved report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (data) => {
    try {
      console.log('🔄 Processing report data...');
      
      const analysisData = data.analysisData || data;
      const thesisData = data.thesisData || data.thesisData || {};
      
      console.log('Raw analysis data:', analysisData);
      console.log('Raw thesis data:', thesisData);

      // Extract AI detection data from various possible structures
      const aiDetectionData = analysisData.ai_detection || 
                           analysisData.ai_content_detection || 
                           analysisData.data?.ai_detection || 
                           analysisData.data?.ai_content_detection || 
                           analysisData.data || 
                           analysisData;

      console.log('🤖 AI Detection data found:', aiDetectionData);

      // Transform the data to match the expected structure
      const transformedAIData = transformAIData(aiDetectionData);

      const formattedReport = {
        reportData: {
          ai_detection: transformedAIData
        },
        filename: thesisData.filename || 'thesis.pdf',
        studentName: thesisData.studentName || 'Unknown Student',
        studentId: thesisData.studentId || 'Unknown ID',
        thesisTitle: thesisData.title || thesisData.thesisTitle || 'Thesis Document',
        timestamp: data.timestamp || new Date().toISOString(),
        status: 'temporary',
        reportType: 'ai-detection'
      };

      console.log('✅ Final formatted report:', formattedReport);

      setReport(formattedReport);
      setStudentInfo({
        studentName: formattedReport.studentName,
        registrationNumber: formattedReport.studentId,
        thesisTitle: formattedReport.thesisTitle,
        submittedDate: thesisData.submittedDate || thesisData.createdAt || new Date().toISOString()
      });
      setLoading(false);
    } catch (error) {
      console.error('❌ Error processing report data:', error);
      setMessage('Error processing report data: ' + error.message);
      setLoading(false);
    }
  };

  const transformAIData = (aiData) => {
    console.log('🔄 Transforming AI data structure...');
    
    // If data already has the expected structure, return as is
    if (aiData.overall && aiData.sections && aiData.summary) {
      return aiData;
    }

    // Extract sections from various possible structures
    const sections = aiData.sections || aiData.detected_sections || [];
    
    // Calculate overall statistics from sections
    const allAiScores = sections.map(section => normalizeScore(section.ai_probability || section.score || 0));
    const averageAiScore = allAiScores.length > 0 ? allAiScores.reduce((a, b) => a + b, 0) / allAiScores.length : 0;
    const highAiSections = allAiScores.filter(score => score > 50).length;
    const totalWords = sections.reduce((sum, section) => sum + (section.word_count || 0), 0);
    
    // Create overall object
    const overall = {
      ai_probability: averageAiScore,
      human_probability: 100 - averageAiScore,
      verdict: getOverallVerdict(averageAiScore),
      confidence: calculateOverallConfidence(sections),
      total_words: totalWords,
      model_used: aiData.model || "roberta-base-openai-detector"
    };

    // Transform sections to ensure they have all required fields
    const transformedSections = sections.map((section, index) => ({
      title: section.title || `Section ${index + 1}`,
      content_preview: section.content_preview || section.content || 'No content preview available',
      ai_probability: normalizeScore(section.ai_probability || section.score || 0),
      human_probability: 100 - normalizeScore(section.ai_probability || section.score || 0),
      verdict: section.verdict || getSectionVerdict(normalizeScore(section.ai_probability || section.score || 0)),
      word_count: section.word_count || 0,
      sentences_analyzed: section.sentences_analyzed || Math.floor((section.word_count || 0) / 15),
      confidence: section.confidence || 85
    }));

    // Create summary
    const summary = {
      total_sections: transformedSections.length,
      sections_analyzed: transformedSections.length,
      high_ai_sections: highAiSections,
      average_ai_score: averageAiScore,
      analysis_summary: generateAnalysisSummary(transformedSections, averageAiScore)
    };

    return {
      overall,
      sections: transformedSections,
      summary
    };
  };

  const getOverallVerdict = (score) => {
    if (score < 20) return "Very Low AI Content";
    if (score < 40) return "Low AI Content";
    if (score < 60) return "Moderate AI Content";
    if (score < 80) return "High AI Content";
    return "Very High AI Content";
  };

  const getSectionVerdict = (score) => {
    if (score < 20) return "Very Low AI";
    if (score < 40) return "Low AI";
    if (score < 60) return "Moderate AI";
    if (score < 80) return "High AI";
    return "Very High AI";
  };

  const calculateOverallConfidence = (sections) => {
    if (!sections.length) return 0;
    const totalConfidence = sections.reduce((sum, section) => sum + (section.confidence || 80), 0);
    return Math.min(totalConfidence / sections.length, 100);
  };

  const generateAnalysisSummary = (sections, averageScore) => {
    const highAISections = sections.filter(s => s.ai_probability > 50).length;
    const lowAISections = sections.filter(s => s.ai_probability < 20).length;
    
    if (averageScore > 70) {
      return `This document shows strong indications of AI-generated content (${averageScore.toFixed(1)}% average). ${highAISections} sections show high AI probability, suggesting significant AI assistance in content creation.`;
    } else if (averageScore > 40) {
      return `Mixed AI and human content detected (${averageScore.toFixed(1)}% average). ${highAISections} sections show higher AI probability, while ${lowAISections} appear primarily human-written.`;
    } else {
      return `Primarily human-written content detected (${averageScore.toFixed(1)}% average). ${lowAISections} sections show very low AI probability, indicating authentic human authorship.`;
    }
  };

  const getAIDetectionLevel = (score) => {
    const normalizedScore = normalizeScore(score);
    
    if (normalizedScore === 0) {
      return { level: 'Not Available', color: 'gray', description: 'AI detection score not calculated' };
    }
    if (normalizedScore < 20) return { level: 'Very Low AI', color: 'green', description: 'Highly likely human-written' };
    if (normalizedScore < 40) return { level: 'Low AI', color: 'blue', description: 'Likely human-written with minimal AI assistance' };
    if (normalizedScore < 60) return { level: 'Moderate AI', color: 'yellow', description: 'Mixed human and AI content' };
    if (normalizedScore < 80) return { level: 'High AI', color: 'orange', description: 'Likely AI-generated with human editing' };
    return { level: 'Very High AI', color: 'red', description: 'Highly likely AI-generated content' };
  };

  const getSectionColor = (score) => {
    const normalizedScore = normalizeScore(score);
    if (normalizedScore < 20) return 'bg-green-500';
    if (normalizedScore < 40) return 'bg-blue-500';
    if (normalizedScore < 60) return 'bg-yellow-500';
    if (normalizedScore < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSectionBorderColor = (score) => {
    const normalizedScore = normalizeScore(score);
    if (normalizedScore < 20) return 'border-green-200';
    if (normalizedScore < 40) return 'border-blue-200';
    if (normalizedScore < 60) return 'border-yellow-200';
    if (normalizedScore < 80) return 'border-orange-200';
    return 'border-red-200';
  };

  const getSectionBackgroundColor = (score) => {
    const normalizedScore = normalizeScore(score);
    if (normalizedScore < 20) return 'bg-green-50';
    if (normalizedScore < 40) return 'bg-blue-50';
    if (normalizedScore < 60) return 'bg-yellow-50';
    if (normalizedScore < 80) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const handleSaveAndSend = async () => {
    if (!report || !studentInfo) {
      setMessage('Error: Report data is incomplete');
      return;
    }
    
    if (!window.confirm('Are you sure you want to save this AI detection report?')) {
      return;
    }

    setSaving(true);
    setMessage("");
    
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      console.log('👤 Current user:', user);
      
      if (!user._id && !user.facultyId) {
        throw new Error('User not authenticated. Please log in again.');
      }

      const facultyId = user._id || user.facultyId;
      const reportId = `ai_detection_${Date.now()}_${report.studentId}`;
      
      const reportData = {
        reportId,
        studentId: report.studentId,
        studentName: report.studentName,
        facultyId: facultyId,
        thesisId: id || reportId,
        thesisTitle: report.thesisTitle,
        filename: report.filename,
        reportType: 'ai-detection',
        reportData: report.reportData
      };

      console.log('📤 Sending report to backend:', reportData);

      const response = await fetch('http://localhost:5000/api/reports/save-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Save response:', result);
      
      if (result.success) {
        setMessage('✅ AI detection report saved and sent to student successfully!');
        setIsSavedReport(true);
        
        // Update the report with saved data
        setReport(prev => ({
          ...prev,
          status: 'sent'
        }));
      } else {
        throw new Error(result.message || 'Failed to save report');
      }
    } catch (error) {
      console.error('❌ Save and send error:', error);
      setMessage('❌ Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = () => {
    window.print();
  };

  const goToEvaluationPage = () => {
    navigate('/faculty/evaluation');
  };

  const closeTab = () => {
    if (isSavedReport) {
      navigate('/faculty/evaluation');
    } else {
      window.close();
    }
  };

  const retryLoad = () => {
    console.log('🔄 Retrying data load...');
    setLoading(true);
    setMessage('');
    loadReportData();
  };

  const loadDemoData = () => {
    console.log('🎭 Loading demonstration AI detection data...');
    const demoReport = {
      reportData: {
        ai_detection: {
          overall: {
            ai_probability: 42.5,
            human_probability: 57.5,
            verdict: "Low AI Content",
            confidence: 87.5,
            total_words: 12500,
            model_used: "roberta-base-openai-detector"
          },
          sections: [
            {
              title: "Abstract",
              content_preview: "This research investigates the application of transformer models in natural language understanding tasks...",
              ai_probability: 28.3,
              human_probability: 71.7,
              verdict: "Low AI",
              word_count: 250,
              sentences_analyzed: 12,
              confidence: 85.0
            },
            {
              title: "Introduction",
              content_preview: "Natural Language Processing has evolved significantly over the past decade...",
              ai_probability: 35.2,
              human_probability: 64.8,
              verdict: "Low AI",
              word_count: 1200,
              sentences_analyzed: 45,
              confidence: 92.0
            }
          ],
          summary: {
            total_sections: 8,
            sections_analyzed: 6,
            high_ai_sections: 1,
            average_ai_score: 42.5,
            analysis_summary: "Mixed AI and human content detected (42.5% average). 1 section shows higher AI probability, while 3 sections appear primarily human-written."
          }
        }
      },
      filename: 'demonstration_thesis.pdf',
      studentName: 'Demo Student',
      studentId: 'DEMO2024001',
      thesisTitle: 'Demonstration of AI Content Detection System',
      timestamp: new Date().toISOString(),
      status: 'temporary',
      reportType: 'ai-detection'
    };
    
    setReport(demoReport);
    setStudentInfo({
      studentName: demoReport.studentName,
      registrationNumber: demoReport.studentId,
      thesisTitle: demoReport.thesisTitle,
      submittedDate: new Date().toISOString()
    });
    setLoading(false);
    setMessage('✅ Demonstration data loaded successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8B5CF6] mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading AI Detection Report</h3>
          <p className="text-gray-600 mb-4">Please wait while we load the report data...</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>Report ID: {id}</p>
            <p>Sources: localStorage, backend, database</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={retryLoad}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Loading
            </button>
            <button
              onClick={loadDemoData}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Load Demonstration Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report || !studentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <Cpu className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Detection Report Not Found</h3>
          <p className="text-gray-600 mb-4">
            {message || 'The requested AI content detection report could not be loaded.'}
          </p>
          <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg">
            <p><strong>Debug Information:</strong></p>
            <p>Report ID: {id || 'None'}</p>
            <p>Location State: {location.state ? 'Available' : 'Empty'}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={retryLoad}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={loadDemoData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Load Demonstration
            </button>
            <button
              onClick={closeTab}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const aiData = report.reportData?.ai_detection || {};
  const overall = aiData.overall || {};
  const sections = aiData.sections || [];
  const summary = aiData.summary || {};
  
  const aiScore = normalizeScore(overall.ai_probability);
  const humanScore = normalizeScore(overall.human_probability);
  const levelInfo = getAIDetectionLevel(aiScore);

  console.log('🎨 Rendering AI detection report with data:', {
    overall,
    sectionsCount: sections.length,
    summary,
    aiScore,
    humanScore
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 print:p-0">
      {/* Header Bar */}
      <div className="bg-white rounded-t-2xl shadow-lg p-4 mb-2 print:shadow-none print:border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition print:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="bg-[#8B5CF6] p-2 rounded-lg">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                AI Content Detection Report
                {isSavedReport && <span className="ml-2 text-sm text-green-600">(Saved)</span>}
              </h1>
              <p className="text-sm text-gray-600">DeskInspect AI Content Analysis System</p>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 print:shadow-none print:border">
        {/* Student Information */}
        <div className="bg-blue-50 p-4 rounded-xl mb-6 border-l-4 border-blue-500 print:border">
          <h2 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            DOCUMENT INFORMATION
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p><strong className="text-gray-700">Student Name:</strong> {studentInfo.studentName}</p>
              <p><strong className="text-gray-700">Registration No:</strong> {studentInfo.registrationNumber}</p>
            </div>
            <div>
              <p><strong className="text-gray-700">Thesis Title:</strong> {studentInfo.thesisTitle}</p>
              <p><strong className="text-gray-700">Document:</strong> {report.filename}</p>
            </div>
            <div>
              <p><strong className="text-gray-700">Analysis Date:</strong> {new Date(studentInfo.submittedDate).toLocaleDateString()}</p>
              <p><strong className="text-gray-700">Total Words:</strong> {overall.total_words?.toLocaleString() || 'Calculating...'}</p>
            </div>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* AI Score */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-center text-white print:border">
            <div className="text-md font-semibold mb-2">AI CONTENT PROBABILITY</div>
            <div className="text-5xl font-bold my-3">{aiScore.toFixed(1)}%</div>
            <div className="text-white text-opacity-90 text-sm">{levelInfo.description}</div>
          </div>

          {/* Human Score */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-center text-white print:border">
            <div className="text-md font-semibold mb-2">HUMAN CONTENT PROBABILITY</div>
            <div className="text-5xl font-bold my-3">{humanScore.toFixed(1)}%</div>
            <div className="text-white text-opacity-90 text-sm">Likely authentic human writing</div>
          </div>

          {/* Confidence */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-center text-white print:border">
            <div className="text-md font-semibold mb-2">ANALYSIS CONFIDENCE</div>
            <div className="text-5xl font-bold my-3">{overall.confidence?.toFixed(1) || '0'}%</div>
            <div className="text-white text-opacity-90 text-sm">Based on {sections.length} sections analyzed</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center border">
            <div className="text-xl font-bold text-gray-800">{sections.length}</div>
            <div className="text-xs text-gray-600">Sections Analyzed</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center border">
            <div className="text-xl font-bold text-gray-800">
              {summary.high_ai_sections || sections.filter(s => normalizeScore(s.ai_probability) > 50).length}
            </div>
            <div className="text-xs text-gray-600">High AI Sections</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center border">
            <div className="text-xl font-bold text-gray-800">{overall.total_words?.toLocaleString() || '0'}</div>
            <div className="text-xs text-gray-600">Total Words</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center border">
            <div className="text-xl font-bold text-gray-800">{overall.model_used || "roberta-base-openai-detector"}</div>
            <div className="text-xs text-gray-600">Detection Model</div>
          </div>
        </div>

        {/* Section-by-Section Analysis */}
        {sections.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              SECTION-BY-SECTION ANALYSIS
            </h3>
            
            <div className="space-y-3">
              {sections.map((section, index) => {
                const sectionAiScore = normalizeScore(section.ai_probability);
                const sectionHumanScore = normalizeScore(section.human_probability);
                const isExpanded = expandedSections[index];
                
                return (
                  <div 
                    key={index} 
                    className={`border rounded-lg transition-all duration-200 ${getSectionBorderColor(sectionAiScore)} ${
                      isExpanded ? getSectionBackgroundColor(sectionAiScore) : 'bg-white'
                    }`}
                  >
                    {/* Section Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors print:cursor-default"
                      onClick={() => toggleSection(index)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getSectionColor(sectionAiScore)}`}></div>
                          <h4 className="font-semibold text-gray-800">{section.title}</h4>
                          <span className="text-xs text-gray-500">({section.word_count} words)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold text-gray-800">{sectionAiScore.toFixed(1)}% AI</div>
                            <div className="text-xs text-gray-500">{section.verdict}</div>
                          </div>
                          <div className="print:hidden">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bars */}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>AI Probability</span>
                          <span>{sectionAiScore.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${sectionAiScore}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs mt-2">
                          <span>Human Probability</span>
                          <span>{sectionHumanScore.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${sectionHumanScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-gray-800">{section.sentences_analyzed}</div>
                            <div className="text-xs text-gray-600">Sentences Analyzed</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-800">{section.confidence}%</div>
                            <div className="text-xs text-gray-600">Confidence</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-800">{section.word_count}</div>
                            <div className="text-xs text-gray-600">Word Count</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-800">{section.verdict}</div>
                            <div className="text-xs text-gray-600">Verdict</div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Content Preview:</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                            {section.content_preview}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analysis Summary */}
        <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-200 print:border">
          <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            ANALYSIS SUMMARY
          </h3>
          <div className="text-gray-700">
            <p className="mb-2">{summary.analysis_summary || `Overall AI content probability: ${aiScore.toFixed(1)}%. ${sections.filter(s => normalizeScore(s.ai_probability) > 50).length} sections show high AI probability.`}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-600">{summary.total_sections || sections.length}</div>
                <div className="text-gray-600">Total Sections</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">{summary.sections_analyzed || sections.length}</div>
                <div className="text-gray-600">Analyzed</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">{summary.high_ai_sections || sections.filter(s => normalizeScore(s.ai_probability) > 50).length}</div>
                <div className="text-gray-600">High AI Sections</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">{summary.average_ai_score?.toFixed(1) || aiScore.toFixed(1)}%</div>
                <div className="text-gray-600">Average AI Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center border-t pt-6 print:hidden">
          {!isSavedReport && (
            <button
              onClick={handleSaveAndSend}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Analysis Report'}
            </button>
          )}
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export as PDF
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded text-center text-sm border ${
            message.includes('Error') ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm py-4 print:text-xs">
        <p>DeskInspect AI Content Detection System • {new Date().getFullYear()}</p>
        <p className="text-xs">This report is generated automatically and should be reviewed by academic staff</p>
        <p className="text-xs mt-1">Report ID: {id || 'N/A'} | Generated on: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AIContentDetectionReport;