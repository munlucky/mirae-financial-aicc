import React from 'react';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT'
}

export enum VoiceState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  PAUSED = 'PAUSED',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE'
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  confidence?: 'high' | 'medium' | 'low'; // AI only
  hasAudio?: boolean; // AI only
  quickReplies?: string[]; // AI only
  isReference?: boolean;
  read?: boolean; // Read receipt
  attachment?: {
    name: string;
    type: 'image' | 'file';
    url?: string;
  };
}

export interface ChatSession {
  id: string;
  avatar: string; // emoji or url
  title: string;
  preview: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'completed' | 'waiting';
}

export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}