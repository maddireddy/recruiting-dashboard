import { useState, useEffect, useRef } from 'react';
import { Send, Plus, Search, Users, Hash, AtSign, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import type { ChatChannel, ChatMessage, UserPresence, ChatChannelType } from '../types/staffing';
import { useOrganizationStore } from '../store/organizationStore';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Mock data for development
const mockChannels: ChatChannel[] = [
  {
    id: '1',
    organizationId: 'org-1',
    type: 'organization',
    name: 'general',
    description: 'Organization-wide announcements and updates',
    memberIds: ['user-1', 'user-2', 'user-3'],
    createdBy: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    unreadCount: 3,
  },
  {
    id: '2',
    organizationId: 'org-1',
    type: 'team',
    name: 'recruiting-team',
    description: 'Recruiting team coordination',
    memberIds: ['user-1', 'user-2'],
    createdBy: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    unreadCount: 0,
  },
  {
    id: '3',
    organizationId: 'org-1',
    type: 'candidate',
    name: 'John Doe Discussion',
    description: 'Candidate-specific discussion',
    memberIds: ['user-1', 'user-2'],
    candidateId: 'cand-123',
    createdBy: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    unreadCount: 1,
  },
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    channelId: '1',
    senderId: 'user-1',
    senderName: 'Sarah Johnson',
    senderAvatar: undefined,
    type: 'text',
    content: 'Hey team! We have 5 new candidates to review for the Software Engineer role.',
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    channelId: '1',
    senderId: 'user-2',
    senderName: 'Mike Chen',
    type: 'text',
    content: 'Great! I\'ll start reaching out to them this afternoon.',
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

const mockPresence: UserPresence[] = [
  {
    userId: 'user-1',
    userName: 'Sarah Johnson',
    status: 'online',
    lastSeen: new Date().toISOString(),
    currentActivity: 'Reviewing candidates',
  },
  {
    userId: 'user-2',
    userName: 'Mike Chen',
    status: 'busy',
    lastSeen: new Date().toISOString(),
    currentActivity: 'In a call',
  },
  {
    userId: 'user-3',
    userName: 'Emily Davis',
    status: 'away',
    lastSeen: new Date(Date.now() - 900000).toISOString(),
  },
];

export default function InternalChatPage() {
  const [channels, setChannels] = useState<ChatChannel[]>(mockChannels);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(channels[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>(mockPresence);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { organization } = useOrganizationStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      channelId: selectedChannel.id,
      senderId: 'current-user',
      senderName: 'You',
      type: 'text',
      content: newMessage,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const getChannelIcon = (type: ChatChannelType) => {
    switch (type) {
      case 'organization':
        return <Hash size={16} />;
      case 'team':
        return <Users size={16} />;
      case 'candidate':
        return <AtSign size={16} />;
      case 'direct':
        return <Users size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChannelMessages = messages.filter((m) => m.channelId === selectedChannel?.id);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <PageHeader
        title="Internal Chat"
        subtitle="Real-time communication with your team"
        actions={
          <Button variant="primary" onClick={() => setShowNewChannelModal(true)}>
            <Plus size={16} />
            <span className="ml-2">New Channel</span>
          </Button>
        }
      />

      <div className="flex flex-1 gap-4 overflow-hidden mt-6">
        {/* Channels Sidebar */}
        <div className="w-80 flex flex-col card h-full">
          <div className="p-4 border-b border-[rgba(var(--app-border-subtle))]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition',
                    selectedChannel?.id === channel.id
                      ? 'bg-[rgba(var(--app-primary),0.15)] text-[rgb(var(--app-text-primary))]'
                      : 'hover:bg-[rgba(var(--app-surface-muted),0.8)] text-[rgb(var(--app-text-secondary))]'
                  )}
                >
                  <div className="text-muted">{getChannelIcon(channel.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{channel.name}</span>
                      {channel.unreadCount! > 0 && (
                        <span className="chip bg-[rgb(var(--app-primary))] text-white text-xs px-2">
                          {channel.unreadCount}
                        </span>
                      )}
                    </div>
                    {channel.description && (
                      <p className="text-xs text-muted truncate">{channel.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Online Users */}
          <div className="border-t border-[rgba(var(--app-border-subtle))] p-4">
            <p className="text-xs uppercase tracking-wider text-muted mb-3">Online Now ({onlineUsers.filter((u) => u.status === 'online').length})</p>
            <div className="space-y-2">
              {onlineUsers.slice(0, 5).map((user) => (
                <div key={user.userId} className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                      {user.userName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className={clsx('absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[rgb(var(--app-surface))]', getStatusColor(user.status))} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.userName}</p>
                    {user.currentActivity && (
                      <p className="text-xs text-muted truncate">{user.currentActivity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col card h-full">
          {selectedChannel ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-[rgba(var(--app-border-subtle))]">
                <div className="flex items-center gap-3">
                  <div className="text-muted">{getChannelIcon(selectedChannel.type)}</div>
                  <div>
                    <h3 className="font-semibold">{selectedChannel.name}</h3>
                    {selectedChannel.description && (
                      <p className="text-sm text-muted">{selectedChannel.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="subtle" size="sm">
                    <Phone size={16} />
                  </Button>
                  <Button variant="subtle" size="sm">
                    <Video size={16} />
                  </Button>
                  <Button variant="subtle" size="sm">
                    <MoreVertical size={16} />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {currentChannelMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {message.senderName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-sm">{message.senderName}</span>
                          <span className="text-xs text-muted">{formatTime(message.createdAt)}</span>
                        </div>
                        <div className="text-sm text-[rgb(var(--app-text-primary))]">{message.content}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-[rgba(var(--app-border-subtle))] p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={`Message #${selectedChannel.name}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="input w-full pr-24"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button className="p-2 hover:bg-[rgba(var(--app-surface-muted),0.8)] rounded-lg transition">
                        <Paperclip size={18} className="text-muted" />
                      </button>
                      <button className="p-2 hover:bg-[rgba(var(--app-surface-muted),0.8)] rounded-lg transition">
                        <Smile size={18} className="text-muted" />
                      </button>
                    </div>
                  </div>
                  <Button variant="primary" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted">
              <p>Select a channel to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
