export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      call_logs: {
        Row: {
          id: string
          conversation_id: string
          caller_id: string
          callee_id: string
          status: string
          started_at: string
          answered_at: string | null
          ended_at: string | null
          duration_seconds: number | null
        }
        Insert: {
          id?: string
          conversation_id: string
          caller_id: string
          callee_id: string
          status?: string
          started_at?: string
          answered_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
        }
        Update: {
          id?: string
          conversation_id?: string
          caller_id?: string
          callee_id?: string
          status?: string
          started_at?: string
          answered_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_caller_id_fkey"
            columns: ["caller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_callee_id_fkey"
            columns: ["callee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          contact_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_contact_user_id_fkey"
            columns: ["contact_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          left_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string | null
          type: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_read_receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
          type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
          type?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          is_banned: boolean
          is_system_admin: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          email: string
          id: string
          is_banned?: boolean
          is_system_admin?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          is_banned?: boolean
          is_system_admin?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_room_member: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: undefined
      }
      delete_room: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
      find_direct_conversation: {
        Args: { p_other_user_id: string }
        Returns: string
      }
      get_user_conversations: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          created_by: string
          id: string
          last_message_at: string
          last_message_content: string
          last_message_sender_id: string
          last_message_type: string
          members: Json
          name: string
          type: string
          unread_count: number
        }[]
      }
      mark_messages_read: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
      remove_room_member: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']

export type Profile = Tables<'profiles'>
export type Conversation = Tables<'conversations'>
export type ConversationMember = Tables<'conversation_members'>
export type Message = Tables<'messages'>
export type MessageReadReceipt = Tables<'message_read_receipts'>

export interface ConversationWithDetails {
  id: string
  type: string
  name: string | null
  avatar_url: string | null
  created_at: string
  created_by: string | null
  last_message_content: string | null
  last_message_at: string | null
  last_message_sender_id: string | null
  last_message_type: string | null
  unread_count: number
  members: MemberInfo[]
}

export interface MemberInfo {
  user_id: string
  display_name: string
  avatar_url: string | null
  email: string
  role: string
}

// File message types
export interface FileMessageContent {
  url: string
  name: string
  size: number
  mimeType: string
}

export function parseFileContent(content: string): FileMessageContent | null {
  try {
    const parsed = JSON.parse(content)
    if (parsed && parsed.url && parsed.name) return parsed as FileMessageContent
    return null
  } catch {
    return null
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

// Call types
export type CallStatus = 'idle' | 'outgoing_ringing' | 'incoming_ringing' | 'connecting' | 'connected' | 'ended'

export interface CallParticipant {
  id: string
  displayName: string
  avatarUrl: string | null
  status: 'ringing' | 'connecting' | 'connected' | 'left'
}

export type CallEndReason = 'rejected' | 'busy' | 'no_answer' | 'failed' | null

export interface CallState {
  status: CallStatus
  conversationId: string | null
  callLogId: string | null
  remoteUser: { id: string; displayName: string; avatarUrl: string | null } | null
  isMuted: boolean
  isSpeaker: boolean
  startedAt: number | null
  isGroup: boolean
  participants: Map<string, CallParticipant>
  endReason: CallEndReason
}
