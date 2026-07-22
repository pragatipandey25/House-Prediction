import { useState, useEffect } from "react";
import {
  uploadResume,
  parseResume,
  analyzeResume,
  getResumes,
  deleteResume,
} from "../services/resumeService";
import LoadingSpinner from "../components/LoadingSpinner";
import ScoreCard from "../components/ScoreCard";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await getResumes();
      setResumes(data.resumes || []);
    } catch (error) {
      console.error("Failed to load resumes:", error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please upload only PDF or DOCX files");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setLoading(true);
      const data = await uploadResume(file);
      toast.success("Resume uploaded successfully!");
      setFile(null);
      setSelectedResume(data.resume);
      await loadResumes();

      // Auto-parse after upload
      setParsing(true);
      const parseData = await parseResume(data.resume._id);
      setParsedData(parseData.parsedData);
      toast.success("Resume parsed successfully!");
      setParsing(false);

      // Update selected resume
      const updated = await getResumes();
      const found = updated.resumes.find((r) => r._id === data.resume._id);
      if (found) {
        setSelectedResume(found);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedResume) {
      toast.error("Please upload and parse a resume first");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    try {
      setAnalyzing(true);
      const data = await analyzeResume(selectedResume._id, jobDescription);
      setAnalysis(data.analysis);
      toast.success("AI Analysis complete!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await deleteResume(id);
      toast.success("Resume deleted");
      setSelectedResume(null);
      setAnalysis(null);
      setParsedData(null);
      await loadResumes();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    setAnalysis(resume.aiScore?.resumeScore ? resume.aiScore : null);
    setParsedData(resume.parsedData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Resume</h1>
          <p className="text-gray-500 mt-1">
            Upload, parse, and analyze your resume with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Resumes */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Upload Resume
              </h2>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 hover:border-indigo-400"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    {file
                      ? file.name
                      : "Drop your resume here or click to browse"}
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF or DOCX (max 10MB)
                  </p>
                </label>
              </div>

              {file && (
                <div className="mt-4">
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📎</span>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full mt-3 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:bg-indigo-400"
                  >
                    {loading ? "Uploading..." : "Upload & Parse"}
                  </button>
                </div>
              )}
            </div>

            {/* Previous Resumes */}
            {resumes.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Previous Resumes
                </h2>
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <div
                      key={resume._id}
                      onClick={() => handleSelectResume(resume)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border ${
                        selectedResume?._id === resume._id
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📄</span>
                          <div>
                            <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                              {resume.originalName}
                            </p>
                            <p
                              className={`text-xs ${
                                resume.status === "analyzed"
                                  ? "text-green-500"
                                  : resume.status === "parsed"
                                    ? "text-blue-500"
                                    : "text-gray-400"
                              }`}
                            >
                              {resume.status}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(resume._id);
                          }}
                          className="text-red-400 hover:text-red-600 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Parsing & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parsed Data */}
            {parsing && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 flex justify-center">
                <LoadingSpinner text="Parsing resume..." />
              </div>
            )}

            {parsedData && !parsing && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  📋 Parsed Resume Data
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">
                        Name
                      </p>
                      <p className="text-gray-800 font-medium">
                        {parsedData.name || "Not found"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">
                        Email
                      </p>
                      <p className="text-gray-800">
                        {parsedData.email || "Not found"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">
                        Phone
                      </p>
                      <p className="text-gray-800">
                        {parsedData.phone || "Not found"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">
                        Skills ({parsedData.skills?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parsedData.skills?.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        )) || (
                          <p className="text-gray-400 text-sm">Not found</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">
                        Languages
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parsedData.languages?.map((lang, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs font-medium"
                          >
                            {lang}
                          </span>
                        )) || (
                          <p className="text-gray-400 text-sm">Not found</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {parsedData.experience?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-2">
                      Experience
                    </p>
                    {parsedData.experience.map((exp, i) => (
                      <div key={i} className="p-2 bg-gray-50 rounded-lg mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          {exp.company || exp.role || "Entry"}
                        </p>
                        <p className="text-xs text-gray-400">{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                )}
                {parsedData.education?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-2">
                      Education
                    </p>
                    {parsedData.education.map((edu, i) => (
                      <div key={i} className="p-2 bg-gray-50 rounded-lg mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          {edu.degree || edu.institution}
                        </p>
                        <p className="text-xs text-gray-400">
                          {edu.institution} {edu.year}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Analysis Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                🤖 AI Analysis
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description (for comparison)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here to analyze your resume against it..."
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={analyzing || !selectedResume}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-600 transition disabled:opacity-50"
              >
                {analyzing ? "Analyzing with AI..." : "Analyze with AI"}
              </button>

              {analyzing && (
                <div className="mt-6 flex justify-center">
                  <LoadingSpinner text="AI is analyzing your resume..." />
                </div>
              )}

              {analysis && !analyzing && (
                <div className="mt-6 space-y-6">
                  {/* Score Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <ScoreCard
                      label="Resume Score"
                      score={analysis.resumeScore}
                      color="indigo"
                      icon="📊"
                    />
                    <ScoreCard
                      label="ATS Score"
                      score={analysis.atsScore}
                      color="blue"
                      icon="⚡"
                    />
                    <ScoreCard
                      label="Technical"
                      score={analysis.technicalSkills}
                      color="purple"
                      icon="💻"
                    />
                    <ScoreCard
                      label="Communication"
                      score={analysis.communication}
                      color="teal"
                      icon="💬"
                    />
                    <ScoreCard
                      label="Experience"
                      score={analysis.experienceMatch}
                      color="orange"
                      icon="💼"
                    />
                    <ScoreCard
                      label="Education"
                      score={analysis.educationMatch}
                      color="green"
                      icon="🎓"
                    />
                  </div>

                  {/* Ranking Badge */}
                  <div
                    className={`text-center py-3 px-6 rounded-xl font-bold text-lg ${
                      analysis.ranking === "Highly Recommended"
                        ? "bg-green-100 text-green-700"
                        : analysis.ranking === "Recommended"
                          ? "bg-blue-100 text-blue-700"
                          : analysis.ranking === "Moderate"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {analysis.ranking}
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-indigo-50 rounded-xl">
                    <p className="text-sm text-indigo-900 font-medium">
                      {analysis.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Strengths */}
                    <div className="p-4 bg-green-50 rounded-xl">
                      <h3 className="text-sm font-bold text-green-700 mb-2">
                        ✅ Strengths
                      </h3>
                      <ul className="space-y-1">
                        {analysis.strengths?.map((s, i) => (
                          <li key={i} className="text-sm text-green-600">
                            • {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="p-4 bg-red-50 rounded-xl">
                      <h3 className="text-sm font-bold text-red-700 mb-2">
                        ⚠️ Weaknesses
                      </h3>
                      <ul className="space-y-1">
                        {analysis.weaknesses?.map((w, i) => (
                          <li key={i} className="text-sm text-red-600">
                            • {w}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <h3 className="text-sm font-bold text-blue-700 mb-2">
                        💡 Recommendations
                      </h3>
                      <ul className="space-y-1">
                        {analysis.recommendations?.map((r, i) => (
                          <li key={i} className="text-sm text-blue-600">
                            • {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {analysis.missingSkills?.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded-xl">
                      <h3 className="text-sm font-bold text-orange-700 mb-2">
                        🔧 Missing Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!selectedResume && !analysis && (
                <div className="mt-6 text-center py-8 text-gray-400">
                  <p className="text-lg">
                    📤 Upload your resume first to get AI analysis
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
