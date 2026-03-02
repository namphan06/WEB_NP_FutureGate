import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    Calendar as CalendarIcon, Clock, MapPin,
    Video, Users, ChevronRight, AlertCircle,
    CheckCircle2, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function CandidateInterviewSchedulePage() {
    const { user } = useAuth();
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchInterviews();
    }, [user]);

    const fetchInterviews = async () => {
        try {
            const { data, error } = await supabase
                .from('interviews')
                .select(`
                    *,
                    jobs (id, metadata),
                    profiles:employer_id (id, full_name, company_name, avatar_url)
                `)
                .eq('candidate_id', user?.id)
                .order('start_time', { ascending: true });

            if (error) throw error;
            setInterviews(data || []);
        } catch (error) {
            console.error('Error fetching interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'scheduled': return 'Sắp diễn ra';
            case 'completed': return 'Đã xong';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]">Đang tải lịch phỏng vấn...</div>;

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Lịch phỏng vấn</h1>
                    <p className="text-slate-500 mt-1 font-medium">Theo dõi các cuộc hẹn phỏng vấn của bạn với nhà tuyển dụng</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100 flex items-center gap-2">
                        <CalendarIcon size={18} /> {interviews.filter(i => i.status === 'scheduled').length} Lịch sắp tới
                    </span>
                </div>
            </div>

            {interviews.length > 0 ? (
                <div className="grid gap-6">
                    {interviews.map((interview) => (
                        <div key={interview.id} className="premium-card p-6 md:p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-slate-100">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Time Column */}
                                <div className="md:w-48 shrink-0">
                                    <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                                        <div className="text-blue-600 font-black text-2xl">
                                            {format(new Date(interview.start_time), 'dd')}
                                        </div>
                                        <div className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                                            {format(new Date(interview.start_time), 'MMMM, yyyy', { locale: vi })}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-center gap-2 text-slate-800 font-bold">
                                            <Clock size={16} />
                                            {format(new Date(interview.start_time), 'HH:mm')}
                                        </div>
                                    </div>
                                    <div className={`mt-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-center border ${getStatusColor(interview.status)}`}>
                                        {getStatusText(interview.status)}
                                    </div>
                                </div>

                                {/* Details Column */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                                {interview.jobs?.metadata?.title || 'Phỏng vấn vị trí công việc'}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Users size={16} />
                                                </div>
                                                <span className="font-bold text-slate-600">{interview.profiles?.company_name || interview.profiles?.full_name}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {interview.interview_type === 'online' ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold border border-purple-100">
                                                    <Video size={14} /> Trực tuyến
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100">
                                                    <MapPin size={14} /> Trực tiếp
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                        <div className="flex items-start gap-3">
                                            <MapPin size={18} className="text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">Địa điểm / Link họp</p>
                                                <p className="text-sm text-slate-500 mt-0.5">
                                                    {interview.location || 'Sẽ được cập nhật sau'}
                                                </p>
                                            </div>
                                        </div>
                                        {interview.notes && (
                                            <div className="flex items-start gap-3">
                                                <AlertCircle size={18} className="text-slate-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">Lưu ý từ nhà tuyển dụng</p>
                                                    <p className="text-sm text-slate-500 mt-0.5 italic">
                                                        "{interview.notes}"
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-3">
                                        {interview.meeting_link && (
                                            <a
                                                href={interview.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-premium px-6 py-2.5 flex items-center gap-2 text-sm font-bold"
                                            >
                                                <Video size={18} /> Tham gia phỏng vấn
                                            </a>
                                        )}
                                        <button className="bg-white text-slate-700 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                                            Nhắn tin cho NTD
                                        </button>
                                        <button className="text-red-600 px-4 py-2.5 text-sm font-bold hover:bg-red-50 rounded-xl transition-all ml-auto">
                                            Yêu cầu đổi lịch
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="premium-card p-20 text-center flex flex-col items-center border-dashed border-2 border-slate-200 bg-slate-50/30">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                        <CalendarIcon size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Chưa có lịch phỏng vấn nào</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                        Khi nhà tuyển dụng mời bạn tham gia phỏng vấn cho các công việc đã ứng tuyển, lịch hẹn sẽ xuất hiện tại đây.
                    </p>
                    <button className="mt-8 btn-premium px-10 py-3">
                        Khám phá việc làm mới
                    </button>
                </div>
            )}

            <style>{`
                .premium-card {
                    background: white;
                    border-radius: 24px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.02);
                }
                .btn-premium {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
                    transition: all 0.3s ease;
                    border: none;
                    cursor: pointer;
                }
                .btn-premium:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
                }
            `}</style>
        </div>
    );
}
