
import React, { useState, useCallback, useRef } from 'react';
import { AppStatus, DesignStyle, Message } from './types';
import { generateDesignVariant, chatAboutDesign, editDesignWithPrompt } from './services/geminiService';
import ComparisonSlider from './components/ComparisonSlider';
import StyleCarousel from './components/StyleCarousel';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setOriginalImage(base64);
      setGeneratedImage(null);
      setSelectedStyle(null);
      setMessages([]);
      setStatus('ready');
    };
    reader.readAsDataURL(file);
  };

  const handleStyleSelect = async (style: DesignStyle) => {
    if (!originalImage || status === 'generating') return;
    
    setSelectedStyle(style);
    setStatus('generating');
    try {
      const result = await generateDesignVariant(originalImage, style.prompt);
      setGeneratedImage(result);
      setStatus('ready');
      
      const welcomeMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I've reimagined your space in a beautiful ${style.name} style! You can see the comparison above. How do you like the color palette and furniture choices?`,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    } catch (error) {
      console.error(error);
      alert("Failed to generate design. Please check your API key.");
      setStatus('ready');
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Check if it's an edit request (simple heuristic)
      const editKeywords = ['make', 'change', 'add', 'remove', 'replace', 'set', 'filter', 'room', 'design'];
      const isEditRequest = editKeywords.some(word => text.toLowerCase().includes(word)) && generatedImage;

      if (isEditRequest) {
        // Use Gemini 2.5 Flash Image to edit
        const newDesign = await editDesignWithPrompt(generatedImage!, text);
        setGeneratedImage(newDesign);
        
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I've applied those changes for you! Here is the updated design.",
          imageUrl: newDesign,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        // Normal chat with Gemini 3 Pro
        const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
        const response = await chatAboutDesign(text, chatHistory, generatedImage || originalImage || undefined);
        
        let assistantContent = response.text;
        if (response.links && response.links.length > 0) {
          assistantContent += "\n\n**Helpful Links:**\n" + response.links.map(link => `- ${link}`).join('\n');
        }

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I had trouble processing that request. Could you try again?",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight">Lumina Interior</h1>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md active:scale-95"
          >
            New Project
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {!originalImage ? (
          <div className="mt-12 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Reimagine Your Space with AI</h2>
            <p className="text-slate-600 mb-10 text-lg">Upload a photo of any room and watch our AI designer transform it into a masterpiece in seconds.</p>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-3xl p-16 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-all group"
            >
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-900 font-semibold text-xl mb-2">Upload Room Photo</p>
              <p className="text-slate-500">JPG, PNG up to 10MB</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Visual Column */}
            <div className="lg:col-span-7 space-y-8">
              <div className="relative group">
                {generatedImage ? (
                  <ComparisonSlider original={originalImage} generated={generatedImage} />
                ) : (
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200 flex items-center justify-center">
                    <img src={originalImage} alt="Base room" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.2]" />
                    {status === 'generating' ? (
                      <div className="relative z-10 flex flex-col items-center gap-4 bg-white/90 p-8 rounded-2xl shadow-xl backdrop-blur-md">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-center">
                          <p className="font-bold text-slate-800">Transforming your space...</p>
                          <p className="text-xs text-slate-500 mt-1">Lumina is crafting your {selectedStyle?.name} vision.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 bg-white/90 p-6 rounded-2xl shadow-xl backdrop-blur-md text-center">
                        <p className="font-bold text-slate-800 text-lg">Select a Style Below</p>
                        <p className="text-sm text-slate-500">to start your makeover</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <StyleCarousel 
                onSelect={handleStyleSelect} 
                selectedId={selectedStyle?.id} 
                disabled={status === 'generating'} 
              />
            </div>

            {/* Chat Column */}
            <div className="lg:col-span-5">
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isTyping={isTyping} 
              />
              
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Pro Tip</h4>
                  <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                    Try asking for specific details! "Add a large velvet blue sofa" or "Show me industrial lighting options for this ceiling".
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer / Floating Actions */}
      {originalImage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white/80 backdrop-blur-lg border border-slate-200 px-6 py-3 rounded-full shadow-2xl flex items-center gap-6">
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1 group"
              >
                <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Replace</span>
             </button>
             <div className="w-px h-8 bg-slate-200"></div>
             <button 
                className="flex flex-col items-center gap-1 group"
                onClick={() => {
                  if (generatedImage) {
                    const link = document.createElement('a');
                    link.href = generatedImage;
                    link.download = 'lumina-design.png';
                    link.click();
                  }
                }}
              >
                <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Save</span>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
