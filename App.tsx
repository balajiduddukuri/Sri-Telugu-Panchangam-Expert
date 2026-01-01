
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Calendar as CalendarIcon, MapPin, Search, Loader2, Info, Moon, Sun, 
  ShieldAlert, Sparkles, CheckCircle, ExternalLink, Clock, 
  Navigation, Eye, Contrast, Accessibility, Palette, User, 
  Share2, ArrowRight, BookOpen, HeartPulse, Zap, ChevronLeft, ChevronRight,
  AlertTriangle, Check, Briefcase, Target, Volume2, VolumeX, Droplets, Flame, Waves, Wind
} from 'lucide-react';
import { fetchPanchangData, fetchMonthHighlights } from './services/geminiService';
import { PanchangData, TimingInfo } from './types';

/**
 * THEME DEFINITIONS - SPIRITUAL PRODUCT DESIGN
 */
type ThemeType = 'executive' | 'temple' | 'godavari' | 'parchment' | 'tirumala' | 'highContrast';

interface ThemeConfig {
  nameTe: string;
  nameEn: string;
  bg: string;
  card: string;
  text: string;
  accent: string;
  secondary: string;
  border: string;
  timelineBg: string;
  pattern: string;
  heroGlow: string;
  glowClass?: string;
  icon: React.ReactNode;
}

const THEMES: Record<ThemeType, ThemeConfig> = {
  executive: {
    nameTe: 'కార్యనిర్వాహక',
    nameEn: 'Executive',
    bg: 'bg-[#f4f4f7]',
    card: 'bg-[#ffffff]', 
    text: 'text-black',
    accent: '#e67e22',
    secondary: '#3498db',
    border: 'border-black border-[4px]',
    timelineBg: 'from-[#e67e22] via-black to-[#3498db]',
    pattern: 'pattern-stripes opacity-10',
    heroGlow: 'from-[#e67e22]/5 to-[#3498db]/5',
    glowClass: 'executive-glow-text',
    icon: <Briefcase />
  },
  temple: {
    nameTe: 'గర్భాలయం',
    nameEn: 'Temple Sanctum',
    bg: 'bg-[#1a1310]', // Deep Cinder
    card: 'bg-[#2a1d18]', 
    text: 'text-[#fdfcf0]',
    accent: '#ff9933', // Deep Saffron
    secondary: '#ffd700', // Lamp Gold
    border: 'border-[#4a2c20] border-[1px]',
    timelineBg: 'from-[#4a2c20] via-[#ff9933] to-[#ffd700]',
    pattern: 'pattern-dots opacity-20',
    heroGlow: 'from-[#ff9933]/15 to-transparent',
    icon: <Flame />
  },
  godavari: {
    nameTe: 'గోదావరి తీరం',
    nameEn: 'Godavari Ghats',
    bg: 'bg-[#eef5f3]',
    card: 'bg-white',
    text: 'text-[#1d3d3a]',
    accent: '#2a9d8f', // River Teal
    secondary: '#e9c46a', // Sand Gold
    border: 'border-[#2a9d8f]/20',
    timelineBg: 'from-[#2a9d8f] via-white to-[#e9c46a]',
    pattern: 'pattern-dots opacity-5',
    heroGlow: 'from-[#2a9d8f]/10 to-[#e9c46a]/10',
    icon: <Waves />
  },
  parchment: {
    nameTe: 'గ్రంథాలయం',
    nameEn: 'Vedic Library',
    bg: 'bg-[#f2e8cf]', // Aged Parchment
    card: 'bg-[#fdfcf0]',
    text: 'text-[#3d405b]',
    accent: '#811d10', // Ink Red
    secondary: '#4d4d4d', // Charcoal
    border: 'border-[#3d405b]/10 border-b-4',
    timelineBg: 'from-[#811d10] via-[#f2e8cf] to-[#3d405b]',
    pattern: 'pattern-stripes opacity-5',
    heroGlow: 'from-[#811d10]/5 to-transparent',
    icon: <BookOpen />
  },
  tirumala: {
    nameTe: 'తిరుమల వైభవం',
    nameEn: 'Tirumala Glory',
    bg: 'bg-[#2d0a31]', // Royal Purple
    card: 'bg-[#3e0f42]',
    text: 'text-white',
    accent: '#f3ce7e', // Temple Gold
    secondary: '#ffffff',
    border: 'border-[#f3ce7e]/40 border-[2px]',
    timelineBg: 'from-[#2d0a31] via-[#f3ce7e] to-white',
    pattern: 'pattern-dots opacity-20',
    heroGlow: 'from-[#f3ce7e]/20 to-transparent',
    icon: <Sparkles />
  },
  highContrast: {
    nameTe: 'దృష్టి స్పష్టత',
    nameEn: 'High Contrast',
    bg: 'bg-[#000000]',
    card: 'bg-[#000000]', 
    text: 'text-white',
    accent: '#ffff00',
    secondary: '#00ffff',
    border: 'border-white border-2',
    timelineBg: 'from-white via-[#ffff00] to-white',
    pattern: 'pattern-stripes opacity-30',
    heroGlow: 'from-white/5 to-white/5',
    icon: <Accessibility />
  }
};

/**
 * UTILITIES
 */
const safeParseTimeToMinutes = (timeStr: string): number | null => {
  if (!timeStr) return null;
  const match = timeStr.trim().toUpperCase().match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/);
  if (!match) return null;
  let [_, hours, minutes, period] = match;
  let h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return (h % 24) * 60 + m;
};

const parseTimeRange = (rangeStr: string): { start: number; end: number } | null => {
  const parts = rangeStr.split(/[-–—to]/i);
  if (parts.length < 2) return null;
  const start = safeParseTimeToMinutes(parts[0]);
  const end = safeParseTimeToMinutes(parts[1]);
  if (start === null || end === null) return null;
  return { start, end };
};

const announceToSR = (msg: string) => {
  const el = document.getElementById('aria-announcer');
  if (el) el.textContent = msg;
};

/**
 * COMPONENTS
 */
const CelestialCalendar: React.FC<{ 
  selectedDate: string; 
  onDateSelect: (d: string) => void;
  location: string;
  theme: ThemeConfig;
  themeType: ThemeType;
}> = ({ selectedDate, onDateSelect, location, theme, themeType }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const [highlights, setHighlights] = useState<Record<string, 'auspicious' | 'inauspicious' | 'neutral'>>({});
  const [loading, setLoading] = useState(false);

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  useEffect(() => {
    const fetchHighlights = async () => {
      setLoading(true);
      const data = await fetchMonthHighlights(viewDate.getFullYear(), viewDate.getMonth(), location);
      setHighlights(data);
      setLoading(false);
    };
    fetchHighlights();
  }, [viewDate.getMonth(), viewDate.getFullYear(), location]);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();

  const days = useMemo(() => {
    const arr = [];
    const count = daysInMonth(year, viewDate.getMonth());
    for (let i = 1; i <= count; i++) {
      const dateStr = `${year}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      arr.push({ day: i, date: dateStr });
    }
    return arr;
  }, [viewDate.getMonth(), year]);

  return (
    <section className={`${theme.card} p-10 rounded-[64px] border ${theme.border} shadow-2xl relative mb-16 overflow-hidden`} aria-label="Celestial Calendar View">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
            <CalendarIcon className="w-8 h-8 text-current opacity-80" />
          </div>
          <div>
            <h2 className={`text-3xl font-black tracking-tighter uppercase ${theme.glowClass || ''}`}>{monthName} {year}</h2>
            <p className="text-[10px] font-black uppercase tracking-[5px] opacity-50">Lunar Phase Scanning</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-3xl border border-white/10">
          <button onClick={handlePrevMonth} className="p-3 hover:bg-white/10 rounded-2xl transition-all" aria-label="Previous Month">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="h-6 w-px bg-white/10" />
          <button onClick={handleNextMonth} className="p-3 hover:bg-white/10 rounded-2xl transition-all" aria-label="Next Month">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 md:gap-6 mb-8">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest opacity-40 py-4">{d}</div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square opacity-0" />
        ))}
        {days.map(({ day, date }) => {
          const isSelected = date === selectedDate;
          const status = highlights[date] || 'neutral';
          const isAuspicious = status === 'auspicious';
          const isInauspicious = status === 'inauspicious';

          return (
            <button
              key={date}
              onClick={() => onDateSelect(date)}
              className={`
                relative aspect-square rounded-[32px] flex flex-col items-center justify-center transition-all group border-2
                ${isSelected 
                  ? 'bg-current text-black scale-105 shadow-2xl' 
                  : 'bg-white/5 border-transparent hover:border-white/20'
                }
              `}
              style={isSelected ? { color: theme.accent, backgroundColor: theme.accent, color: (themeType === 'temple' || themeType === 'tirumala') ? 'black' : '' } : {}}
            >
              <span className={`text-xl font-black ${isSelected ? 'text-black' : ''}`}>{day}</span>
              <div className="flex gap-1 mt-2">
                {isAuspicious && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-emerald-500'} animate-pulse`} />}
                {isInauspicious && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-rose-500'}`} />}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

const Hero = ({ theme, themeType }: { theme: ThemeConfig, themeType: ThemeType }) => {
  const [timeGreet, setTimeGreet] = useState('');
  
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setTimeGreet('సుప్రభాతం (Morning)');
    else if (hr < 17) setTimeGreet('శుభ మధ్యాహ్నం (Afternoon)');
    else setTimeGreet('సాయం సంధ్య (Evening)');
  }, []);

  return (
    <section className="relative h-[560px] overflow-hidden rounded-b-[80px] shadow-2xl" aria-label="Hero">
      <div className={`absolute inset-0 ${theme.bg} overflow-hidden`}>
        <div className={`absolute inset-0 opacity-40 bg-gradient-to-br ${theme.heroGlow}`}></div>
        <div className={`absolute inset-0 ${theme.pattern} animate-pulse`}></div>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 max-w-5xl mx-auto">
        <div className={`backdrop-blur-xl px-10 py-4 rounded-full border mb-10 flex items-center gap-5 shadow-xl transition-all ${themeType === 'executive' ? 'bg-black border-black text-white' : 'bg-white/5 border-white/10'}`}>
          <Target className={`w-6 h-6 animate-pulse`} style={{ color: theme.accent }} />
          <span className="text-[12px] font-black uppercase tracking-[8px]">
            {timeGreet} • {theme.nameEn} Mood
          </span>
        </div>
        <h1 className={`text-8xl md:text-[10rem] font-black mb-8 tracking-tighter drop-shadow-2xl leading-none ${theme.glowClass || ''}`}>
          శ్రీ <span className="opacity-90">పంచాంగం</span>
        </h1>
        <p className={`text-xl md:text-3xl ${themeType === 'executive' ? 'text-black font-black uppercase tracking-tight' : 'opacity-80 font-medium italic'} max-w-3xl leading-relaxed pl-8 ml-8 border-l-4`} style={{ borderLeftColor: theme.accent }}>
          Connecting Ancient Astral Cycles with Modern Precision.
        </p>
      </div>
    </section>
  );
};

const NFTCard: React.FC<{ label: string; te: string; val: string; icon: React.ReactNode; color: string; theme: ThemeConfig; themeType: ThemeType }> = ({ label, te, val, icon, color, theme, themeType }) => (
  <article className={`group relative p-10 backdrop-blur-3xl rounded-[56px] border transition-all hover:scale-[1.05] shadow-2xl overflow-hidden cursor-default ${themeType === 'executive' ? 'bg-white border-black border-4' : theme.card + ' ' + theme.border}`}>
    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color} opacity-40`} />
    <div className="flex items-center justify-between mb-8">
      <div className={`p-5 rounded-[32px] shadow-inner ${themeType === 'executive' ? 'bg-black text-white' : 'bg-white/10 text-current'}`}>
        {icon}
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</p>
        <p className={`font-black text-2xl mt-1 ${theme.glowClass || ''}`}>{te}</p>
      </div>
    </div>
    <div className={`mt-10 pt-8 border-t flex items-end justify-between ${themeType === 'executive' ? 'border-black/5' : 'border-white/5'}`}>
      <span className="font-mono font-black text-3xl tracking-tighter opacity-90">{val}</span>
      <Sparkles className="w-6 h-6 opacity-10 group-hover:opacity-100 transition-opacity" />
    </div>
  </article>
);

const Timeline: React.FC<{ data: PanchangData; selectedDate: string; theme: ThemeConfig; themeType: ThemeType }> = ({ data, selectedDate, theme, themeType }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const curMin = now.getHours() * 60 + now.getMinutes();
  const getP = (m: number) => (Math.min(Math.max(m, 0), 1440) / 1440) * 100;

  return (
    <section className={`${theme.card} p-12 rounded-[64px] border ${theme.border} shadow-2xl relative overflow-visible`} aria-label="Interactive Panchang Timeline">
      <div className="flex items-center justify-between mb-12">
        <h2 className={`text-2xl font-black flex items-center gap-4 ${theme.glowClass || ''}`}>
          <Clock className="w-12 h-12 opacity-80" style={{ color: theme.accent }} />
          దినచర్య టైమ్‌లైన్
        </h2>
        {isToday && (
          <div className={`flex items-center gap-5 px-8 py-4 rounded-full border shadow-2xl ${themeType === 'executive' ? 'bg-black text-white border-black' : 'bg-white/5 border-white/10'}`}>
            <HeartPulse className="w-6 h-6 animate-pulse" style={{ color: theme.accent }} />
            <span className="text-sm font-black uppercase tracking-widest opacity-80">Live Transition: {now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
          </div>
        )}
      </div>

      <div className="relative h-48 mt-16 px-6">
        <div className="absolute top-20 left-0 right-0 h-14 bg-black/5 rounded-full border-2 border-black/10 shadow-inner overflow-hidden">
          <div className={`absolute inset-0 opacity-60 bg-gradient-to-r ${theme.timelineBg}`} />
          <div className={`absolute inset-0 ${theme.pattern} opacity-20`} />
        </div>

        {isToday && (
          <div className="absolute top-0 flex flex-col items-center -ml-8 z-50 pointer-events-none" style={{ left: `${getP(curMin)}%` }}>
            <div className={`text-black text-[11px] font-black px-5 py-2 rounded-full mb-3 shadow-2xl ${themeType === 'executive' ? 'bg-white border-2 border-black' : 'bg-current'}`} style={themeType !== 'executive' ? { backgroundColor: theme.accent } : {}}>NOW</div>
            <div className={`w-10 h-10 rounded-full ring-[12px] ring-black/5 shadow-2xl`} style={{ backgroundColor: theme.accent }} />
            <div className="w-2 h-36 opacity-20 blur-[1px]" style={{ backgroundColor: theme.accent }} />
          </div>
        )}

        {data.inauspiciousTimings.map((t, i) => {
          const r = parseTimeRange(t.time);
          if (!r) return null;
          return (
            <button key={`in-${i}`} className="group absolute top-20 h-14 bg-rose-600/40 hover:bg-rose-500 transition-all z-20 border-x border-white/10 first:rounded-l-full last:rounded-r-full overflow-visible" style={{ left: `${getP(r.start)}%`, width: `${getP(r.end - r.start)}%` }} aria-label={`Inauspicious: ${t.nameEn} during ${t.time}`}>
              <div className="absolute inset-0 pattern-stripes opacity-30" />
              <div className={`hidden group-hover:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-8 p-6 rounded-[32px] shadow-2xl flex-col items-center min-w-[240px] z-[60] animate-in fade-in zoom-in duration-300 border-2 ${themeType === 'executive' ? 'bg-white border-black' : 'bg-black/90 border-white/10 backdrop-blur-3xl'}`}>
                <span className={`text-lg font-black ${theme.glowClass || ''}`}>{t.nameTe}</span>
                <span className="text-xs opacity-40 uppercase tracking-widest mt-1 font-bold">{t.nameEn}</span>
                <div className={`h-px w-16 my-4 ${themeType === 'executive' ? 'bg-black' : 'bg-white/10'}`} />
                <span className="text-base font-mono font-black opacity-80">{t.time}</span>
              </div>
            </button>
          );
        })}

        {data.auspiciousTimings.map((t, i) => {
          const r = parseTimeRange(t.time);
          if (!r) return null;
          return (
            <button key={`au-${i}`} className="group absolute top-20 h-14 bg-emerald-500/40 hover:bg-emerald-400 transition-all z-20 border-x border-white/10 first:rounded-l-full last:rounded-r-full overflow-visible" style={{ left: `${getP(r.start)}%`, width: `${getP(r.end - r.start)}%` }} aria-label={`Auspicious: ${t.nameEn} during ${t.time}`}>
              <div className="absolute inset-0 pattern-dots opacity-30" />
              <div className={`hidden group-hover:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-8 p-6 rounded-[32px] shadow-2xl flex-col items-center min-w-[240px] z-[60] animate-in fade-in zoom-in duration-300 border-2 ${themeType === 'executive' ? 'bg-white border-black' : 'bg-black/90 border-white/10 backdrop-blur-3xl'}`}>
                <span className={`text-lg font-black ${theme.glowClass || ''}`}>{t.nameTe}</span>
                <span className="text-xs opacity-40 uppercase tracking-widest mt-1 font-bold">{t.nameEn}</span>
                <div className={`h-px w-16 my-4 ${themeType === 'executive' ? 'bg-black' : 'bg-white/10'}`} />
                <span className="text-base font-mono font-black opacity-80">{t.time}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

/**
 * MAIN APP
 */
const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>('executive');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('Hyderabad, Telangana');
  const [data, setData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const cur = THEMES[theme];

  const handleFetch = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    announceToSR(`Scanning ${theme} spiritual dimensions for ${location}`);
    try {
      const res = await fetchPanchangData(date, location);
      setData(res);
      announceToSR('Celestial synchronization complete.');
    } catch (e) {
      setError('Alignment failure. Astral signal weak.');
      announceToSR('Calculation error.');
    } finally {
      setLoading(false);
    }
  }, [date, location, theme]);

  useEffect(() => { handleFetch(); }, [handleFetch]);

  return (
    <div className={`min-h-screen ${cur.bg} ${cur.text} selection:bg-current selection:text-black transition-all duration-1000 font-sans`} data-theme={theme}>
      <header className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-3xl border-b h-24 transition-all ${theme === 'executive' ? 'bg-white/80 border-black' : 'bg-black/40 border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-8 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className={`p-4 rounded-[24px] border shadow-inner transition-transform group-hover:rotate-12 group-hover:scale-110 ${theme === 'executive' ? 'bg-black text-white border-black' : 'bg-white/5 border-white/10'}`}>
              <Sun className="w-8 h-8" />
            </div>
            <div className="hidden lg:block text-left">
              <span className={`font-black text-3xl tracking-tighter uppercase opacity-90 ${cur.glowClass || ''}`}>శ్రీ పంచాంగం</span>
              <p className="text-[9px] font-black uppercase tracking-[5px] opacity-40">EXECUTIVE VEDIC EDITION</p>
            </div>
          </div>

          <div className={`flex items-center gap-4 p-2.5 rounded-[32px] border shadow-2xl ${theme === 'executive' ? 'bg-black/5 border-black/20' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center">
              <MapPin className="w-6 h-6 ml-6 opacity-30" />
              <input aria-label="Target City" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Target City..." className="bg-transparent text-sm px-6 py-4 outline-none min-w-[240px] font-black placeholder:opacity-20" />
            </div>
            <button onClick={handleFetch} aria-label="Recalculate Muhurtas" className={`px-10 py-4 rounded-[24px] transition-all active:scale-95 font-black shadow-xl hover:opacity-90 ${theme === 'executive' ? 'bg-black text-white' : 'bg-white text-black'}`}>
              <Search className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsMuted(!isMuted)} 
                className={`p-5 rounded-[24px] border transition-all hover:scale-110 active:scale-90 shadow-lg ${isMuted ? 'opacity-40' : 'opacity-100 bg-current text-black'}`}
                title={isMuted ? "Divine Soundscape Off" : "Divine Soundscape On"}
             >
                {isMuted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
             </button>

             <button 
                onClick={() => {
                  const sequence: ThemeType[] = ['executive', 'temple', 'godavari', 'parchment', 'tirumala'];
                  const idx = sequence.indexOf(theme);
                  setTheme(sequence[(idx + 1) % sequence.length]);
                }} 
                className={`p-5 rounded-[24px] border transition-all hover:scale-110 active:scale-90 shadow-lg ${theme === 'executive' ? 'bg-black text-white border-black' : 'bg-white/5 border-white/10'}`}
                title="Change Divine Theme"
             >
                {cur.icon}
             </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="pt-24 pb-48">
        <Hero theme={cur} themeType={theme} />

        <div className="max-w-7xl mx-auto px-10 py-24 space-y-24">
          {error && (
            <div className="bg-rose-500/10 border-2 border-rose-500/40 p-12 rounded-[64px] flex items-center gap-10 text-rose-200 animate-in fade-in" role="alert">
              <ShieldAlert className="w-16 h-16 flex-shrink-0" />
              <p className="font-black text-3xl">{error}</p>
            </div>
          )}

          <CelestialCalendar 
            selectedDate={date} 
            onDateSelect={setDate} 
            location={location} 
            theme={cur} 
            themeType={theme}
          />

          {loading && !data && (
            <div className="flex flex-col items-center justify-center py-64 space-y-16">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full border-4 border-t-transparent animate-spin ${theme === 'executive' ? 'border-black' : 'border-current opacity-20'}`} />
                <Target className="absolute inset-0 m-auto w-12 h-12 animate-pulse opacity-20" />
              </div>
              <p className={`text-6xl font-black tracking-[30px] uppercase text-center ${cur.glowClass || ''}`}>శుభం భూయాత్</p>
            </div>
          )}

          {data && (
            <div className="animate-in fade-in slide-in-from-bottom-20 duration-1000 space-y-24">
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                <NFTCard label="Lunar Phase (Tithi)" te="తిథి" val={data.basicDetails.tithi} icon={<Sparkles/>} color="from-orange-500 to-red-600" theme={cur} themeType={theme} />
                <NFTCard label="Astral Constellation" te="నక్షత్రం" val={data.basicDetails.nakshatra} icon={<Moon/>} color="from-blue-600 to-indigo-600" theme={cur} themeType={theme} />
                <NFTCard label="Dawn Ascension" te="సూర్యోదయం" val={data.basicDetails.sunrise} icon={<Sun/>} color="from-amber-400 to-orange-500" theme={cur} themeType={theme} />
                <NFTCard label="Dusk Descension" te="సూర్యాస్తమయం" val={data.basicDetails.sunset} icon={<Clock/>} color="from-slate-500 to-black" theme={cur} themeType={theme} />
              </section>

              <Timeline data={data} selectedDate={date} theme={cur} themeType={theme} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-5 space-y-12">
                  <section className={`${cur.card} p-14 rounded-[72px] border ${cur.border} shadow-2xl relative overflow-hidden group`} aria-label="Spiritual Insight">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                      <BookOpen className="w-48 h-48" />
                    </div>
                    <div className="flex items-center gap-6 mb-12">
                      <div className={`p-5 rounded-[32px] shadow-inner bg-white/10`}>
                        <BookOpen className="w-10 h-10" />
                      </div>
                      <h3 className={`text-3xl font-black uppercase tracking-[6px] ${cur.glowClass || ''}`}>DIVINE STRATEGY</h3>
                    </div>
                    
                    <div className="space-y-16">
                      <div>
                        <span className="text-[12px] font-black uppercase opacity-30 tracking-[10px]">Aura Color</span>
                        <div className={`mt-6 flex items-center gap-8 p-12 rounded-[56px] border-2 group-hover:border-current transition-all shadow-inner ${theme === 'executive' ? 'bg-black/[0.03] border-black/10' : 'bg-white/5 border-white/10'}`}>
                          <div className="w-24 h-24 rounded-full border-[12px] border-white shadow-2xl ring-4 ring-black/5" style={{ backgroundColor: data.luckyColor }} />
                          <span className={`text-5xl font-black tracking-tighter ${cur.glowClass || ''}`}>{data.luckyColor}</span>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="text-[12px] font-black uppercase opacity-30 tracking-[10px]">Gita Darsanam</span>
                        <div className="mt-12 relative">
                          <span className={`text-[250px] leading-none opacity-[0.05] absolute -top-48 -left-20 font-serif select-none`}>"</span>
                          <p className={`text-4xl font-black leading-tight indent-16 relative z-10 opacity-90 ${theme === 'executive' ? 'tracking-tight' : 'italic'}`}>
                            {data.horoscope}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className={`${theme === 'executive' ? 'bg-black text-white' : 'bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]'} p-14 rounded-[72px] shadow-2xl relative overflow-hidden group border-4 border-black`} aria-label="Author Profile">
                    <User className="absolute -bottom-16 -right-16 w-64 h-64 opacity-10 group-hover:scale-110 transition-all duration-1000" />
                    <h3 className="text-2xl font-black mb-10 flex items-center gap-5">
                       <Briefcase className="w-10 h-10" style={{ color: cur.accent }} /> Executive Signature
                    </h3>
                    <p className={`text-6xl font-black tracking-tighter mb-8 ${cur.glowClass ? 'executive-glow-text text-white' : ''}`}>BalajiDuddukuri</p>
                    <p className="opacity-50 text-[14px] font-black tracking-[10px] mb-12 uppercase">Architect • Devotee • Strategist</p>
                  </section>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <TimingGrid title="Auspicious" te="శుభ సమయాలు" icon={<CheckCircle className="w-12 h-12 text-emerald-500" />} timings={data.auspiciousTimings} theme={cur} themeType={theme} />
                  <TimingGrid title="Inauspicious" te="అశుభ సమయాలు" icon={<ShieldAlert className="w-12 h-12 text-rose-500" />} timings={data.inauspiciousTimings} theme={cur} themeType={theme} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className={`text-center py-40 border-t ${theme === 'executive' ? 'bg-black text-white border-black' : 'bg-black/40 text-white/40 border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-10 flex flex-col items-center gap-20">
          <div className="flex gap-32">
            <AccessibilityIndicator icon={<Accessibility />} label="EXECUTIVE AA" theme={cur} />
            <AccessibilityIndicator icon={<Contrast />} label="SHARP 7:1" theme={cur} />
            <AccessibilityIndicator icon={<Eye />} label="PANOPTIC VISION" theme={cur} />
          </div>
          <p className="font-black tracking-[20px] text-[14px] uppercase opacity-40 leading-loose text-center">
            శ్రీ తెలుగు పంచాంగం • VEDIC SYSTEMS • BalajiDuddukuri Authority
          </p>
        </div>
      </footer>
    </div>
  );
};

const AccessibilityIndicator = ({ icon, label, theme }: any) => (
  <div className="flex flex-col items-center gap-6 group">
    <div className={`p-6 rounded-[28px] group-hover:scale-110 transition-all border-2 bg-white/5 border-white/10`}>
      {React.cloneElement(icon, { className: "w-10 h-10" })}
    </div>
    <span className="text-[11px] font-black uppercase tracking-[8px] opacity-60">{label}</span>
  </div>
);

const TimingGrid = ({ title, te, icon, timings, theme, themeType }: any) => (
  <section className={`${theme.card} rounded-[72px] border ${theme.border} overflow-hidden shadow-2xl transition-transform hover:rotate-1`} aria-label={`${title} timings`}>
    <div className={`px-12 py-12 flex items-center gap-10 border-b-2 ${themeType === 'executive' ? 'border-black' : 'border-white/5'}`}>
      <div className={`p-8 rounded-[40px] shadow-inner bg-white/10`}>{icon}</div>
      <div>
        <h3 className="font-black text-[14px] uppercase tracking-[12px] opacity-40">{title}</h3>
        <p className={`text-4xl font-black tracking-tighter ${theme.glowClass || ''}`}>{te}</p>
      </div>
    </div>
    <div className={`divide-y-2 ${themeType === 'executive' ? 'divide-black/10' : 'divide-white/5'}`}>
      {timings.map((t: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-12 hover:bg-black/5 transition-all group cursor-default">
          <div>
            <p className={`font-black text-3xl leading-tight opacity-90 group-hover:opacity-100 ${themeType === 'executive' ? 'tracking-tight' : ''}`}>{t.nameTe}</p>
            <p className="text-[12px] font-black opacity-40 uppercase tracking-[6px] mt-3">{t.nameEn}</p>
          </div>
          <span className={`font-mono text-xl font-black px-10 py-4 rounded-[28px] border-4 shadow-inner transition-all ${themeType === 'executive' ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 opacity-70 group-hover:opacity-100'}`}>
            {t.time}
          </span>
        </div>
      ))}
    </div>
  </section>
);

export default App;
