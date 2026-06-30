'use client';

// Standalone preview — renders the full Hub chat UI without auth
// Access: http://localhost:3001/preview-chat

import React from 'react';
import ChatPage from '../hub/assistente-ia/page';

export default function PreviewChatPage() {
  return (
    <div className="h-screen p-4 bg-[#EBEBED]">
      <ChatPage />
    </div>
  );
}
