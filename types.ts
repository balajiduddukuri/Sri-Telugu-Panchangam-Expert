
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
  };
  inauspiciousTimings: TimingInfo[];
  auspiciousTimings: TimingInfo[];
  horoscope: string;
  luckyColor: string;
  sources: { uri: string; title: string }[];
}

export interface TimingInfo {
  nameEn: string;
  nameTe: string;
  time: string;
  status: 'auspicious' | 'inauspicious';
}
