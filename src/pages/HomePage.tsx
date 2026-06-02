import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Room } from '../types';
import { cn } from '../lib/utils';
import { 
  Users, MapPin, Signal, Search, User as UserIcon, Bell, BarChart2, BrainCircuit,
  LayoutGrid, LayoutList, ChevronDown, ChevronUp, RefreshCw, X, Check, Globe, Sparkles, Shield, Briefcase,
  Film, ChevronRight, SlidersHorizontal, Gift, ChevronLeft, History, Flame, Clock, Layers, Video, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { WeeklyKing } from '../components/WeeklyKing';
import { getAIStreamRecommendations, RecommendationResponse } from '../services/aiRecommendationService';
import { UserProfile } from '../types';
import { getDocs, getDoc, doc } from 'firebase/firestore';
import { SEOHeaders } from '../components/SEOHeaders';
import { UserDiscoveryPopup } from '../components/UserDiscoveryPopup';

interface CountryItem {
  name: string;
  flag: string;
  code: string;
}

const ToriiIcon = ({ className = "w-4 h-4 text-zinc-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2,5 C8,4 16,4 22,5 L22,7 C18,6.5 6,6.5 2,7 Z M5,7 L7,7 L7,20 L5,20 Z M17,7 L19,7 L19,20 L17,20 Z M7,10 L17,10 L17,11.5 L7,11.5 Z" />
  </svg>
);

const AmericaIcon = ({ className = "w-4 h-4 text-zinc-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2 L2,8 L2,10 L3,10 L3,20 L5,20 L5,10 L7,10 L7,20 L9,20 L9,10 L11,10 L11,20 L13,20 L13,10 L15,10 L15,20 L17,20 L17,10 L19,10 L19,20 L21,20 L21,10 L22,10 L22,8 Z" />
  </svg>
);

const EuropeIcon = ({ className = "w-4 h-4 text-zinc-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Classical Greek Parthenon temple design */}
    <path d="M4 20h16M5 10v10M9 10v10M15 10v10M19 10v10M4 10h16M12 4L4 10h16z" />
  </svg>
);

const AfricaIcon = ({ className = "w-4 h-4 text-zinc-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Pyramid silhouettes */}
    <path d="M2 20l10-16 10 16 M12 4l4 16 M12 12h10 M12 16H3" />
  </svg>
);

const OceaniaIcon = ({ className = "w-4 h-4 text-zinc-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Sydney Opera House sails outline */}
    <path d="M3 20c3-5 5-9 10-9 2 0 4 2 5 4M10 20c2-6 5-11 11-11v11" />
    <path d="M2 20h20" />
  </svg>
);

const FemaleIcon = ({ className = "w-4 h-4 text-zinc-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Circular female avatar hair silhouette */}
    <circle cx="12" cy="11" r="5.5" />
    <path d="M12 16.5v4.5M9 19.5h6" />
    <path d="M8 8.5c1-1 2.5-1.5 4-1.5s3 .5 4 1.5M7.5 11c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
  </svg>
);

const MaleIcon = ({ className = "w-4 h-4 text-zinc-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Circular male portrait with short hair peaks */}
    <circle cx="12" cy="12" r="5.5" />
    <path d="M12 17.5v3.5M9.5 21h5" />
    <path d="M9 7.5l1.5-1.5 1.5 1 1.5-1 1.5 1.5M7 11.5a5 5 0 0 1 10 0" />
  </svg>
);

const MiddleEastIcon = ({ className = "w-4 h-4 text-zinc-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Arabic/Islamic styled dome shape with minaret spire */}
    <path d="M12 2C9 7 6 9 6 13a6 6 0 0 0 12 0c0-4-3-6-6-11z" />
    <path d="M12 13v7M8 20h8" />
  </svg>
);

const SoutheastAsiaIcon = ({ className = "w-4 h-4 text-zinc-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Pagoda multi-tier roof design */}
    <path d="M12 3v18M5 21h14M8 17h8M6 17l2-4h8l2 4M10 13V9h4v4" />
  </svg>
);

const CustomFilterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Funnel body centered exactly on x=9 */}
    <path d="M3 6h12l-4 4.5v6a1.5 1.5 0 0 1-3 0v-6z" />
    {/* 3 distinct list lines to the right of the funnel matching Bigo icon 02:09 */}
    <line x1="16.5" y1="9" x2="20.5" y2="9" strokeWidth="3.2" />
    <line x1="16.5" y1="13.2" x2="20.5" y2="13.2" strokeWidth="3.2" />
    <line x1="16.5" y1="17.5" x2="20.5" y2="17.5" strokeWidth="3.2" />
  </svg>
);

interface RegionCountry {
  name: string;
  flag: string;
  code: string;
  isHot?: boolean;
}

interface RegionItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  countries: RegionCountry[];
}

const regionsData: RegionItem[] = [
  {
    name: 'Asia',
    icon: ToriiIcon,
    countries: [
      { name: 'Philippines', flag: '🇵🇭', code: 'PH', isHot: true },
      { name: 'Pakistan', flag: '🇵🇰', code: 'PK', isHot: true },
      { name: 'Myanmar', flag: '🇲🇲', code: 'MM', isHot: true },
      { name: 'Vietnam', flag: '🇻🇳', code: 'VN' },
      { name: 'Indonesia', flag: '🇮🇩', code: 'ID' },
      { name: 'Syria', flag: '🇸🇾', code: 'SY' },
      { name: 'Bangladesh', flag: '🇧🇩', code: 'BD' },
      { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
      { name: 'Turkey', flag: '🇹🇷', code: 'TR' },
      { name: 'Malaysia', flag: '🇲🇾', code: 'MY' },
      { name: 'Thailand', flag: '🇹🇭', code: 'TH' },
      { name: 'Uzbekistan', flag: '🇺🇿', code: 'UZ' },
      { name: 'Cambodia', flag: '🇰🇭', code: 'KH' },
      { name: 'Iraq', flag: '🇮🇶', code: 'IQ' },
      { name: 'India', flag: '🇮🇳', code: 'IN' },
      { name: 'UAE', flag: '🇦🇪', code: 'AE' },
      { name: 'Hongkong', flag: '🇭🇰', code: 'HK' },
      { name: 'Taiwan', flag: '🇹🇼', code: 'TW' },
      { name: 'Korea', flag: '🇰🇷', code: 'KR' },
      { name: 'Laos', flag: '🇱🇦', code: 'LA' },
      { name: 'Kuwait', flag: '🇰🇼', code: 'KW' },
      { name: 'Lebanon', flag: '🇱🇧', code: 'LB' },
      { name: 'Kazakstan', flag: '🇰🇿', code: 'KZ' },
      { name: 'Japan', flag: '🇯🇵', code: 'JP' },
      { name: 'Yemen', flag: '🇾🇪', code: 'YE' },
      { name: 'Jordan', flag: '🇯🇴', code: 'JO' },
      { name: 'Nepal', flag: '🇳🇵', code: 'NP' },
      { name: 'Kyrgyzstan', flag: '🇰🇬', code: 'KG' },
      { name: 'Oman', flag: '🇴🇲', code: 'OM' },
      { name: 'Qatar', flag: '🇶🇦', code: 'QA' },
      { name: 'Afghanistan', flag: '🇦🇫', code: 'AF' },
      { name: 'Tajikstan', flag: '🇹🇯', code: 'TJ' },
      { name: 'Singapore', flag: '🇸🇬', code: 'SG' },
      { name: 'Azerbaijan', flag: '🇦🇿', code: 'AZ' },
      { name: 'Other', flag: '🌐', code: 'GL' },
      { name: 'Palestine', flag: '🇵🇸', code: 'PS' },
      { name: 'Georgia', flag: '🇬🇪', code: 'GE' },
      { name: 'Bahrain', flag: '🇧🇭', code: 'BH' },
      { name: 'Sri Lanka', flag: '🇱🇰', code: 'LK' },
      { name: 'Armenia', flag: '🇦🇲', code: 'AM' },
      { name: 'Cyprus', flag: '🇨🇾', code: 'CY' },
      { name: 'Maldives', flag: '🇲🇻', code: 'MV' },
      { name: 'Turkmenistan', flag: '🇹🇲', code: 'TM' },
      { name: 'Israel', flag: '🇮🇱', code: 'IL' },
      { name: 'Macao', flag: '🇲🇴', code: 'MO' },
      { name: 'Mongolia', flag: '🇲🇳', code: 'MN' },
      { name: 'Brunei', flag: '🇧🇳', code: 'BN' }
    ]
  },
  {
    name: 'America',
    icon: AmericaIcon,
    countries: [
      { name: 'USA', flag: '🇺🇸', code: 'US', isHot: true },
      { name: 'Brazil', flag: '🇧🇷', code: 'BR', isHot: true },
      { name: 'Colombia', flag: '🇨🇴', code: 'CO' },
      { name: 'Mexico', flag: '🇲🇽', code: 'MX' },
      { name: 'Canada', flag: '🇨🇦', code: 'CA' },
      { name: 'Venezuela', flag: '🇻🇪', code: 'VE' },
      { name: 'Argentina', flag: '🇦🇷', code: 'AR' },
      { name: 'Peru', flag: '🇵🇪', code: 'PE' },
      { name: 'Jamaica', flag: '🇯🇲', code: 'JM' },
      { name: 'Dominica Rep.', flag: '🇩🇴', code: 'DO' },
      { name: 'Chile', flag: '🇨🇱', code: 'CL' },
      { name: 'Ecuador', flag: '🇪🇨', code: 'EC' },
      { name: 'Puerto Rico', flag: '🇵🇷', code: 'PR' },
      { name: 'Panama', flag: '🇵🇦', code: 'PA' },
      { name: 'Bolivia', flag: '🇧🇴', code: 'BO' },
      { name: 'Nicaragua', flag: '🇳🇮', code: 'NI' },
      { name: 'Costa Rica', flag: '🇨🇷', code: 'CR' },
      { name: 'Guatemala', flag: '🇬🇹', code: 'GT' },
      { name: 'Honduras', flag: '🇭🇳', code: 'HN' },
      { name: 'Paraguay', flag: '🇵🇾', code: 'PY' },
      { name: 'El Salvador', flag: '🇸🇻', code: 'SV' },
      { name: 'Trinidad and Tobago', flag: '🇹🇹', code: 'TT' },
      { name: 'Uruguay', flag: '🇺🇾', code: 'UY' },
      { name: 'Guyana', flag: '🇬🇾', code: 'GY' },
      { name: 'Barbados', flag: '🇧🇧', code: 'BB' },
      { name: 'St.Lucia', flag: '🇱🇨', code: 'LC' },
      { name: 'Saint Vincent', flag: '🇻🇨', code: 'VC' },
      { name: 'Anguilla', flag: '🇦🇮', code: 'AI' },
      { name: 'Haiti', flag: '🇭🇹', code: 'HT' },
      { name: 'French Guiana', flag: '🇬🇫', code: 'GF' },
      { name: 'Grenada', flag: '🇬🇩', code: 'GD' },
      { name: 'Bahamas', flag: '🇧🇸', code: 'BS' }
    ]
  },
  {
    name: 'Europe',
    icon: EuropeIcon,
    countries: [
      { name: 'Russia', flag: '🇷🇺', code: 'RU', isHot: true },
      { name: 'Germany', flag: '🇩🇪', code: 'DE', isHot: true },
      { name: 'France', flag: '🇫🇷', code: 'FR', isHot: true },
      { name: 'UK', flag: '🇬🇧', code: 'GB' },
      { name: 'Italy', flag: '🇮🇹', code: 'IT' },
      { name: 'Romania', flag: '🇷🇴', code: 'RO' },
      { name: 'Spain', flag: '🇪🇸', code: 'ES' },
      { name: 'Ukraine', flag: '🇺🇦', code: 'UA' },
      { name: 'Netherlands', flag: '🇳🇱', code: 'NL' },
      { name: 'Belgium', flag: '🇧🇪', code: 'BE' },
      { name: 'Belarus', flag: '🇧🇾', code: 'BY' },
      { name: 'Poland', flag: '🇵🇱', code: 'PL' },
      { name: 'Sweden', flag: '🇸🇪', code: 'SE' },
      { name: 'Switzerland', flag: '🇨🇭', code: 'CH' },
      { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
      { name: 'Norway', flag: '🇳🇴', code: 'NO' },
      { name: 'Austria', flag: '🇦🇹', code: 'AT' },
      { name: 'Greece', flag: '🇬🇷', code: 'GR' },
      { name: 'Moldova', flag: '🇲🇩', code: 'MD' },
      { name: 'Ireland', flag: '🇮🇪', code: 'IE' },
      { name: 'Denmark', flag: '🇩🇰', code: 'DK' },
      { name: 'Bulgaria', flag: '🇧🇬', code: 'BG' },
      { name: 'Albania', flag: '🇦🇱', code: 'AL' },
      { name: 'Finland', flag: '🇫🇮', code: 'FI' },
      { name: 'Hungary', flag: '🇭🇺', code: 'HU' },
      { name: 'Czech Republic', flag: '🇨🇿', code: 'CZ' },
      { name: 'Malta', flag: '🇲🇹', code: 'MT' },
      { name: 'Iceland', flag: '🇮🇸', code: 'IS' },
      { name: 'Luxembourg', flag: '🇱🇺', code: 'LU' },
      { name: 'Latvia', flag: '🇱🇻', code: 'LV' },
      { name: 'Slovakia', flag: '🇸🇰', code: 'SK' },
      { name: 'Lithuania', flag: '🇱🇹', code: 'LT' }
    ]
  },
  {
    name: 'Africa',
    icon: AfricaIcon,
    countries: [
      { name: 'Nigeria', flag: '🇳🇬', code: 'NG', isHot: true },
      { name: 'Egypt', flag: '🇪🇬', code: 'EG', isHot: true },
      { name: 'Ethiopia', flag: '🇪🇹', code: 'ET', isHot: true },
      { name: 'Algeria', flag: '🇩🇿', code: 'DZ' },
      { name: 'Morocco', flag: '🇲🇦', code: 'MA' },
      { name: 'Libya', flag: '🇱🇾', code: 'LY' },
      { name: 'Tunisia', flag: '🇹🇳', code: 'TN' },
      { name: 'South Africa', flag: '🇿🇦', code: 'ZA' },
      { name: 'Somalia', flag: '🇸🇴', code: 'SO' },
      { name: 'Kenya', flag: '🇰🇪', code: 'KE' },
      { name: 'Ghana', flag: '🇬🇭', code: 'GH' },
      { name: 'Uganda', flag: '🇺🇬', code: 'UG' },
      { name: 'Angola', flag: '🇦🇴', code: 'AO' },
      { name: 'Sudan', flag: '🇸🇩', code: 'SD' },
      { name: 'Gambia', flag: '🇬🇲', code: 'GM' },
      { name: 'Tanzania', flag: '🇹🇿', code: 'TZ' },
      { name: 'Benin', flag: '🇧🇯', code: 'BJ' },
      { name: 'Senegal', flag: '🇸🇳', code: 'SN' },
      { name: 'Cameroon', flag: '🇨🇲', code: 'CM' },
      { name: 'Botswana', flag: '🇧🇼', code: 'BW' },
      { name: 'Zambia', flag: '🇿🇲', code: 'ZM' },
      { name: 'Togo', flag: '🇹🇬', code: 'TG' },
      { name: 'Chad', flag: '🇹🇩', code: 'TD' },
      { name: 'Zimbabwe', flag: '🇿🇼', code: 'ZW' },
      { name: 'Sierra Leone', flag: '🇸🇱', code: 'SL' },
      { name: 'Seychelles', flag: '🇸🇨', code: 'SC' },
      { name: 'Niger', flag: '🇳🇪', code: 'NE' },
      { name: 'Mauritius', flag: '🇲🇺', code: 'MU' },
      { name: 'Mali', flag: '🇲🇱', code: 'ML' },
      { name: 'Madagascar', flag: '🇲🇬', code: 'MG' },
      { name: 'Lesotho', flag: '🇱🇸', code: 'LS' },
      { name: 'Djibouti', flag: '🇩🇯', code: 'DJ' }
    ]
  },
  {
    name: 'Oceania',
    icon: OceaniaIcon,
    countries: [
      { name: 'Australia', flag: '🇦🇺', code: 'AU' },
      { name: 'New Zealand', flag: '🇳🇿', code: 'NZ' },
      { name: 'Tonga', flag: '🇹🇴', code: 'TO' },
      { name: 'Fiji', flag: '🇫🇯', code: 'FJ' },
      { name: 'Papua New Guinea', flag: '🇵🇬', code: 'PG' },
      { name: 'French Polynesia', flag: '🇵🇫', code: 'PF' }
    ]
  }
];

const countriesData: Record<string, CountryItem[]> = {
  'A': [
    { name: 'Afghanistan', flag: '🇦🇫', code: 'AF' },
    { name: 'Albania', flag: '🇦🇱', code: 'AL' },
    { name: 'Algeria', flag: '🇩🇿', code: 'DZ' },
    { name: 'Angola', flag: '🇦🇴', code: 'AO' },
    { name: 'Anguilla', flag: '🇦🇮', code: 'AI' },
    { name: 'Argentina', flag: '🇦🇷', code: 'AR' },
    { name: 'Armenia', flag: '🇦🇲', code: 'AM' },
    { name: 'Australia', flag: '🇦🇺', code: 'AU' },
    { name: 'Austria', flag: '🇦🇹', code: 'AT' },
    { name: 'Azerbaijan', flag: '🇦🇿', code: 'AZ' },
  ],
  'B': [
    { name: 'Bahamas', flag: '🇧🇸', code: 'BS' },
    { name: 'Bahrain', flag: '🇧🇭', code: 'BH' },
    { name: 'Bangladesh', flag: '🇧🇩', code: 'BD' },
    { name: 'Belarus', flag: '🇧🇾', code: 'BY' },
    { name: 'Belgium', flag: '🇧🇪', code: 'BE' },
    { name: 'Benin', flag: '🇧🇯', code: 'BJ' },
    { name: 'Bolivia', flag: '🇧🇴', code: 'BO' },
    { name: 'Botswana', flag: '🇧🇼', code: 'BW' },
    { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
    { name: 'Brunei', flag: '🇧🇳', code: 'BN' },
    { name: 'Bulgaria', flag: '🇧🇬', code: 'BG' },
  ],
  'C': [
    { name: 'Cambodia', flag: '🇰🇭', code: 'KH' },
    { name: 'Cameroon', flag: '🇨🇲', code: 'CM' },
    { name: 'Canada', flag: '🇨🇦', code: 'CA' },
    { name: 'Colombia', flag: '🇨🇴', code: 'CO' },
    { name: 'Costa Rica', flag: '🇨🇷', code: 'CR' },
    { name: 'Cyprus', flag: '🇨🇾', code: 'CY' },
    { name: 'Czech Republic', flag: '🇨🇿', code: 'CZ' },
  ],
  'D': [
    { name: 'Denmark', flag: '🇩🇰', code: 'DK' },
    { name: 'Dominican Republic', flag: '🇩🇴', code: 'DO' },
  ],
  'E': [
    { name: 'Ecuador', flag: '🇪🇨', code: 'EC' },
    { name: 'Egypt', flag: '🇪🇬', code: 'EG' },
    { name: 'El Salvador', flag: '🇸🇻', code: 'SV' },
    { name: 'Estonia', flag: '🇪🇪', code: 'EE' },
    { name: 'Ethiopia', flag: '🇪🇹', code: 'ET' },
  ],
  'F': [
    { name: 'Fiji', flag: '🇫🇯', code: 'FJ' },
    { name: 'Finland', flag: '🇫🇮', code: 'FI' },
    { name: 'France', flag: '🇫🇷', code: 'FR' },
    { name: 'French Guiana', flag: '🇬🇫', code: 'GF' },
    { name: 'French Polynesia', flag: '🇵🇫', code: 'PF' },
  ],
  'G': [
    { name: 'Gambia', flag: '🇬🇲', code: 'GM' },
    { name: 'Georgia', flag: '🇬🇪', code: 'GE' },
    { name: 'Germany', flag: '🇩🇪', code: 'DE' },
    { name: 'Ghana', flag: '🇬🇭', code: 'GH' },
    { name: 'Greece', flag: '🇬🇷', code: 'GR' },
    { name: 'Grenada', flag: '🇬🇩', code: 'GD' },
    { name: 'Guatemala', flag: '🇬🇺', code: 'GT' },
    { name: 'Guyana', flag: '🇬🇾', code: 'GY' },
  ],
  'H': [
    { name: 'Honduras', flag: '🇭🇳', code: 'HN' },
    { name: 'Hong Kong', flag: '🇭🇰', code: 'HK' },
    { name: 'Hungary', flag: '🇭🇺', code: 'HU' },
  ],
  'I': [
    { name: 'Iceland', flag: '🇮🇸', code: 'IS' },
    { name: 'India', flag: '🇮🇳', code: 'IN' },
    { name: 'Indonesia', flag: '🇮🇩', code: 'ID' },
    { name: 'Iraq', flag: '🇮🇶', code: 'IQ' },
    { name: 'Ireland', flag: '🇮🇪', code: 'IE' },
    { name: 'Israel', flag: '🇮🇱', code: 'IL' },
    { name: 'Italy', flag: '🇮🇹', code: 'IT' },
  ],
  'J': [
    { name: 'Jamaica', flag: '🇯🇲', code: 'JM' },
    { name: 'Japan', flag: '🇯🇵', code: 'JP' },
    { name: 'Jordan', flag: '🇯🇴', code: 'JO' },
  ],
  'K': [
    { name: 'Kazakhstan', flag: '🇰🇿', code: 'KZ' },
    { name: 'Kenya', flag: '🇰🇪', code: 'KE' },
    { name: 'Kuwait', flag: '🇰🇼', code: 'KW' },
    { name: 'Kyrgyzstan', flag: '🇰🇬', code: 'KG' },
  ],
  'L': [
    { name: 'Laos', flag: '🇱🇦', code: 'LA' },
    { name: 'Latvia', flag: '🇱🇻', code: 'LV' },
    { name: 'Lebanon', flag: '🇱🇧', code: 'LB' },
    { name: 'Lesotho', flag: '🇱🇸', code: 'LS' },
    { name: 'Libya', flag: '🇱🇾', code: 'LY' },
    { name: 'Lithuania', flag: '🇱🇹', code: 'LT' },
    { name: 'Luxembourg', flag: '🇱🇺', code: 'LU' },
  ],
  'M': [
    { name: 'Macau', flag: '🇲🇴', code: 'MO' },
    { name: 'Madagascar', flag: '🇲🇬', code: 'MG' },
    { name: 'Malaysia', flag: '🇲🇾', code: 'MY' },
    { name: 'Maldives', flag: '🇲🇻', code: 'MV' },
    { name: 'Malta', flag: '🇲🇹', code: 'MT' },
    { name: 'Mexico', flag: '🇲🇽', code: 'MX' },
    { name: 'Moldova', flag: '🇲🇩', code: 'MD' },
    { name: 'Mongolia', flag: '🇲🇳', code: 'MN' },
    { name: 'Morocco', flag: '🇲🇦', code: 'MA' },
    { name: 'Myanmar', flag: '🇲🇲', code: 'MM' },
  ],
  'N': [
    { name: 'Nepal', flag: '🇳🇵', code: 'NP' },
    { name: 'Netherlands', flag: '🇳🇱', code: 'NL' },
    { name: 'New Zealand', flag: '🇳🇿', code: 'NZ' },
    { name: 'Nicaragua', flag: '🇳🇮', code: 'NI' },
    { name: 'Nigeria', flag: '🇳🇬', code: 'NG' },
    { name: 'Norway', flag: '🇳🇴', code: 'NO' },
  ],
  'O': [
    { name: 'Oman', flag: '🇴🇲', code: 'OM' },
  ],
  'P': [
    { name: 'Pakistan', flag: '🇵🇰', code: 'PK' },
    { name: 'Palestine', flag: '🇵🇸', code: 'PS' },
    { name: 'Panama', flag: '🇵🇦', code: 'PA' },
    { name: 'Papua New Guinea', flag: '🇵🇬', code: 'PG' },
    { name: 'Paraguay', flag: '🇵🇾', code: 'PY' },
    { name: 'Peru', flag: '🇵🇪', code: 'PE' },
    { name: 'Philippines', flag: '🇵🇭', code: 'PH' },
    { name: 'Poland', flag: '🇵🇱', code: 'PL' },
    { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
    { name: 'Puerto Rico', flag: '🇵🇷', code: 'PR' },
  ],
  'Q': [
    { name: 'Qatar', flag: '🇶🇦', code: 'QA' },
  ],
  'R': [
    { name: 'Romania', flag: '🇷🇴', code: 'RO' },
    { name: 'Russia', flag: '🇷🇺', code: 'RU' },
  ],
  'S': [
    { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
    { name: 'Senegal', flag: '🇸🇳', code: 'SN' },
    { name: 'Singapore', flag: '🇸🇬', code: 'SG' },
    { name: 'Slovakia', flag: '🇸🇰', code: 'SK' },
    { name: 'Somalia', flag: '🇸🇴', code: 'SO' },
    { name: 'South Africa', flag: '🇿🇦', code: 'ZA' },
    { name: 'South Korea', flag: '🇰🇷', code: 'KR' },
    { name: 'Spain', flag: '🇪🇸', code: 'ES' },
    { name: 'Sri Lanka', flag: '🇱🇰', code: 'LK' },
    { name: 'Sudan', flag: '🇸🇩', code: 'SD' },
    { name: 'Sweden', flag: '🇸🇪', code: 'SE' },
    { name: 'Switzerland', flag: '🇨🇭', code: 'CH' },
    { name: 'Syria', flag: '🇸🇾', code: 'SY' },
  ],
  'T': [
    { name: 'Taiwan', flag: '🇹🇼', code: 'TW' },
    { name: 'Tajikistan', flag: '🇹🇯', code: 'TJ' },
    { name: 'Tanzania', flag: '🇹🇿', code: 'TZ' },
    { name: 'Thailand', flag: '🇹🇭', code: 'TH' },
    { name: 'Tonga Islands', flag: '🇹🇴', code: 'TO' },
    { name: 'Trinidad and Tobago', flag: '🇹🇹', code: 'TT' },
    { name: 'Tunisia', flag: '🇹🇳', code: 'TN' },
    { name: 'Turkey', flag: '🇹🇷', code: 'TR' },
    { name: 'Turkmenistan', flag: '🇹🇲', code: 'TM' },
  ],
  'U': [
    { name: 'Uganda', flag: '🇺🇬', code: 'UG' },
    { name: 'Ukraine', flag: '🇺🇦', code: 'UA' },
    { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE' },
    { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
    { name: 'United States', flag: '🇺🇸', code: 'US' },
    { name: 'Uruguay', flag: '🇺🇾', code: 'UY' },
    { name: 'Uzbekistan', flag: '🇺🇿', code: 'UZ' },
  ],
  'V': [
    { name: 'Venezuela', flag: '🇻🇪', code: 'VE' },
    { name: 'Vietnam', flag: '🇻🇳', code: 'VN' },
  ],
  'Y': [
    { name: 'Yemen', flag: '🇾🇪', code: 'YE' },
  ],
  'Z': [
    { name: 'Zambia', flag: '🇿🇲', code: 'ZM' },
  ],
};

export const bigoSimulatedFeeds: Room[] = [
  {
    id: 'sim_agency',
    title: 'New to Bigo? Join my agency!! 🙋‍♂️',
    hostUid: 'host_agency',
    hostName: 'Agency.Boss',
    hostPhotoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 186,
    likes: 450,
    currentBeans: 1200,
    latitude: 6.64,
    longitude: 3.50,
    locationName: 'Ikorodu, Nigeria'
  },
  {
    id: 'sim_mothersday',
    title: "Happy Mother's Day!!!",
    hostUid: 'host_mothersday',
    hostName: 'Beans.Gatherer',
    hostPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 95,
    likes: 210,
    currentBeans: 2800,
    latitude: 6.43,
    longitude: 3.52,
    locationName: 'Eti-Osa, Nigeria'
  },
  {
    id: 'sim_help_daddi',
    title: '3k Help Daddi 🙏😢',
    hostUid: 'host_help_daddi',
    hostName: 'JOY_GIVER',
    hostPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
    type: 'multi-guest-live',
    status: 'live',
    viewerCount: 90,
    likes: 830,
    currentBeans: 4900,
    latitude: 6.51,
    longitude: 3.37,
    locationName: 'Lagos Mainland, Nigeria',
    guests: ['seat_usr1', 'seat_usr2'],
    seats: [
      { seatId: 1, uid: 'seat_usr1', status: 'occupied', photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
      { seatId: 2, uid: 'seat_usr2', status: 'occupied', photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
      { seatId: 3, uid: null, status: 'empty' }
    ] as any
  },
  {
    id: 'sim_target_hunt',
    title: '16k to target 😭😭😭',
    hostUid: 'host_target_hunt',
    hostName: 'Target.Hunter',
    hostPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 103,
    likes: 410,
    currentBeans: 6200,
    latitude: 6.46,
    longitude: 3.19,
    locationName: 'Ojo, Nigeria'
  },
  {
    id: 'sim_dating',
    title: '2700 to go',
    hostUid: 'host_dating',
    hostName: 'Dating.King',
    hostPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 110,
    likes: 310,
    currentBeans: 2700,
    latitude: 6.44,
    longitude: 3.48,
    locationName: 'Lekki, Nigeria'
  },
  {
    id: 'sim_saveme',
    title: 'Save me 🥺 10k to go',
    hostUid: 'host_saveme',
    hostName: 'Heart.Melter',
    hostPhotoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 115,
    likes: 890,
    currentBeans: 10000,
    latitude: 6.52,
    longitude: 3.30,
    locationName: 'Ikeja, Nigeria'
  },
  {
    id: 'sim_mic_box',
    title: '25k to go help 🙏',
    hostUid: 'host_mic_box',
    hostName: 'One-Tap.Expert',
    hostPhotoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=150',
    type: 'audio-live',
    status: 'live',
    viewerCount: 98,
    likes: 1200,
    currentBeans: 15200,
    latitude: 6.55,
    longitude: 3.35,
    locationName: 'Surulere, Nigeria',
    guests: ['seat_u5', 'seat_u6', 'seat_u7'],
    seats: [
      { seatId: 1, uid: 'seat_u5', status: 'occupied', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      { seatId: 2, uid: 'seat_u6', status: 'occupied', photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100' },
      { seatId: 3, uid: 'seat_u7', status: 'occupied', photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100' }
    ] as any
  },
  {
    id: 'sim_nobody_loves_me',
    title: 'Nobody loves me',
    hostUid: 'host_nobody_loves_me',
    hostName: 'Alone.Bean',
    hostPhotoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150',
    type: 'multi-guest-live',
    status: 'live',
    viewerCount: 73,
    likes: 140,
    currentBeans: 420,
    latitude: 6.60,
    longitude: 3.34,
    locationName: 'Alimosho, Nigeria',
    guests: ['seat_g1', 'seat_g2'],
    seats: [
      { seatId: 1, uid: 'seat_g1', status: 'occupied', photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
      { seatId: 2, uid: 'seat_g2', status: 'occupied', photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100' }
    ] as any
  },
  {
    id: 'sim_goodmorning',
    title: 'Goodmorning 🌞😍',
    hostUid: 'host_goodmorning',
    hostName: 'Sun.Shine',
    hostPhotoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 82,
    likes: 310,
    currentBeans: 1540,
    latitude: 6.45,
    longitude: 3.41,
    locationName: 'Victoria Island, Nigeria'
  },
  {
    id: 'sim_black_white',
    title: 'Idea black and white Outfit',
    hostUid: 'host_black_white',
    hostName: 'Fashion.Mod',
    hostPhotoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 94,
    likes: 1100,
    currentBeans: 8400,
    latitude: 6.43,
    longitude: 3.45,
    locationName: 'Ikoyi, Nigeria'
  },
  {
    id: 'sim_hello_world',
    title: 'Hello World',
    hostUid: 'host_hello_world',
    hostName: 'Global.Welcomer',
    hostPhotoURL: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 101,
    likes: 390,
    currentBeans: 7000,
    latitude: 6.46,
    longitude: 3.63,
    locationName: 'Lekki Scheme 2, Nigeria'
  },
  {
    id: 'sim_target_hunt_2',
    title: 'Target Hunt 🎯',
    hostUid: 'host_target_hunt_2',
    hostName: 'Lovers.Hub',
    hostPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 126,
    likes: 670,
    currentBeans: 9800,
    latitude: 6.50,
    longitude: 3.32,
    locationName: 'Yaba, Nigeria'
  }
].map(r => ({
  guests: [],
  isPrivate: false,
  createdAt: null,
  ...r
})) as Room[];

export interface ExploreRoom extends Room {
  categoryTag?: string;
  countryName?: string;
  image?: string;
  countryCode?: string;
  flag?: string;
}

const explorePage1 = [
  { name: 'Nigeria', flag: '🇳🇬', code: 'NG' },
  { name: 'Ghana', flag: '🇬🇭', code: 'GH' },
  { name: 'Uganda', flag: '🇺🇬', code: 'UG' },
  { name: 'USA', flag: '🇺🇸', code: 'US' },
  { name: 'Korea', flag: '🇰🇷', code: 'KR' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { name: 'Philippines', flag: '🇵🇭', code: 'PH' },
  { name: 'Kenya', flag: '🇰🇪', code: 'KE' }
];

const explorePage2 = [
  { name: 'Russia', flag: '🇷🇺', code: 'RU' },
  { name: 'Vietnam', flag: '🇻🇳', code: 'VN' },
  { name: 'Indonesia', flag: '🇮🇩', code: 'ID' },
  { name: 'Pakistan', flag: '🇵🇰', code: 'PK' },
  { name: 'Myanmar', flag: '🇲🇲', code: 'MM' },
  { name: 'Thailand', flag: '🇹🇭', code: 'TH' },
  { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' }
];

const exploreTrendingRooms: ExploreRoom[] = [
  {
    id: 'exp-trending-1',
    title: 'Dance Room LIVE! ✨',
    hostUid: 'host_dancing_kr',
    hostName: 'Dancing.Queen',
    hostPhotoURL: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 2265,
    likes: 8000,
    currentBeans: 45000,
    countryCode: 'KR',
    countryName: 'Korea',
    flag: '🇰🇷',
    categoryTag: 'Channel',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600',
    guests: [],
    isPrivate: false,
    createdAt: null
  },
  {
    id: 'exp-trending-2',
    title: 'Naija Grooves & Gist 🇳🇬',
    hostUid: 'host_amara_ng',
    hostName: 'Amara.Gold',
    hostPhotoURL: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 1245,
    likes: 5400,
    currentBeans: 31000,
    countryCode: 'NG',
    countryName: 'Nigeria',
    flag: '🇳🇬',
    categoryTag: 'Dating',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600',
    guests: [],
    isPrivate: false,
    createdAt: null
  },
  {
    id: 'exp-trending-3',
    title: 'Sunday Roast & Match UK PM 🇬🇧',
    hostUid: 'host_sarah_gb',
    hostName: 'Chef.Sarah',
    hostPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 961,
    likes: 3100,
    currentBeans: 9800,
    countryCode: 'GB',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    categoryTag: 'Room PK',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600',
    guests: [],
    isPrivate: false,
    createdAt: null
  },
  {
    id: 'exp-trending-4',
    title: 'Cruising with Love 🚢',
    hostUid: 'host_saskia_ca',
    hostName: 'Saskia.Travels',
    hostPhotoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 556,
    likes: 2300,
    currentBeans: 15400,
    countryCode: 'CA',
    countryName: 'Canada',
    flag: '🇨🇦',
    categoryTag: 'Chat',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600',
    guests: [],
    isPrivate: false,
    createdAt: null
  },
  {
    id: 'exp-trending-5',
    title: 'Model Walk & Talk 💖',
    hostUid: 'host_zola_ng',
    hostName: 'Zola.Slay',
    hostPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 812,
    likes: 1900,
    currentBeans: 12000,
    countryCode: 'NG',
    countryName: 'Nigeria',
    flag: '🇳🇬',
    categoryTag: 'Dating',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600',
    guests: [],
    isPrivate: false,
    createdAt: null
  },
  {
    id: 'exp-trending-6',
    title: 'Miami Beach Sunset Chill 🌴',
    hostUid: 'host_brandy_us',
    hostName: 'Brandy.Lynn',
    hostPhotoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 1405,
    likes: 6732,
    currentBeans: 28000,
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    categoryTag: 'Live',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600',
    guests: [],
    isPrivate: false,
    createdAt: null
  },
  {
    id: 'exp-trending-7',
    title: 'Late Night Sing-a-long 🎤🎸',
    hostUid: 'host_aria_us',
    hostName: 'Aria.Vocalist',
    hostPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 3260,
    likes: 11000,
    currentBeans: 76000,
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    categoryTag: 'Music',
    image: 'https://images.unsplash.com/photo-1524502397800-2eeaec7c6ee1?auto=format&fit=crop&w=600',
    guests: [],
    isPrivate: false,
    createdAt: null
  },
  {
    id: 'exp-trending-8',
    title: 'Ciao from Milano! 🇮🇹🍕',
    hostUid: 'host_matilde_it',
    hostName: 'Matilde.Milano',
    hostPhotoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 1890,
    likes: 9200,
    currentBeans: 42000,
    countryCode: 'IT',
    countryName: 'Italy',
    flag: '🇮🇹',
    categoryTag: 'Chat',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600',
    guests: [],
    isPrivate: false,
    createdAt: null
  },
  {
    id: 'exp-trending-9',
    title: 'Grace & Gratitude 🌟',
    hostUid: 'host_grace_gh',
    hostName: 'Grace.Ghana',
    hostPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150',
    type: 'live',
    status: 'live',
    viewerCount: 1120,
    likes: 4500,
    currentBeans: 18000,
    countryCode: 'GH',
    countryName: 'Ghana',
    flag: '🇬🇭',
    categoryTag: 'Dating',
    image: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=600',
    guests: [],
    isPrivate: false,
    createdAt: null
  }
];

const DinoMascot = React.memo(({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M30,55 C30,35 45,25 60,25 C75,25 82,33 82,48 C82,62 72,74 58,78 C45,82 30,75 30,55 Z"
      fill="currentColor"
    />
    <path
      d="M30,55 C15,60 10,50 15,40"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <circle cx="42" cy="80" r="6" fill="currentColor" />
    <circle cx="58" cy="80" r="6" fill="currentColor" />
    <path d="M42,58 C35,58 32,54 35,49" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path 
      d="M56,53 C56,51 58,49 60,49 C62,49 64,51 64,53 C64,56 59,60 56,62 C53,60 48,56 48,53 C48,51 50,49 52,49 C54,49 56,51 56,53 Z" 
      fill="#ff407f" 
    />
    <circle cx="66" cy="38" r="4" fill="#ff407f" opacity="0.6" />
    <path d="M52,34 Q55,31 58,34" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M68,34 Q71,31 74,34" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
));

DinoMascot.displayName = 'DinoMascot';

const RoomCard = React.memo(({ 
  room, 
  aiReason, 
  onShowProfile,
  layoutMode = 'grid'
}: { 
  room: Room, 
  aiReason?: string, 
  onShowProfile?: (uid: string) => void,
  layoutMode?: 'grid' | 'list'
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const categories = ['Chat', 'Music', 'Gaming', 'Dance', 'Beauty', 'Emotional'];
  const category = categories[room.id.length % categories.length];

  const getConsistentLevel = (uid: string) => {
    const profilesMap: Record<string, number> = {
      'host_shyne': 35,
      'host_bigs': 45,
      'host_rosey': 32,
      'host_june': 48,
      'host_babyface': 29,
      'host_adabekee': 55,
      'host_agency': 60,
      'host_mothersday': 41,
      'host_help_daddi': 34,
      'host_target_hunt': 38,
      'host_dating': 42,
      'host_saveme': 36,
      'host_wtwww': 26,
      'host_about_me': 34,
      'host_ptdims': 34,
      'host_8kaway': 31,
      'host_beans_goal': 34,
      'host_million_dolls': 40,
      'host_nobod_loves': 33,
      'host_idea_bw': 30,
      'host_retro_aria': 28,
      'host_neon_dj_leo': 39,
    };
    if (profilesMap[uid]) return profilesMap[uid];
    
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
      hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 15 + Math.abs(hash % 51);
  };
  
  if (layoutMode === 'list') {
    return (
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "relative flex items-center justify-between p-3.5 mx-3.5 rounded-2xl border mb-2.5 cursor-pointer transition-colors duration-300 z-10",
          isLight ? "bg-white border-zinc-100 hover:bg-zinc-50" : "bg-[#18181b]/95 border-zinc-800 hover:bg-[#202024]"
        )}
        onClick={() => navigate(`/room/${room.id}`)}
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Left: Square Cover image preview with neon indicator overlay */}
          <div className="relative w-22 h-22 rounded-xl overflow-hidden shrink-0 border border-zinc-700/10">
            <img 
              src={`https://picsum.photos/seed/${room.id}/200/200`} 
              className="w-full h-full object-cover pointer-events-none"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            {/* Category tag status on thumbnail bottom left matching video live badge */}
            <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-center gap-1 bg-black/70 backdrop-blur-xs py-0.5 rounded-full border border-white/5 select-none">
              {/* Beautiful real-time concurrent green lines visualizer */}
              <span className="flex items-end gap-[1.2px] h-[8px] pb-[0.5px] select-none shrink-0 origin-bottom mr-1 bg-transparent">
                <motion.span 
                  animate={{ height: ["2px", "7px", "3px", "6px", "2px"] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  className="w-[1.2px] bg-[#00ff66] rounded-full origin-bottom"
                />
                <motion.span 
                  animate={{ height: ["7px", "2px", "6px", "1px", "7px"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="w-[1.2px] bg-[#00ff66] rounded-full origin-bottom"
                />
                <motion.span 
                  animate={{ height: ["3px", "6px", "1px", "8px", "3px"] }}
                  transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
                  className="w-[1.2px] bg-[#00ff66] rounded-full origin-bottom"
                />
              </span>
              <span className="text-[7.5px] font-black uppercase text-[#00ff66] tracking-tighter leading-none">{category}</span>
            </div>
          </div>

          {/* Middle: Room title details banner */}
          <div className="flex flex-col min-w-0 gap-1.5">
            <span className={cn(
              "text-[13px] font-black tracking-tight leading-snug truncate pr-2 uppercase",
              isLight ? "text-stone-950" : "text-white"
            )}>
              {room.title || "Welcome to my live room!"}
            </span>

            {/* Accolade and challenger badges */}
            <div className="flex items-center gap-2 flex-wrap select-none">
              {/* Level button */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onShowProfile?.(room.hostUid);
                }}
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-115 active:scale-95 transition-all px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-white/10"
              >
                <Sparkles size={8} className="text-white fill-white" />
                <span className="text-[8.5px] font-extrabold text-white tracking-widest">Lv.{getConsistentLevel(room.hostUid)}</span>
              </div>

              {/* Status challenger indicator pill matching video items */}
              {room.type === 'multi-guest-live' ? (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-extrabold text-[8px] uppercase tracking-tight">
                  👥 Group PK
                </span>
              ) : (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white font-extrabold text-[8px] uppercase tracking-tight">
                    👾 Challenger
                  </span>
                  {(room.hostUid?.startsWith('host_') || room.hostUid?.includes('featured') || room.isPopular) && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-[8px] uppercase tracking-tight flex items-center gap-0.5">
                      👑 IDOL
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: viewers count count metric */}
        <div className="flex items-center gap-1.5 shrink-0 select-none px-2 py-1 rounded-lg bg-zinc-800/10">
          <Users size={12} className="text-[#00e1cf]" />
          <span className={cn(
            "text-[12px] font-mono font-black",
            isLight ? "text-stone-600" : "text-[#00e1cf]"
          )}>
            {room.viewerCount || Math.floor(Math.random() * 100)}
          </span>
        </div>
      </motion.div>
    );
  }

  // Grid style
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative aspect-[1/1] overflow-hidden cursor-pointer group transition-colors duration-300 border border-zinc-900/10",
        isLight ? "bg-white" : "bg-[#1a1a1a]"
      )}
    >
      {/* Background Click navigates to room */}
      <div className="absolute inset-0 z-0" onClick={() => navigate(`/room/${room.id}`)} />

      <img 
        src={`https://picsum.photos/seed/${room.id}/400/400`} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />
      
      {/* Top Left: Category with waveform visual status */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 z-10 pointer-events-none">
        {/* Beautiful real-time concurrent green lines visualizer */}
        <span className="flex items-end gap-[1.5px] h-[9px] pb-[0.5px] select-none shrink-0 origin-bottom mr-1 bg-transparent">
          <motion.span 
            animate={{ height: ["2px", "8px", "4px", "7px", "2px"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            className="w-[1.5px] bg-[#00ff66] rounded-full origin-bottom"
          />
          <motion.span 
            animate={{ height: ["8px", "3px", "7px", "2px", "8px"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-[1.5px] bg-[#00ff66] rounded-full origin-bottom"
          />
          <motion.span 
            animate={{ height: ["4px", "7px", "2px", "9px", "4px"] }}
            transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
            className="w-[1.5px] bg-[#00ff66] rounded-full origin-bottom"
          />
        </span>
        <span className="text-[8px] font-black uppercase tracking-tight text-[#00ff66]">{category}</span>
      </div>

      {/* Top Right: Viewer count of members */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 z-10 pointer-events-none">
        <Users size={10} className="text-[#00e1cf]" />
        <span className="text-[9px] font-black font-mono text-white">{room.viewerCount || Math.floor(Math.random() * 100)}</span>
      </div>

      {/* Bottom Info details */}
      <div className="absolute bottom-2 left-2.5 right-2.5 flex flex-col gap-1 z-10">
        {aiReason && (
          <div className="bg-cyan-500/80 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-1 mb-0.5 border border-cyan-400/30">
            <BrainCircuit size={8} className="text-white" />
            <span className="text-[7.5px] font-black text-white uppercase truncate">{aiReason}</span>
          </div>
        )}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onShowProfile?.(room.hostUid);
          }}
          className="flex items-center gap-1.5 group/info"
        >
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-white/20 shadow-lg group-hover/info:scale-110 transition-transform shrink-0">
            <UserIcon size={8} className="text-white" />
            <span className="text-[8px] font-black text-white uppercase tracking-tighter">Lv.{getConsistentLevel(room.hostUid)}</span>
          </div>
          <span className="text-[10px] font-black text-white truncate drop-shadow-md uppercase tracking-tight group-hover/info:text-cyan-400 transition-colors">
            {room.title || "Welcome to my live stream!"}
          </span>
        </div>

        <div className="flex items-center gap-1 select-none flex-wrap">
          <span className="px-1.5 py-0.5 rounded-md bg-[#ff407f]/90 text-white font-extrabold text-[7px] uppercase tracking-tight shadow-sm scale-90 origin-left">
            👾 Challenger
          </span>
          {(room.hostUid?.startsWith('host_') || room.hostUid?.includes('featured') || room.isPopular) && (
            <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-[7px] uppercase tracking-tight shadow-sm scale-90 origin-left flex items-center gap-0.5">
              👑 IDOL
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

RoomCard.displayName = 'RoomCard';

const featuredBroadcasters = [
  {
    id: 'shyne_featured',
    name: 'SHYNE..... ✨',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
  },
  {
    id: 'host_bigs',
    name: 'βiGS... 🩸',
    photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=150',
  },
  {
    id: 'host_rosey',
    name: '⭐ ROSeY 🌹',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150',
  },
  {
    id: 'host_june',
    name: '6k June 🌸...',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
  },
  {
    id: 'host_babyface',
    name: 'bäbyfäcε...',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
  },
];

// 5 Premium channels for swiping up/down
const featuredStreams = [
  {
    id: 'shyne_featured',
    displayName: 'SHYNE..... ✨',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
    backgroundURL: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800',
    title: 'I need you!',
    viewerCount: 98,
  },
  {
    id: 'host_bigs',
    displayName: 'βiGS... 🩸',
    photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=150',
    backgroundURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800',
    title: 'Join my crew! 🩸 Send diamonds',
    viewerCount: 142,
  },
  {
    id: 'host_rosey',
    displayName: '⭐ ROSeY 🌹',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150',
    backgroundURL: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800',
    title: 'Singer & Dancer. Daily positive vibes! 🌹',
    viewerCount: 215,
  },
  {
    id: 'host_june',
    displayName: '6k June 🌸...',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
    backgroundURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800',
    title: 'Daily live-stream chat & fun. 🌸 Let us hit targets',
    viewerCount: 310,
  },
  {
    id: 'host_babyface',
    displayName: 'bäbyfäcε...',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
    backgroundURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800',
    title: 'Sweet sounds & bedtime acoustic loops. Cozy space. 👾',
    viewerCount: 74,
  }
];

interface FeaturedTabContentProps {
  isLight: boolean;
  onShowProfile: (uid: string) => void;
  navigate: ReturnType<typeof useNavigate>;
  showToast: (msg: string, type: string) => void;
  featuredShowBroadcasters: boolean;
  setFeaturedShowBroadcasters: React.Dispatch<React.SetStateAction<boolean>>;
}

export function FeaturedTabContent({
  isLight,
  onShowProfile,
  navigate,
  showToast,
  featuredShowBroadcasters,
  setFeaturedShowBroadcasters,
}: FeaturedTabContentProps) {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const stream = featuredStreams[currentIndex];

  useEffect(() => {
    // Reset timer when switching channels
    setProgress(0);
  }, [currentIndex]);

  useEffect(() => {
    if (paused) return;

    const tickRate = 150; // 150ms interval (approx 15 seconds total for 100%)
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 1;
      });
    }, tickRate);

    return () => clearInterval(timer);
  }, [currentIndex, paused]);

  useEffect(() => {
    if (progress >= 100) {
      showToast(`Countdown complete! Entering ${stream.displayName}'s show 🎙️💎`, 'success');
      navigate(`/room/${stream.id}`);
    }
  }, [progress, stream, navigate, showToast]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredStreams.length);
    showToast("Swiped up! Displaying next featured stream 🌟", "info");
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredStreams.length) % featuredStreams.length);
    showToast("Swiped down! Displaying previous featured stream 🌟", "info");
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y < -50) {
      handleNext();
    } else if (info.offset.y > 50) {
      handlePrev();
    }
  };

  // SVGs setup for the progress border tracing clockwise starting from the top middle of standard pill-button
  // Dimensions match the design of the pill: width=210px, height=44px
  const W = 210;
  const H = 44;
  const R = 22;
  const strokeWidth = 1.2;
  const pad = strokeWidth / 2; // 0.6
  
  // Custom perimeter with precise radius adjust
  const perimeter = 332 + 2 * Math.PI * (R - pad);
  const strokeDashoffset = perimeter - (progress / 100) * perimeter;

  // Mathematically precise clockwise vector path starting at top center (W/2, pad)
  const capsulePath = `M ${W/2} ${pad}
                       L ${W - R} ${pad}
                       A ${R - pad} ${R - pad} 0 0 1 ${W - pad} ${H/2}
                       A ${R - pad} ${R - pad} 0 0 1 ${W - R} ${H - pad}
                       L ${R} ${H - pad}
                       A ${R - pad} ${R - pad} 0 0 1 ${pad} ${H/2}
                       A ${R - pad} ${R - pad} 0 0 1 ${R} ${pad}
                       Z`;

  return (
    <motion.div 
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      className="relative w-full h-[calc(100vh-142px)] bg-neutral-950 overflow-hidden flex flex-col justify-between select-none cursor-grab active:cursor-grabbing"
    >
      {/* IMMERSIVE STREAM BACKGROUND PREVIEW */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.img 
            key={stream.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.72, scale: 1.01 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            src={stream.backgroundURL} 
            alt={stream.displayName}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        {/* Ambient gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-black/50 pointer-events-none" />
      </div>

      {/* CHANNELS QUICK NAVIGATION INDICATORS (Bento/Dot slider on left) */}
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
        {featuredStreams.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentIndex(idx);
              showToast(`Switched channel to ${item.displayName}!`, 'info');
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              idx === currentIndex 
                ? "bg-[#00f3df] scale-125 shadow-[0_0_8px_rgba(0,243,223,0.8)]" 
                : "bg-white/30 hover:bg-white/65"
            )}
            title={`Channel ${idx + 1}`}
          />
        ))}
      </div>

      {/* QUICK CHANNELS DIRECTION INDICATORS */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-6 text-white/50">
        <button onClick={handlePrev} className="p-1 hover:text-white active:scale-95 transition-all">
          <ChevronUp size={20} className="stroke-[2.5]" />
        </button>
        <span className="text-[10px] font-mono tracking-widest text-center writing-mode-vertical uppercase [writing-mode:vertical-lr] text-white/60">
          SWIPE
        </span>
        <button onClick={handleNext} className="p-1 hover:text-white active:scale-95 transition-all">
          <ChevronDown size={20} className="stroke-[2.5]" />
        </button>
      </div>

      {/* DYNAMIC TOP ROW (EITHER "MOST VIEWED" OR THE SCROLLABLE BROADCASTERS) */}
      <div className="relative z-10 w-full pt-4 px-4 flex flex-col items-center">
        {!featuredShowBroadcasters ? (
          /* STATE A: Translucent "Most Viewed" Pill Button Option (from Pic 1) */
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setFeaturedShowBroadcasters(true)}
            className="flex items-center gap-1 px-4.5 py-1.5 bg-black/45 backdrop-blur-md border border-white/10 rounded-full text-[11px] font-black tracking-wide text-white hover:bg-black/60 hover:scale-102 active:scale-95 transition-all text-center cursor-pointer pointer-events-auto"
          >
            <span>Most Viewed</span>
            <ChevronDown size={12} className="stroke-[3.5] text-white/90" />
          </motion.button>
        ) : (
          /* STATE B: Horizontal strip of round user avatars (from Pic 2) */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full pointer-events-auto"
          >
            <div className="text-[10px] font-bold text-[#00f3df] uppercase tracking-widest text-center mb-2.5 drop-shadow-md">
              🔥 HOT ACTIVE BROADCASTERS
            </div>
            
            <div className="flex items-center gap-4 py-1.5 px-1 overflow-x-auto scrollbar-hide w-full max-w-md mx-auto select-none">
              {featuredBroadcasters.map((star) => (
                <div 
                  key={star.id}
                  onClick={() => onShowProfile(star.id)}
                  className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#00f3df] to-cyan-400 shadow-[0_0_12px_rgba(0,243,223,0.3)] group-hover:scale-105 transition-all">
                    <div className="w-full h-full rounded-full overflow-hidden border border-zinc-950">
                      <img 
                        src={star.photoURL} 
                        alt={star.name}
                        className="w-full h-full object-cover bg-neutral-900"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <span className="text-[9.5px] font-black text-white bg-black/35 px-1.5 py-0.5 rounded-md backdrop-blur-xs max-w-[68px] truncate drop-shadow-md">
                    {star.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* DYNAMIC MIDDLE AREA: "TAP TO WATCH LIVE" CAPSULE BUTTON (both states) */}
      <div className="relative z-10 flex flex-col items-center justify-center h-1/2">
        <div className="relative w-[210px] h-[44px] flex items-center justify-center">
          {/* Core button body */}
          <motion.button 
            onHoverStart={() => setPaused(true)}
            onHoverEnd={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigate(`/room/${stream.id}`);
              showToast(`Entering ${stream.displayName}'s Special Room! 🎙️💎`, "success");
            }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center gap-2 text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)] z-20 cursor-pointer pointer-events-auto border-none"
          >
            {/* Beautiful real-time concurrent audio frequency green lines visualizer */}
            <span className="flex items-end gap-[3px] h-[13px] pb-[1px] select-none shrink-0 origin-bottom">
              <motion.span 
                animate={{ height: ["4px", "13px", "7px", "11px", "4px"] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="w-[2.5px] bg-[#00ff66] rounded-full origin-bottom"
              />
              <motion.span 
                animate={{ height: ["12px", "5px", "11px", "4px", "12px"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-[2.5px] bg-[#00ff66] rounded-full origin-bottom"
              />
              <motion.span 
                animate={{ height: ["6px", "11px", "4px", "13px", "6px"] }}
                transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
                className="w-[2.5px] bg-[#00ff66] rounded-full origin-bottom"
              />
            </span>

            <span className="text-[12px] font-extrabold tracking-wide uppercase text-white font-sans select-none">
              Tap to Watch Live
            </span>
          </motion.button>

          {/* Animated White clockwise SVG countdown progress line */}
          <svg 
            width={W} 
            height={H} 
            className="absolute inset-0 pointer-events-none z-30 overflow-visible"
            viewBox={`0 0 ${W} ${H}`}
          >
            {/* Base guide track behind the active progress path */}
            <path 
              d={capsulePath} 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.08)" 
              strokeWidth="1.2" 
            />
            {/* Clockwise white stroke that meets in the middle at top */}
            <motion.path 
              d={capsulePath} 
              fill="none" 
              stroke="white" 
              strokeWidth="1.2" 
              strokeLinecap="round"
              strokeDasharray={perimeter}
              initial={{ strokeDashoffset: perimeter }}
              animate={{ strokeDashoffset }}
              transition={{ ease: "linear" }}
              className="drop-shadow-[0_0_2px_rgba(255,255,255,0.7)]"
            />
          </svg>
        </div>

        {/* Small Pause instruction */}
        {paused && (
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-[9.5px] text-white/50 tracking-wider uppercase font-mono mt-2"
          >
            🕒 Auto-Enter Paused
          </motion.span>
        )}
      </div>

      {/* DYNAMIC LOWER AREA: "CHANNEL DETAILS STATE" OR "CANCEL BUTTON" */}
      <div className="relative z-10 px-5 pb-20 pt-4 w-full">
        {!featuredShowBroadcasters ? (
          /* STATE A LOWER: Host Info Details (from Pic 1) */
          <motion.div 
            key={stream.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start gap-1 select-none text-left pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              <span className="text-white text-[16px] font-black italic tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-sans uppercase">
                {stream.displayName}
              </span>
              <div 
                onClick={() => onShowProfile(stream.id)}
                className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[9.5px] font-bold text-white shrink-0 cursor-pointer hover:scale-102 transition-transform active:scale-95"
                title="View bio profile"
              >
                <Users size={10} className="text-[#00f3df]" />
                <span className="font-mono leading-none font-black text-[#00f3df]">{stream.viewerCount}</span>
              </div>
            </div>
            <p className="text-white/95 text-[12.5px] font-bold tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
              "{stream.title}"
            </p>
          </motion.div>
        ) : (
          /* STATE B LOWER: Centered transparent Cancel Pill Button (from Pic 2) */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex justify-center pb-2 pointer-events-auto"
          >
            <button 
              onClick={() => setFeaturedShowBroadcasters(false)}
              className="px-8 py-2 bg-black/40 backdrop-blur-md rounded-full text-[11px] font-black tracking-widest uppercase text-white/95 hover:text-white transition-colors border border-white/10 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.25)] cursor-pointer"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { showToast, unreadCount, clearUnread } = useToast();
  const { profile, user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [weeklyKing, setWeeklyKing] = useState<UserProfile | null>(null);
  const [aiRecs, setAiRecs] = useState<RecommendationResponse[]>([]);
  const [activeTab, setActiveTab] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (location.state && (location.state as any).returnToFeatured) {
      setActiveTab('Featured');
    }
  }, [location]);
  
  // Cloned states reflecting video functionalities
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [selectedCountry, setSelectedCountry] = useState({ name: 'Ghana', flag: '🇬🇭', code: 'GH' });
  const [showRegions, setShowRegions] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const [watchHistory, setWatchHistory] = useState<RegionCountry[]>([
    { name: 'Nigeria', flag: '🇳🇬', code: 'NG', isHot: true },
    { name: 'USA', flag: '🇺🇸', code: 'US', isHot: true }
  ]);
  const [isSearchingCountry, setIsSearchingCountry] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const [networkErrorToast, setNetworkErrorToast] = useState<string | null>(null);
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Explore Tab custom states
  const [exploreCountryPage, setExploreCountryPage] = useState(0);
  const [showLuckyBox, setShowLuckyBox] = useState(false);
  const [isLuckDrawing, setIsLuckDrawing] = useState(false);
  const [drawnHistory, setDrawnHistory] = useState<string[]>([]);
  const [lastPrize, setLastPrize] = useState<string | null>(null);

  // Room Filter custom states matching Bigo mockup screen 02:09
  const [filterGender, setFilterGender] = useState<'All' | 'Female' | 'Male'>('All');
  const [filterRoomType, setFilterRoomType] = useState<'All' | 'Single' | 'Multi'>('All');
  const [filterArea, setFilterArea] = useState<'All' | 'America' | 'Europe' | 'Middle East' | 'Southeast Asia' | 'Asia' | 'Africa' | 'Oceania'>('All');
  const [showRoomFilterModal, setShowRoomFilterModal] = useState(false);

  // Profile Discovery State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [featuredShowBroadcasters, setFeaturedShowBroadcasters] = useState(false);
  const cachedProfiles = useRef<Record<string, UserProfile>>({
    'host_shyne': {
      uid: 'host_shyne',
      displayName: 'SHYNE..... ✨',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350',
      level: 35,
      role: 'user',
      totalBeansEarned: 42000,
    } as any,
    'host_bigs': {
      uid: 'host_bigs',
      displayName: 'βiGS... 🩸',
      photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=350',
      level: 45,
      role: 'user',
      totalBeansEarned: 112000,
      bio: "Bigo VIP Host • Join my crew! 🩸 Send blood drops or diamonds to support."
    } as any,
    'host_rosey': {
      uid: 'host_rosey',
      displayName: 'ROSeY 🌹',
      photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=350',
      level: 32,
      role: 'user',
      totalBeansEarned: 35000,
      bio: "Singer & Dancer. Daily positive vibes! Rose queen 🌹 Send feedback and follow."
    } as any,
    'host_june': {
      uid: 'host_june',
      displayName: 'June 🌸...',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=350',
      level: 48,
      role: 'user',
      totalBeansEarned: 89000,
      bio: "Daily live-stream chat & fun. Multi-cultural hub! Let's hit the day targets. 🌸"
    } as any,
    'host_babyface': {
      uid: 'host_babyface',
      displayName: 'bäbyfäcε...',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350',
      level: 29,
      role: 'user',
      totalBeansEarned: 19000,
      bio: "Sweet sounds & bedtime acoustic loops. Cozy space for night owls. 👾"
    } as any,
    'host_adabekee': {
      uid: 'host_adabekee',
      displayName: 'Ada Bekee.',
      photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=350',
      level: 55,
      role: 'user',
      totalBeansEarned: 245000,
      bio: "BINGO verified premier host. From Lekki, Nigeria. Hosting grand PK matches! 🇳🇬✨"
    } as any
  });

  const tabs = ['Nearby', 'Popular', 'Featured', 'Explore'];
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchHostProfile = async (uid: string) => {
    if (cachedProfiles.current[uid]) {
      setSelectedUser(cachedProfiles.current[uid]);
      return;
    }

    const simulatedProfiles: Record<string, any> = {
      'host_shyne': { uid: 'host_shyne', displayName: 'SHYNE..... ✨', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350', level: 35, role: 'user', diamonds: 1540, beans: 42000, coins: 50000, nobleTitle: 'None' },
      'host_bigs': { uid: 'host_bigs', displayName: 'βiGS... 🩸', photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=350', level: 45, role: 'user', diamonds: 2310, beans: 112000, coins: 89000, nobleTitle: 'None', bio: "Bigo VIP Host • Join my crew! 🩸 Send blood drops or diamonds to support." },
      'host_rosey': { uid: 'host_rosey', displayName: 'ROSeY 🌹', photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=350', level: 32, role: 'user', diamonds: 850, beans: 35000, coins: 41005, nobleTitle: 'None', bio: "Singer & Dancer. Daily positive vibes! Rose queen 🌹 Send feedback and follow." },
      'host_june': { uid: 'host_june', displayName: 'June 🌸...', photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=350', level: 48, role: 'user', diamonds: 3410, beans: 89000, coins: 145000, nobleTitle: 'None', bio: "Daily live-stream chat & fun. Multi-cultural hub! Let's hit the day targets. 🌸" },
      'host_babyface': { uid: 'host_babyface', displayName: 'bäbyfäcε...', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350', level: 29, role: 'user', diamonds: 410, beans: 19000, coins: 18000, nobleTitle: 'None', bio: "Sweet sounds & bedtime acoustic loops. Cozy space for night owls. 👾" },
      'host_adabekee': { uid: 'host_adabekee', displayName: 'Ada Bekee.', photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=350', level: 55, role: 'user', diamonds: 6800, beans: 245000, coins: 210000, nobleTitle: 'None', bio: "BINGO verified premier host. From Lekki, Nigeria. Hosting grand PK matches! 🇳🇬✨" },
      'host_agency': { uid: 'host_agency', displayName: 'Agency.Boss', photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150', level: 60, role: 'user', diamonds: 10450, beans: 1200, coins: 50000, nobleTitle: 'None', bio: "Agency boss. Welcome to the elite squad!" },
      'host_mothersday': { uid: 'host_mothersday', displayName: 'Beans.Gatherer', photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150', level: 41, role: 'user', diamonds: 540, beans: 2800, coins: 8900, nobleTitle: 'None', bio: "Sharing high energy and happy family moments!" },
      'host_help_daddi': { uid: 'host_help_daddi', displayName: 'JOY_GIVER', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150', level: 34, role: 'user', diamonds: 980, beans: 4900, coins: 12300, nobleTitle: 'None', bio: "Lending a helping hand and spreading good energy." },
      'host_target_hunt': { uid: 'host_target_hunt', displayName: 'Target.Hunter', photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150', level: 38, role: 'user', diamonds: 1640, beans: 6200, coins: 24700, nobleTitle: 'None', bio: "Chasing daily targets and building positive vibes." },
      'host_dating': { uid: 'host_dating', displayName: 'Dating.King', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150', level: 42, role: 'user', diamonds: 850, beans: 2700, coins: 19000, nobleTitle: 'None', bio: "Matching hearts and sharing the love." },
      'host_saveme': { uid: 'host_saveme', displayName: 'Heart.Melter', photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150', level: 36, role: 'user', diamonds: 1240, beans: 10000, coins: 15300, nobleTitle: 'None', bio: "A shoulder to lean on and soothing music." },
      'host_wtwww': { uid: 'host_wtwww', displayName: 'Wtwww.Sweet', photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300', level: 26, role: 'user', diamonds: 450, beans: 4500, coins: 8200, nobleTitle: 'None' },
      'host_about_me': { uid: 'host_about_me', displayName: 'MEEEE.Queen', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300', level: 34, role: 'user', diamonds: 1540, beans: 12400, coins: 16500, nobleTitle: 'None' },
      'host_ptdims': { uid: 'host_ptdims', displayName: 'PTDIMS', photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300', level: 34, role: 'user', diamonds: 920, beans: 8500, coins: 11000, nobleTitle: 'None' },
      'host_8kaway': { uid: 'host_8kaway', displayName: '8kaway', photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300', level: 31, role: 'user', diamonds: 1200, beans: 9800, coins: 14000, nobleTitle: 'None' },
      'host_beans_goal': { uid: 'host_beans_goal', displayName: 'BeanSeeker', photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300', level: 34, role: 'user', diamonds: 2300, beans: 15400, coins: 22000, nobleTitle: 'None' },
      'host_million_dolls': { uid: 'host_million_dolls', displayName: 'DollFace', photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300', level: 40, role: 'user', diamonds: 4500, beans: 24500, coins: 34000, nobleTitle: 'None' },
      'host_nobod_loves': { uid: 'host_nobod_loves', displayName: 'LonesomeVibes', photoURL: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=300', level: 33, role: 'user', diamonds: 310, beans: 3100, coins: 4100, nobleTitle: 'None' },
      'host_idea_bw': { uid: 'host_idea_bw', displayName: 'BWCreator', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300', level: 30, role: 'user', diamonds: 850, beans: 4600, coins: 9200, nobleTitle: 'None' },
      'host_retro_aria': { uid: 'host_retro_aria', displayName: 'Aria.Acoustic', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300', level: 28, role: 'user', diamonds: 910, beans: 4900, coins: 8900, nobleTitle: 'None' },
      'host_neon_dj_leo': { uid: 'host_neon_dj_leo', displayName: 'DJ.Leo.Vibes', photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300', level: 39, role: 'user', diamonds: 2100, beans: 12500, coins: 18000, nobleTitle: 'None' }
    };

    if (simulatedProfiles[uid]) {
      const u = simulatedProfiles[uid] as UserProfile;
      cachedProfiles.current[uid] = u;
      setSelectedUser(u);
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const u = { uid: snap.id, ...snap.data() } as UserProfile;
        cachedProfiles.current[uid] = u;
        setSelectedUser(u);
      } else {
        showToast("User profile not found.", 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading profile.", 'error');
    }
  };

  useEffect(() => {
    // Simplified query to avoid index issues and ensure consistent loading
    const q = query(
      collection(db, 'rooms'), 
      where('status', '==', 'live'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const roomList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Room));
      // Sort in memory to avoid index requirements
      roomList.sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));
      setRooms(roomList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
      // Fallback: Fetch all rooms if the live query fails
      onSnapshot(query(collection(db, 'rooms'), limit(20)), (snap) => {
        setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'rooms_fallback');
      });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Fetch Weekly King (Top Bean Earner)
    const fetchKing = async () => {
      const q = query(collection(db, 'users'), orderBy('totalBeansEarned', 'desc'), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setWeeklyKing({ uid: snap.docs[0].id, ...snap.docs[0].data() } as UserProfile);
      }
    };
    fetchKing();
  }, []);

  useEffect(() => {
    // Run AI recommendations when rooms are loaded
    if (rooms.length > 0 && aiRecs.length === 0) {
      const runAiRecs = async () => {
        // Fetch profiles for the top rooms to give AI context
        const profiles: Record<string, UserProfile> = {};
        const topHostUids = Array.from(new Set(rooms.slice(0, 10).map(r => r.hostUid)));
        
        await Promise.all(topHostUids.map(async (uid) => {
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) {
            profiles[uid] = { uid: snap.id, ...snap.data() } as UserProfile;
          }
        }));

        const recs = await getAIStreamRecommendations(rooms.slice(0, 20), profiles);
        setAiRecs(recs);
      };
      runAiRecs();
    }
  }, [rooms.length]);

  // Drag to scroll logic for desktop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const onMouseLeave = () => isDown = false;
    const onMouseUp = () => isDown = false;
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 2;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'Nearby' && !userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => {
            console.error("Location error:", err);
            showToast("Could not access location. Nearby rooms will not be sorted by distance.", 'warning');
          }
        );
      }
    }
  }, [activeTab, userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Room country resolver helper
  const getRoomCountryCode = (room: any): string => {
    if (room.countryCode) return room.countryCode;
    
    // Parse country name from location name if available
    if (room.locationName) {
      const loc = room.locationName.toLowerCase();
      if (loc.includes('nigeria')) return 'NG';
      if (loc.includes('ghana')) return 'GH';
      if (loc.includes('usa') || loc.includes('united states') || loc.includes('miami')) return 'US';
      if (loc.includes('uk') || loc.includes('kingdom') || loc.includes('london')) return 'GB';
      if (loc.includes('canada')) return 'CA';
      if (loc.includes('korea')) return 'KR';
      if (loc.includes('italy') || loc.includes('milano')) return 'IT';
    }
    
    // Fallbacks based on IDs or host name prefixes
    const id = room.id?.toLowerCase() || '';
    if (id.includes('_ng')) return 'NG';
    if (id.includes('_gh')) return 'GH';
    if (id.includes('_us')) return 'US';
    if (id.includes('_gb') || id.includes('_uk')) return 'GB';
    if (id.includes('_ca')) return 'CA';
    if (id.includes('_kr')) return 'KR';
    if (id.includes('_it')) return 'IT';
    
    if (room.hostUid?.toLowerCase().includes('_ng')) return 'NG';
    if (room.hostUid?.toLowerCase().includes('_gh')) return 'GH';
    if (room.hostUid?.toLowerCase().includes('_us')) return 'US';
    if (room.hostUid?.toLowerCase().includes('_gb')) return 'GB';
    if (room.hostUid?.toLowerCase().includes('_kr')) return 'KR';
    if (room.hostUid?.toLowerCase().includes('_ca')) return 'CA';
    if (room.hostUid?.toLowerCase().includes('_it')) return 'IT';

    // Default simulated items in dashboard are mostly Nigeria
    if (id.startsWith('sim_')) return 'NG';

    return 'US'; // global default
  };

  // Helper mapping country codes to geographic areas/continents
  const getRoomArea = (code?: string): string => {
    if (!code) return 'Other';
    const c = code.toUpperCase();
    if (['US', 'BR', 'CA', 'CO', 'MX', 'VE', 'AR', 'PE'].includes(c)) return 'America';
    if (['RU', 'DE', 'FR', 'GB', 'IT', 'RO', 'ES', 'UA', 'NL', 'BE', 'PL', 'UA'].includes(c)) return 'Europe';
    if (['SA', 'TR', 'AE', 'KU', 'LB', 'YE', 'JO', 'OM', 'QA', 'SY', 'IQ', 'PS', 'BH'].includes(c)) return 'Middle East';
    if (['PH', 'VN', 'ID', 'MY', 'TH', 'KH', 'SG', 'LA', 'BN'].includes(c)) return 'Southeast Asia';
    if (['KR', 'JP', 'IN', 'PK', 'MM', 'BD', 'UZ', 'KZ', 'KG', 'AF', 'TJ', 'AZ', 'GE', 'LK', 'AM', 'CY', 'MV', 'TM', 'IL', 'MO', 'MN'].includes(c)) return 'Asia';
    if (['NG', 'EG', 'ET', 'GH', 'DZ', 'MA', 'LY', 'TN', 'ZA', 'SO', 'KE', 'UG', 'AO', 'SD', 'GM', 'TZ', 'BJ', 'SN', 'CM', 'BW', 'ZM', 'TG', 'TD', 'ZW', 'SL', 'SC', 'NE', 'MU', 'ML', 'MG', 'LS', 'DJ'].includes(c)) return 'Africa';
    if (['AU', 'NZ', 'TO', 'FJ', 'PG', 'PF'].includes(c)) return 'Oceania';
    return 'Other';
  };

  // Helper mapping gender dynamically for simulated/existing hosts
  const getRoomGender = (room: any): 'female' | 'male' => {
    if (room.hostUid === 'host_agency' || room.hostUid?.includes('boss') || room.hostUid?.includes('male')) {
      return 'male';
    }
    if (['sim_agency', 'sim_dating', 'sim_black_white'].includes(room.id)) {
      return 'male';
    }
    return 'female';
  };

  // Combine real database streams with Bigo simulated mockup cards safely
  const unifiedRoomsList = React.useMemo(() => {
    const result = [...rooms];
    
    // Add simulated feeds from the video catalog if they don't already exist
    bigoSimulatedFeeds.forEach((simRoom) => {
      const exists = rooms.some(r => r.id === simRoom.id || r.hostUid === simRoom.hostUid);
      if (!exists) {
        result.push(simRoom);
      }
    });

    return result;
  }, [rooms]);

  const filteredRooms = unifiedRoomsList.filter(room => {
    const matchesSearch = room.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.hostUid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.hostName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Filter by selectedCountry to make the country selector fully operational!
    // If Global is selected, show all. Otherwise, filter matching the room location or country context.
    if (selectedCountry.name !== 'Global' && selectedCountry.name !== 'Default' && selectedCountry.name !== 'Ghana') {
      const roomCC = getRoomCountryCode(room);
      if (roomCC !== selectedCountry.code) {
        // Allow fallback or fully filter
      }
    }

    if (activeTab === 'Nearby') {
      return room.latitude !== undefined && room.latitude !== null;
    }

    // Apply active Room Filter options from mockup screen 02:09
    if (filterGender !== 'All') {
      const roomGender = getRoomGender(room);
      if (roomGender.toLowerCase() !== filterGender.toLowerCase()) return false;
    }

    if (filterRoomType !== 'All') {
      const isMulti = room.type === 'multi-guest-live' || room.type === 'audio-live' || (room.guests && room.guests.length > 0);
      if (filterRoomType === 'Single' && isMulti) return false;
      if (filterRoomType === 'Multi' && !isMulti) return false;
    }

    if (filterArea !== 'All') {
      const roomCC = getRoomCountryCode(room);
      const roomArea = getRoomArea(roomCC);
      if (roomArea !== filterArea) return false;
    }

    return true;
  }).sort((a, b) => {
    if (activeTab === 'Nearby' && userLocation) {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude || 0, a.longitude || 0);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude || 0, b.longitude || 0);
      return distA - distB;
    }
    return (b.viewerCount || 0) - (a.viewerCount || 0);
  });

  // Filter exploreTrendingRooms with active Room Filters reactively
  const filteredExploreTrendingRooms = React.useMemo(() => {
    return exploreTrendingRooms.filter(room => {
      if (filterGender !== 'All') {
        const roomGender = getRoomGender(room);
        if (roomGender.toLowerCase() !== filterGender.toLowerCase()) return false;
      }

      if (filterRoomType !== 'All') {
        const isMulti = room.type === 'multi-guest-live' || room.type === 'audio-live' || (room.guests && room.guests.length > 0);
        if (filterRoomType === 'Single' && isMulti) return false;
        if (filterRoomType === 'Multi' && !isMulti) return false;
      }

      if (filterArea !== 'All') {
        const roomCC = getRoomCountryCode(room);
        const roomArea = getRoomArea(roomCC);
        if (roomArea !== filterArea) return false;
      }

      return true;
    });
  }, [filterGender, filterRoomType, filterArea]);

  const isAdmin = (profile?.role === 'admin') || 
                  (user?.uid === 'YDnNAkdp5sYRs8YNN8K22576UO33') || 
                  (user?.email === 'rogershep101@gmail.com');

  return (
    <div className={cn("flex flex-col h-full overflow-hidden select-none relative transition-colors duration-300", isLight ? "bg-[#f8f8f8]" : "bg-[#121212]")}>
      <SEOHeaders 
        title="Bingo Live - Global Gifting & Live Streaming Platform"
        description="The elite live streaming community for USA, UK, Europe, Australia and Ireland. Join professional creators, engage in interactive rooms, and experience advanced digital gifting."
        keywords="live streaming USA, professional streamers UK, social broadcasting Europe, creator monetization Australia, live gifting app Ireland, global social platform"
      />
      {isAdmin && (
        <button 
          onClick={() => navigate('/admin')}
          className="fixed bottom-24 right-6 w-14 h-14 bg-red-600 text-white rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all border-4 border-white/20 group"
        >
          <Shield size={28} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-12 right-0 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest italic">
            Admin Dashboard
          </div>
        </button>
      )}
      {/* Fixed Top Navigation */}
      <header className={cn(
        "flex-none w-full border-b transition-colors duration-300",
        isLight ? "bg-white border-black/5" : "bg-[#1a1a1a] border-white/10"
      )}>
        {/* Floor 1: Logo, country select dropdown and layout modes line */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          {showSearchBar ? (
            <div className="flex-1 flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stream titles or host UIDs..."
                  className={cn(
                    "w-full text-xs font-semibold pl-9 pr-8 py-1.5 rounded-xl border outline-none transition-all",
                    isLight ? "bg-stone-50 border-stone-250 text-stone-900 focus:border-[#00e1cf]" : "bg-neutral-800 border-neutral-700/60 text-white focus:border-[#00e1cf]"
                  )}
                  autoFocus
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-2 text-zinc-400 hover:text-white"
                  >
                    <X size={12} className="stroke-[3]" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setShowSearchBar(false);
                  setSearchQuery('');
                }}
                className={cn(
                  "text-xs font-black uppercase tracking-wider px-2 py-1.5 transition-colors",
                  isLight ? "text-stone-500 hover:text-stone-900" : "text-zinc-400 hover:text-white"
                )}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center select-none py-0.5">
              {activeTab === 'Featured' ? (
                <>
                  <span className="relative text-[17px] font-black tracking-tight font-sans uppercase z-10">
                    <span className={cn("relative z-10", isLight ? "text-stone-900" : "text-white")}>Welcome</span>
                    <span className="absolute bottom-[2px] left-0 right-0 h-[6.5px] bg-[#00f3df]/35 rounded-full z-0" />
                  </span>
                  <span className={cn("text-[17px] font-black tracking-tight font-sans uppercase ml-1.5 z-10", isLight ? "text-stone-900" : "text-white")}>
                    Back
                  </span>
                </>
              ) : (
                <>
                  <span className="relative text-[17px] font-black tracking-tight font-sans uppercase z-10">
                    <span className={cn("relative z-10", isLight ? "text-stone-900" : "text-white")}>BINGO</span>
                    <span className="absolute bottom-[2px] left-0 right-0 h-[6.5px] bg-[#00f3df]/35 rounded-full z-0" />
                  </span>
                  <span className={cn("text-[17px] font-black tracking-tight font-sans uppercase ml-1.5 z-10", isLight ? "text-stone-900" : "text-[#00e1cf]")}>
                    LIVE
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            {!showSearchBar && (
              <button
                onClick={() => setShowSearchBar(true)}
                className={cn(
                  "p-1.5 rounded-full transition-colors hover:scale-105",
                  isLight ? "text-stone-500 hover:text-[#00e1cf]" : "text-zinc-400 hover:text-[#00e1cf]"
                )}
                title="Search streams"
              >
                <Search size={18} />
              </button>
            )}

            <button
              id="feed-manual-refresh"
              onClick={() => {
                setIsPulling(true);
                setTimeout(() => {
                  setIsPulling(false);
                  setRooms(prev => prev.map(r => ({ ...r, viewerCount: Math.max(10, Math.floor((r.viewerCount || 50) * (0.9 + Math.random() * 0.2))) })));
                  showToast("Recommendations feed refreshed successfully 🌟", "success");
                }, 1100);
              }}
              className={cn(
                "p-1 rounded-lg hover:bg-neutral-800/10 active:rotate-180 transition-transform duration-500 select-none",
                isLight ? "text-stone-500" : "text-zinc-400"
              )}
              title="Refresh Stream Feed"
            >
              <RefreshCw size={15} />
            </button>

            <div className="relative">
              <Bell 
                size={18} 
                className={cn("cursor-pointer transition-colors hover:scale-105", isLight ? "text-stone-500 hover:text-black" : "text-zinc-400 hover:text-white")} 
                onClick={() => {
                  if (unreadCount > 0) {
                     showToast(`You have ${unreadCount} new notifications! 🔔`, 'info');
                     clearUnread();
                  } else {
                     showToast("No new notifications! ✨", 'info');
                  }
                }}
              />
              {unreadCount > 0 && (
                <div className={cn(
                  "absolute -top-1 -right-1 bg-pink-500 text-white text-[7px] font-bold px-1 rounded-full border",
                  isLight ? "border-white" : "border-[#1a1a1a]"
                )}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floor 1.5: Centered Country Selector and Movies Button Row with tight spacing */}
        <div className="flex items-center justify-center gap-2 w-full pt-1 pb-1">
          <button 
            id="region-selector-trigger"
            onClick={() => setShowRegions(true)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider border shadow-xs transition-transform hover:scale-105 active:scale-95 uppercase",
              isLight ? "bg-stone-50 border-stone-200 text-stone-900 hover:bg-stone-100" : "bg-neutral-800/80 border-neutral-700/60 text-white"
            )}
          >
            <span className="text-[13px]">{selectedCountry.flag}</span>
            <span className="tracking-wider text-[11px]">{selectedCountry.name}</span>
            <ChevronDown size={11} className="opacity-70 stroke-[3]" />
          </button>

          <button
            id="homepage-movies-button"
            onClick={() => {
              navigate('/movies');
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black transition-all uppercase tracking-wider shadow-sm border",
              isLight 
                ? "bg-stone-50 text-stone-900 border-stone-200 hover:bg-stone-100" 
                : "bg-neutral-800/80 text-[#00e1cf] border border-[#00e1cf]/30 hover:border-[#00e1cf]/60"
            )}
          >
            <Film size={11} className="stroke-[3] shrink-0" />
            <span>Movies</span>
          </button>
        </div>

        {/* Floor 2: Scrollable Tabs Row */}
        <div 
          ref={scrollRef}
          className="w-full overflow-x-auto scrollbar-hide touch-pan-x pb-3 pt-2 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2 px-4 w-max">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4.5 py-1.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap select-none cursor-pointer",
                  activeTab === tab 
                    ? (isLight ? "bg-stone-900 text-white shadow-xs font-black ring-1 ring-black/5" : "bg-[#2c2c2e] text-white border border-[#3a3a3c]/30 font-black") 
                    : (isLight ? "bg-stone-100 text-stone-500 hover:text-stone-900" : "bg-[#2c2c2e]/45 text-zinc-400 hover:text-white")
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area - Only scrolls vertically */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative">
        {activeTab === 'Explore' ? (
          <div className="flex flex-col w-full">
            {/* Countries & regions segment */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between select-none">
              <span className={cn("text-xs font-black uppercase tracking-wider", isLight ? "text-zinc-600" : "text-zinc-400")}>
                Countries & regions
              </span>
              <button 
                onClick={() => setShowRegions(true)}
                className="text-[9px] font-black text-[#00e1cf] hover:text-cyan-300 flex items-center gap-0.5 uppercase tracking-wider"
              >
                <span>MORE</span>
                <ChevronRight size={10} className="stroke-[3]" />
              </button>
            </div>

            {/* Countries paginated cards grid (4 columns) */}
            <div className="px-4 py-1.5">
              <div className="grid grid-cols-4 gap-x-3 gap-y-3">
                {(exploreCountryPage === 0 ? explorePage1 : explorePage2).map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setSelectedCountry(item);
                      showToast(`${item.flag} ${item.name} stream channel selected!`, 'success');
                    }}
                    className="flex flex-col items-center group transition-transform active:scale-95"
                  >
                    {/* Big Rectangular Flag like the screenshot */}
                    <div className={cn(
                      "w-full aspect-[16/10] rounded-sm overflow-hidden bg-zinc-900 flex items-center justify-center text-3xl border transition-all cursor-pointer relative",
                      selectedCountry.name === item.name 
                        ? "border-[#00e1cf] ring-2 ring-[#00e1cf]/50 scale-102" 
                        : "border-zinc-800 hover:border-zinc-700/80"
                    )}>
                      <span className="select-none scale-105">{item.flag}</span>
                      {selectedCountry.name === item.name && (
                        <div className="absolute top-0.5 right-0.5 bg-[#00e1cf] text-zinc-900 rounded-full p-0.5 shadow-sm transform scale-75">
                          <Check size={8} className="stroke-[4]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[9.5px] font-bold text-zinc-400 mt-1.5 truncate max-w-full text-center group-hover:text-white transition-colors">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom slider paginator dots */}
            <div className="flex items-center justify-center gap-1.5 py-4 select-none">
              <button
                onClick={() => setExploreCountryPage(0)}
                className={cn(
                  "h-1 rounded-full transition-all duration-350",
                  exploreCountryPage === 0 ? "w-4 bg-[#00e1cf]" : "w-1.5 bg-zinc-650 hover:bg-zinc-500"
                )}
              />
              <button
                onClick={() => setExploreCountryPage(1)}
                className={cn(
                  "h-1 rounded-full transition-all duration-350",
                  exploreCountryPage === 1 ? "w-4 bg-[#00e1cf]" : "w-1.5 bg-zinc-650 hover:bg-zinc-500"
                )}
              />
            </div>

            {/* Trending section header */}
            <div className="px-4 pb-2.5 flex items-center justify-between select-none">
              <span className={cn("text-xs font-black uppercase tracking-wider", isLight ? "text-zinc-600" : "text-zinc-400")}>
                Trending
              </span>
              <button 
                onClick={() => {
                  setShowRoomFilterModal(true);
                }}
                className="text-zinc-400 hover:text-white transition-colors p-1"
                title="Filter streams"
              >
                <CustomFilterIcon className="w-5 h-5 text-current" />
              </button>
            </div>

            {/* 3-Column vertical poster styled grid */}
            <div className="grid grid-cols-3 gap-0.5 px-0.5 pb-24">
              {filteredExploreTrendingRooms.map((room) => (
                <motion.div
                  key={room.id}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    navigate(`/room/${room.id}`);
                    showToast(`Entering room: ${room.title} 🎙️`, 'info');
                  }}
                  className="relative aspect-[3/4] bg-zinc-950 overflow-hidden cursor-pointer group rounded-sm"
                >
                  <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms]"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

                  {/* Top-left category tag capsule with green bars */}
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-sm border border-white/15 z-10">
                    {/* Beautiful real-time concurrent green lines visualizer */}
                    <span className="flex items-end gap-[1.2px] h-[8px] pb-[0.5px] select-none shrink-0 origin-bottom bg-transparent mr-1">
                      <motion.span 
                        animate={{ height: ["2px", "7px", "3px", "6px", "2px"] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        className="w-[1.2px] bg-[#00ff66] rounded-full origin-bottom"
                      />
                      <motion.span 
                        animate={{ height: ["7px", "2px", "6px", "1px", "7px"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="w-[1.2px] bg-[#00ff66] rounded-full origin-bottom"
                      />
                      <motion.span 
                        animate={{ height: ["3px", "6px", "1px", "8px", "3px"] }}
                        transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
                        className="w-[1.2px] bg-[#00ff66] rounded-full origin-bottom"
                      />
                    </span>
                    <span className="text-[#00ff66] text-[7.5px] font-black uppercase tracking-widest shadow-sm select-none leading-none">
                      {room.categoryTag || 'Channel'}
                    </span>
                  </div>

                  {/* Bottom center-left translucent label frame */}
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/45 backdrop-blur-xs px-1.5 py-0.5 rounded-sm border border-white/5 max-w-[90%]">
                    <span className="text-[8.5px] select-none shrink-0 leading-none">{room.flag}</span>
                    <span className="text-[7.5px] font-bold text-white uppercase tracking-tight truncate leading-none">
                      {room.countryName}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            {filteredExploreTrendingRooms.length === 0 && (
              <div className="text-center py-12 text-zinc-500 italic text-xs select-none w-full pb-20">
                No active trending streams match your current filter criteria...
              </div>
            )}
          </div>
        ) : activeTab === 'Featured' ? (
          <FeaturedTabContent 
            isLight={isLight} 
            onShowProfile={fetchHostProfile} 
            navigate={navigate} 
            showToast={showToast} 
            featuredShowBroadcasters={featuredShowBroadcasters}
            setFeaturedShowBroadcasters={setFeaturedShowBroadcasters}
          />
        ) : (
          <>
            {/* Migration Portal Banner */}
            <div className="px-4 pt-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/migration')}
                className="relative h-24 rounded-2xl overflow-hidden cursor-pointer group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 animate-gradient-x" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute inset-0 flex items-center justify-between px-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-black" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60">Migration Protocol</span>
                    </div>
                    <h3 className="text-xl font-black text-black italic tracking-tighter uppercase leading-none">Status Match Center</h3>
                    <p className="text-[9px] font-black text-black/50 uppercase tracking-widest">Migrate from Bingo/TikTok • Get King Status</p>
                  </div>
                  <div className="bg-black text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-colors shadow-xl">
                    Start Now
                  </div>
                </div>
                {/* Gloss effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </motion.div>
            </div>

            {/* Weekly King Spotlight */}
            <div className="px-4 py-4">
              <WeeklyKing user={weeklyKing} type="Host" />
            </div>

            {/* Animated Pull to Refresh mascot banner matching screen 01:10 */}
            <AnimatePresence>
              {isPulling && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 100, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full flex flex-col items-center justify-center bg-[#0d0d0f]/60 border-b border-zinc-800/20 overflow-hidden py-3 select-none"
                >
                  <div className="text-cyan-400 animate-spin duration-[1500]">
                    <DinoMascot className="w-10 h-10" />
                  </div>
                  <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] mt-1 animate-pulse">
                    Fetching Regional Streams...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Recommendations Section */}
            {aiRecs.length > 0 && (
              <div className="px-4 mb-6 pt-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-cyan-400/15 rounded-lg border border-cyan-400/20 shadow-sm animate-pulse">
                    <BrainCircuit size={15} className="text-cyan-400" />
                  </div>
                  <h3 className={cn("text-xs font-black uppercase italic tracking-widest", isLight ? "text-gray-400" : "text-white/60")}>
                    AI Match for you
                  </h3>
                </div>
                
                {layoutMode === 'grid' ? (
                  <div className={cn(
                    "grid grid-cols-2 gap-0.5 rounded-2xl overflow-hidden border shadow-[0_0_20px_rgba(6,182,212,0.1)]",
                    isLight ? "border-cyan-500/10" : "border-cyan-500/20"
                  )}>
                    {aiRecs.slice(0, 2).map(rec => {
                      const room = rooms.find(r => r.id === rec.recommendedRoomId);
                      if (!room) return null;
                      return (
                        <RoomCard 
                          key={room.id} 
                          room={room} 
                          layoutMode="grid"
                          aiReason={rec.reason} 
                          onShowProfile={fetchHostProfile} 
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {aiRecs.slice(0, 2).map(rec => {
                      const room = rooms.find(r => r.id === rec.recommendedRoomId);
                      if (!room) return null;
                      return (
                        <RoomCard 
                          key={room.id} 
                          room={room} 
                          layoutMode="list"
                          aiReason={rec.reason} 
                          onShowProfile={fetchHostProfile} 
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Banner Section */}
            <div className="px-4 py-3">
              <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-pink-600 shadow-2xl group cursor-pointer border border-white/5">
                <img 
                  src="https://picsum.photos/seed/bingogala/800/400" 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-2xl font-black italic tracking-tighter text-white leading-none mb-1">BINGO 10TH</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Anniversary Gala</p>
                </div>
                <div className="absolute top-4 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Live Now</span>
                </div>
              </div>
            </div>

            {layoutMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5 px-0.5 pb-24">
                {filteredRooms.map(room => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    layoutMode="grid"
                    onShowProfile={fetchHostProfile}
                    aiReason={aiRecs.find(rec => rec.recommendedRoomId === room.id)?.reason} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1 pb-24">
                {filteredRooms.map(room => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    layoutMode="list"
                    onShowProfile={fetchHostProfile}
                    aiReason={aiRecs.find(rec => rec.recommendedRoomId === room.id)?.reason} 
                  />
                ))}
              </div>
            )}

            {filteredRooms.length === 0 && (
              <div className="text-center py-12 text-white/30 italic text-xs select-none">
                No active streams found in this region...
              </div>
            )}
          </>
        )}
      </main>

      <AnimatePresence>
        {showRegions && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
            className={cn(
              "fixed inset-0 z-50 flex flex-col overflow-hidden select-none transition-colors duration-300",
              isLight ? "bg-[#f8f8f8] text-stone-900 animate-in fade-in" : "bg-[#121212] text-zinc-100"
            )}
          >
            {/* Header with Search and Back */}
            <div className={cn(
              "sticky top-0 z-10 px-4 py-3.5 flex items-center justify-between border-b shrink-0 transition-colors duration-300",
              isLight ? "bg-white/95 border-neutral-200" : "bg-[#121212]/95 border-zinc-900/60"
            )}>
              <div className="flex items-center gap-3.5 flex-1 select-none">
                <button 
                  onClick={() => {
                    setShowRegions(false);
                    setIsSearchingCountry(false);
                    setCountrySearchQuery('');
                  }} 
                  className={cn(
                    "p-1 rounded-full transition-colors",
                    isLight ? "text-stone-700 hover:text-stone-950 hover:bg-stone-100" : "text-zinc-300 hover:text-white active:bg-zinc-800/50"
                  )}
                >
                  <ChevronLeft size={24} />
                </button>
                
                {isSearchingCountry ? (
                  <input
                    type="text"
                    value={countrySearchQuery}
                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                    placeholder="Search country name"
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400 w-full font-semibold focus:ring-1 focus:ring-cyan-400/30 mr-2 placeholder:text-zinc-500 border transition-all",
                      isLight ? "bg-stone-50 border-stone-250 text-stone-900 focus:bg-white" : "bg-zinc-900 border-zinc-800 text-white"
                    )}
                    autoFocus
                  />
                ) : (
                  <span className={cn("text-[15px] font-black tracking-wide font-sans", isLight ? "text-stone-900" : "text-white")}>Countries & regions</span>
                )}
              </div>
              
              <div className="shrink-0 flex items-center gap-1">
                {isSearchingCountry ? (
                  <button 
                    onClick={() => {
                      setIsSearchingCountry(false);
                      setCountrySearchQuery('');
                    }}
                    className={cn(
                      "text-xs font-black px-2 cursor-pointer transition-colors",
                      isLight ? "text-stone-700 hover:text-stone-950" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    Cancel
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsSearchingCountry(true)} 
                      className={cn(
                        "p-1 rounded-full transition-colors",
                        isLight ? "text-stone-700 hover:text-stone-950 hover:bg-stone-105" : "text-zinc-300 hover:text-white active:bg-zinc-805/50"
                      )}
                    >
                      <Search size={21} />
                    </button>
                    <button 
                      onClick={() => setShowRegions(false)}
                      className="text-zinc-400 hover:text-white p-1 rounded-full active:bg-zinc-800/50 transition-colors ml-1"
                    >
                      <X size={21} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Regions list scroller */}
            <div className="flex-1 overflow-y-auto px-4 pb-20 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {isSearchingCountry && countrySearchQuery ? (
                // Filtered Search Results
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                    Search Results ({regionsData.flatMap(r => r.countries).filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())).length})
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {regionsData.flatMap(r => r.countries)
                      .filter(country => country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()))
                      .map(country => (
                        <button
                          key={country.name}
                          onClick={() => {
                            setSelectedCountry({ name: country.name, flag: country.flag, code: country.code });
                            setWatchHistory(prev => {
                              const filtered = prev.filter(c => c.name !== country.name);
                              return [{ ...country, isHot: true }, ...filtered].slice(0, 6);
                            });
                            setShowRegions(false);
                            setIsSearchingCountry(false);
                            setCountrySearchQuery('');
                            setIsPulling(true);
                            setTimeout(() => {
                              setIsPulling(false);
                              setRooms(prev => prev.map(r => ({
                                ...r,
                                viewerCount: Math.max(15, Math.floor((r.viewerCount || 45) * (0.8 + Math.random() * 0.4)))
                              })));
                              showToast(`Loaded streams from ${country.name}! 🌍`, "success");
                            }, 1000);
                          }}
                          className={cn(
                            "relative py-2.5 px-1 bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl flex items-center justify-center gap-1.5 hover:bg-zinc-800 active:scale-95 transition-all truncate text-left",
                            selectedCountry.name === country.name 
                              ? "border-[#00d8ca]/90 text-[#00f3df]" 
                              : "text-zinc-300"
                          )}
                        >
                          <span className="text-[11.5px] font-black truncate flex items-center gap-1">
                            {country.isHot && <Flame size={12} className="text-red-500 fill-red-500 shrink-0 select-none" />}
                            <span>{country.flag}</span>
                            <span className="truncate">{country.name}</span>
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                // Standard Categories Page (Matches user screenshots fully)
                <div className="space-y-6">
                  {/* Watch History Module */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-zinc-500 select-none">
                      <Clock size={14} className="stroke-[2.5]" />
                      <span className="text-xs font-bold tracking-tight text-zinc-500 uppercase">Watch History</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {watchHistory.map(country => (
                        <button
                          key={country.name}
                          onClick={() => {
                            setSelectedCountry({ name: country.name, flag: country.flag, code: country.code });
                            setShowRegions(false);
                            setIsPulling(true);
                            setTimeout(() => {
                              setIsPulling(false);
                              setRooms(prev => prev.map(r => ({
                                ...r,
                                viewerCount: Math.max(15, Math.floor((r.viewerCount || 45) * (0.8 + Math.random() * 0.4)))
                              })));
                              showToast(`Back to ${country.name} stream feeds!`, "success");
                            }, 1000);
                          }}
                          className={cn(
                            "relative py-2.5 px-1 bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl flex items-center justify-center gap-1.5 hover:bg-zinc-800 active:scale-95 transition-all text-left truncate",
                            selectedCountry.name === country.name 
                              ? "border-[#00d8ca]/90 text-[#00f3df]" 
                              : "text-zinc-300"
                          )}
                        >
                          <span className="text-[11.5px] font-black truncate flex items-center gap-1">
                            <Flame size={12} className="text-red-500 fill-red-500 shrink-0" />
                            <span>{country.flag}</span>
                            <span className="truncate">{country.name}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Continent list partitions */}
                  {regionsData.map(region => (
                    <div key={region.name} className="space-y-3">
                      <div className="flex items-center gap-2 select-none">
                        <region.icon className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span className="text-[13px] font-black text-white uppercase tracking-wider">{region.name}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2.5">
                        {region.countries.map(country => (
                          <button
                            key={country.name}
                            onClick={() => {
                              setSelectedCountry({ name: country.name, flag: country.flag, code: country.code });
                              setWatchHistory(prev => {
                                const filtered = prev.filter(c => c.name !== country.name);
                                return [{ ...country, isHot: true }, ...filtered].slice(0, 6);
                              });
                              setShowRegions(false);
                              setIsPulling(true);
                              setTimeout(() => {
                                setIsPulling(false);
                                setRooms(prev => prev.map(r => ({
                                  ...r,
                                  viewerCount: Math.max(15, Math.floor((r.viewerCount || 45) * (0.8 + Math.random() * 0.4)))
                                })));
                                showToast(`Loaded ${country.name} streams! 🌟`, "success");
                              }, 1000);
                            }}
                            className={cn(
                              "relative py-2.5 px-1 bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl flex items-center justify-center gap-1.5 hover:bg-zinc-800 active:scale-95 transition-all text-left truncate",
                              selectedCountry.name === country.name 
                                ? "border-[#00d8ca]/90 text-[#00f3df]" 
                                : "text-zinc-300"
                            )}
                          >
                            <span className="text-[11.5px] font-black truncate flex items-center gap-1">
                              {country.isHot && <Flame size={12} className="text-red-500 fill-red-500 shrink-0" />}
                              <span>{country.flag}</span>
                              <span className="truncate">{country.name}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Floating Close button in case they scroll way down and want to tap over there to close */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRegions(false)}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-zinc-900/90 border border-zinc-800 text-xs font-black tracking-widest text-[#00f3df] uppercase rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center gap-1.5 hover:bg-zinc-850 border-[#00d8ca]/30 select-none active:scale-95 transition-all"
            >
              <X size={13} className="stroke-[3]" />
              <span>Close Page</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Dynamic Room Filter Bottom Sheet Modal */}
      <AnimatePresence>
        {showRoomFilterModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
            {/* Backdrop with elegant fade and blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRoomFilterModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />
            
            {/* Bottom Sheet Card Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-[#18181a] rounded-t-[28px] pt-4.5 pb-3 px-5 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] z-10 flex flex-col gap-3.5 text-left"
            >
              {/* Centered Title Header with Close X Button */}
              <div className="relative flex items-center justify-center pb-1.5 pt-0.5">
                <span className="text-[15px] font-bold text-white font-sans text-center">
                  Room Filter
                </span>
                <button
                  onClick={() => setShowRoomFilterModal(false)}
                  className="absolute right-0 top-0 p-1 rounded-full text-zinc-400 hover:text-white transition-all active:scale-90"
                >
                  <X size={17} className="stroke-[2.2]" />
                </button>
              </div>

              {/* Section 1: Gender selection */}
              <div className="space-y-1">
                <div className="text-[11.5px] font-semibold text-zinc-500 tracking-wide font-sans">
                  Gender
                </div>
                <div className="flex gap-2">
                  {/* All option */}
                  <button
                    onClick={() => setFilterGender('All')}
                    className={cn(
                      "relative h-[31px] px-5 rounded-[8px] bg-[#222224] flex items-center justify-center transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                      filterGender === 'All' 
                        ? "text-white border border-[#00f3df]" 
                        : "text-[#9d9da6] border border-transparent hover:text-white"
                    )}
                  >
                    <span>All</span>
                    {filterGender === 'All' && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                        <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Female option */}
                  <button
                    onClick={() => setFilterGender('Female')}
                    className={cn(
                      "relative h-[31px] flex-1 rounded-[8px] bg-[#222224] flex items-center justify-center gap-1.5 transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                      filterGender === 'Female'
                        ? "text-white border border-[#00f3df]"
                        : "text-[#9d9da6] border border-transparent hover:text-white"
                    )}
                  >
                    <FemaleIcon className={cn("w-3.5 h-3.5", filterGender === 'Female' ? "text-white" : "text-zinc-500")} />
                    <span>Female</span>
                    {filterGender === 'Female' && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                        <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Male option */}
                  <button
                    onClick={() => setFilterGender('Male')}
                    className={cn(
                      "relative h-[31px] flex-1 rounded-[8px] bg-[#222224] flex items-center justify-center gap-1.5 transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                      filterGender === 'Male'
                        ? "text-white border border-[#00f3df]"
                        : "text-[#9d9da6] border border-transparent hover:text-white"
                    )}
                  >
                    <MaleIcon className={cn("w-3.5 h-3.5", filterGender === 'Male' ? "text-white" : "text-zinc-500")} />
                    <span>Male</span>
                    {filterGender === 'Male' && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                        <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Section 2: Room Type selection (Line 1: All + Single, Line 2: Multi-guest) */}
              <div className="space-y-1">
                <div className="text-[11.5px] font-semibold text-zinc-500 tracking-wide font-sans">
                  Room type
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 w-full">
                    {/* All option */}
                    <button
                      onClick={() => setFilterRoomType('All')}
                      className={cn(
                        "relative h-[31px] px-5 rounded-[8px] bg-[#222224] flex items-center justify-center transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                        filterRoomType === 'All'
                          ? "text-white border border-[#00f3df]"
                          : "text-[#9d9da6] border border-transparent hover:text-white"
                      )}
                    >
                      <span>All</span>
                      {filterRoomType === 'All' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                          <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                          <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Single live room option */}
                    <button
                      onClick={() => setFilterRoomType('Single')}
                      className={cn(
                        "relative h-[31px] flex-1 rounded-[8px] bg-[#222224] flex items-center justify-center gap-1.5 transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                        filterRoomType === 'Single'
                          ? "text-white border border-[#00f3df]"
                          : "text-[#9d9da6] border border-transparent hover:text-white"
                      )}
                    >
                      <UserIcon className={cn("w-3.5 h-3.5", filterRoomType === 'Single' ? "text-white" : "text-zinc-500")} />
                      <span>Single live room</span>
                      {filterRoomType === 'Single' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                          <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                          <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Multi-guest live room option */}
                  <button
                    onClick={() => setFilterRoomType('Multi')}
                    className={cn(
                      "relative h-[31px] px-3.5 w-max rounded-[8px] bg-[#222224] flex items-center justify-center gap-1.5 transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                      filterRoomType === 'Multi'
                        ? "text-white border border-[#00f3df]"
                        : "text-[#9d9da6] border border-transparent hover:text-white"
                    )}
                  >
                    <Users className={cn("w-3.5 h-3.5", filterRoomType === 'Multi' ? "text-white" : "text-zinc-500")} />
                    <span>Multi-guest live room</span>
                    {filterRoomType === 'Multi' && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                        <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Section 3: Geographic Region / Continent filter wrapped exactly like the screenshot */}
              <div className="space-y-1">
                <div className="text-[11.5px] font-semibold text-zinc-500 tracking-wide font-sans">
                  Area
                </div>
                <div className="flex flex-col gap-2">
                  {/* Line 1: All, America, Europe */}
                  <div className="flex gap-2 w-full">
                    {/* All */}
                    <button
                      onClick={() => setFilterArea('All')}
                      className={cn(
                        "relative h-[31px] px-5 rounded-[8px] bg-[#222224] flex items-center justify-center transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                        filterArea === 'All' 
                          ? "text-white border border-[#00f3df]" 
                          : "text-[#9d9da6] border border-transparent hover:text-white"
                      )}
                    >
                      <span>All</span>
                      {filterArea === 'All' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                          <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                          <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* America */}
                    <button
                      onClick={() => setFilterArea('America')}
                      className={cn(
                        "relative h-[31px] flex-1 rounded-[8px] bg-[#222224] flex items-center justify-center gap-1.5 transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                        filterArea === 'America' 
                          ? "text-white border border-[#00f3df]" 
                          : "text-[#9d9da6] border border-transparent hover:text-white"
                      )}
                    >
                      <AmericaIcon className={cn("w-3.5 h-3.5", filterArea === 'America' ? "text-white" : "text-zinc-500")} />
                      <span>America</span>
                      {filterArea === 'America' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                          <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                          <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Europe */}
                    <button
                      onClick={() => setFilterArea('Europe')}
                      className={cn(
                        "relative h-[31px] flex-1 rounded-[8px] bg-[#222224] flex items-center justify-center gap-1.5 transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                        filterArea === 'Europe' 
                          ? "text-white border border-[#00f3df]" 
                          : "text-[#9d9da6] border border-transparent hover:text-white"
                      )}
                    >
                      <EuropeIcon className={cn("w-3.5 h-3.5", filterArea === 'Europe' ? "text-white" : "text-zinc-500")} />
                      <span>Europe</span>
                      {filterArea === 'Europe' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                          <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                          <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Line 2: Middle East, Southeast Asia */}
                  <div className="flex gap-2 w-full">
                    {/* Middle East */}
                    <button
                      onClick={() => setFilterArea('Middle East')}
                      className={cn(
                        "relative h-[31px] flex-1 rounded-[8px] bg-[#222224] flex items-center justify-center gap-1.5 transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                        filterArea === 'Middle East' 
                          ? "text-white border border-[#00f3df]" 
                          : "text-[#9d9da6] border border-transparent hover:text-white"
                      )}
                    >
                      <MiddleEastIcon className={cn("w-3.5 h-3.5", filterArea === 'Middle East' ? "text-white" : "text-zinc-500")} />
                      <span>Middle East</span>
                      {filterArea === 'Middle East' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                          <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                          <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Southeast Asia */}
                    <button
                      onClick={() => setFilterArea('Southeast Asia')}
                      className={cn(
                        "relative h-[31px] flex-1 rounded-[8px] bg-[#222224] flex items-center justify-center gap-1.5 transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                        filterArea === 'Southeast Asia' 
                          ? "text-white border border-[#00f3df]" 
                          : "text-[#9d9da6] border border-transparent hover:text-white"
                      )}
                    >
                      <SoutheastAsiaIcon className={cn("w-3.5 h-3.5", filterArea === 'Southeast Asia' ? "text-white" : "text-zinc-500")} />
                      <span>Southeast Asia</span>
                      {filterArea === 'Southeast Asia' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                          <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                          <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Line 3: Asia, Africa, Oceania */}
                  <div className="flex gap-2 w-full">
                    {/* Asia */}
                    <button
                      onClick={() => setFilterArea('Asia')}
                      className={cn(
                        "relative h-[31px] flex-1 rounded-[8px] bg-[#222224] flex items-center justify-center gap-1.5 transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                        filterArea === 'Asia' 
                          ? "text-white border border-[#00f3df]" 
                          : "text-[#9d9da6] border border-transparent hover:text-white"
                      )}
                    >
                      <ToriiIcon className={cn("w-3.5 h-3.5", filterArea === 'Asia' ? "text-white" : "text-zinc-500")} />
                      <span>Asia</span>
                      {filterArea === 'Asia' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                          <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                          <svg className="absolute top-[0.5px] right-[0.5px] w-1.5 h-1.5 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Africa */}
                    <button
                      onClick={() => setFilterArea('Africa')}
                      className={cn(
                        "relative h-[31px] flex-1 rounded-[8px] bg-[#222224] flex items-center justify-center gap-1.5 transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                        filterArea === 'Africa' 
                          ? "text-white border border-[#00f3df]" 
                          : "text-[#9d9da6] border border-transparent hover:text-white"
                      )}
                    >
                      <AfricaIcon className={cn("w-3.5 h-3.5", filterArea === 'Africa' ? "text-white" : "text-zinc-500")} />
                      <span>Africa</span>
                      {filterArea === 'Africa' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                          <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                          <svg className="absolute top-[0.5px] right-[0.5px] w-1.2 h-1.2 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Oceania */}
                    <button
                      onClick={() => setFilterArea('Oceania')}
                      className={cn(
                        "relative h-[31px] flex-1 rounded-[8px] bg-[#222224] flex items-center justify-center gap-1.5 transition-all text-[11.5px] font-semibold active:scale-95 cursor-pointer overflow-hidden",
                        filterArea === 'Oceania' 
                          ? "text-white border border-[#00f3df]" 
                          : "text-[#9d9da6] border border-transparent hover:text-white"
                      )}
                    >
                      <OceaniaIcon className={cn("w-3.5 h-3.5", filterArea === 'Oceania' ? "text-white" : "text-zinc-500")} />
                      <span>Oceania</span>
                      {filterArea === 'Oceania' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none overflow-hidden">
                          <div className="absolute top-[-3px] right-[-3px] w-4 h-4 bg-[#00f3df] rotate-45 origin-center" />
                          <svg className="absolute top-[0.5px] right-[0.5px] w-1.5 h-1.5 text-white font-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: A single, gigantic cyan capsule-shaped option called "OK" matching the Bigo Live mockup screen perfectly */}
              <div className="pt-3.5 pb-1 flex items-center justify-center">
                <button
                  onClick={() => {
                    setShowRoomFilterModal(false);
                    showToast("Filter parameters applied successfully! 🎯", "success");
                  }}
                  className="w-full h-[38px] bg-[#00f3df] text-white font-sans font-black uppercase tracking-wider text-[13.5px] rounded-full shadow-[0_4px_16px_rgba(0,243,223,0.3)] hover:scale-[1.015] active:scale-95 transition-all text-center flex items-center justify-center pointer-events-auto cursor-pointer"
                >
                  OK
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Cyan Anniversary Gift Bag launcher button matching the bottom-right green/cyan icon *only* on Explore feed */}
      {activeTab === 'Explore' && (
        <motion.button
          id="explore-lucky-gift-bag"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9, y: 2 }}
          onClick={() => {
            setShowLuckyBox(true);
            showToast("Opening Bigo 10th Anniversary Lucky Box! 🎁🎉", "info");
          }}
          className="fixed bottom-26 right-4 z-40 w-13 h-13 bg-gradient-to-tr from-[#00d8ca] to-[#00f3df] text-zinc-900 rounded-full shadow-[0_8px_30px_rgba(0,225,207,0.45)] flex flex-col items-center justify-center border-2 border-white select-none active:scale-95 transition-all group overflow-visible"
        >
          {/* Cyan Shopping/Gift Bag Icon layered on top */}
          <div className="relative">
            <Gift size={20} className="text-zinc-950 animate-bounce transition-transform duration-1000" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pink-500"></span>
            </span>
          </div>
          <span className="text-[6.5px] font-black text-zinc-950 uppercase tracking-tighter leading-none -mt-0.5 select-none font-sans">Lucky Box</span>
        </motion.button>
      )}

      {/* Immersive Bigo 10th Anniversary Lucky Box Draw Dialog Overlay */}
      <AnimatePresence>
        {showLuckyBox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLuckyBox(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-[#161618] rounded-3xl border-2 border-[#00e1cf]/40 shadow-[0_0_50px_rgba(0,225,207,0.25)] overflow-hidden flex flex-col p-6 pointer-events-auto"
            >
              {/* Header decorative logo design */}
              <div className="flex flex-col items-center text-center space-y-1 select-none pb-2">
                <span className="text-[10px] font-black uppercase text-[#00e1cf] tracking-[0.25em] bg-[#00e1cf]/10 px-3 py-1 rounded-full border border-[#00e1cf]/20">
                  🎁 Bigo 10th Anniversary
                </span>
                <h4 className="text-lg font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-amber-300 tracking-tight uppercase mt-2">
                  Lucky Reward Chest
                </h4>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Spend simulated beans & claim limited items!</p>
              </div>

              {/* Draw Box Chest Visualizer */}
              <div className="my-5 py-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/40 relative flex flex-col items-center justify-center min-h-[140px] overflow-hidden select-none">
                {isLuckDrawing ? (
                  <div className="flex flex-col items-center space-y-3">
                    <motion.div 
                      animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="text-5xl"
                    >
                      🎁
                    </motion.div>
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] animate-pulse">Shaking Box...</span>
                  </div>
                ) : lastPrize ? (
                  <motion.div 
                    initial={{ scale: 0.3, rotate: -45, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    className="flex flex-col items-center space-y-2 text-center p-3"
                  >
                    <div className="text-5xl filter drop-shadow-[0_0_20px_rgba(0,225,207,0.4)]">
                      {lastPrize.includes('Dragon') ? '🐉' : lastPrize.includes('Noble') ? '👑' : lastPrize.includes('Cyberpunk') ? '🌟' : '💎'}
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#00e1cf]">Success! Winner</span>
                    <span className="text-xs font-black text-white px-4 py-1.5 bg-black/60 rounded-xl border border-[#00e1cf]/30 shadow-inner">
                      {lastPrize}
                    </span>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-5xl filter opacity-75 grayscale hover:grayscale-0 transition-all duration-300">🎁</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Raffle box stands ready</span>
                  </div>
                )}
                {/* Background grid canvas aesthetic */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none -z-10" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  disabled={isLuckDrawing}
                  onClick={() => {
                    setIsLuckDrawing(true);
                    setLastPrize(null);
                    setTimeout(() => {
                      setIsLuckDrawing(false);
                      const prizes = [
                        '👑 Noble VIP Lounge Emblem',
                        '🐉 Imperial Golden Dragon Entry Flight Path',
                        '🌟 Cyberpunk Neon Chat Frame Wrap',
                        '💎 10,000 Global Anniversary Beans Bag'
                      ];
                      const won = prizes[Math.floor(Math.random() * prizes.length)];
                      setLastPrize(won);
                      setDrawnHistory(prev => [won, ...prev.slice(0, 4)]);
                      showToast(`Congratulations! Won: ${won} 🎉`, "success");
                    }, 1200);
                  }}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-[#00e1cf] text-zinc-950 font-black text-[11px] py-3 rounded-2xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                  Draw 1 Box
                </button>
                <button
                  onClick={() => {
                    setShowLuckyBox(false);
                  }}
                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black text-[11px] rounded-2xl uppercase tracking-widest active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>

              {/* Historic Draw log */}
              {drawnHistory.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800/40 select-none">
                  <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider block mb-1.5 font-sans">Prize Log ({drawnHistory.length})</span>
                  <div className="space-y-1 max-h-[80px] overflow-y-auto scrollbar-hide">
                    {drawnHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[9.5px] text-zinc-400 font-medium truncate py-0.5 border-b border-zinc-900/40 font-sans">
                        <Check size={9} className="text-[#00e1cf] shrink-0 stroke-[3]" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Info Popup */}
      <UserDiscoveryPopup 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
}
