'use client';

// Standalone preview — renders the full Hub chat UI without auth
// Access: http://localhost:3001/preview-chat

import React, { Suspense } from 'react';
import ChatPage from '../hub/assistente-ia/page';

export default function PreviewChatPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#EBEBED] text-slate-500 text-sm">Carregando...</div>}>
      <div className="h-screen p-4 bg-[#EBEBED]">
        <ChatPage />
      </div>
    </Suspense>
  );
}
