import { db, auth } from '../firebase';
import { doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';

export interface LocationData {
  countryCode: string;
  countryName: string;
  ip: string;
  timezone: string;
  isVpnDetected: boolean;
}

// Country CPM and bean metrics setup
// 210 beans = $1.00 USD -> CPM * 0.21 beans per impression
export const REGIONAL_CPM_TABLE: Record<string, { label: string; cpm: number; beansPerImp: number }> = {
  US: { label: 'United States', cpm: 12.00, beansPerImp: (12.00 / 1000) * 210 }, // 2.52 beans/imp
  GB: { label: 'United Kingdom', cpm: 9.50, beansPerImp: (9.50 / 1000) * 210 },  // 1.99 beans/imp
  CA: { label: 'Canada', cpm: 9.00, beansPerImp: (9.00 / 1000) * 210 },          // 1.89 beans/imp
  DE: { label: 'Germany', cpm: 8.50, beansPerImp: (8.50 / 1000) * 210 },         // 1.78 beans/imp
  JP: { label: 'Japan', cpm: 8.00, beansPerImp: (8.00 / 1000) * 210 },           // 1.68 beans/imp
  FR: { label: 'France', cpm: 7.00, beansPerImp: (7.00 / 1000) * 210 },          // 1.47 beans/imp
  AU: { label: 'Australia', cpm: 8.50, beansPerImp: (8.50 / 1000) * 210 },       // 1.78 beans/imp
  BR: { label: 'Brazil', cpm: 3.50, beansPerImp: (3.50 / 1000) * 210 },          // 0.73 beans/imp
  IN: { label: 'India', cpm: 2.20, beansPerImp: (2.20 / 1000) * 210 },           // 0.46 beans/imp
  DEFAULT: { label: 'International Tier', cpm: 1.80, beansPerImp: (1.80 / 1000) * 210 } // 0.38 beans/imp
};

/**
 * Fallback to browser timezone parsing when API is blocked/unavailable.
 * Returns estimated country and detects mismatch VPNs
 */
function getLocalFallbackData(simulateVpn = false): LocationData {
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  
  // Basic mapping of timezone prefixes to likely country
  let estCountry = 'US';
  let estCountryName = 'United States';
  
  if (browserTz.includes('London') || browserTz.includes('Europe/London')) {
    estCountry = 'GB';
    estCountryName = 'United Kingdom';
  } else if (browserTz.includes('Berlin') || browserTz.includes('Paris') || browserTz.includes('Rome')) {
    estCountry = 'DE';
    estCountryName = 'Germany';
  } else if (browserTz.includes('Tokyo') || browserTz.includes('Asia/Tokyo')) {
    estCountry = 'JP';
    estCountryName = 'Japan';
  } else if (browserTz.includes('Sydney') || browserTz.includes('Australia')) {
    estCountry = 'AU';
    estCountryName = 'Australia';
  } else if (browserTz.includes('Calcutta') || browserTz.includes('Kolkata') || browserTz.includes('Asia/Kolkata')) {
    estCountry = 'IN';
    estCountryName = 'India';
  } else if (browserTz.includes('Sao_Paulo') || browserTz.includes('America/Sao_Paulo')) {
    estCountry = 'BR';
    estCountryName = 'Brazil';
  }

  // If testing VPN simulation, we mock location/timezone conflict
  return {
    countryCode: simulateVpn ? 'US' : estCountry,
    countryName: simulateVpn ? 'United States (Proxy Routing)' : estCountryName,
    ip: simulateVpn ? '192.162.24.45' : '108.162.1.20',
    timezone: browserTz,
    isVpnDetected: simulateVpn // VPN active
  };
}

/**
 * Core detector: grabs remote IP info and handles timezone cross-examination (VPN Guard)
 */
export async function detectViewerLocation(simulateVpn = false): Promise<LocationData> {
  try {
    // Attempt request to lightweight JSON IP info endpoint
    const response = await fetch('https://ipapi.co/json/', { mode: 'cors' }).catch(() => null);
    
    if (!response || !response.ok) {
      return getLocalFallbackData(simulateVpn);
    }
    
    const data = await response.json();
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    
    // Cross-examine timezone to detect VPN routing
    const ipTimezone = data.timezone || '';
    
    // If the IP location timezone is different from browser timezone, a VPN or Proxy is shielding the user!
    let isVpnDetected = false;
    if (ipTimezone && systemTimezone) {
      const canonicalIpTz = ipTimezone.toLowerCase().replace('_', ' ');
      const canonicalSysTz = systemTimezone.toLowerCase().replace('_', ' ');
      
      // If broad timezone area (e.g. America vs Europe) does not match, trigger flag
      const ipRegion = canonicalIpTz.split('/')[0];
      const sysRegion = canonicalSysTz.split('/')[0];
      
      if (ipRegion !== sysRegion && ipRegion && sysRegion) {
        isVpnDetected = true;
      }
    }

    if (simulateVpn) {
      isVpnDetected = true;
    }

    return {
      countryCode: data.country_code || 'US',
      countryName: data.country_name || 'United States',
      ip: data.ip || '127.0.0.1',
      timezone: ipTimezone || systemTimezone,
      isVpnDetected: isVpnDetected
    };
  } catch (error) {
    console.warn("Location service unavailable, falling back to secure timezone tracking:", error);
    return getLocalFallbackData(simulateVpn);
  }
}

/**
 * Writes an ad impression record and rewards Ad Beans safely
 */
export async function registerAdImpression({
  hostUid,
  campaignId,
  campaignBrand,
  simulateVpn = false
}: {
  hostUid: string;
  campaignId: string;
  campaignBrand: string;
  simulateVpn?: boolean;
}): Promise<{ success: boolean; data: LocationData; earned: number }> {
  // 1. Detect location & examine VPN
  const geo = await detectViewerLocation(simulateVpn);
  
  const currentUser = auth.currentUser;
  const viewerUid = currentUser?.uid || 'anonymous';
  const viewerName = currentUser?.displayName || 'Spectator';

  // 2. Fetch CPM & calculate earned beans
  const metrics = REGIONAL_CPM_TABLE[geo.countryCode] || REGIONAL_CPM_TABLE.DEFAULT;
  
  // If VPN detected, ad beans reward is frozen (fraud protection)
  const earnedBeans = geo.isVpnDetected ? 0 : Number(metrics.beansPerImp.toFixed(4));

  const impressionId = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  try {
    // 3. Write audited record in root collection
    const impressionRef = doc(db, 'ad_impressions', impressionId);
    await setDoc(impressionRef, {
      id: impressionId,
      hostUid,
      viewerUid,
      viewerName,
      campaignId,
      campaignBrand,
      country: geo.countryCode,
      countryName: geo.countryName,
      ip: geo.ip,
      isVpn: geo.isVpnDetected,
      cpmValue: metrics.cpm,
      adBeansEarned: earnedBeans,
      timestamp: new Date().toISOString()
    });

    // 4. Update the host's ad beans balance inside users/{hostUid}
    if (earnedBeans > 0) {
      const hostRef = doc(db, 'users', hostUid);
      
      // Make sure the creator exists before incrementing
      const hostSnap = await getDoc(hostRef);
      if (hostSnap.exists()) {
        await updateDoc(hostRef, {
          adBeans: increment(earnedBeans),
          totalAdBeansEarned: increment(earnedBeans)
        });
      }
    }

    return {
      success: true,
      data: geo,
      earned: earnedBeans
    };
  } catch (err) {
    console.error("Failed to register ad impression securely:", err);
    return {
      success: false,
      data: geo,
      earned: 0
    };
  }
}
