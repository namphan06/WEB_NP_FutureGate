import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface MBTIType {
  id: string;
  code: string;
  name: string | null;
  short_description: string | null;
  image_url: string | null;
  color_hex: string | null;
  is_active: boolean;
}

interface MBTITypeSection {
  id: string;
  mbti_type_id: string;
  title: string;
  content: string;
  order: number;
  is_active: boolean;
}

interface MBTIQuestion {
  id: string;
  question_text: string;
  question_dimension: 'EI' | 'SN' | 'TF' | 'JP' | null;
  placeholder_hint: string | null;
  order: number;
  is_active: boolean;
}

interface MBTIQuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  mapped_letter: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  order: number;
  is_active: boolean;
}

const emptyTypeForm = {
  id: '',
  code: '',
  name: '',
  short_description: '',
  image_url: '',
  color_hex: '',
  is_active: true,
};

const emptySectionForm = {
  id: '',
  title: '',
  content: '',
  order: 0,
  is_active: true,
};

const emptyQuestionForm = {
  id: '',
  question_text: '',
  question_dimension: 'EI' as 'EI' | 'SN' | 'TF' | 'JP',
  placeholder_hint: '',
  order: 0,
  is_active: true,
};

const emptyOptionForm = {
  id: '',
  option_text: '',
  mapped_letter: 'E' as 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P',
  order: 0,
  is_active: true,
};

export default function AdminMBTIPage() {
  const { profile } = useAuth();

  const [types, setTypes] = useState<MBTIType[]>([]);
  const [sections, setSections] = useState<MBTITypeSection[]>([]);
  const [questions, setQuestions] = useState<MBTIQuestion[]>([]);
  const [questionOptions, setQuestionOptions] = useState<MBTIQuestionOption[]>([]);

  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingQuestionOptions, setLoadingQuestionOptions] = useState(false);
  const [savingType, setSavingType] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [savingOption, setSavingOption] = useState(false);

  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [typeForm, setTypeForm] = useState(emptyTypeForm);
  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [optionForm, setOptionForm] = useState(emptyOptionForm);

  const selectedType = useMemo(
    () => types.find((item) => item.id === selectedTypeId),
    [types, selectedTypeId],
  );

  const selectedQuestion = useMemo(
    () => questions.find((item) => item.id === selectedQuestionId),
    [questions, selectedQuestionId],
  );

  const fetchTypes = useCallback(async () => {
    setLoadingTypes(true);
    try {
      const { data, error } = await supabase
        .from('mbti_types')
        .select('*')
        .order('code', { ascending: true });

      if (error) throw error;

      const nextTypes = (data || []) as MBTIType[];
      setTypes(nextTypes);

      if (!selectedTypeId && nextTypes.length > 0) {
        setSelectedTypeId(nextTypes[0].id);
        setTypeForm({
          id: nextTypes[0].id,
          code: nextTypes[0].code,
          name: nextTypes[0].name || '',
          short_description: nextTypes[0].short_description || '',
          image_url: nextTypes[0].image_url || '',
          color_hex: nextTypes[0].color_hex || '',
          is_active: nextTypes[0].is_active,
        });
      }
    } catch (error) {
      console.error('Error loading MBTI types:', error);
      alert('Không thể tải danh sách nhóm MBTI');
    } finally {
      setLoadingTypes(false);
    }
  }, [selectedTypeId]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  useEffect(() => {
    if (selectedTypeId) {
      fetchSections(selectedTypeId);
    } else {
      setSections([]);
    }
  }, [selectedTypeId]);

  useEffect(() => {
    if (selectedQuestionId) {
      fetchQuestionOptions(selectedQuestionId);
    } else {
      setQuestionOptions([]);
    }
  }, [selectedQuestionId]);

  const fetchSections = async (typeId: string) => {
    setLoadingSections(true);
    try {
      const { data, error } = await supabase
        .from('mbti_type_sections')
        .select('*')
        .eq('mbti_type_id', typeId)
        .order('order', { ascending: true });

      if (error) throw error;
      setSections((data || []) as MBTITypeSection[]);
    } catch (error) {
      console.error('Error loading MBTI sections:', error);
      alert('Không thể tải đầu mục nội dung MBTI');
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      const { data, error } = await supabase
        .from('mbti_questions')
        .select('id, question_text, question_dimension, placeholder_hint, order, is_active')
        .order('order', { ascending: true });

      if (error) throw error;
      const list = (data || []) as MBTIQuestion[];
      setQuestions(list);

      if (list.length === 0) {
        setSelectedQuestionId('');
      } else if (!selectedQuestionId || !list.some((item) => item.id === selectedQuestionId)) {
        setSelectedQuestionId(list[0].id);
      }
    } catch (error) {
      console.error('Error loading MBTI questions:', error);
      alert('Không thể tải câu hỏi MBTI');
    } finally {
      setLoadingQuestions(false);
    }
  }, [selectedQuestionId]);

  const fetchQuestionOptions = async (questionId: string) => {
    setLoadingQuestionOptions(true);
    try {
      const { data, error } = await supabase
        .from('mbti_question_options')
        .select('id, question_id, option_text, mapped_letter, order, is_active')
        .eq('question_id', questionId)
        .order('order', { ascending: true });

      if (error) throw error;
      setQuestionOptions((data || []) as MBTIQuestionOption[]);
    } catch (error) {
      console.error('Error loading question options:', error);
      alert('Không thể tải đáp án của câu hỏi');
    } finally {
      setLoadingQuestionOptions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  if (profile?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleSelectType = (type: MBTIType) => {
    setSelectedTypeId(type.id);
    setTypeForm({
      id: type.id,
      code: type.code,
      name: type.name || '',
      short_description: type.short_description || '',
      image_url: type.image_url || '',
      color_hex: type.color_hex || '',
      is_active: type.is_active,
    });
    setSectionForm(emptySectionForm);
  };

  const resetTypeForm = () => {
    setTypeForm(emptyTypeForm);
  };

  const saveType = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = typeForm.code.trim().toUpperCase();

    if (code.length !== 4) {
      alert('Mã MBTI phải có đúng 4 ký tự, ví dụ: ISTJ');
      return;
    }

    setSavingType(true);
    try {
      const payload = {
        ...(typeForm.id ? { id: typeForm.id } : {}),
        code,
        name: typeForm.name.trim() || null,
        short_description: typeForm.short_description.trim() || null,
        image_url: typeForm.image_url.trim() || null,
        color_hex: typeForm.color_hex.trim() || null,
        is_active: typeForm.is_active,
      };

      const { error } = await supabase
        .from('mbti_types')
        .upsert(payload, { onConflict: 'code' });

      if (error) throw error;

      await fetchTypes();
      alert('Đã lưu nhóm MBTI');
    } catch (error) {
      console.error('Error saving MBTI type:', error);
      alert('Lưu nhóm MBTI thất bại');
    } finally {
      setSavingType(false);
    }
  };

  const deleteType = async () => {
    if (!typeForm.id) return;

    const confirmed = confirm('Xóa nhóm này sẽ xóa cả các đầu mục nội dung. Bạn có chắc?');
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('mbti_types').delete().eq('id', typeForm.id);
      if (error) throw error;

      setSelectedTypeId('');
      setTypeForm(emptyTypeForm);
      setSectionForm(emptySectionForm);
      await fetchTypes();
    } catch (error) {
      console.error('Error deleting MBTI type:', error);
      alert('Xóa nhóm MBTI thất bại');
    }
  };

  const saveSection = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTypeId) {
      alert('Vui lòng chọn nhóm MBTI trước khi lưu đầu mục.');
      return;
    }

    if (!sectionForm.title.trim() || !sectionForm.content.trim()) {
      alert('Vui lòng nhập đủ tiêu đề và nội dung đầu mục.');
      return;
    }

    setSavingSection(true);
    try {
      const payload = {
        ...(sectionForm.id ? { id: sectionForm.id } : {}),
        mbti_type_id: selectedTypeId,
        title: sectionForm.title.trim(),
        content: sectionForm.content.trim(),
        order: Number(sectionForm.order) || 0,
        is_active: sectionForm.is_active,
      };

      const { error } = await supabase.from('mbti_type_sections').upsert(payload);
      if (error) throw error;

      setSectionForm(emptySectionForm);
      await fetchSections(selectedTypeId);
      alert('Đã lưu đầu mục nội dung');
    } catch (error) {
      console.error('Error saving MBTI section:', error);
      alert('Lưu đầu mục thất bại');
    } finally {
      setSavingSection(false);
    }
  };

  const editSection = (section: MBTITypeSection) => {
    setSectionForm({
      id: section.id,
      title: section.title,
      content: section.content,
      order: section.order,
      is_active: section.is_active,
    });
  };

  const deleteSection = async (sectionId: string) => {
    const confirmed = confirm('Bạn có chắc muốn xóa đầu mục này?');
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('mbti_type_sections').delete().eq('id', sectionId);
      if (error) throw error;

      await fetchSections(selectedTypeId);
    } catch (error) {
      console.error('Error deleting MBTI section:', error);
      alert('Xóa đầu mục thất bại');
    }
  };

  const saveQuestion = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!questionForm.question_text.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    setSavingQuestion(true);
    try {
      const payload = {
        ...(questionForm.id ? { id: questionForm.id } : {}),
        question_text: questionForm.question_text.trim(),
        question_dimension: questionForm.question_dimension,
        placeholder_hint: questionForm.placeholder_hint.trim() || null,
        order: Number(questionForm.order) || 0,
        is_active: questionForm.is_active,
      };

      const { error } = await supabase.from('mbti_questions').upsert(payload);
      if (error) throw error;

      setQuestionForm(emptyQuestionForm);
      await fetchQuestions();
      alert('Đã lưu câu hỏi MBTI');
    } catch (error) {
      console.error('Error saving MBTI question:', error);
      alert('Lưu câu hỏi thất bại');
    } finally {
      setSavingQuestion(false);
    }
  };

  const editQuestion = (question: MBTIQuestion) => {
    setSelectedQuestionId(question.id);
    setQuestionForm({
      id: question.id,
      question_text: question.question_text,
      question_dimension: question.question_dimension || 'EI',
      placeholder_hint: question.placeholder_hint || '',
      order: question.order,
      is_active: question.is_active,
    });
  };

  const deleteQuestion = async (questionId: string) => {
    const confirmed = confirm('Bạn có chắc muốn xóa câu hỏi này?');
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('mbti_questions').delete().eq('id', questionId);
      if (error) throw error;

      if (questionForm.id === questionId) {
        setQuestionForm(emptyQuestionForm);
      }
      if (selectedQuestionId === questionId) {
        setSelectedQuestionId('');
        setOptionForm(emptyOptionForm);
      }
      await fetchQuestions();
    } catch (error) {
      console.error('Error deleting MBTI question:', error);
      alert('Xóa câu hỏi thất bại');
    }
  };

  const saveOption = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedQuestionId) {
      alert('Vui lòng chọn câu hỏi trước khi lưu đáp án.');
      return;
    }

    if (!optionForm.option_text.trim()) {
      alert('Vui lòng nhập nội dung đáp án.');
      return;
    }

    setSavingOption(true);
    try {
      const payload = {
        ...(optionForm.id ? { id: optionForm.id } : {}),
        question_id: selectedQuestionId,
        option_text: optionForm.option_text.trim(),
        mapped_letter: optionForm.mapped_letter,
        order: Number(optionForm.order) || 0,
        is_active: optionForm.is_active,
      };

      const { error } = await supabase.from('mbti_question_options').upsert(payload);
      if (error) throw error;

      setOptionForm(emptyOptionForm);
      await fetchQuestionOptions(selectedQuestionId);
      alert('Đã lưu đáp án');
    } catch (error) {
      console.error('Error saving question option:', error);
      alert('Lưu đáp án thất bại');
    } finally {
      setSavingOption(false);
    }
  };

  const editOption = (option: MBTIQuestionOption) => {
    setOptionForm({
      id: option.id,
      option_text: option.option_text,
      mapped_letter: option.mapped_letter,
      order: option.order,
      is_active: option.is_active,
    });
  };

  const deleteOption = async (optionId: string) => {
    const confirmed = confirm('Bạn có chắc muốn xóa đáp án này?');
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('mbti_question_options').delete().eq('id', optionId);
      if (error) throw error;

      if (optionForm.id === optionId) {
        setOptionForm(emptyOptionForm);
      }
      await fetchQuestionOptions(selectedQuestionId);
    } catch (error) {
      console.error('Error deleting question option:', error);
      alert('Xóa đáp án thất bại');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#0F172A' }}>Quản lý nội dung MBTI</h1>
          <p style={{ color: '#64748B', marginTop: '0.5rem' }}>
            Tạo nhóm MBTI bằng mã (VD: ISTJ) và nhập các đầu mục gồm tiêu đề + nội dung.
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {loadingTypes ? (
              <span>Đang tải nhóm MBTI...</span>
            ) : (
              types.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectType(item)}
                  style={{
                    border: selectedTypeId === item.id ? '1px solid #2563EB' : '1px solid #CBD5E1',
                    background: selectedTypeId === item.id ? '#DBEAFE' : '#fff',
                    color: '#1E293B',
                    borderRadius: 999,
                    padding: '6px 12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {item.code}
                </button>
              ))
            )}
            <button
              onClick={resetTypeForm}
              style={{ border: '1px dashed #94A3B8', background: '#fff', borderRadius: 999, padding: '6px 12px', cursor: 'pointer' }}
            >
              + Tạo nhóm mới
            </button>
          </div>

          <form onSubmit={saveType} style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                placeholder="Mã nhóm MBTI (4 ký tự)"
                value={typeForm.code}
                onChange={(e) => setTypeForm((prev) => ({ ...prev, code: e.target.value }))}
                maxLength={4}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1', textTransform: 'uppercase' }}
              />
              <input
                placeholder="Tên nhóm"
                value={typeForm.name}
                onChange={(e) => setTypeForm((prev) => ({ ...prev, name: e.target.value }))}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
              />
            </div>

            <input
              placeholder="Mô tả ngắn"
              value={typeForm.short_description}
              onChange={(e) => setTypeForm((prev) => ({ ...prev, short_description: e.target.value }))}
              style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                placeholder="Image URL"
                value={typeForm.image_url}
                onChange={(e) => setTypeForm((prev) => ({ ...prev, image_url: e.target.value }))}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
              />
              <input
                placeholder="Màu HEX (vd #A3D4B5)"
                value={typeForm.color_hex}
                onChange={(e) => setTypeForm((prev) => ({ ...prev, color_hex: e.target.value }))}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
              />
            </div>

            <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#334155' }}>
              <input
                type="checkbox"
                checked={typeForm.is_active}
                onChange={(e) => setTypeForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Hiển thị nhóm cho người dùng
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                disabled={savingType}
                style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}
              >
                {savingType ? 'Đang lưu...' : 'Lưu nhóm MBTI'}
              </button>
              <button
                type="button"
                onClick={deleteType}
                disabled={!typeForm.id}
                style={{ background: '#fff', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}
              >
                Xóa nhóm
              </button>
            </div>
          </form>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 }}>
          <h2 style={{ marginTop: 0, color: '#0F172A' }}>
            Đầu mục nội dung {selectedType ? `- ${selectedType.code}` : ''}
          </h2>

          <form onSubmit={saveSection} style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
            <input
              placeholder="Tiêu đề đầu mục"
              value={sectionForm.title}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, title: e.target.value }))}
              style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
            />
            <textarea
              placeholder="Nội dung"
              value={sectionForm.content}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, content: e.target.value }))}
              rows={5}
              style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1', resize: 'vertical' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Thứ tự"
                value={sectionForm.order}
                onChange={(e) => setSectionForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
              />
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#334155' }}>
                <input
                  type="checkbox"
                  checked={sectionForm.is_active}
                  onChange={(e) => setSectionForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                Hiển thị đầu mục
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                disabled={savingSection || !selectedTypeId}
                style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}
              >
                {savingSection ? 'Đang lưu...' : 'Lưu đầu mục'}
              </button>
              <button
                type="button"
                onClick={() => setSectionForm(emptySectionForm)}
                style={{ background: '#fff', color: '#334155', border: '1px solid #CBD5E1', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}
              >
                Làm mới
              </button>
            </div>
          </form>

          {loadingSections ? (
            <p>Đang tải đầu mục...</p>
          ) : sections.length === 0 ? (
            <p style={{ color: '#64748B' }}>Chưa có đầu mục cho nhóm này.</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {sections.map((section) => (
                <div
                  key={section.id}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 12,
                    display: 'grid',
                    gap: 6,
                    background: section.is_active ? '#fff' : '#F8FAFC',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <strong>{section.title}</strong>
                    <span style={{ color: '#64748B', fontSize: 12 }}>Thứ tự: {section.order}</span>
                  </div>
                  <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-wrap' }}>{section.content}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => editSection(section)}
                      style={{ border: '1px solid #CBD5E1', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      style={{ border: '1px solid #FECACA', color: '#DC2626', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 }}>
          <h2 style={{ marginTop: 0, color: '#0F172A' }}>Ngân hàng câu hỏi MBTI</h2>
          <p style={{ color: '#64748B', marginTop: 0 }}>
            Câu hỏi này sẽ hiển thị ở trang trắc nghiệm người dùng và trả lời theo dạng nhập tự do.
          </p>

          <form onSubmit={saveQuestion} style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
            <textarea
              placeholder="Nội dung câu hỏi"
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm((prev) => ({ ...prev, question_text: e.target.value }))}
              rows={3}
              style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1', resize: 'vertical' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <select
                value={questionForm.question_dimension}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    question_dimension: e.target.value as 'EI' | 'SN' | 'TF' | 'JP',
                  }))
                }
                style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
              >
                <option value="EI">EI (Hướng ngoại / Hướng nội)</option>
                <option value="SN">SN (Giác quan / Trực giác)</option>
                <option value="TF">TF (Lý trí / Cảm xúc)</option>
                <option value="JP">JP (Nguyên tắc / Linh hoạt)</option>
              </select>

              <input
                type="number"
                placeholder="Thứ tự"
                value={questionForm.order}
                onChange={(e) => setQuestionForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
              />
            </div>

            <input
              placeholder="Gợi ý nhập câu trả lời (placeholder)"
              value={questionForm.placeholder_hint}
              onChange={(e) => setQuestionForm((prev) => ({ ...prev, placeholder_hint: e.target.value }))}
              style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
            />

            <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#334155' }}>
              <input
                type="checkbox"
                checked={questionForm.is_active}
                onChange={(e) => setQuestionForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Hiển thị câu hỏi cho người dùng
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                disabled={savingQuestion}
                style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}
              >
                {savingQuestion ? 'Đang lưu...' : 'Lưu câu hỏi'}
              </button>
              <button
                type="button"
                onClick={() => setQuestionForm(emptyQuestionForm)}
                style={{ background: '#fff', color: '#334155', border: '1px solid #CBD5E1', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}
              >
                Làm mới
              </button>
            </div>
          </form>

          {loadingQuestions ? (
            <p>Đang tải câu hỏi...</p>
          ) : questions.length === 0 ? (
            <p style={{ color: '#64748B' }}>Chưa có câu hỏi MBTI.</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {questions.map((question) => (
                <div
                  key={question.id}
                  style={{
                    border: selectedQuestionId === question.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 12,
                    display: 'grid',
                    gap: 6,
                    background: selectedQuestionId === question.id ? '#EFF6FF' : question.is_active ? '#fff' : '#F8FAFC',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <strong>
                      [{question.question_dimension || 'N/A'}] {question.question_text}
                    </strong>
                    <span style={{ color: '#64748B', fontSize: 12 }}>Thứ tự: {question.order}</span>
                  </div>
                  {question.placeholder_hint ? (
                    <p style={{ margin: 0, color: '#64748B' }}>Gợi ý: {question.placeholder_hint}</p>
                  ) : null}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        setSelectedQuestionId(question.id);
                        setOptionForm(emptyOptionForm);
                      }}
                      style={{ border: '1px solid #93C5FD', color: '#1D4ED8', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                    >
                      Quản lý đáp án
                    </button>
                    <button
                      onClick={() => editQuestion(question)}
                      style={{ border: '1px solid #CBD5E1', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      style={{ border: '1px solid #FECACA', color: '#DC2626', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#0F172A' }}>
              Đáp án cho câu hỏi {selectedQuestion ? `#${selectedQuestion.order}` : ''}
            </h3>
            <p style={{ color: '#64748B', marginTop: 0 }}>
              {selectedQuestion
                ? `Đang chọn: ${selectedQuestion.question_text}`
                : 'Chọn một câu hỏi ở trên để thêm đáp án.'}
            </p>

            <form onSubmit={saveOption} style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
              <input
                placeholder="Nội dung đáp án"
                value={optionForm.option_text}
                onChange={(e) => setOptionForm((prev) => ({ ...prev, option_text: e.target.value }))}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select
                  value={optionForm.mapped_letter}
                  onChange={(e) =>
                    setOptionForm((prev) => ({
                      ...prev,
                      mapped_letter: e.target.value as 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P',
                    }))
                  }
                  style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
                >
                  <option value="E">E - Hướng ngoại</option>
                  <option value="I">I - Hướng nội</option>
                  <option value="S">S - Giác quan</option>
                  <option value="N">N - Trực giác</option>
                  <option value="T">T - Lý trí</option>
                  <option value="F">F - Cảm xúc</option>
                  <option value="J">J - Nguyên tắc</option>
                  <option value="P">P - Linh hoạt</option>
                </select>

                <input
                  type="number"
                  placeholder="Thứ tự"
                  value={optionForm.order}
                  onChange={(e) => setOptionForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                  style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }}
                />
              </div>

              <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#334155' }}>
                <input
                  type="checkbox"
                  checked={optionForm.is_active}
                  onChange={(e) => setOptionForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                Hiển thị đáp án
              </label>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={savingOption || !selectedQuestionId}
                  style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}
                >
                  {savingOption ? 'Đang lưu...' : 'Lưu đáp án'}
                </button>
                <button
                  type="button"
                  onClick={() => setOptionForm(emptyOptionForm)}
                  style={{ background: '#fff', color: '#334155', border: '1px solid #CBD5E1', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}
                >
                  Làm mới
                </button>
              </div>
            </form>

            {loadingQuestionOptions ? (
              <p>Đang tải đáp án...</p>
            ) : !selectedQuestionId ? (
              <p style={{ color: '#64748B' }}>Chưa chọn câu hỏi.</p>
            ) : questionOptions.length === 0 ? (
              <p style={{ color: '#64748B' }}>Chưa có đáp án cho câu hỏi này.</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {questionOptions.map((option) => (
                  <div
                    key={option.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: 12,
                      padding: 12,
                      display: 'grid',
                      gap: 6,
                      background: option.is_active ? '#fff' : '#F8FAFC',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong>[{option.mapped_letter}] {option.option_text}</strong>
                      <span style={{ color: '#64748B', fontSize: 12 }}>Thứ tự: {option.order}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => editOption(option)}
                        style={{ border: '1px solid #CBD5E1', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteOption(option.id)}
                        style={{ border: '1px solid #FECACA', color: '#DC2626', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
