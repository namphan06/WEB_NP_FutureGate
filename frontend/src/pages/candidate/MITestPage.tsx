import { useState, useEffect } from 'react';
import { supabase, type MIQuestion, MI_INTELLIGENCE_LABELS } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import {
    ChevronRight, ChevronLeft, CheckCircle2, AlertCircle,
    Brain, Trophy, History
} from 'lucide-react';

type Step = 'intro' | 'testing' | 'result' | 'history';

export default function MITestPage() {
    const { user } = useAuth();
    const [step, setStep] = useState<Step>('intro');
    const [questions, setQuestions] = useState<MIQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchQuestions();
        if (user) fetchHistory();
    }, [user]);

    const fetchQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from('mi_questions')
                .select('*')
                .eq('is_active', true)
                .order('order', { ascending: true });

            if (error) throw error;
            setQuestions(data || []);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('mi_results')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleAnswer = (questionId: string, score: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: score }));

        // Auto-next with delay
        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
            }, 300);
        }
    };

    const calculateResults = () => {
        const scores: Record<string, number> = {};
        const counts: Record<string, number> = {};

        questions.forEach(q => {
            const type = q.intelligence_type;
            const score = answers[q.id] || 0;
            scores[type] = (scores[type] || 0) + score;
            counts[type] = (counts[type] || 0) + 1;
        });

        // Normalize to 0-100 scale (assuming 1-5 scale per question)
        const normalizedData = Object.keys(MI_INTELLIGENCE_LABELS).map(type => {
            const rawScore = scores[type] || 0;
            const maxPossible = (counts[type] || 1) * 5;
            const value = Math.round((rawScore / maxPossible) * 100);

            return {
                subject: (MI_INTELLIGENCE_LABELS as any)[type].split(' (')[0],
                fullMark: 100,
                A: value,
                type: type
            };
        });

        return { rawScores: scores, chartData: normalizedData };
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            alert('Vui lòng hoàn thành tất cả các câu hỏi!');
            return;
        }

        setSubmitting(true);
        const calcResults = calculateResults();

        try {
            const { error } = await supabase
                .from('mi_results')
                .insert({

                    user_id: user?.id,
                    scores: calcResults.rawScores,
                    chart_data: calcResults.chartData,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            setResults(calcResults);
            setStep('result');
            fetchHistory();
        } catch (error) {
            console.error('Error saving result:', error);
            alert('Có lỗi xảy ra khi lưu kết quả.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full">Đang tải câu hỏi...</div>;

    return (
        <div className="mi-test-container">
            {/* Header section with Premium design */}
            <div className="mi-wrapper">
                <div className="mi-header">
                    <div>
                        <h1 className="mi-title">Trắc nghiệm Đa trí thông minh (MI)</h1>
                        <p className="mi-subtitle">Khám phá tiềm năng vượt trội của chính bạn qua 8 loại trí thông minh</p>
                    </div>
                    <div className="mi-header-actions">
                        <button
                            onClick={() => setStep('history')}
                            className={`mi-icon-button ${step === 'history' ? 'mi-icon-button-active' : ''}`}
                            title="Lịch sử kiểm tra"
                        >
                            <History size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mi-wrapper">
                {step === 'intro' && (
                    <div className="mi-card mi-intro-card">
                        <div className="mi-intro-icon">
                            <Brain size={48} strokeWidth={2.5} />
                        </div>
                        <h2 className="mi-intro-title">Chào mừng bạn đến với bài test MI</h2>
                        <p className="mi-intro-desc">
                            Dựa trên thuyết Trí thông minh Đa dạng của Howard Gardner, bài trắc nghiệm này giúp bạn xác định thế mạnh bản thân để lựa chọn nghề nghiệp phù hợp.
                        </p>

                        <div className="mi-intro-grid">
                            <div className="mi-intro-tile">
                                <CheckCircle2 className="mi-tile-icon success" size={20} />
                                <div>
                                    <h4>Cần khoảng 10 phút</h4>
                                    <p>Trả lời thành thật với bản thân</p>
                                </div>
                            </div>
                            <div className="mi-intro-tile">
                                <AlertCircle className="mi-tile-icon info" size={20} />
                                <div>
                                    <h4>Không có câu trả lời sai</h4>
                                    <p>Mỗi cá nhân là một phiên bản đặc biệt</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('testing')}
                            className="btn-premium mi-cta"
                        >
                            Bắt đầu ngay
                        </button>
                    </div>
                )}

                {step === 'testing' && questions.length > 0 && (
                    <div className="mi-card mi-question-card">
                        {/* Progress bar */}
                        <div className="mi-progress">
                            <div
                                className="mi-progress-bar"
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>

                        <div className="mi-question-body">
                            <div className="mi-question-meta">
                                <span className="mi-question-index">
                                    Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                                </span>
                                <div className="mi-question-type">
                                    {(MI_INTELLIGENCE_LABELS as any)[questions[currentQuestionIndex].intelligence_type]}
                                </div>
                            </div>

                            <div className="mi-question-title">
                                <h3>
                                    {questions[currentQuestionIndex].question_text}
                                </h3>
                            </div>

                            <div className="mi-answer-grid">
                                {[1, 2, 3, 4, 5].map(score => (
                                    <button
                                        key={score}
                                        onClick={() => handleAnswer(questions[currentQuestionIndex].id, score)}
                                        className={`mi-answer-btn ${answers[questions[currentQuestionIndex].id] === score ? 'active' : ''}`}
                                    >
                                        <span className="mi-answer-score">{score}</span>
                                        <span className="mi-answer-label">
                                            {score === 1 && 'Hoàn toàn sai'}
                                            {score === 3 && 'Trung bình'}
                                            {score === 5 && 'Hoàn toàn đúng'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mi-question-actions">
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestionIndex === 0}
                                    className="mi-nav-btn muted"
                                >
                                    <ChevronLeft size={20} /> Quay lại
                                </button>

                                {currentQuestionIndex === questions.length - 1 ? (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="btn-premium mi-submit"
                                    >
                                        {submitting ? 'Đang phân tích...' : 'Xem kết quả'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                        className="mi-nav-btn primary"
                                    >
                                        Câu tiếp theo <ChevronRight size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {step === 'result' && results && (
                    <div className="mi-results">
                        <div className="mi-results-grid">
                            {/* Left Column: Visual Result */}
                            <div className="mi-card mi-result-card mi-chart-card">
                                <div className="mi-card-header">
                                    <h3>Bản đồ Trí thông minh</h3>
                                    <Trophy className="mi-trophy" size={28} />
                                </div>

                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={results.chartData}>
                                            <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
                                            <PolarAngleAxis
                                                dataKey="subject"
                                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                                            />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                                            <Radar
                                                name="Profile"
                                                dataKey="A"
                                                stroke="#2563eb"
                                                strokeWidth={3}
                                                fill="#3b82f6"
                                                fillOpacity={0.5}
                                            />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Right Column: Top Strengths */}
                            <div className="mi-card mi-result-card">
                                <h3 className="mi-card-title">Điểm mạnh của bạn</h3>
                                <div className="mi-strengths">
                                    {[...results.chartData].sort((a, b) => b.A - a.A).slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="mi-strength-item">
                                            <div className="mi-strength-header">
                                                <span>{item.subject}</span>
                                                <span className="mi-strength-score">{item.A}%</span>
                                            </div>
                                            <div className="mi-strength-bar">
                                                <div style={{ width: `${item.A}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mi-quote">
                                    <p>
                                        "Mỗi người sinh ra đều mang trong mình những tài năng tiềm ẩn. Hãy tập trung phát huy thế mạnh vượt trội để đi xa hơn."
                                    </p>
                                </div>
                            </div>

                            {/* Detailed breakdown */}
                            <div className="mi-card mi-result-card mi-breakdown-card">
                                <h3 className="mi-card-title">Chi tiết các loại trí thông minh</h3>
                                <div className="mi-breakdown-chart">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={results.chartData}>
                                            <XAxis dataKey="subject" hide />
                                            <YAxis domain={[0, 100]} hide />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="A" radius={[10, 10, 0, 0]}>
                                                {results.chartData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.A > 70 ? '#2563eb' : entry.A > 40 ? '#60a5fa' : '#94a3b8'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mi-breakdown-labels">
                                    {results.chartData.map((item: any, idx: number) => (
                                        <div key={idx}>
                                            {item.subject}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mi-results-actions">
                            <button
                                onClick={() => setStep('testing')}
                                className="mi-secondary-btn"
                            >
                                Làm lại bài test
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="mi-primary-btn"
                            >
                                Xuất báo cáo PDF
                            </button>
                        </div>
                    </div>
                )}

                {step === 'history' && (
                    <div className="mi-card mi-history-card">
                        <div className="mi-card-header">
                            <div className="mi-history-title">
                                <History />
                                <h3>Lịch sử trắc nghiệm</h3>
                            </div>
                        </div>

                        <div className="mi-history-list">
                            {history.length > 0 ? history.map((h, i) => (
                                <div key={i} className="mi-history-item">
                                    <div className="mi-history-info">
                                        <div className="mi-history-date">
                                            {new Date(h.created_at).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <h4>Kết quả Trắc nghiệm MI</h4>
                                            <div className="mi-history-tags">
                                                {h.chart_data?.sort((a: any, b: any) => b.A - a.A).slice(0, 2).map((item: any, idx: number) => (
                                                    <span key={idx}>
                                                        {item.subject}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setResults({
                                                rawScores: h.scores,
                                                chartData: h.chart_data
                                            });
                                            setStep('result');
                                        }}
                                        className="mi-history-action"
                                    >
                                        <Trophy size={20} />
                                    </button>
                                </div>
                            )) : (
                                <div className="mi-history-empty">
                                    Bạn chưa thực hiện bài trắc nghiệm nào.
                                </div>
                            )}
                        </div>

                        <div className="mi-history-footer">
                            <button
                                onClick={() => setStep('intro')}
                                className="mi-primary-btn"
                            >
                                Thực hiện bài test mới
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .mi-test-container {
                    background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
                    min-height: 100vh;
                    padding: 28px 18px 60px;
                }
                .mi-wrapper {
                    max-width: 1120px;
                    margin: 0 auto;
                }
                .mi-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .mi-title {
                    font-size: clamp(1.6rem, 3vw, 2.2rem);
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.03em;
                    margin: 0;
                }
                .mi-subtitle {
                    color: #64748b;
                    font-weight: 600;
                    margin-top: 6px;
                }
                .mi-header-actions {
                    display: flex;
                    gap: 8px;
                }
                .mi-icon-button {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #475569;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .mi-icon-button:hover {
                    background: #f8fafc;
                    color: #2563eb;
                    border-color: #bfdbfe;
                }
                .mi-icon-button-active {
                    background: #2563eb;
                    color: white;
                    border-color: #2563eb;
                    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.25);
                }
                .mi-card {
                    background: white;
                    border-radius: 28px;
                    border: 1px solid rgba(226, 232, 240, 0.9);
                    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
                }
                .mi-intro-card {
                    text-align: center;
                    padding: clamp(28px, 4vw, 48px);
                }
                .mi-intro-icon {
                    width: 88px;
                    height: 88px;
                    background: #e0e7ff;
                    border-radius: 24px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #2563eb;
                    margin: 0 auto 28px;
                    transform: rotate(4deg);
                    transition: transform 0.4s ease;
                }
                .mi-intro-icon:hover {
                    transform: rotate(0deg);
                }
                .mi-intro-title {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 12px;
                }
                .mi-intro-desc {
                    color: #475569;
                    line-height: 1.7;
                    max-width: 620px;
                    margin: 0 auto 28px;
                }
                .mi-intro-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 16px;
                    text-align: left;
                    margin-bottom: 32px;
                }
                .mi-intro-tile {
                    display: flex;
                    gap: 14px;
                    align-items: flex-start;
                    padding: 16px;
                    border-radius: 18px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                }
                .mi-intro-tile h4 {
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 4px;
                }
                .mi-intro-tile p {
                    font-size: 0.9rem;
                    color: #64748b;
                    margin: 0;
                }
                .mi-tile-icon {
                    margin-top: 2px;
                }
                .mi-tile-icon.success {
                    color: #22c55e;
                }
                .mi-tile-icon.info {
                    color: #3b82f6;
                }
                .mi-cta {
                    padding: 14px 36px;
                    font-size: 1rem;
                }
                .mi-question-card {
                    overflow: hidden;
                }
                .mi-progress {
                    height: 8px;
                    width: 100%;
                    background: #e2e8f0;
                }
                .mi-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #2563eb, #60a5fa);
                    transition: width 0.4s ease;
                }
                .mi-question-body {
                    padding: clamp(24px, 4vw, 40px);
                }
                .mi-question-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 28px;
                }
                .mi-question-index {
                    padding: 6px 14px;
                    background: #e0e7ff;
                    color: #2563eb;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .mi-question-type {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .mi-question-title h3 {
                    font-size: clamp(1.4rem, 2.4vw, 1.9rem);
                    color: #0f172a;
                    font-weight: 800;
                    margin: 0 0 24px;
                    line-height: 1.4;
                }
                .mi-answer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 14px;
                }
                .mi-answer-btn {
                    border: 2px solid #e2e8f0;
                    border-radius: 18px;
                    padding: 18px 12px;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .mi-answer-btn:hover {
                    border-color: #93c5fd;
                    background: #eff6ff;
                }
                .mi-answer-btn.active {
                    border-color: #2563eb;
                    background: #2563eb;
                    color: white;
                    box-shadow: 0 12px 25px rgba(37, 99, 235, 0.3);
                    transform: translateY(-2px);
                }
                .mi-answer-score {
                    font-size: 1.4rem;
                    font-weight: 800;
                }
                .mi-answer-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: inherit;
                    opacity: 0.7;
                }
                .mi-question-actions {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 24px;
                    margin-top: 24px;
                    border-top: 1px solid #e2e8f0;
                }
                .mi-nav-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 700;
                    background: none;
                    border: none;
                    cursor: pointer;
                }
                .mi-nav-btn.muted {
                    color: #94a3b8;
                }
                .mi-nav-btn.primary {
                    color: #2563eb;
                }
                .mi-submit {
                    padding: 12px 28px;
                }
                .mi-results {
                    animation: fadeIn 0.4s ease;
                }
                .mi-results-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 20px;
                }
                .mi-result-card {
                    padding: 28px;
                }
                .mi-chart-card {
                    grid-column: span 2;
                }
                .mi-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                }
                .mi-card-header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #0f172a;
                }
                .mi-trophy {
                    color: #f59e0b;
                }
                .mi-card-title {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 20px;
                }
                .mi-strengths {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .mi-strength-item {
                    padding: 16px;
                    border-radius: 16px;
                    background: #f8fafc;
                    border-left: 4px solid #2563eb;
                }
                .mi-strength-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-weight: 700;
                    color: #0f172a;
                }
                .mi-strength-score {
                    color: #2563eb;
                    font-size: 1.1rem;
                }
                .mi-strength-bar {
                    height: 6px;
                    background: #e2e8f0;
                    border-radius: 999px;
                    overflow: hidden;
                }
                .mi-strength-bar div {
                    height: 100%;
                    background: #2563eb;
                    border-radius: inherit;
                }
                .mi-quote {
                    margin-top: 24px;
                    padding: 16px;
                    border-radius: 16px;
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    color: #1e3a8a;
                    font-size: 0.9rem;
                    font-style: italic;
                }
                .mi-breakdown-card {
                    grid-column: span 3;
                }
                .mi-breakdown-chart {
                    height: 280px;
                }
                .mi-breakdown-labels {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                    gap: 8px;
                    margin-top: 16px;
                    text-align: center;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .mi-results-actions {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 24px;
                    flex-wrap: wrap;
                }
                .mi-primary-btn {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 12px 28px;
                    border-radius: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.2);
                }
                .mi-secondary-btn {
                    background: white;
                    border: 2px solid #e2e8f0;
                    padding: 12px 28px;
                    border-radius: 18px;
                    font-weight: 700;
                    color: #0f172a;
                    cursor: pointer;
                }
                .mi-history-card {
                    padding: 28px;
                }
                .mi-history-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #64748b;
                }
                .mi-history-title h3 {
                    margin: 0;
                    color: #0f172a;
                    font-size: 1.2rem;
                    font-weight: 800;
                }
                .mi-history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .mi-history-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    border-radius: 18px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s ease;
                }
                .mi-history-item:hover {
                    background: white;
                    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
                }
                .mi-history-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .mi-history-date {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 0.7rem;
                    color: #2563eb;
                    border: 1px solid #e2e8f0;
                }
                .mi-history-info h4 {
                    margin: 0;
                    font-weight: 700;
                    color: #0f172a;
                }
                .mi-history-tags {
                    display: flex;
                    gap: 6px;
                    margin-top: 6px;
                }
                .mi-history-tags span {
                    font-size: 0.65rem;
                    background: #dbeafe;
                    color: #1d4ed8;
                    padding: 2px 8px;
                    border-radius: 999px;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .mi-history-action {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #2563eb;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.85;
                }
                .mi-history-action:hover {
                    opacity: 1;
                    box-shadow: 0 12px 20px rgba(37, 99, 235, 0.2);
                }
                .mi-history-empty {
                    text-align: center;
                    padding: 40px 0;
                    color: #94a3b8;
                }
                .mi-history-footer {
                    margin-top: 28px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: center;
                }
                .btn-premium {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: white;
                    border-radius: 18px;
                    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.25);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: none;
                    cursor: pointer;
                }
                .btn-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 35px rgba(37, 99, 235, 0.35);
                }
                .btn-premium:active {
                    transform: translateY(0);
                }
                @media (max-width: 1024px) {
                    .mi-results-grid {
                        grid-template-columns: 1fr;
                    }
                    .mi-chart-card,
                    .mi-breakdown-card {
                        grid-column: span 1;
                    }
                }
                @media (max-width: 640px) {
                    .mi-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .mi-question-actions {
                        flex-direction: column;
                        gap: 12px;
                    }
                    .mi-history-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }
                    .mi-history-action {
                        align-self: flex-end;
                    }
                }
            `}</style>
        </div>
    );
}
