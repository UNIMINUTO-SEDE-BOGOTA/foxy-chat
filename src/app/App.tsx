import { useState, useEffect } from "react";
import { WelcomeAnimation } from "./components/WelcomeAnimation";
import { ChatSidebar } from "./components/ChatSidebar";
import { MobileSidebar } from "./components/MobileSidebar";
import { ChatPanel } from "./components/ChatPanel";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "Nueva conversación",
      timestamp: new Date(),
      preview: "Inicia una conversación con el asistente...",
    },
  ]);
  const [activeChat, setActiveChat] = useState("1");

  useEffect(() => {
    // Aplicar el tema al documento
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "Nueva conversación",
      timestamp: new Date(),
      preview: "Inicia una nueva conversación...",
    };
    setChats([newChat, ...chats]);
    setActiveChat(newChat.id);
  };

  const handleDeleteChat = (id: string) => {
    setChats(chats.filter((chat) => chat.id !== id));
    if (activeChat === id && chats.length > 1) {
      const remainingChats = chats.filter((chat) => chat.id !== id);
      setActiveChat(remainingChats[0].id);
    }
  };

  if (showWelcome) {
    return <WelcomeAnimation onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
      />
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        chats={chats}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
      />
      <ChatPanel 
        key={activeChat} 
        chatId={activeChat}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />
    </div>
  );
}