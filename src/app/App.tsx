// src/app/App.tsx
import { useState, useEffect } from "react";
import { WelcomeAnimation } from "./components/WelcomeAnimation";
import { ChatSidebar } from "./components/ChatSidebar";
import { MobileSidebar } from "./components/MobileSidebar";
import { ChatPanel } from "./components/ChatPanel";
import { TourGuide } from "./components/Tourguide"
import { useN8nChat } from "../hooks/useN8nChat";
import { createNewChat } from "../models/chat.model";

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const {
    chats, activeChat, setActiveChat,
    createChat, deleteChat,
    sendMessage, isTyping, activeMessages,
  } = useN8nChat([createNewChat()]);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  if (showWelcome) {
    return <WelcomeAnimation onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
        onNewChat={createChat}
        onDeleteChat={deleteChat}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
        onHelpClick={() => { setShowTour(false); setTimeout(() => setShowTour(true), 50); }}
      />
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        chats={chats}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
        onNewChat={createChat}
        onDeleteChat={deleteChat}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
        onHelpClick={() => { setShowTour(false); setTimeout(() => setShowTour(true), 50); }}
        tourActive={showTour}
      />
      <ChatPanel
        key={activeChat}
        chatId={activeChat}
        messages={activeMessages}
        isTyping={isTyping}
        onSend={sendMessage}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      {/* Tour — controla la sidebar mobile internamente */}
      <TourGuide
        forceOpen={showTour}
        onClose={() => setShowTour(false)}
        onMobileSidebarChange={setIsMobileMenuOpen}
      />
    </div>
  );
}
