import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type Conversation, type Message } from '../lib/supabase';
import { ChatService } from '../lib/chatService';
import { useAuth } from '../contexts/AuthContext';
import {
    Send, Paperclip, MoreVertical, Search,
    ChevronLeft, Phone, Video, Mic,
    Smile, Check, CheckCheck, Image as ImageIcon,
    File as FileIcon, X, Download, Plus
} from 'lucide-react';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ChatPage() {
    const { conversationId: paramId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);

    // Attachment state
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadConversations();

        const convSubscription = supabase
            .channel('conversations_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                loadConversations();
            })
            .subscribe();

        return () => {
            convSubscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (paramId) {
            loadMessages(paramId);
            const found = conversations.find(c => c.id === paramId);
            if (found) setActiveConv(found);

            const msgSubscription = supabase
                .channel(`messages_${paramId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${paramId}`
                }, (payload) => {
                    const newMsg = payload.new as Message;
                    newMsg.isSentByMe = newMsg.sender_id === user?.id;
                    setMessages(prev => {
                        const exists = prev.some(m => m.id === newMsg.id);
                        if (exists) return prev;
                        return [...prev, newMsg];
                    });
                    scrollToBottom();
                })
                .subscribe();

            return () => {
                msgSubscription.unsubscribe();
            };
        }
    }, [paramId, conversations, user?.id]);

    const loadConversations = async () => {
        const data = await ChatService.getConversations();
        setConversations(data);
        setLoading(false);
    };

    const loadMessages = async (id: string) => {
        const data = await ChatService.getMessages(id);
        setMessages(data);
        scrollToBottom();
        ChatService.markAsRead(id);
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const hasText = inputText.trim();
        const hasFile = selectedFile;

        if (!hasText && !hasFile) return;
        if (!paramId) return;

        setUploading(true);
        let attachmentInfo = null;

        try {
            if (selectedFile) {
                attachmentInfo = await ChatService.uploadFile(selectedFile);
                if (!attachmentInfo) {
                    throw new Error('Upload failed');
                }
            }

            const content = inputText.trim();
            const messageContent = content || (attachmentInfo?.type === 'image' ? '[Hình ảnh]' : attachmentInfo?.name || '[Tệp tin]');

            setInputText('');
            clearSelection();

            const result = await ChatService.sendMessage({
                conversationId: paramId,
                content: messageContent,
                messageType: attachmentInfo?.type || 'text',
                attachmentUrl: attachmentInfo?.url,
                attachmentName: attachmentInfo?.name,
                attachmentSize: attachmentInfo?.size
            });

            if (result) {
                const newMsg = { ...result, isSentByMe: true };
                setMessages(prev => {
                    const filtered = prev.filter(m => m.id !== newMsg.id);
                    return [...filtered, newMsg];
                });
                scrollToBottom();
            }
        } catch (err: any) {
            console.error('Send error:', err);
            // Ghi nhận lỗi cụ thể để debug
            if (err.message?.includes('bucket not found')) {
                alert('Lỗi: Thư mục chat_attachments không tồn tại trên Supabase. Bạn vui lòng kiểm tra lại!');
            } else {
                alert('Lỗi: Không thể gửi ảnh/tệp lúc này. Vui lòng thử lại sau!');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#F8FAFC' }}>
            <div className="loader"></div>
            <span style={{ marginLeft: '16px', fontWeight: 600, color: '#64748B', fontSize: '1.2rem' }}>Đang kết nối...</span>
        </div>
    );

    return (
        <div className="chat-container">
            {/* Sidebar */}
            <div className={`chat-sidebar ${paramId ? 'mobile-hidden' : ''}`}>
                <div className="sidebar-header">
                    <h1 className="sidebar-title">Nhắn tin</h1>
                    <div className="search-wrapper">
                        <Search className="search-icon" size={22} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="conversation-list scrollbar-hide">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`conversation-item ${paramId === conv.id ? 'active' : ''}`}
                                onClick={() => navigate(`/chat/${conv.id}`)}
                            >
                                <div className="avatar-wrapper">
                                    {conv.otherUserAvatar ? (
                                        <img src={conv.otherUserAvatar} alt={conv.otherUserName} className="user-avatar" />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {conv.otherUserName?.[0]}
                                        </div>
                                    )}
                                    {conv.unreadCount ? (
                                        <span className="unread-badge">
                                            {conv.unreadCount}
                                        </span>
                                    ) : null}
                                </div>
                                <div className="conv-info">
                                    <div className="conv-header">
                                        <h3 className="user-name">{conv.otherUserName}</h3>
                                        <span className="last-time">
                                            {conv.last_message_at ? format(new Date(conv.last_message_at), 'HH:mm', { locale: vi }) : ''}
                                        </span>
                                    </div>
                                    <p className="last-message">
                                        {conv.last_message_sender_id === user?.id ? 'Bạn: ' : ''}
                                        {conv.last_message || 'Bắt đầu cuộc trò chuyện'}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>Không có hội thoại</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`chat-main ${!paramId ? 'mobile-hidden' : ''}`}>
                {paramId && activeConv ? (
                    <>
                        <div className="chat-header">
                            <div className="header-left">
                                <button className="back-btn" onClick={() => navigate('/chat')}>
                                    <ChevronLeft size={28} />
                                </button>
                                <div className="header-avatar-status">
                                    {activeConv.otherUserAvatar ? (
                                        <img src={activeConv.otherUserAvatar} alt={activeConv.otherUserName} className="header-avatar" />
                                    ) : (
                                        <div className="header-avatar-placeholder">
                                            {activeConv.otherUserName?.[0]}
                                        </div>
                                    )}
                                    <div className="status-indicator"></div>
                                </div>
                                <div className="header-info">
                                    <h2 className="header-name">{activeConv.otherUserName}</h2>
                                    <span className="header-status">Đang trực tuyến</span>
                                </div>
                            </div>
                            <div className="header-actions">
                                <button className="action-btn"><Phone size={22} /></button>
                                <button className="action-btn"><Video size={22} /></button>
                                <button className="action-btn"><MoreVertical size={22} /></button>
                            </div>
                        </div>

                        <div className="chat-messages scrollbar-hide" ref={scrollContainerRef}>
                            <div className="messages-grid">
                                {messages.map((msg, index) => {
                                    const prevMsg = messages[index - 1];
                                    const showDate = !prevMsg || format(new Date(msg.created_at), 'yyyy-MM-dd') !== format(new Date(prevMsg.created_at), 'yyyy-MM-dd');
                                    const isOnlyImage = msg.message_type === 'image' && !msg.content;

                                    return (
                                        <div key={msg.id}>
                                            {showDate && (
                                                <div className="date-separator">
                                                    <span className="date-label">
                                                        {format(new Date(msg.created_at), 'dd/MM/yyyy', { locale: vi })}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`message-row ${msg.isSentByMe ? 'sent' : 'received'}`}>
                                                <div className={`message-bubble ${isOnlyImage ? 'image-only' : ''}`}>
                                                    {msg.message_type === 'image' && msg.attachment_url && (
                                                        <div className="message-image-container">
                                                            <img
                                                                src={msg.attachment_url}
                                                                alt="Sent"
                                                                className="message-image"
                                                                onClick={() => window.open(msg.attachment_url!, '_blank')}
                                                            />
                                                        </div>
                                                    )}

                                                    {msg.message_type === 'file' && msg.attachment_url && (
                                                        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="message-file-link">
                                                            <div className="file-icon-box">
                                                                <FileIcon size={24} />
                                                            </div>
                                                            <div className="file-info">
                                                                <div className="file-name">{msg.attachment_name}</div>
                                                                <div className="file-size">{((msg.attachment_size || 0) / 1024).toFixed(1)} KB</div>
                                                            </div>
                                                            <Download size={18} className="download-icon" />
                                                        </a>
                                                    )}

                                                    {msg.content && msg.content !== '[Hình ảnh]' && msg.content !== '[Tệp tin]' && (
                                                        <p className="message-text">{msg.content}</p>
                                                    )}

                                                    <div className="message-meta">
                                                        <span className="message-time">
                                                            {format(new Date(msg.created_at), 'HH:mm')}
                                                        </span>
                                                        {msg.isSentByMe && (
                                                            msg.is_read ? <CheckCheck size={14} className="read-icon" /> : <Check size={14} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Attachment Preview */}
                        {selectedFile && (
                            <div className="attachment-preview-bar">
                                <div className="preview-content">
                                    {filePreview ? (
                                        <img src={filePreview} className="preview-thumbnail" alt="Preview" />
                                    ) : (
                                        <div className="preview-file-icon">
                                            <FileIcon size={24} />
                                            <span className="preview-filename">{selectedFile.name}</span>
                                        </div>
                                    )}
                                    <button className="preview-clear-btn" onClick={clearSelection}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <div className="input-wrapper">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                />
                                <button
                                    type="button"
                                    className="input-action-btn attach"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Plus size={24} />
                                </button>
                                <textarea
                                    className="message-input scrollbar-hide"
                                    placeholder="Viết tin nhắn..."
                                    rows={1}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <div className="input-right-actions">
                                    <button
                                        type="button"
                                        className={`input-action-btn ${isListening ? 'listening' : ''}`}
                                        onClick={handleVoiceInput}
                                    >
                                        <Mic size={24} />
                                    </button>
                                    <button type="submit" disabled={(!inputText.trim() && !selectedFile) || uploading} className="send-btn-modern">
                                        {uploading ? <div className="loader smaller white"></div> : <Send size={22} />}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="welcome-area">
                        <div className="welcome-icon-box">
                            <Send size={52} />
                        </div>
                        <h2 className="welcome-title">Cổng trao đổi nghề nghiệp</h2>
                        <p className="welcome-desc">Chọn một người để bắt đầu trò chuyện ngay.</p>
                    </div>
                )}
            </div>

            <style>{`
                .chat-container {
                    display: flex;
                    height: calc(100vh - var(--header-height));
                    background: #fff;
                    overflow: hidden;
                    width: 100%;
                }
                
                /* Sidebar Styles */
                .chat-sidebar {
                    width: 380px;
                    border-right: 1px solid #E5E7EB;
                    display: flex;
                    flex-direction: column;
                    background: #fff;
                    flex-shrink: 0;
                }
                .sidebar-header {
                    padding: 24px;
                    border-bottom: 1px solid #F3F4F6;
                }
                .sidebar-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #111827;
                    margin: 0;
                }
                .search-wrapper {
                    position: relative;
                    margin-top: 16px;
                }
                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9CA3AF;
                }
                .search-input {
                    width: 100%;
                    padding: 12px 12px 12px 42px;
                    background: #F3F4F6;
                    border-radius: 12px;
                    border: 2px solid transparent;
                    outline: none;
                    transition: all 0.2s;
                    font-size: 1rem;
                }
                .search-input:focus {
                    background: #fff;
                    border-color: #3B82F6;
                }

                /* Conversation Item Styles */
                .conversation-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                }
                .conversation-item {
                    display: flex;
                    align-items: center;
                    padding: 14px 16px;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 4px;
                }
                .conversation-item:hover { background: #F9FAFB; }
                .conversation-item.active { background: #EBF5FF; }
                
                .avatar-wrapper {
                    position: relative;
                    width: 56px;
                    height: 56px;
                    flex-shrink: 0;
                }
                .user-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .avatar-placeholder {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: #DBEAFE;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #2563EB;
                    font-weight: 700;
                    font-size: 1.4rem;
                }
                .unread-badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: #EF4444;
                    color: white;
                    font-size: 10px;
                    font-weight: 800;
                    padding: 2px 6px;
                    border-radius: 10px;
                    border: 2px solid #fff;
                }
                .conv-info {
                    flex: 1;
                    min-width: 0;
                    margin-left: 14px;
                }
                .conv-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 2px;
                }
                .user-name {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1F2937;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .last-time { font-size: 0.8rem; color: #9CA3AF; }
                .last-message {
                    font-size: 0.95rem;
                    color: #6B7280;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Main Chat Window */
                .chat-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #fff;
                    position: relative;
                }
                .chat-header {
                    padding: 16px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #F3F4F6;
                    height: 84px;
                }
                .header-left { display: flex; align-items: center; }
                .back-btn { display: none; margin-right: 12px; border: none; background: transparent; color: #3B82F6; cursor: pointer; }
                
                .header-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
                .header-avatar-placeholder {
                    width: 48px; height: 48px; border-radius: 50%; background: #DBEAFE;
                    display: flex; align-items: center; justify-content: center; color: #2563EB; font-weight: 700;
                }
                .status-indicator {
                    position: absolute; bottom: 1px; right: 1px; width: 12px; height: 12px;
                    background: #10B981; border-radius: 50%; border: 2px solid #fff;
                }
                .header-info { margin-left: 14px; }
                .header-name { font-size: 1.2rem; font-weight: 800; color: #111827; margin: 0; }
                .header-status { font-size: 0.85rem; color: #10B981; font-weight: 600; }
                
                .header-actions { display: flex; gap: 10px; }
                .action-btn {
                    padding: 10px; border-radius: 12px; border: none; background: transparent;
                    color: #6B7280; cursor: pointer; transition: all 0.2s;
                }
                .action-btn:hover { background: #F3F4F6; color: #3B82F6; }

                /* Messages Area */
                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    background-color: #F9FAFB;
                    background-image: radial-gradient(#E5E7EB 0.8px, transparent 0.8px);
                    background-size: 24px 24px;
                }
                .messages-grid { display: flex; flex-direction: column; gap: 16px; }
                .date-separator { display: flex; justify-content: center; margin: 20px 0; }
                .date-label { background: #fff; color: #6B7280; font-size: 0.75rem; font-weight: 700; padding: 4px 16px; border-radius: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                
                .message-row { display: flex; width: 100%; }
                .message-row.sent { justify-content: flex-end; }
                .message-row.received { justify-content: flex-start; }
                
                .message-bubble {
                    max-width: 70%;
                    padding: 14px 18px;
                    border-radius: 20px;
                    position: relative;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .sent .message-bubble { background: #3B82F6; color: white; border-bottom-right-radius: 4px; }
                .received .message-bubble { background: white; color: #1F2937; border-bottom-left-radius: 4px; border: 1px solid #E5E7EB; }
                
                .message-bubble.image-only { padding: 4px; }

                .message-text { font-size: 1rem; line-height: 1.5; margin: 0; white-space: pre-wrap; font-weight: 500; }

                .message-image-container { border-radius: 16px; overflow: hidden; margin-bottom: 2px; }
                .message-image { max-width: 100%; max-height: 400px; display: block; cursor: pointer; }

                .message-file-link {
                    display: flex; align-items: center; padding: 12px; background: #F3F4F6; border-radius: 12px;
                    text-decoration: none; color: inherit; gap: 12px; margin-bottom: 4px; min-width: 240px;
                }
                .sent .message-file-link { background: rgba(255, 255, 255, 0.1); }
                .file-icon-box {
                    width: 40px; height: 40px; background: white; color: #3B82F6;
                    border-radius: 10px; display: flex; align-items: center; justify-content: center;
                }
                .file-info { flex: 1; min-width: 0; }
                .file-name { font-size: 0.9rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .file-size { font-size: 0.75rem; opacity: 0.8; }

                .message-meta { display: flex; align-items: center; justify-content: flex-end; gap: 6px; margin-top: 4px; opacity: 0.7; }
                .message-time { font-size: 0.75rem; font-weight: 600; }
                .read-icon { color: white; }
                .received .read-icon { color: #3B82F6; }

                /* Attachment Preview */
                .attachment-preview-bar { padding: 12px 24px; background: #fff; border-top: 1px solid #F3F4F6; }
                .preview-content {
                    display: flex; align-items: center; background: #F9FAFB; padding: 8px;
                    border-radius: 12px; border: 1px solid #E5E7EB; width: fit-content; position: relative;
                }
                .preview-thumbnail { width: 64px; height: 64px; border-radius: 8px; object-fit: cover; }
                .preview-file-icon { display: flex; align-items: center; gap: 10px; padding: 8px; }
                .preview-filename { font-size: 0.9rem; font-weight: 600; }
                .preview-clear-btn {
                    position: absolute; top: -10px; right: -10px; background: #EF4444; color: white;
                    border: none; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer;
                }

                /* Input Area */
                .chat-input-area { padding: 16px 24px 32px; background: #fff; border-top: 1px solid #F3F4F6; }
                .input-wrapper {
                    background: #F3F4F6; border-radius: 24px; display: flex; align-items: center; padding: 6px 10px; transition: all 0.2s;
                }
                .input-wrapper:focus-within { background: #fff; box-shadow: 0 0 0 2px #3B82F6; }
                
                .input-action-btn {
                    padding: 10px; border-radius: 50%; border: none; background: transparent; color: #9CA3AF; cursor: pointer;
                }
                .input-action-btn:hover { background: #E5E7EB; color: #4B5563; }
                .input-action-btn.attach { color: #3B82F6; }
                .input-action-btn.listening { color: #EF4444; background: #FEE2E2; }
                
                .message-input {
                    flex: 1; background: transparent; border: none; outline: none; padding: 10px;
                    font-size: 1.05rem; color: #111827; font-weight: 500; font-family: inherit; resize: none; max-height: 120px;
                }
                .input-right-actions { display: flex; align-items: center; gap: 4px; }
                .send-btn-modern {
                    width: 44px; height: 44px; background: #2563EB; color: white; border-radius: 50%; border: none;
                    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
                }
                .send-btn-modern:hover { background: #1D4ED8; transform: scale(1.05); }
                .send-btn-modern:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
                
                /* Welcome State */
                .welcome-area { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #F9FAFB; }
                .welcome-icon-box {
                    width: 100px; height: 100px; background: #fff; border-radius: 32px;
                    display: flex; align-items: center; justify-content: center; color: #3B82F6; margin-bottom: 24px; box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }
                .welcome-title { font-size: 1.8rem; font-weight: 800; color: #111827; margin: 0; }
                .welcome-desc { color: #6B7280; margin-top: 12px; max-width: 320px; text-align: center; font-weight: 500; }

                /* Common Utilities */
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .loader { border: 3px solid rgba(255,255,255,0.2); border-top: 3px solid #fff; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                /* Responsive */
                @media (max-width: 768px) {
                    .mobile-hidden { display: none !important; }
                    .chat-sidebar { width: 100%; border-right: none; }
                    .back-btn { display: block; }
                }
            `}</style>
        </div>
    );
}
