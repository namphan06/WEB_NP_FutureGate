import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface MBTIQuestion {
  id: string;
  question_text: string;
  placeholder_hint: string | null;
  order: number;
  is_active: boolean;
}

export default function MBTITestPage() {
  const { user, profile } = useAuth();

  const [questions, setQuestions] = useState<MBTIQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mbti_questions')
        .select('id, question_text, placeholder_hint, order, is_active')
        .eq('is_active', true)
        .order('order', { ascending: true });

      if (error) throw error;

      const list = (data || []) as MBTIQuestion[];
      setQuestions(list);

      const nextAnswers: Record<string, string> = {};
      list.forEach((q) => {
        nextAnswers[q.id] = '';
      });
      setAnswers(nextAnswers);
    } catch (error) {
      console.error('Error fetching MBTI questions:', error);
      alert('Không thể tải câu hỏi MBTI');
    } finally {
      setLoading(false);
    }
  };

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value.trim().length > 0).length,
    [answers],
  );

  if (profile?.role !== 'candidate') {
    return <Navigate to="/" />;
  }

  const submit = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để nộp bài.');
      return;
    }

    if (questions.length === 0) {
      alert('Hiện chưa có câu hỏi MBTI.');
      return;
    }

    if (answeredCount < questions.length) {
      alert(`Vui lòng hoàn thành tất cả câu hỏi. Còn thiếu ${questions.length - answeredCount} câu.`);
      return;
    }

    setSubmitting(true);
    try {
      const { data: session, error: sessionError } = await supabase
        .from('mbti_test_sessions')
        .insert({ user_id: user.id })
        .select('id')
        .single();

      if (sessionError) throw sessionError;

      const payload = questions.map((question) => ({
        session_id: session.id,
        question_id: question.id,
        answer_text: answers[question.id].trim(),
      }));

      const { error: answerError } = await supabase.from('mbti_test_answers').insert(payload);
      if (answerError) throw answerError;

      alert('Đã lưu câu trả lời MBTI thành công!');
      await fetchQuestions();
    } catch (error) {
      console.error('Error submitting MBTI answers:', error);
      alert('Nộp bài MBTI thất bại, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#0F172A' }}>Trắc nghiệm MBTI</h1>
          <p style={{ color: '#64748B', marginTop: 8 }}>
            Trả lời tự do theo góc nhìn cá nhân. Hệ thống sẽ lưu dạng văn bản, không chọn đáp án cố định.
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
            Tiến độ: {answeredCount}/{questions.length}
          </div>
          <div style={{ width: '100%', height: 8, borderRadius: 999, background: '#E2E8F0', overflow: 'hidden' }}>
            <div
              style={{
                width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%`,
                height: '100%',
                background: '#2563EB',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 }}>
          {loading ? (
            <p>Đang tải câu hỏi...</p>
          ) : questions.length === 0 ? (
            <p style={{ color: '#64748B' }}>Chưa có câu hỏi MBTI. Vui lòng liên hệ quản trị viên.</p>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {questions.map((question, index) => (
                <div key={question.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 12 }}>
                  <label style={{ display: 'block', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                    {index + 1}. {question.question_text}
                  </label>
                  <textarea
                    rows={4}
                    value={answers[question.id] || ''}
                    placeholder={question.placeholder_hint || 'Nhập câu trả lời của bạn...'}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: e.target.value,
                      }))
                    }
                    style={{
                      width: '100%',
                      border: '1px solid #CBD5E1',
                      borderRadius: 10,
                      padding: 10,
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={submit}
                  disabled={submitting || loading}
                  style={{
                    background: '#2563EB',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {submitting ? 'Đang lưu...' : 'Nộp câu trả lời'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
