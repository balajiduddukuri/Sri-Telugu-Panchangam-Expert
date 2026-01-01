
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, MapPin, Search, Info, Moon, Sun, 
  ShieldAlert, Sparkles, CheckCircle, ExternalLink, Clock, 
  Eye, Contrast, Accessibility, User, 
  ArrowRight, BookOpen, HeartPulse, ChevronLeft, ChevronRight,
  Briefcase, Target, Volume2, VolumeX, Settings, X, HelpCircle, Languages, Globe,
  Flame, Waves
} from 'lucide-react';
import { fetchPanchangData, fetchMonthHighlights } from './services/geminiService';
import { PanchangData, TimingInfo, AppLanguage, PanchangRegion } from './types';

const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  telugu: {
    appTitle: 'శ్రీ పంచాంగం',
    scanMessage: 'శుభం భూయాత్',
    divineTone: 'దినచర్య సారాంశం',
    strategy: 'దైవ ప్రణాళిక',
    inauspicious: 'అశుభ సమయాలు',
    auspicious: 'శుభ సమయాలు',
    sources: 'ఆధార గ్రంథాలు',
    settings: 'సెట్టింగులు',
    docs: 'జ్యోతిష్య మార్గదర్శి',
    month: 'మాసం',
    era: 'సంవత్సరం',
    tithi: 'తిథి',
    nakshatra: 'నక్షత్రం',
    sunrise: 'సూర్యోదయం',
    sunset: 'సూర్యాస్తమయం',
  },
  tamil: {
    appTitle: 'ஸ்ரீ பஞ்சாங்கம்',
    scanMessage: 'சுபம் உண்டாகட்டும்',
    divineTone: 'நாள் சுருக்கம்',
    strategy: 'தெய்வீக வியூகம்',
    inauspicious: 'அசுப நேரங்கள்',
    auspicious: 'சுப நேரங்கள்',
    sources: 'ஆதாரங்கள்',
    settings: 'அமைப்புகள்',
    docs: 'சோதிட கையேடு',
    month: 'மாதம்',
    era: 'ஆண்டு',
    tithi: 'திதி',
    nakshatra: 'நட்சத்திரம்',
    sunrise: 'சூரியோதயம்',
    sunset: 'சூரிய அஸ்தமனம்',
  },
  hindi: {
    appTitle: 'श्री पंचांग',
    scanMessage: 'शुभं भूयात्',
    divineTone: 'दैनिक सारांश',
    strategy: 'दैवीय रणनीति',
    inauspicious: 'अशुभ समय',
    auspicious: 'शुभ समय',
    sources: 'प्रामाणिक स्रोत',
    settings: 'सेटिंग्स',
    docs: 'ज्योतिष मार्गदर्शिका',
    month: 'मास',
    era: 'संवत्',
    tithi: 'तिथि',
    nakshatra: 'नक्षत्र',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्तम',
  },
  english: {
    appTitle: 'Sri Panchang',
    scanMessage: 'Auspicious Scanning',
    divineTone: 'Divine Tone',
    strategy: 'Divine Strategy',
    inauspicious: 'Inauspicious Times',
    auspicious: 'Auspicious Times',
    sources: 'Sources',
    settings: 'Settings',
    docs: 'Vedic Documentation',
    month: 'Month',
    era: 'Era',
    tithi: 'Tithi',
    nakshatra: 'Nakshatra',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
  }
};

type ThemeType = 'executive' | 'temple' | 'godavari' | 'parchment' | 'tirumala' | 'highContrast';

interface ThemeConfig {
  nameTe: string; bg: string; card: string; text: string; accent: string; secondary: string; border: string; timelineBg: string; pattern: string; heroGlow: string; glowClass?: string; icon: React.ReactNode;
}

const THEMES: Record<ThemeType, ThemeConfig> = {
  executive: { nameTe: 'Executive', bg: 'bg-[#f4f4f7]', card: 'bg-[#ffffff]', text: 'text-black', accent: '#e67e22', secondary: '#3498db', border: 'border-black border-[4px]', timelineBg: 'from-[#e67e22] via-black to-[#3498db]', pattern: 'pattern-stripes opacity-10', heroGlow: 'from-[#e67e22]/5 to-[#3498db]/5', glowClass: 'executive-glow-text', icon: <Briefcase /> },
  temple: { nameTe: 'Temple', bg: 'bg-[#1a1310]', card: 'bg-[#2a1d18]', text: 'text-[#fdfcf0]', accent: '#ff9933', secondary: '#ffd700', border: 'border-[#4a2c20] border-[1px]', timelineBg: 'from-[#4a2c20] via-[#ff9933] to-[#ffd700]', pattern: 'pattern-dots opacity-20', heroGlow: 'from-[#ff9933]/15 to-transparent', icon: <Flame /> },
  godavari: { nameTe: 'Godavari', bg: 'bg-[#eef5f3]', card: 'bg-white', text: 'text-[#1d3d3a]', accent: '#2a9d8f', secondary: '#e9c46a', border: 'border-[#2a9d8f]/20', timelineBg: 'from-[#2a9d8f] via-white to-[#e9c46a]', pattern: 'pattern-dots opacity-5', heroGlow: 'from-[#2a9d8f]/10 to-[#e9c46a]/10', icon: <Waves /> },
  parchment: { nameTe: 'Library', bg: 'bg-[#f2e8cf]', card: 'bg-[#fdfcf0]', text: 'text-[#3d405b]', accent: '#811d10', secondary: '#4d4d4d', border: 'border-[#3d405b]/10 border-b-4', timelineBg: 'from-[#811d10] via-[#f2e8cf] to-[#3d405b]', pattern: 'pattern-stripes opacity-5', heroGlow: 'from-[#811d10]/5 to-transparent', icon: <BookOpen /> },
  tirumala: { nameTe: 'Tirumala', bg: 'bg-[#2d0a31]', card: 'bg-[#3e0f42]', text: 'text-white', accent: '#f3ce7e', secondary: '#ffffff', border: 'border-[#f3ce7e]/40 border-[2px]', timelineBg: 'from-[#2d0a31] via-[#f3ce7e] to-white', pattern: 'pattern-dots opacity-20', heroGlow: 'from-[#f3ce7e]/20 to-transparent', icon: <Sparkles /> },
  highContrast: { nameTe: 'Accessible', bg: 'bg-[#000000]', card: 'bg-[#000000]', text: 'text-white', accent: '#ffff00', secondary: '#00ffff', border: 'border-white border-2', timelineBg: 'from-white via-[#ffff00] to-white', pattern: 'pattern-stripes opacity-30', heroGlow: 'from-white/5 to-white/5', icon: <Accessibility /> }
};

/**
 * COMPONENTS
 */

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; theme: ThemeConfig }> = ({ isOpen, onClose, title, children, theme }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 backdrop-blur-3xl bg-black/80 animate-in fade-in duration-300">
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto ${theme.card} ${theme.text} ${theme.border} rounded-[40px] md:rounded-[64px] shadow-[0_0_100px_rgba(0,0,0,0.5)] p-8 md:p-16`}>
        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-black/10 rounded-full transition-all" aria-label="Close Modal"><X className="w-8 h-8" /></button>
        <h2 className={`text-3xl md:text-5xl font-black mb-12 tracking-tighter uppercase ${theme.glowClass || ''}`}>{title}</h2>
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>('executive');
  const [language, setLanguage] = useState<AppLanguage>('telugu');
  const [region, setRegion] = useState<PanchangRegion>('andhra');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('Hyderabad, Telangana');
  const [coords, setCoords] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [data, setData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const cur = THEMES[theme];
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
    }
  }, []);

  const handleFetch = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPanchangData(date, location, language, region, coords);
      setData(res);
      announceToSR('Synchronization complete.');
    } catch (e) {
      setError('Alignment failure.');
    } finally {
      setLoading(false);
    }
  }, [date, location, language, region, coords]);

  useEffect(() => { handleFetch(); }, [handleFetch]);

  return (
    <div className={`min-h-screen ${cur.bg} ${cur.text} transition-all duration-1000 font-sans pb-20`} data-theme={theme}>
      <header className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-3xl border-b transition-all py-3 md:py-0 md:h-24 ${theme === 'executive' ? 'bg-white/80 border-black' : 'bg-black/40 border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-10 h-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className={`p-2.5 rounded-xl border shadow-inner ${theme === 'executive' ? 'bg-black text-white' : 'bg-white/5'}`}><Globe className="w-5 h-5 md:w-8 md:h-8" /></div>
            <div className="text-left">
              <span className={`font-black text-lg md:text-2xl uppercase tracking-tighter ${cur.glowClass || ''}`}>{t.appTitle}</span>
              <p className="text-[8px] font-black uppercase tracking-[3px] opacity-40">VEDIC SYSTEMS</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 p-1.5 rounded-2xl border w-full md:max-w-[400px] ${theme === 'executive' ? 'bg-black/5 border-black/20' : 'bg-white/5 border-white/10'}`}>
            <MapPin className="w-4 h-4 ml-2 opacity-30" />
            <input aria-label="Target Location" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City..." className="bg-transparent text-sm px-2 py-2 outline-none w-full font-black" />
            <button onClick={handleFetch} className={`px-4 py-2 rounded-xl font-black ${theme === 'executive' ? 'bg-black text-white' : 'bg-white text-black'}`}><Search className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
             <button onClick={() => setIsDocsOpen(true)} className="p-3 rounded-xl border opacity-70 hover:opacity-100 transition-all" aria-label="Documentation"><HelpCircle className="w-5 h-5" /></button>
             <button onClick={() => setIsSettingsOpen(true)} className="p-3 rounded-xl border opacity-70 hover:opacity-100 transition-all" aria-label="Settings"><Settings className="w-5 h-5" /></button>
             <button onClick={() => {
                const seq: ThemeType[] = ['executive', 'temple', 'godavari', 'tirumala'];
                setTheme(seq[(seq.indexOf(theme) + 1) % seq.length]);
             }} className="p-3 rounded-xl border opacity-70 hover:opacity-100 transition-all" aria-label="Switch Theme">{cur.icon}</button>
          </div>
        </div>
      </header>

      <main id="main-content" className="pt-48 md:pt-24">
        <section className="relative h-[400px] flex items-center justify-center text-center px-6">
          <div className={`absolute inset-0 ${cur.bg} ${cur.pattern} opacity-20`}></div>
          <div className="relative z-10 max-w-4xl">
            <h1 className={`text-5xl md:text-[8rem] font-black tracking-tighter leading-none mb-6 ${cur.glowClass || ''}`}>{t.appTitle}</h1>
            <p className="text-xl md:text-3xl font-black uppercase tracking-widest opacity-60">Global Vedic Authority</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-10 py-24 space-y-24">
          {loading && !data && (
            <div className="flex flex-col items-center py-64 space-y-12">
              <div className={`w-24 h-24 rounded-full border-4 border-t-transparent animate-spin ${theme === 'executive' ? 'border-black' : 'border-current'}`} />
              <p className={`text-4xl md:text-6xl font-black tracking-[20px] uppercase ${cur.glowClass || ''}`}>{t.scanMessage}</p>
            </div>
          )}

          {data && (
            <div className="animate-in fade-in slide-in-from-bottom-20 duration-1000 space-y-24">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <NFTCard label={t.month} te={t.month} val={data.basicDetails.maasam} icon={<Target/>} color="from-orange-500 to-red-600" theme={cur} />
                <NFTCard label={t.tithi} te={t.tithi} val={data.basicDetails.tithi} icon={<Sparkles/>} color="from-blue-600 to-indigo-600" theme={cur} />
                <NFTCard label={t.nakshatra} te={t.nakshatra} val={data.basicDetails.nakshatra} icon={<Moon/>} color="from-amber-400 to-orange-500" theme={cur} />
                <NFTCard label={t.era} te={t.era} val={data.basicDetails.samvat} icon={<Clock/>} color="from-slate-500 to-black" theme={cur} />
              </div>

              <section className={`${cur.card} p-12 rounded-[64px] border ${cur.border} shadow-2xl overflow-hidden group`}>
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className={`p-8 rounded-[40px] shadow-inner ${theme === 'executive' ? 'bg-black text-white' : 'bg-white/10'}`}><Info className="w-12 h-12" /></div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-black text-[12px] uppercase tracking-[12px] opacity-40 mb-4">{t.divineTone}</h3>
                    <p className={`text-3xl md:text-5xl font-black leading-tight telugu-robust ${cur.glowClass || ''}`}>{data.spiritualSummary}</p>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <TimingGrid title={t.auspicious} icon={<CheckCircle className="w-10 h-10 text-emerald-500" />} timings={data.auspiciousTimings} theme={cur} />
                <TimingGrid title={t.inauspicious} icon={<ShieldAlert className="w-10 h-10 text-rose-500" />} timings={data.inauspiciousTimings} theme={cur} />
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title={t.settings} theme={cur}>
        <div className="space-y-12">
          <section>
            <h3 className="text-xl font-black mb-6 uppercase tracking-widest flex items-center gap-4"><Languages className="w-6 h-6" /> App Language</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['telugu', 'tamil', 'hindi', 'english'] as AppLanguage[]).map(lang => (
                <button key={lang} onClick={() => setLanguage(lang)} className={`px-6 py-4 rounded-2xl border-2 font-black transition-all ${language === lang ? 'bg-current text-black' : 'hover:bg-black/5'}`}>{lang.toUpperCase()}</button>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-xl font-black mb-6 uppercase tracking-widest flex items-center gap-4"><Globe className="w-6 h-6" /> Calendar Tradition</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'andhra', name: 'Andhra/Telangana (Amanta)' },
                { id: 'tamilnadu', name: 'Tamil Nadu (Solar/Vakya)' },
                { id: 'north', name: 'North India (Purnimanta)' }
              ].map(reg => (
                <button key={reg.id} onClick={() => setRegion(reg.id as PanchangRegion)} className={`px-6 py-4 rounded-2xl border-2 font-black transition-all ${region === reg.id ? 'bg-current text-black' : 'hover:bg-black/5'}`}>{reg.name}</button>
              ))}
            </div>
          </section>
        </div>
      </Modal>

      <Modal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} title={t.docs} theme={cur}>
        <div className="space-y-10 prose prose-invert max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-10 rounded-[40px] border-2 bg-black/5">
              <h4 className="text-2xl font-black mb-6 uppercase">Regional Calendars</h4>
              <p className="opacity-70 leading-relaxed">Vedic timekeeping varies by region. <strong>Amanta</strong> (South) ends months on New Moon, while <strong>Purnimanta</strong> (North) ends on Full Moon. The <strong>Tamil</strong> system uses a Solar cycle relative to the Sun's transit through constellations.</p>
            </div>
            <div className="p-10 rounded-[40px] border-2 bg-black/5">
              <h4 className="text-2xl font-black mb-6 uppercase">Key Astral Points</h4>
              <ul className="space-y-4 opacity-70">
                <li><strong>Rahu Kalam:</strong> A 90-min period to avoid starting new ventures.</li>
                <li><strong>Abhijit Muhurta:</strong> The most powerful 48 mins for victory.</li>
                <li><strong>Brahma Muhurta:</strong> Optimal for meditation (96 mins before dawn).</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      <footer className="text-center py-24 border-t opacity-40 uppercase tracking-[10px] font-black text-[12px]">{t.appTitle} • GLOBAL VEDIC AUTHORITY</footer>
    </div>
  );
};

const NFTCard = ({ label, val, icon, color, theme }: any) => (
  <article className={`p-8 rounded-[40px] border-2 ${theme.card} flex flex-col justify-between h-56 transition-all hover:scale-105`}>
    <div className="flex justify-between items-start">
      <div className="p-4 rounded-2xl bg-black/5">{icon}</div>
      <div className="text-right">
        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black leading-tight mt-1">{val}</p>
      </div>
    </div>
    <div className={`h-1.5 w-full bg-gradient-to-r ${color} rounded-full opacity-40`} />
  </article>
);

const TimingGrid = ({ title, icon, timings, theme }: any) => (
  <section className={`${theme.card} rounded-[56px] border ${theme.border} overflow-hidden shadow-xl`}>
    <div className="px-10 py-10 flex items-center gap-6 border-b-2">
      {icon}
      <h3 className="text-2xl font-black uppercase tracking-widest">{title}</h3>
    </div>
    <div className="divide-y-2">
      {timings.map((t: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-8 hover:bg-black/5 transition-all">
          <div className="flex-1">
            <p className="text-2xl font-black leading-snug telugu-robust">{t.nameTe}</p>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-1">{t.nameEn}</p>
          </div>
          <span className="font-mono text-xl font-black px-6 py-3 rounded-2xl border-2 bg-white/5 whitespace-nowrap">{t.time}</span>
        </div>
      ))}
    </div>
  </section>
);

const announceToSR = (msg: string) => { const el = document.getElementById('aria-announcer'); if (el) el.textContent = msg; };

export default App;
