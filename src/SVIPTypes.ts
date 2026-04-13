export interface SVIPPrivileges {
  mystery_man_mode?: boolean;
  level_up_boost_percent?: number;
  anti_mute?: boolean;
  anti_kick?: boolean;
  anti_ban_protection?: boolean;
  platinum_badge?: boolean;
  whatsapp_vip_support?: boolean;
  hidden_visitor_mode?: boolean;
  exclusive_gifts?: boolean;
  special_entrance_effect?: boolean;
}

export interface SVIPTier {
  name: string;
  points: number;
  cost_usd_30d?: number;
  cost_usd_90d?: number;
  cost_usd_365d?: number;
  diamond_discount_percent: number;
  privileges: SVIPPrivileges;
  privilege_durations?: Record<string, number>; // Duration in days
}

export interface UserSVIPStatus {
  tier: string;
  activationDate: string; // ISO string
  expirationDate: string; // ISO string
  privilegeExpirations: Record<string, string>; // ISO strings
  status: 'active' | 'pending' | 'expired';
}

export const SVIP_TIERS: Record<string, SVIPTier> = {
  "Bronze Basilisk": {
    name: "Bronze Basilisk",
    points: 100,
    cost_usd_30d: 50,
    diamond_discount_percent: 5,
    privileges: {
      platinum_badge: true,
      level_up_boost_percent: 5,
    }
  },
  "Silver Serpent": {
    name: "Silver Serpent",
    points: 250,
    cost_usd_30d: 150,
    diamond_discount_percent: 8,
    privileges: {
      platinum_badge: true,
      level_up_boost_percent: 10,
      exclusive_gifts: true,
    }
  },
  "Gold Griffin": {
    name: "Gold Griffin",
    points: 500,
    cost_usd_30d: 300,
    diamond_discount_percent: 10,
    privileges: {
      platinum_badge: true,
      level_up_boost_percent: 15,
      exclusive_gifts: true,
      special_entrance_effect: true,
    }
  },
  "Platinum Phantom": {
    name: "Platinum Phantom",
    points: 750,
    cost_usd_30d: 600,
    diamond_discount_percent: 12,
    privileges: {
      mystery_man_mode: true,
      level_up_boost_percent: 20,
      anti_mute: true,
      platinum_badge: true,
      hidden_visitor_mode: true,
    },
    privilege_durations: {
      mystery_man_mode: 3,
      hidden_visitor_mode: 3,
    }
  },
  "Platinum Dragon": {
    name: "Platinum Dragon",
    points: 1000,
    cost_usd_30d: 1000,
    diamond_discount_percent: 15,
    privileges: {
      mystery_man_mode: true,
      level_up_boost_percent: 30,
      anti_mute: true,
      anti_kick: true,
      platinum_badge: true,
      whatsapp_vip_support: true,
    },
    privilege_durations: {
      mystery_man_mode: 7,
      anti_mute: 7,
      anti_kick: 7,
    }
  },
  "Man of Steel": {
    name: "Man of Steel",
    points: 2500,
    cost_usd_30d: 2500,
    diamond_discount_percent: 20,
    privileges: {
      mystery_man_mode: true,
      level_up_boost_percent: 50,
      anti_mute: true,
      anti_kick: true,
      anti_ban_protection: true,
      platinum_badge: true,
      whatsapp_vip_support: true,
      special_entrance_effect: true,
    },
    privilege_durations: {
      mystery_man_mode: 14,
      anti_mute: 14,
      anti_kick: 14,
    }
  }
};
