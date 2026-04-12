import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type Conversation, type Message } from '../lib/supabase';
import { ChatService } from '../lib/chatService';
import { useAuth } from '../contexts/AuthContext';
import {
    Send, MoreVertical, Search,
    ChevronLeft, Phone, Video, Mic,
    Check, CheckCheck,
    File as FileIcon, X, Download, Plus
} from 'lucide-react';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

function ConversationSkeleton() {
    return (
        <div className="conversation-item skeleton-item">
            <div className="avatar-wrapper">
                <div className="avatar-placeholder skeleton"></div>
            </div>
            <div className="conv-info">
                <div className="conv-header">
                    <div className="user-name skeleton skeleton-text" style={{ width: '60%' }}></div>
                    <div className="last-time skeleton skeleton-text" style={{ width: '40px' }}></div>
                </div>
                <div className="last-message skeleton skeleton-text" style={{ width: '80%' }}></div>
            </div>
        </div>
    );
}

function MessageSkeleton() {
    return (
        <div className="messages-grid">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`message-row ${i % 2 === 0 ? 'sent' : 'received'}`}>
                    <div className="message-bubble skeleton-bubble">
                        <div className="skeleton skeleton-text" style={{ width: i % 3 === 0 ? '80%' : '60%', height: '16px', marginBottom: '8px' }}></div>
                        {i % 2 === 0 && <div className="skeleton skeleton-text" style={{ width: '40%', height: '12px' }}></div>}
                    </div>
                </div>
            ))}
        </div>
    );
}

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
    const [mobileShowChat, setMobileShowChat] = useState(!!paramId);

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
            setMobileShowChat(true);
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
        } else {
            setMobileShowChat(false);
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

    const handleConversationSelect = (convId: string) => {
        navigate(`/chat/${convId}`);
        setMobileShowChat(true);
    };

    const handleBackToList = () => {
        setMobileShowChat(false);
        navigate('/chat');
    };

    const filteredConversations = conversations.filter(c =>
        c.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="chat-container chat-loading">
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-title skeleton skeleton-text" style={{ width: '120px', height: '28px' }}></div>
                    <div className="search-wrapper">
                        <div className="search-input skeleton" style={{ height: '44px' }}></div>
                    </div>
                </div>
                <div className="conversation-list scrollbar-hide">
                    {[1, 2, 3, 4, 5].map(i => <ConversationSkeleton key={i} />)}
                </div>
            </div>
            <div className="chat-main">
                <div className="chat-header">
                    <div className="header-left">
                        <div className="header-avatar-status">
                            <div className="header-avatar-placeholder skeleton"></div>
                        </div>
                        <div className="header-info">
                            <div className="header-name skeleton skeleton-text" style={{ width: '120px' }}></div>
                            <div className="header-status skeleton skeleton-text" style={{ width: '80px', height: '12px' }}></div>
                        </div>
                    </div>
                </div>
                <div className="chat-messages">
                    <MessageSkeleton />
                </div>
                <div className="chat-input-area">
                    <div className="input-wrapper">
                        <div className="skeleton" style={{ width: '100%', height: '44px', borderRadius: '24px' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="chat-container">
            <div className={`chat-sidebar ${mobileShowChat ? 'mobile-hidden' : 'mobile-visible'}`}>
                <div className="sidebar-header glass-effect">
                    <div className="sidebar-header-top">
                        <h1 className="sidebar-title">Nhắn tin</h1>
                    </div>
                    <div className="search-wrapper">
                        <Search className="search-icon" size={20} />
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
                                onClick={() => handleConversationSelect(conv.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleConversationSelect(conv.id)}
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
                            <Search size={48} className="empty-state-icon" />
                            <p>Không tìm thấy hội thoại nào</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={`chat-main ${!mobileShowChat ? 'mobile-hidden' : ''}`}>
                {paramId && activeConv ? (
                    <>
                        <div className="chat-header glass-effect">
                            <div className="header-left">
                                <button
                                    className="back-btn mobile-back-btn"
                                    onClick={handleBackToList}
                                    aria-label="Quay lại danh sách"
                                >
                                    <ChevronLeft size={24} />
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
                                <button className="action-btn" aria-label="Gọi điện"><Phone size={20} /></button>
                                <button className="action-btn" aria-label="Video call"><Video size={20} /></button>
                                <button className="action-btn" aria-label="Thêm"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        <div className="chat-messages scrollbar-hide" ref={scrollContainerRef}>
                            <div className="messages-grid">
                                {messages.map((msg, index) => {
                                    const prevMsg = messages[index - 1];
                                    const showDate = !prevMsg || format(new Date(msg.created_at), 'yyyy-MM-dd') !== format(new Date(prevMsg.created_at), 'yyyy-MM-dd');
                                    const isOnlyImage = msg.message_type === 'image' && !msg.content;

                                    return (
                                        <div key={msg.id} className="message-animate">
                                            {showDate && (
                                                <div className="date-separator">
                                                    <span className="date-label glass-effect">
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
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                    )}

                                                    {msg.message_type === 'file' && msg.attachment_url && (
                                                        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="message-file-link">
                                                            <div className="file-icon-box">
                                                                <FileIcon size={22} />
                                                            </div>
                                                            <div className="file-info">
                                                                <div className="file-name">{msg.attachment_name}</div>
                                                                <div className="file-size">{((msg.attachment_size || 0) / 1024).toFixed(1)} KB</div>
                                                            </div>
                                                            <Download size={16} className="download-icon" />
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

                        {selectedFile && (
                            <div className="attachment-preview-bar glass-effect">
                                <div className="preview-content">
                                    {filePreview ? (
                                        <img src={filePreview} className="preview-thumbnail" alt="Preview" />
                                    ) : (
                                        <div className="preview-file-icon">
                                            <FileIcon size={20} />
                                            <span className="preview-filename">{selectedFile.name}</span>
                                        </div>
                                    )}
                                    <button
                                        className="preview-clear-btn"
                                        onClick={clearSelection}
                                        aria-label="Xóa tệp đã chọn"
                                    >
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
                                    className="hidden-file-input"
                                    onChange={handleFileSelect}
                                />
                                <button
                                    type="button"
                                    className="input-action-btn attach"
                                    onClick={() => fileInputRef.current?.click()}
                                    aria-label="Đính kèm tệp"
                                >
                                    <Plus size={22} />
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
                                        aria-label="Nhập liệu bằng giọng nói"
                                    >
                                        <Mic size={22} />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={(!inputText.trim() && !selectedFile) || uploading}
                                        className="send-btn-modern"
                                        aria-label="Gửi tin nhắn"
                                    >
                                        {uploading ? <div className="loader smaller white"></div> : <Send size={20} />}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="welcome-area">
                        <div className="welcome-icon-box glass-effect">
                            <Send size={48} />
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
                    background: var(--color-background-alt);
                    overflow: hidden;
                    width: 100%;
                }

                .chat-loading {
                    background: var(--color-surface);
                }

                .glass-effect {
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-blur);
                    -webkit-backdrop-filter: var(--glass-blur);
                    border: 1px solid var(--glass-border);
                }

                .chat-sidebar {
                    width: 380px;
                    border-right: 1px solid var(--color-border);
                    display: flex;
                    flex-direction: column;
                    background: var(--color-surface);
                    flex-shrink: 0;
                    transition: all var(--transition-base);
                }

                .sidebar-header {
                    padding: var(--spacing-lg);
                    border-bottom: 1px solid var(--color-border-light);
                }

                .sidebar-header-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .sidebar-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--color-text);
                    margin: 0;
                }

                .search-wrapper {
                    position: relative;
                    margin-top: var(--spacing-md);
                }

                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--color-text-light);
                    pointer-events: none;
                }

                .search-input {
                    width: 100%;
                    padding: 12px 12px 12px 42px;
                    background: var(--color-background);
                    border-radius: var(--radius-md);
                    border: 2px solid transparent;
                    outline: none;
                    transition: all var(--transition-fast);
                    font-size: 1rem;
                    color: var(--color-text);
                    min-height: 44px;
                }

                .search-input:focus {
                    background: var(--color-surface);
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
                }

                .search-input::placeholder {
                    color: var(--color-text-light);
                }

                .conversation-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: var(--spacing-sm);
                }

                .conversation-item {
                    display: flex;
                    align-items: center;
                    padding: var(--spacing-md);
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    margin-bottom: var(--spacing-xs);
                    min-height: 44px;
                }

                .conversation-item:hover {
                    background: var(--color-hover);
                }

                .conversation-item.active {
                    background: var(--color-primary-50);
                }

                .conversation-item:active {
                    transform: scale(0.98);
                }

                .avatar-wrapper {
                    position: relative;
                    width: 56px;
                    height: 56px;
                    flex-shrink: 0;
                }

                .user-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: var(--radius-full);
                    object-fit: cover;
                }

                .avatar-placeholder {
                    width: 56px;
                    height: 56px;
                    border-radius: var(--radius-full);
                    background: var(--color-primary-50);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-primary);
                    font-weight: 700;
                    font-size: 1.4rem;
                }

                .unread-badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: var(--color-error);
                    color: white;
                    font-size: 10px;
                    font-weight: 800;
                    padding: 2px 6px;
                    border-radius: var(--radius-full);
                    border: 2px solid var(--color-surface);
                    box-shadow: var(--shadow-sm);
                }

                .conv-info {
                    flex: 1;
                    min-width: 0;
                    margin-left: var(--spacing-md);
                }

                .conv-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 2px;
                }

                .user-name {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: var(--color-text);
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .last-time {
                    font-size: 0.8rem;
                    color: var(--color-text-light);
                    flex-shrink: 0;
                    margin-left: var(--spacing-sm);
                }

                .last-message {
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .chat-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: var(--color-surface);
                    position: relative;
                    min-width: 0;
                }

                .chat-header {
                    padding: var(--spacing-md) var(--spacing-lg);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--color-border-light);
                    height: 72px;
                    flex-shrink: 0;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                }

                .mobile-back-btn {
                    display: none;
                    min-width: 44px;
                    min-height: 44px;
                    border: none;
                    background: transparent;
                    color: var(--color-primary);
                    cursor: pointer;
                    border-radius: var(--radius-md);
                    transition: all var(--transition-fast);
                    align-items: center;
                    justify-content: center;
                }

                .mobile-back-btn:hover {
                    background: var(--color-primary-50);
                }

                .mobile-back-btn:active {
                    transform: scale(0.95);
                }

                .header-avatar-status {
                    position: relative;
                    flex-shrink: 0;
                }

                .header-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: var(--radius-full);
                    object-fit: cover;
                }

                .header-avatar-placeholder {
                    width: 44px;
                    height: 44px;
                    border-radius: var(--radius-full);
                    background: var(--color-primary-50);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-primary);
                    font-weight: 700;
                    font-size: 1.2rem;
                }

                .status-indicator {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 12px;
                    height: 12px;
                    background: var(--color-success);
                    border-radius: var(--radius-full);
                    border: 2px solid var(--color-surface);
                }

                .header-info {
                    margin-left: var(--spacing-sm);
                }

                .header-name {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: var(--color-text);
                    margin: 0;
                    line-height: 1.2;
                }

                .header-status {
                    font-size: 0.8rem;
                    color: var(--color-success);
                    font-weight: 600;
                }

                .header-actions {
                    display: flex;
                    gap: var(--spacing-xs);
                }

                .action-btn {
                    min-width: 44px;
                    min-height: 44px;
                    border-radius: var(--radius-md);
                    border: none;
                    background: transparent;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .action-btn:hover {
                    background: var(--color-hover);
                    color: var(--color-primary);
                }

                .action-btn:active {
                    transform: scale(0.95);
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: var(--spacing-lg);
                    background-color: var(--color-background-alt);
                    background-image: radial-gradient(var(--color-border) 0.8px, transparent 0.8px);
                    background-size: 24px 24px;
                }

                .messages-grid {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md);
                }

                .message-animate {
                    animation: fade-in 0.3s ease-out;
                }

                .date-separator {
                    display: flex;
                    justify-content: center;
                    margin: var(--spacing-lg) 0;
                }

                .date-label {
                    background: var(--color-surface);
                    color: var(--color-text-secondary);
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: var(--spacing-xs) var(--spacing-md);
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                }

                .message-row {
                    display: flex;
                    width: 100%;
                }

                .message-row.sent {
                    justify-content: flex-end;
                }

                .message-row.received {
                    justify-content: flex-start;
                }

                .message-bubble {
                    max-width: 70%;
                    padding: var(--spacing-md) var(--spacing-lg);
                    border-radius: var(--radius-xl);
                    position: relative;
                    box-shadow: var(--shadow-xs);
                }

                .sent .message-bubble {
                    background: var(--color-primary);
                    color: white;
                    border-bottom-right-radius: var(--radius-sm);
                }

                .received .message-bubble {
                    background: var(--color-surface);
                    color: var(--color-text);
                    border-bottom-left-radius: var(--radius-sm);
                    border: 1px solid var(--color-border);
                }

                .message-bubble.image-only {
                    padding: var(--spacing-xs);
                }

                .message-text {
                    font-size: 1rem;
                    line-height: 1.5;
                    margin: 0;
                    white-space: pre-wrap;
                    font-weight: 500;
                }

                .message-image-container {
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    margin-bottom: var(--spacing-xs);
                }

                .message-image {
                    max-width: 100%;
                    max-height: 400px;
                    display: block;
                    cursor: pointer;
                    transition: opacity var(--transition-fast);
                }

                .message-image:hover {
                    opacity: 0.9;
                }

                .message-file-link {
                    display: flex;
                    align-items: center;
                    padding: var(--spacing-md);
                    background: var(--color-background);
                    border-radius: var(--radius-md);
                    text-decoration: none;
                    color: inherit;
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-xs);
                    min-width: 220px;
                    transition: all var(--transition-fast);
                }

                .message-file-link:hover {
                    background: var(--color-hover);
                }

                .sent .message-file-link {
                    background: rgba(255, 255, 255, 0.15);
                }

                .sent .message-file-link:hover {
                    background: rgba(255, 255, 255, 0.25);
                }

                .file-icon-box {
                    width: 40px;
                    height: 40px;
                    background: var(--color-surface);
                    color: var(--color-primary);
                    border-radius: var(--radius-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .file-info {
                    flex: 1;
                    min-width: 0;
                }

                .file-name {
                    font-size: 0.85rem;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .file-size {
                    font-size: 0.75rem;
                    opacity: 0.7;
                }

                .message-meta {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: var(--spacing-xs);
                    margin-top: var(--spacing-xs);
                    opacity: 0.7;
                }

                .message-time {
                    font-size: 0.7rem;
                    font-weight: 600;
                }

                .read-icon {
                    color: white;
                }

                .received .read-icon {
                    color: var(--color-primary);
                }

                .attachment-preview-bar {
                    padding: var(--spacing-md) var(--spacing-lg);
                    background: var(--color-surface);
                    border-top: 1px solid var(--color-border-light);
                }

                .preview-content {
                    display: flex;
                    align-items: center;
                    background: var(--color-background);
                    padding: var(--spacing-sm);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                    width: fit-content;
                    max-width: 100%;
                    position: relative;
                }

                .preview-thumbnail {
                    width: 56px;
                    height: 56px;
                    border-radius: var(--radius-sm);
                    object-fit: cover;
                }

                .preview-file-icon {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    padding: var(--spacing-sm);
                    color: var(--color-text-secondary);
                }

                .preview-filename {
                    font-size: 0.85rem;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 200px;
                }

                .preview-clear-btn {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: var(--color-error);
                    color: white;
                    border: 2px solid var(--color-surface);
                    border-radius: var(--radius-full);
                    min-width: 28px;
                    min-height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .preview-clear-btn:hover {
                    background: var(--color-error-dark);
                    transform: scale(1.1);
                }

                .chat-input-area {
                    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
                    background: var(--color-surface);
                    border-top: 1px solid var(--color-border-light);
                    flex-shrink: 0;
                }

                .input-wrapper {
                    background: var(--color-background);
                    border-radius: var(--radius-2xl);
                    display: flex;
                    align-items: center;
                    padding: var(--spacing-xs) var(--spacing-sm);
                    transition: all var(--transition-fast);
                    border: 2px solid transparent;
                }

                .input-wrapper:focus-within {
                    background: var(--color-surface);
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
                }

                .hidden-file-input {
                    display: none;
                }

                .input-action-btn {
                    min-width: 44px;
                    min-height: 44px;
                    border-radius: var(--radius-full);
                    border: none;
                    background: transparent;
                    color: var(--color-text-light);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all var(--transition-fast);
                }

                .input-action-btn:hover {
                    background: var(--color-border-light);
                    color: var(--color-text-secondary);
                }

                .input-action-btn.attach {
                    color: var(--color-primary);
                }

                .input-action-btn.attach:hover {
                    background: var(--color-primary-50);
                }

                .input-action-btn.listening {
                    color: var(--color-error);
                    background: var(--color-error-light);
                    animation: pulse 1.5s ease-in-out infinite;
                }

                .message-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    padding: var(--spacing-md);
                    font-size: 1rem;
                    color: var(--color-text);
                    font-weight: 500;
                    font-family: inherit;
                    resize: none;
                    max-height: 120px;
                    min-height: 44px;
                    line-height: 1.5;
                }

                .message-input::placeholder {
                    color: var(--color-text-light);
                }

                .input-right-actions {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                }

                .send-btn-modern {
                    min-width: 44px;
                    min-height: 44px;
                    background: var(--color-primary);
                    color: white;
                    border-radius: var(--radius-full);
                    border: none;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .send-btn-modern:hover:not(:disabled) {
                    background: var(--color-primary-dark);
                    transform: scale(1.05);
                }

                .send-btn-modern:active:not(:disabled) {
                    transform: scale(0.95);
                }

                .send-btn-modern:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .welcome-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-background-alt);
                    padding: var(--spacing-xl);
                }

                .welcome-icon-box {
                    width: 96px;
                    height: 96px;
                    background: var(--color-surface);
                    border-radius: var(--radius-2xl);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-primary);
                    margin-bottom: var(--spacing-xl);
                    box-shadow: var(--shadow-lg);
                }

                .welcome-title {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: var(--color-text);
                    margin: 0;
                    text-align: center;
                }

                .welcome-desc {
                    color: var(--color-text-secondary);
                    margin-top: var(--spacing-md);
                    max-width: 320px;
                    text-align: center;
                    font-weight: 500;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-2xl);
                    color: var(--color-text-light);
                    text-align: center;
                }

                .empty-state-icon {
                    margin-bottom: var(--spacing-md);
                    opacity: 0.5;
                }

                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }

                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .loader {
                    border: 3px solid rgba(255, 255, 255, 0.2);
                    border-top: 3px solid white;
                    border-radius: var(--radius-full);
                    width: 20px;
                    height: 20px;
                    animation: spin 1s linear infinite;
                }

                .loader.smaller {
                    width: 16px;
                    height: 16px;
                    border-width: 2px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .skeleton {
                    background: linear-gradient(90deg, var(--color-border-light) 25%, var(--color-background) 50%, var(--color-border-light) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: var(--radius-md);
                }

                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                .skeleton-text {
                    height: 1rem;
                }

                .skeleton-bubble {
                    background: var(--color-background) !important;
                    border: none !important;
                    box-shadow: none !important;
                }

                .skeleton-item {
                    pointer-events: none;
                }

                @media (max-width: 768px) {
                    .chat-container {
                        height: calc(100vh - var(--header-height, 72px));
                    }

                    .mobile-hidden {
                        display: none !important;
                    }

                    .mobile-visible {
                        display: flex !important;
                        width: 100% !important;
                    }

                    .chat-sidebar {
                        width: 100%;
                        border-right: none;
                    }

                    .chat-main {
                        width: 100%;
                    }

                    .mobile-back-btn {
                        display: flex;
                    }

                    .chat-header {
                        height: 64px;
                        padding: var(--spacing-md);
                    }

                    .header-name {
                        font-size: 1rem;
                    }

                    .header-status {
                        font-size: 0.75rem;
                    }

                    .header-actions {
                        gap: 0;
                    }

                    .action-btn {
                        min-width: 40px;
                        min-height: 40px;
                    }

                    .chat-messages {
                        padding: var(--spacing-md);
                    }

                    .message-bubble {
                        max-width: 85%;
                        padding: var(--spacing-sm) var(--spacing-md);
                    }

                    .message-image {
                        max-height: 280px;
                    }

                    .chat-input-area {
                        padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
                    }

                    .input-wrapper {
                        padding: 4px 6px;
                    }

                    .input-action-btn {
                        min-width: 40px;
                        min-height: 40px;
                    }

                    .send-btn-modern {
                        min-width: 40px;
                        min-height: 40px;
                    }

                    .message-input {
                        padding: var(--spacing-sm);
                        min-height: 40px;
                        font-size: 0.95rem;
                    }

                    .attachment-preview-bar {
                        padding: var(--spacing-sm) var(--spacing-md);
                    }

                    .preview-content {
                        width: 100%;
                    }

                    .preview-filename {
                        max-width: 150px;
                        font-size: 0.8rem;
                    }

                    .preview-thumbnail {
                        width: 48px;
                        height: 48px;
                    }

                    .sidebar-header {
                        padding: var(--spacing-md);
                    }

                    .sidebar-title {
                        font-size: 1.3rem;
                    }

                    .search-input {
                        min-height: 40px;
                        padding: 10px 10px 10px 38px;
                    }

                    .search-icon {
                        left: 12px;
                        size: 18px;
                    }

                    .conversation-item {
                        padding: var(--spacing-sm) var(--spacing-md);
                        min-height: 60px;
                    }

                    .avatar-wrapper {
                        width: 48px;
                        height: 48px;
                    }

                    .user-avatar {
                        width: 48px;
                        height: 48px;
                    }

                    .avatar-placeholder {
                        width: 48px;
                        height: 48px;
                        font-size: 1.2rem;
                    }

                    .user-name {
                        font-size: 0.95rem;
                    }

                    .last-message {
                        font-size: 0.85rem;
                    }

                    .welcome-icon-box {
                        width: 80px;
                        height: 80px;
                    }

                    .welcome-title {
                        font-size: 1.3rem;
                    }

                    .welcome-desc {
                        font-size: 0.9rem;
                    }

                    .file-name {
                        font-size: 0.8rem;
                    }

                    .message-file-link {
                        min-width: 180px;
                        padding: var(--spacing-sm);
                    }

                    .file-icon-box {
                        width: 36px;
                        height: 36px;
                    }
                }

                @media (max-width: 480px) {
                    .chat-header {
                        height: 56px;
                        padding: var(--spacing-sm);
                    }

                    .header-avatar,
                    .header-avatar-placeholder {
                        width: 36px;
                        height: 36px;
                    }

                    .header-name {
                        font-size: 0.95rem;
                    }

                    .header-status {
                        display: none;
                    }

                    .action-btn {
                        min-width: 36px;
                        min-height: 36px;
                    }

                    .message-bubble {
                        max-width: 90%;
                    }

                    .chat-input-area {
                        padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-sm);
                    }

                    .input-wrapper {
                        border-radius: var(--radius-lg);
                    }

                    .input-action-btn {
                        min-width: 36px;
                        min-height: 36px;
                    }

                    .send-btn-modern {
                        min-width: 36px;
                        min-height: 36px;
                    }

                    .message-input {
                        padding: var(--spacing-xs) var(--spacing-sm);
                        font-size: 0.9rem;
                    }
                }

                @media (min-width: 769px) {
                    .mobile-back-btn {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
