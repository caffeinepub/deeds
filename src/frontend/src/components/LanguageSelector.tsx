import { useState } from 'react';
import { Globe, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './ui/dialog';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
] as const;

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find((l) => l.code === language);

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode as any);
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-2 relative z-10"
        onClick={() => setIsOpen(true)}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage?.flag}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199]" onClick={() => setIsOpen(false)} />
        <DialogContent className="sm:max-w-[400px] z-[200] bg-white">
          <DialogClose 
            className="absolute right-4 top-4 rounded-full opacity-90 ring-offset-background transition-all hover:opacity-100 hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-[210] cursor-pointer p-2 w-10 h-10 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Select Language
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 py-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-accent ${
                  language === lang.code ? 'bg-accent border-2 border-primary' : 'border-2 border-transparent'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto text-primary font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

