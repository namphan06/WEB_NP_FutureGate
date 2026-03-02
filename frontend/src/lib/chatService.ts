import { supabase, type Conversation, type Message } from './supabase';

export class ChatService {
    static async getConversations() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        try {
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            const conversations = data as Conversation[];

            // Enriched with user and job info
            const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
                const otherUserId = conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id;

                // Get profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', otherUserId)
                    .maybeSingle();

                conv.otherUserName = profile?.full_name || 'Người dùng';
                conv.otherUserAvatar = profile?.avatar_url;

                // Get unread count
                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conv.id)
                    .neq('sender_id', user.id)
                    .eq('is_read', false);

                conv.unreadCount = count || 0;

                return conv;
            }));

            return enrichedConversations;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    }

    static async getMessages(conversationId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .eq('is_deleted', false)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const messages = data as Message[];
            return messages.map(msg => ({
                ...msg,
                isSentByMe: msg.sender_id === user.id
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    static async sendMessage(params: {
        conversationId: string;
        content: string;
        messageType?: string;
        attachmentUrl?: string;
        attachmentName?: string;
        attachmentSize?: number;
    }) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        try {
            // Get user role for sender_type
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            const senderType = profile?.role || 'candidate';

            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: params.conversationId,
                    sender_id: user.id,
                    sender_type: senderType,
                    content: params.content,
                    message_type: params.messageType || 'text',
                    attachment_url: params.attachmentUrl,
                    attachment_name: params.attachmentName,
                    attachment_size: params.attachmentSize,
                })
                .select()
                .single();

            if (error) throw error;

            // Update conversation last message
            await supabase
                .from('conversations')
                .update({
                    last_message: params.content,
                    last_message_at: new Date().toISOString(),
                    last_message_sender_id: user.id
                })
                .eq('id', params.conversationId);

            return data as Message;
        } catch (error) {
            console.error('Error sending message:', error);
            return null;
        }
    }

    static async getOrCreateConversation(otherUserId: string, otherUserType: string, jobId?: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        try {
            // Check existing
            const { data: existing } = await supabase
                .from('conversations')
                .select('*')
                .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`)
                .maybeSingle();

            if (existing) {
                // Update job if needed
                if (jobId && existing.job_id !== jobId) {
                    await supabase.from('conversations').update({ job_id: jobId }).eq('id', existing.id);
                }
                return existing as Conversation;
            }

            // Create new
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            const myRole = profile?.role || 'candidate';

            const { data, error } = await supabase
                .from('conversations')
                .insert({
                    participant1_id: user.id,
                    participant1_type: myRole,
                    participant2_id: otherUserId,
                    participant2_type: otherUserType,
                    job_id: jobId,
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;
            return data as Conversation;
        } catch (error) {
            console.error('Error in getOrCreateConversation:', error);
            return null;
        }
    }

    static async uploadFile(file: File) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('chat_attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat_attachments')
                .getPublicUrl(filePath);

            return {
                url: publicUrl,
                name: file.name,
                size: file.size,
                type: file.type.startsWith('image/') ? 'image' : 'file'
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    }

    static async markAsRead(conversationId: string) {

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .neq('sender_id', user.id);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }
}
