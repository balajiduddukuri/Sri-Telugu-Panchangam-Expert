
export type AppLanguage = 'telugu' | 'tamil' | 'hindi' | 'english';
export type PanchangRegion = 'andhra' | 'tamilnadu' | 'north';

export interface PanchangData {
  date: string;
  location: string;
  basicDetails: {
    sunrise: string;
    sunset: string;
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    rahu: string;
    samvat: string;
    maasam: string; // Regional Month (e.g., Chithirai in Tamil, Chaitra in Hindi/Telugu)
    varam: string;  // Day of week in regional language
  };
  inauspiciousTimings: TimingInfo[];
  auspiciousTimings: TimingInfo[];
  horoscope: string;
  spiritualSummary: string;
  luckyColor: string;
  sources: { uri: string; title: string }[];
}

export interface TimingInfo {
  nameEn: string;
  nameTe: string; // Used as the primary regional name field
  time: string;
  status: 'auspicious' | 'inauspicious';
}
