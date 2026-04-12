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
        <div className="mi-test-container p-6 animate-in fade-in duration-500">
            {/* Header section with Premium design */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Trắc nghiệm Đa trí thông minh (MI)</h1>
                    <p className="text-slate-500 font-medium mt-1">Khám phá tiềm năng vượt trội của chính bạn qua 8 loại trí thông minh</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setStep('history')}
                        className={`p-2.5 rounded-xl transition-all ${step === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                        title="Lịch sử kiểm tra"
                    >
                        <History size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {step === 'intro' && (
                    <div className="premium-card p-10 text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-8 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                            <Brain size={48} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Chào mừng bạn đến với bài test MI</h2>
                        <p className="text-slate-600 leading-relaxed mb-8 max-w-lg mx-auto">
                            Dựa trên thuyết Trí thông minh Đa dạng của Howard Gardner, bài trắc nghiệm này giúp bạn xác định thế mạnh bản thân để lựa chọn nghề nghiệp phù hợp.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-10">
                            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <CheckCircle2 className="text-green-500 mt-1 shrink-0" size={20} />
                                <div>
                                    <h4 className="font-bold text-slate-800">Cần khoảng 10 phút</h4>
                                    <p className="text-sm text-slate-500">Trả lời thành thật với bản thân</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <AlertCircle className="text-blue-500 mt-1 shrink-0" size={20} />
                                <div>
                                    <h4 className="font-bold text-slate-800">Không có câu trả lời sai</h4>
                                    <p className="text-sm text-slate-500">Mỗi cá nhân là một phiên bản đặc biệt</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('testing')}
                            className="btn-premium px-12 py-4 text-lg font-bold"
                        >
                            Bắt đầu ngay
                        </button>
                    </div>
                )}

                {step === 'testing' && questions.length > 0 && (
                    <div className="premium-card p-0 overflow-hidden shadow-2xl animate-in slide-in-from-right duration-500">
                        {/* Progress bar */}
                        <div className="h-2 w-full bg-slate-100">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-sm"
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>

                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest">
                                    Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                                </span>
                                <div className="text-xs text-slate-400 font-bold uppercase overflow-hidden whitespace-nowrap">
                                    {(MI_INTELLIGENCE_LABELS as any)[questions[currentQuestionIndex].intelligence_type]}
                                </div>
                            </div>

                            <div className="min-h-[120px] mb-12">
                                <h3 className="text-2xl font-bold text-slate-800 leading-snug">
                                    {questions[currentQuestionIndex].question_text}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                {[1, 2, 3, 4, 5].map(score => (
                                    <button
                                        key={score}
                                        onClick={() => handleAnswer(questions[currentQuestionIndex].id, score)}
                                        className={`py-6 rounded-2xl border-2 transition-all duration-300 font-bold text-lg ${answers[questions[currentQuestionIndex].id] === score
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105'
                                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                                            }`}
                                    >
                                        {score}
                                        <p className="text-[10px] mt-1 opacity-60 uppercase tracking-tighter">
                                            {score === 1 && 'Hoàn toàn sai'}
                                            {score === 3 && 'Trung bình'}
                                            {score === 5 && 'Hoàn toàn đúng'}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between mt-12 pt-8 border-t border-slate-100">
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestionIndex === 0}
                                    className="flex items-center gap-2 text-slate-400 hover:text-slate-800 disabled:opacity-30 font-bold transition-all"
                                >
                                    <ChevronLeft size={20} /> Quay lại
                                </button>

                                {currentQuestionIndex === questions.length - 1 ? (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="btn-premium px-10 py-3"
                                    >
                                        {submitting ? 'Đang phân tích...' : 'Xem kết quả'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-all"
                                    >
                                        Câu tiếp theo <ChevronRight size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {step === 'result' && results && (
                    <div className="animate-in zoom-in duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Visual Result */}
                            <div className="lg:col-span-2 premium-card p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-slate-800">Bản đồ Trí thông minh</h3>
                                    <Trophy className="text-yellow-500" size={28} />
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
                            <div className="premium-card p-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 font-display">Điểm mạnh của bạn</h3>
                                <div className="space-y-6">
                                    {[...results.chartData].sort((a, b) => b.A - a.A).slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border-l-4 border-blue-600">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-slate-800">{item.subject}</span>
                                                <span className="text-xl font-black text-blue-600">{item.A}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
                                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.A}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <p className="text-sm text-blue-800 font-medium leading-relaxed italic">
                                        "Mỗi người sinh ra đều mang trong mình những tài năng tiềm ẩn. Hãy tập trung phát huy thế mạnh vượt trội để đi xa hơn."
                                    </p>
                                </div>
                            </div>

                            {/* Detailed breakdown */}
                            <div className="lg:col-span-3 premium-card p-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-8">Chi tiết các loại trí thông minh</h3>
                                <div className="h-[300px] w-full">
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
                                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 mt-4 text-center">
                                    {results.chartData.map((item: any, idx: number) => (
                                        <div key={idx} className="text-[10px] font-bold text-slate-500 uppercase leading-tight px-1">
                                            {item.subject}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-10 gap-4">
                            <button
                                onClick={() => setStep('testing')}
                                className="bg-white text-slate-800 border-2 border-slate-200 py-3 px-10 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                            >
                                Làm lại bài test
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-slate-800 text-white py-3 px-10 rounded-2xl font-bold hover:bg-slate-900 shadow-xl transition-all"
                            >
                                Xuất báo cáo PDF
                            </button>
                        </div>
                    </div>
                )}

                {step === 'history' && (
                    <div className="premium-card p-8 animate-in slide-in-from-bottom duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <History className="text-slate-400" />
                            <h3 className="text-xl font-bold text-slate-800">Lịch sử trắc nghiệm</h3>
                        </div>

                        <div className="space-y-4">
                            {history.length > 0 ? history.map((h, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all border border-slate-100 group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm font-black text-xs border border-slate-100 overflow-hidden">
                                            {new Date(h.created_at).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">Kết quả Trắc nghiệm MI</h4>
                                            <div className="flex gap-2 mt-1">
                                                {h.chart_data?.sort((a: any, b: any) => b.A - a.A).slice(0, 2).map((item: any, idx: number) => (
                                                    <span key={idx} className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">
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
                                        className="p-3 bg-white text-blue-600 rounded-xl opacity-0 group-hover:opacity-100 shadow-sm border border-slate-200 transition-all"
                                    >
                                        <Trophy size={20} />
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-16 text-slate-400">
                                    Bạn chưa thực hiện bài trắc nghiệm nào.
                                </div>
                            )}
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
                            <button
                                onClick={() => setStep('intro')}
                                className="bg-blue-600 text-white py-3 px-10 rounded-2xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all"
                            >
                                Thực hiện bài test mới
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .mi-test-container {
                    background: #f8fafc;
                    min-height: 100vh;
                }
                .premium-card {
                    background: white;
                    border-radius: 32px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.03);
                }
                .btn-premium {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: white;
                    border-radius: 20px;
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
            `}</style>
        </div>
    );
}
