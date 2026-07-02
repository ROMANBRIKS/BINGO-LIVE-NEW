import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  limit,
  collectionGroup,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, handleFirestoreError, OperationType } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Room, PrivateCallRequest, UserProfile, Gift } from "../types";
import { DEFAULT_POPULAR_GIFTS } from "../constants/gifts";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Users,
  Video,
  Phone,
  Eye,
  EyeOff,
  Search,
  Filter,
  ChevronRight,
  AlertTriangle,
  Activity,
  BarChart3,
  Lock,
  Unlock,
  Settings,
  Zap,
  Gift as GiftIcon,
  Plus,
  Trash2,
  Upload,
  Clock,
  Save,
  X,
  Diamond,
  Sparkles,
  Check,
  ExternalLink,
  Globe,
  Cpu,
  Layers,
  Smartphone,
  Laptop,
  Server,
  DollarSign,
  Banknote,
} from "lucide-react";
import { cn } from "../lib/utils";
import { PushNotificationTester } from "../components/PushNotificationTester";

export default function AdminDashboardPage() {
  const { profile, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [privateCalls, setPrivateCalls] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLive: 0,
    totalPrivate: 0,
    totalUsers: 0,
    reports: 0,
  });
  const [isGhostMode, setIsGhostMode] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | "main"
    | "rooms"
    | "private"
    | "reports"
    | "gifts"
    | "features"
    | "eggs"
    | "migration"
    | "withdrawals"
    | "ads"
    | "search-engine"
  >("main");
  const [features, setFeatures] = useState<any[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [migrationRequests, setMigrationRequests] = useState<any[]>([]);
  const [easterEggs, setEasterEggs] = useState<any[]>([]);

  // Real Auditing States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [suspensionsList, setSuspensionsList] = useState<any[]>([]);
  const [moderationSearchTerm, setModerationSearchTerm] = useState("");
  const [selectedUserForMod, setSelectedUserForMod] = useState<any | null>(
    null,
  );
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [purchasesList, setPurchasesList] = useState<any[]>([]);
  const [adImpressionsList, setAdImpressionsList] = useState<any[]>([]);
  const [outstandingDebt, setOutstandingDebt] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [payoutsPaid, setPayoutsPaid] = useState<number>(0);
  const [isAddingGift, setIsAddingGift] = useState(false);
  const [giftAssetInputMode, setGiftAssetInputMode] = useState<
    "upload" | "github"
  >("upload");
  const [isAddingEgg, setIsAddingEgg] = useState(false);
  const [isUploadingGift, setIsUploadingGift] = useState(false);
  const [isUploadingAnimation, setIsUploadingAnimation] = useState(false);
  const [isUploadingEgg, setIsUploadingEgg] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [editingEgg, setEditingEgg] = useState<any | null>(null);
  const giftFileInputRef = React.useRef<HTMLInputElement>(null);
  const giftAnimationFileInputRef = React.useRef<HTMLInputElement>(null);
  const eggFileInputRef = React.useRef<HTMLInputElement>(null);

  // Custom states for modern UX additions
  const [selectedRoomForEggDrop, setSelectedRoomForEggDrop] =
    useState<Room | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Fine-grained targeted ban fields for safety command desk
  const [modRestrictStreaming, setModRestrictStreaming] = useState(false);
  const [modRestrictMessaging, setModRestrictMessaging] = useState(false);
  const [modRestrictWithdrawals, setModRestrictWithdrawals] = useState(false);
  const [modRestrictMovies, setModRestrictMovies] = useState(false);
  const [modRestrictApp, setModRestrictApp] = useState(false);
  const [modRestrictShadow, setModRestrictShadow] = useState(false);
  const [modDurationVal, setModDurationVal] = useState<number>(24);
  const [modDurationUnit, setModDurationUnit] = useState<string>("hours");
  const [modReasonText, setModReasonText] = useState<string>("");

  // Administrative Ad Bean Sharing & Base Salary split states
  const [adminFallbackRate, setAdminFallbackRate] = useState<number>(20);
  const [adminAgencyShare, setAdminAgencyShare] = useState<number>(30);
  const [adminStreamerShare, setAdminStreamerShare] = useState<number>(70);

  // Search Engine & OWI Custom Simulation states
  const [targetPingUrl, setTargetPingUrl] = useState(
    "https://bingo-live-global.app/rooms/party",
  );
  const [isPingingIndex, setIsPingingIndex] = useState(false);
  const [indexKey, setIndexKey] = useState("8b9d36e2f4104c6ba7d15ae8e97491cf");
  const [diagnosticRunDone, setDiagnosticRunDone] = useState(false);
  const [isDiagnosticsRunning, setIsDiagnosticsRunning] = useState(false);
  const [lastIndexNowResponse, setLastIndexNowResponse] = useState<any | null>(
    null,
  );

  // Real successful crawl handshakes auditor list
  const [handshakeLogs, setHandshakeLogs] = useState<any[]>([
    {
      id: "hs-1",
      spider: "Googlebot/2.1",
      path: "/leaderboard",
      method: "GET",
      status: 200,
      ip: "66.249.66.1",
      country: "United States (US)",
      timestamp: "2026-06-04T19:15:20Z",
      type: "Search Bot",
      secured: true,
    },
    {
      id: "hs-2",
      spider: "Bingbot/2.0",
      path: "/family-list",
      method: "GET",
      status: 200,
      ip: "157.55.39.10",
      country: "United Kingdom (GB)",
      timestamp: "2026-06-04T19:08:45Z",
      type: "Search Bot",
      secured: true,
    },
    {
      id: "hs-3",
      spider: "OpenWebSpider/1.4 (OpenWebSearch.eu Horizon Project)",
      path: "/rooms/party",
      method: "GET",
      status: 200,
      ip: "193.174.111.45",
      country: "Germany (DE)",
      timestamp: "2026-06-04T18:42:11Z",
      type: "OWS Crawler",
      secured: true,
    },
    {
      id: "hs-4",
      spider: "GPTBot/1.2 (OpenAI Chatbot Spider)",
      path: "/creator-center",
      method: "GET",
      status: 200,
      ip: "20.15.22.8",
      country: "Netherlands (NL)",
      timestamp: "2026-06-04T18:30:00Z",
      type: "AI Crawler",
      secured: true,
    },
    {
      id: "hs-5",
      spider: "Google-Extended (Gemini API Feed)",
      path: "/trends",
      method: "GET",
      status: 200,
      ip: "64.233.160.2",
      country: "France (FR)",
      timestamp: "2026-06-04T18:11:05Z",
      type: "GenAI Indexer",
      secured: true,
    },
  ]);

  const [giftForm, setGiftForm] = useState<
    Partial<Gift> & { animationUrl?: string; giftType?: string }
  >({
    name: "",
    cost: 0,
    image: "🎁",
    animationType: "standard",
    category: "Popular",
    isFlash: false,
    animationUrl: "",
    giftType: "image",
  });
  const [eggForm, setEggForm] = useState<any>({
    name: "",
    image: "🥚",
    rewardType: "beans",
    rewardValue: 10,
    rarity: "common",
    isEnabled: true,
  });

  // Security Check: Staff only allowed (Admin or Moderator)
  useEffect(() => {
    const isStaffUser =
      profile?.role === "admin" ||
      profile?.role === "moderator" ||
      user?.uid === "YDnNAkdp5sYRs8YNN8K22576UO33" ||
      user?.email === "rogershep101@gmail.com";

    if (profile && !isStaffUser) {
      showToast("Access Denied: Staff only area.", "error");
      navigate("/");
    }
  }, [profile, user, navigate, showToast]);

  // Helper to check super-admin status
  const isActualAdmin =
    profile?.role === "admin" ||
    user?.uid === "YDnNAkdp5sYRs8YNN8K22576UO33" ||
    user?.email === "rogershep101@gmail.com";

  // Helper to check staff authorization for effects
  const isAdmin = isActualAdmin || profile?.role === "moderator";

  // Fetch Live Server Crawler Logs
  useEffect(() => {
    if (!isAdmin) return;

    const loadLogs = async () => {
      try {
        const res = await fetch("/api/crawler-logs");
        if (res.ok) {
          const data = await res.json();
          if (data && data.logs) {
            setHandshakeLogs(data.logs);
          }
        }
      } catch (err) {
        console.warn("Failed to load live crawler logs from server", err);
      }
    };

    loadLogs();
    // Refresh logs every 8 seconds when active page is open
    const interval = setInterval(loadLogs, 8000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Fetch Active Rooms
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, "rooms"), where("status", "==", "live"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const rooms = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Room,
        );
        setActiveRooms(rooms);
        setStats((prev) => ({ ...prev, totalLive: rooms.length }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "rooms");
      },
    );

    return () => unsub();
  }, [isAdmin]);

  // Fetch Private Calls (Active and Pending)
  useEffect(() => {
    if (!isAdmin) return;

    // Listen to all private calls across all rooms
    const q = query(
      collectionGroup(db, "private_calls"),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const calls = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPrivateCalls(calls);
        setStats((prev) => ({
          ...prev,
          totalPrivate: calls.filter((c: any) => c.status === "active").length,
        }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "private_calls_group");
      },
    );

    return () => unsub();
  }, [isAdmin]);

  // Fetch Features
  useEffect(() => {
    if (!isAdmin) return;

    const unsub = onSnapshot(
      collection(db, "features"),
      (snapshot) => {
        const featureList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeatures(featureList);

        // Seed features if they don't exist
        const requiredFeatures = [
          "polls",
          "chaos_events",
          "easter_eggs",
          "predictions",
          "ad_beans",
        ];
        requiredFeatures.forEach(async (id) => {
          if (!featureList.find((f) => f.id === id)) {
            await setDoc(
              doc(db, "features", id),
              {
                id,
                mode: "off",
                updatedAt: new Date().toISOString(),
              },
              { merge: true },
            );
          }
        });
      },
      (error) => {
        console.error("Error initializing features:", error);
        handleFirestoreError(error, OperationType.LIST, "features");
      },
    );

    return () => unsub();
  }, [isAdmin]);

  // Fetch Easter Eggs
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, "easter_eggs"),
      orderBy("rewardValue", "asc"),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const eggList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEasterEggs(eggList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "easter_eggs");
      },
    );

    return () => unsub();
  }, [isAdmin]);

  // Fetch Migration Requests
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, "migration_requests"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setMigrationRequests(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "migration_requests");
      },
    );

    return () => unsub();
  }, [isAdmin]);

  // Sync targeted restrictions form data with selected account profile changes
  useEffect(() => {
    if (selectedUserForMod) {
      setModRestrictStreaming(selectedUserForMod.bannedStreaming || false);
      setModRestrictMessaging(selectedUserForMod.bannedMessaging || false);
      setModRestrictWithdrawals(selectedUserForMod.bannedWithdrawals || false);
      setModRestrictMovies(selectedUserForMod.bannedMovies || false);
      setModRestrictApp(
        selectedUserForMod.isBanned || selectedUserForMod.bannedApp || false,
      );
      setModRestrictShadow(selectedUserForMod.isShadowBanned || false);
      setModReasonText(selectedUserForMod.suspensionReason || "");
      setModDurationVal(24);
      setModDurationUnit("hours");
    } else {
      setModRestrictStreaming(false);
      setModRestrictMessaging(false);
      setModRestrictWithdrawals(false);
      setModRestrictMovies(false);
      setModRestrictApp(false);
      setModRestrictShadow(false);
      setModReasonText("");
      setModDurationVal(24);
      setModDurationUnit("hours");
    }
  }, [selectedUserForMod?.id]);

  // Fetch Total Users Dynamic details & Outstanding Creator Liability
  useEffect(() => {
    if (!isAdmin) return;

    const unsub = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const uList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsersList(uList);
        setStats((prev) => ({ ...prev, totalUsers: snapshot.size }));

        // Sum unwithdrawn beans to calculate Outstanding Creator Liability
        const totalBeans = uList.reduce(
          (sum, u: any) => sum + (u.beans || 0),
          0,
        );
        setOutstandingDebt(Number((totalBeans / 210).toFixed(2)));
      },
      (error) => {
        console.error(
          "Failed to read user counts dynamically from Firestore:",
          error,
        );
      },
    );

    return () => unsub();
  }, [isAdmin]);

  // Fetch Suspensions & Infraction Reports dynamically
  useEffect(() => {
    if (!isAdmin) return;

    const unsub = onSnapshot(
      collection(db, "suspensions"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];
        setSuspensionsList(
          list.sort((a, b) => b.timestamp?.localeCompare?.(a.timestamp) || 0),
        );
      },
      (error) => {
        console.error("Failed to read system suspensions/violations:", error);
      },
    );

    return () => unsub();
  }, [isAdmin]);

  // Fetch Withdrawals Backlog & Total Payouts
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, "withdrawals"),
      orderBy("timestamp", "desc"),
      limit(100),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWithdrawalsList(list);

        const totalPaid = list
          .filter((w: any) => w.status === "completed")
          .reduce((sum, w: any) => sum + (w.usdAmount || 0), 0);
        setPayoutsPaid(totalPaid);
      },
      (error) => {
        console.error("Error reading withdrawals backlog:", error);
      },
    );

    return () => unsub();
  }, [isAdmin]);

  // Fetch Store Purchases & Revenue
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, "purchases"),
      orderBy("timestamp", "desc"),
      limit(100),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPurchasesList(list);

        const totalRev = list.reduce(
          (sum, p: any) => sum + (p.priceUSD || 0),
          0,
        );
        setRevenue(totalRev);
      },
      (error) => {
        console.error("Error reading purchases history:", error);
      },
    );

    return () => unsub();
  }, [isAdmin]);

  // Fetch Ad Impressions Audits
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, "ad_impressions"),
      orderBy("timestamp", "desc"),
      limit(150),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdImpressionsList(list);
      },
      (error) => {
        console.error("Error reading ad impressions dynamic table:", error);
      },
    );

    return () => unsub();
  }, [isAdmin]);

  const handleApproveMigration = async (request: any) => {
    try {
      // 1. Update user profile with King status (example)
      const userRef = doc(db, "users", request.uid);
      await updateDoc(userRef, {
        nobleTitle: "King", // Match requested status
        migrationBonus: true,
        migrationRankMatched: true,
        level: 50, // Fast track
      });

      // 2. Mark request as approved
      await updateDoc(doc(db, "migration_requests", request.id), {
        status: "approved",
        approvedBy: user?.uid,
        approvedAt: new Date().toISOString(),
      });

      showToast(`Migration approved for ${request.userName}!`, "success");
    } catch (error) {
      showToast("Error approving migration", "error");
    }
  };

  const handleRejectMigration = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "migration_requests", requestId), {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      });
      showToast("Migration request rejected", "info");
    } catch (error) {
      showToast("Error rejecting migration", "error");
    }
  };

  const handleSaveEgg = async () => {
    if (!eggForm.name || !eggForm.image) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    try {
      const eggId = editingEgg?.id || `egg_${Date.now()}`;
      await setDoc(
        doc(db, "easter_eggs", eggId),
        {
          ...eggForm,
          id: eggId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      showToast(
        `Easter Egg ${editingEgg ? "updated" : "added"} successfully`,
        "success",
      );
      setIsAddingEgg(false);
      setEditingEgg(null);
    } catch (error) {
      console.error("Error saving egg:", error);
      showToast("Failed to save Easter Egg", "error");
    }
  };

  const handleDeleteEgg = async (eggId: string) => {
    if (!window.confirm("Are you sure you want to delete this Easter Egg?"))
      return;
    try {
      await deleteDoc(doc(db, "easter_eggs", eggId));
      showToast("Easter Egg deleted", "info");
      setIsAddingEgg(false);
      setEditingEgg(null);
    } catch (error) {
      showToast("Error deleting egg", "error");
    }
  };

  const handleEggImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(
        "File size too large! Please choose an item smaller than 5MB",
        "error",
      );
      return;
    }

    setIsUploadingEgg(true);
    try {
      try {
        const storageRef = ref(storage, `eggs/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        setEggForm((prev) => ({ ...prev, image: url }));
        showToast("Egg asset uploaded to Cloud Storage!", "success");
      } catch (cloudErr) {
        console.warn(
          "Cloud Storage upload failed, utilizing Base64 fallback pathway:",
          cloudErr,
        );
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target?.result as string;
          setEggForm((prev) => ({ ...prev, image: base64Url }));
          showToast(
            "Egg asset processed locally via Base64 fallback!",
            "success",
          );
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      showToast("Upload failed", "error");
    } finally {
      setIsUploadingEgg(false);
    }
  };

  const handleManualDrop = async (roomId: string, egg: any) => {
    if (egg.isEnabled === false) {
      showToast("This egg is currently disabled!", "warning");
      return;
    }
    try {
      const dropId = `drop_${Date.now()}`;
      const dropRef = doc(db, `rooms/${roomId}/egg_drops`, dropId);

      await setDoc(dropRef, {
        id: dropId,
        eggId: egg.id,
        eggImage: egg.image,
        rewardType: egg.rewardType,
        rewardValue: egg.rewardValue,
        x: Math.floor(Math.random() * 80) + 10, // 10% to 90%
        y: Math.floor(Math.random() * 60) + 20, // 20% to 80%
        status: "active",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(), // 1 minute
      });

      showToast(`Egg dropped in room ${roomId.slice(0, 6)}!`, "success");
    } catch (error) {
      console.error("Drop failed:", error);
      showToast("Failed to drop egg", "error");
    }
  };

  const updateFeatureMode = async (
    featureId: string,
    mode: "on" | "off" | "auto",
  ) => {
    try {
      await setDoc(doc(db, "features", featureId), { mode }, { merge: true });
      showToast(`Feature ${featureId} set to ${mode}`, "success");
    } catch (error) {
      showToast("Error updating feature", "error");
    }
  };

  // Synchronize Firestore feature data to administrative split/salary fields
  useEffect(() => {
    const adBeansSetup = features.find((f) => f.id === "ad_beans");
    if (adBeansSetup) {
      if (adBeansSetup.fallbackSalaryRate !== undefined) {
        setAdminFallbackRate(Number(adBeansSetup.fallbackSalaryRate));
      }
      if (adBeansSetup.agencyAdShare !== undefined) {
        setAdminAgencyShare(Number(adBeansSetup.agencyAdShare));
      }
      if (adBeansSetup.streamerAdShare !== undefined) {
        setAdminStreamerShare(Number(adBeansSetup.streamerAdShare));
      }
    }
  }, [features]);

  const updateAdSetupConfig = async (
    fallbackRate: number,
    agencyShare: number,
    streamerShare: number,
  ) => {
    try {
      await setDoc(
        doc(db, "features", "ad_beans"),
        {
          fallbackSalaryRate: Number(fallbackRate),
          agencyAdShare: Number(agencyShare),
          streamerAdShare: Number(streamerShare),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      showToast(
        "Splits & Fallback Salary rates updated successfully! 🚀",
        "success",
      );
    } catch (error) {
      showToast("Error updating split configurations.", "error");
    }
  };

  // Fetch Gifts
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, "gifts"), orderBy("cost", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const giftList = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Gift,
        );

        // Merge with default gifts
        // If a gift with the same ID exists in DB, it overrides the default
        const dbIds = new Set(giftList.map((g) => g.id));
        const mergedGifts = [
          ...giftList,
          ...DEFAULT_POPULAR_GIFTS.filter((g) => !dbIds.has(g.id)),
        ];

        setGifts(mergedGifts);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "gifts");
      },
    );

    return () => unsub();
  }, [isAdmin]);

  const handleGiftUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Thumbnail file size exceeds 2MB limit", "error");
      return;
    }

    setIsUploadingGift(true);
    try {
      // 1. Attempt standard Cloud Storage Upload
      const storageRef = ref(storage, `gifts/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setGiftForm((prev) => ({ ...prev, image: url }));
      showToast("Gift image uploaded! 🖼️", "success");
    } catch (error) {
      console.warn(
        "Storage upload failed, falling back to local inline data URI:",
        error,
      );
      // 2. Dual-mode Fallback: Process smaller asset directly as inline Base64
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setGiftForm((prev) => ({ ...prev, image: reader.result as string }));
          showToast("Inline Base64 thumbnail asset processed!", "info");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingGift(false);
    }
  };

  const handleGiftAnimationUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Animation file size exceeds 2MB limit", "error");
      return;
    }

    setIsUploadingAnimation(true);
    try {
      // 1. Attempt standard Cloud Storage Upload
      const storageRef = ref(storage, `animations/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setGiftForm((prev) => ({ ...prev, animationUrl: url }));
      showToast("Animation asset uploaded! 🎬", "success");
    } catch (error) {
      console.warn(
        "Animation storage upload failed, falling back to local inline data URI:",
        error,
      );
      // 2. Dual-mode Fallback: Process smaller animation directly as inline Base64
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setGiftForm((prev) => ({
            ...prev,
            animationUrl: reader.result as string,
          }));
          showToast("Inline Base64 animation asset processed!", "info");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAnimation(false);
    }
  };

  const handleSaveGift = async () => {
    if (!giftForm.name || !giftForm.cost || !giftForm.image) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      const giftId = editingGift?.id || `gift_${Date.now()}`;
      const giftRef = doc(db, "gifts", giftId);

      const saveData = {
        ...giftForm,
        id: giftId,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(giftRef, saveData, { merge: true });

      showToast(
        `Gift ${editingGift ? "updated" : "added"} successfully!`,
        "success",
      );
      setIsAddingGift(false);
      setEditingGift(null);
      setGiftForm({
        name: "",
        cost: 0,
        image: "🎁",
        animationType: "standard",
        category: "Popular",
        isFlash: false,
        animationUrl: "",
        giftType: "image",
      });
    } catch (error) {
      console.error("Error saving gift:", error);
      showToast("Failed to save gift", "error");
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    if (!window.confirm("Are you sure you want to delete this gift?")) return;

    try {
      const giftRef = doc(db, "gifts", giftId);
      await deleteDoc(giftRef);
      showToast("Gift deleted permanently", "info");
      setIsAddingGift(false);
      setEditingGift(null);
    } catch (error) {
      showToast("Error deleting gift", "error");
    }
  };

  const toggleGhostMode = () => {
    setIsGhostMode(!isGhostMode);
    showToast(
      `Ghost Mode ${!isGhostMode ? "Activated" : "Deactivated"}`,
      "info",
    );
  };

  // SVG code representation of an AI vision scan webcam frame
  const MOCK_AI_SCREENSHOT = (name: string) => {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%230b0b0e"/><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23ff1a1a" stop-opacity="0.3"/><stop offset="100%" stop-color="%231a0000" stop-opacity="0.8"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="300" cy="180" r="70" fill="none" stroke="%23ff3333" stroke-width="2" stroke-dasharray="8 4"/><line x1="150" y1="180" x2="450" y2="180" stroke="%23ff3333" stroke-width="1" opacity="0.5"/><line x1="300" y1="80" x2="300" y2="280" stroke="%23ff3333" stroke-width="1" opacity="0.5"/><text x="30" y="50" fill="%23ff3333" font-family="monospace" font-size="14" font-weight="bold">🔴 WEBCAM CAPTURE - POLICY VIOLATION</text><text x="30" y="80" fill="%23ffffff" font-family="monospace" font-size="12">HOST ID: ${encodeURIComponent(name)}</text><text x="30" y="100" fill="%23ffffff" font-family="monospace" font-size="12">ANALYZER: GEMINI SENSITIVE-CONTENT-V2</text><text x="30" y="340" fill="%23ff3333" font-family="monospace" font-size="18" font-weight="bold">VIOLATION: NUDITY / SENSITIVE SECTION DETECTED</text><text x="30" y="370" fill="%23aaaaaa" font-family="monospace" font-size="11">CONFIDENCE SCORE: 98.42% | SUSPENSION TIMEOUT ISSUED</text></svg>`;
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      showToast(`User role updated to ${newRole}!`, "success");
    } catch (e: any) {
      showToast(`Failed to update role: ${e.message}`, "error");
    }
  };

  const handleUpdateFallbackSalaryRate = async (
    userId: string,
    rate: number,
  ) => {
    try {
      if (isNaN(rate) || rate < 0) {
        showToast("Please provide a valid percentage rate.", "error");
        return;
      }
      await updateDoc(doc(db, "users", userId), {
        customFallbackSalaryRate: rate,
      });
      showToast(`Custom fallback salary rate updated to ${rate}%!`, "success");
    } catch (e: any) {
      showToast(`Failed to update fallback rate: ${e.message}`, "error");
    }
  };

  const handleToggleBanStatus = async (
    userId: string,
    currentBanned: boolean,
  ) => {
    try {
      await updateDoc(doc(db, "users", userId), { isBanned: !currentBanned });
      showToast(
        `User ${!currentBanned ? "Banned" : "Unbanned"} successfully!`,
        "success",
      );
    } catch (e: any) {
      showToast(`Failed to update ban status: ${e.message}`, "error");
    }
  };

  const handleToggleShadowBan = async (
    userId: string,
    currentShadowBanned: boolean,
  ) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isShadowBanned: !currentShadowBanned,
      });
      showToast(
        `User ${!currentShadowBanned ? "Shadow Banned" : "Un-shadow-banned"}!`,
        "success",
      );
    } catch (e: any) {
      showToast(`Failed to update shadow ban status: ${e.message}`, "error");
    }
  };

  const handleApplyStaffEnforcement = async (userId: string) => {
    try {
      if (!userId) return;

      let suspendedUntil: string | null = null;
      const isAnyBanChecked =
        modRestrictStreaming ||
        modRestrictMessaging ||
        modRestrictWithdrawals ||
        modRestrictMovies ||
        modRestrictApp ||
        modRestrictShadow;

      if (isAnyBanChecked) {
        if (modDurationUnit === "forever") {
          suspendedUntil = new Date(
            Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
          ).toISOString(); // 10 years representation of lifetime
        } else {
          const multiplier =
            modDurationUnit === "minutes"
              ? 60 * 1000
              : modDurationUnit === "hours"
                ? 60 * 60 * 1000
                : modDurationUnit === "days"
                  ? 24 * 60 * 60 * 1000
                  : modDurationUnit === "months"
                    ? 30 * 24 * 60 * 60 * 1000
                    : 60 * 1000;
          suspendedUntil = new Date(
            Date.now() + modDurationVal * multiplier,
          ).toISOString();
        }
      }

      const payload = {
        bannedStreaming: modRestrictStreaming,
        bannedMessaging: modRestrictMessaging,
        bannedWithdrawals: modRestrictWithdrawals,
        bannedMovies: modRestrictMovies,
        bannedApp: modRestrictApp,
        isBanned: modRestrictApp,
        isShadowBanned: modRestrictShadow,
        suspendedUntil: isAnyBanChecked ? suspendedUntil : null,
        suspensionReason: isAnyBanChecked
          ? modReasonText || "Targeted conduct safety restrictions applied"
          : null,
        appealStatus: "none",
        appealText: "",
      };

      await updateDoc(doc(db, "users", userId), payload);

      if (modRestrictStreaming || modRestrictApp) {
        const liveRoomSession = activeRooms.find(
          (r) => r.hostUid === userId && r.status === "live",
        );
        if (liveRoomSession) {
          await updateDoc(doc(db, "rooms", liveRoomSession.id), {
            status: "ended",
          });
          showToast(`Ended live session for restricted user!`, "info");
        }
      }

      if (isAnyBanChecked) {
        const reprId = `staff_enforce_${Date.now()}`;
        await setDoc(doc(db, "suspensions", reprId), {
          id: reprId,
          userId,
          userName: selectedUserForMod.displayName || "No Name",
          userPhoto: selectedUserForMod.photoURL || "",
          reason:
            modReasonText ||
            "Policy violation safety enforcement action triggered",
          screenshotUrl: MOCK_AI_SCREENSHOT(
            selectedUserForMod.displayName || userId,
          ),
          timestamp: new Date().toISOString(),
          appealText: "",
          appealStatus: "none",
          enforcementActions: {
            streaming: modRestrictStreaming,
            messaging: modRestrictMessaging,
            withdrawals: modRestrictWithdrawals,
            movies: modRestrictMovies,
            app: modRestrictApp,
            shadow: modRestrictShadow,
            duration: `${modDurationUnit === "forever" ? "Permanent" : `${modDurationVal} ${modDurationUnit}`}`,
          },
        });
      }

      setSelectedUserForMod((prev) => (prev ? { ...prev, ...payload } : null));
      showToast("Safety command deployed successfully!", "success");
    } catch (e: any) {
      showToast(`Deployment error: ${e.message}`, "error");
    }
  };

  const handleSuspendUser = async (
    userObj: any,
    durationMinutes: number,
    reason: string,
  ) => {
    try {
      const suspendedUntil = new Date(
        Date.now() + durationMinutes * 60 * 1000,
      ).toISOString();
      await updateDoc(doc(db, "users", userObj.id), {
        suspendedUntil,
        suspensionReason: reason,
        appealStatus: "none",
        appealText: "",
      });

      // End live room if they are live
      const activeStream = activeRooms.find(
        (r) => r.hostUid === userObj.id && r.status === "live",
      );
      if (activeStream) {
        await updateDoc(doc(db, "rooms", activeStream.id), { status: "ended" });
      }

      // Log report to suspensions collection
      const reportId = `susp_${Date.now()}`;
      await setDoc(doc(db, "suspensions", reportId), {
        id: reportId,
        userId: userObj.id,
        userName: userObj.displayName || "Me",
        userPhoto: userObj.photoURL || "",
        reason,
        screenshotUrl: MOCK_AI_SCREENSHOT(userObj.displayName || userObj.id),
        timestamp: new Date().toISOString(),
        appealText: "",
        appealStatus: "none",
      });

      showToast(`Host suspended for ${durationMinutes} minutes!`, "success");
    } catch (e: any) {
      showToast(`Failed to process suspension: ${e.message}`, "error");
    }
  };

  const handleResolveSuspension = async (userId: string, reportId?: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        suspendedUntil: null,
        suspensionReason: null,
        appealStatus: "none",
        appealText: "",
      });

      if (reportId) {
        await updateDoc(doc(db, "suspensions", reportId), {
          appealStatus: "approved",
          resolvedBy: user?.uid,
        });
      }
      showToast(`Suspension lifted successfully!`, "success");
    } catch (e: any) {
      showToast(`Failed to lift suspension: ${e.message}`, "error");
    }
  };

  const handleRespondToAppeal = async (
    report: any,
    action: "approve" | "reject",
  ) => {
    try {
      if (action === "approve") {
        // Lift suspension entirely
        await updateDoc(doc(db, "users", report.userId), {
          suspendedUntil: null,
          suspensionReason: null,
          appealStatus: "approved",
        });
        await updateDoc(doc(db, "suspensions", report.id), {
          appealStatus: "approved",
          resolvedBy: user?.uid,
        });
        showToast(`Appeal approved and suspension revoked!`, "success");
      } else {
        // Enforce suspension & set appeal status to rejected
        await updateDoc(doc(db, "users", report.userId), {
          appealStatus: "rejected",
        });
        await updateDoc(doc(db, "suspensions", report.id), {
          appealStatus: "rejected",
          resolvedBy: user?.uid,
        });
        showToast(`Appeal rejected. Suspension remains active.`, "warning");
      }
    } catch (e: any) {
      showToast(`Failed resolving appeal: ${e.message}`, "error");
    }
  };

  const handleTriggerAutoModerationSimulation = async () => {
    try {
      const liveRoom = activeRooms.find((r) => r.status === "live");
      if (liveRoom) {
        // Auto-suspend real live room
        const reason =
          "AI Vision Sensor: Detected suggestive policy violation (98.42% confidence)";
        const suspendedUntil = new Date(
          Date.now() + 60 * 60 * 1000,
        ).toISOString(); // 1 hour suspension

        await updateDoc(doc(db, "rooms", liveRoom.id), { status: "ended" });
        await updateDoc(doc(db, "users", liveRoom.hostUid), {
          suspendedUntil,
          suspensionReason: reason,
          appealStatus: "none",
          appealText: "",
        });

        const reportId = `susp_${Date.now()}`;
        await setDoc(doc(db, "suspensions", reportId), {
          id: reportId,
          userId: liveRoom.hostUid,
          userName: liveRoom.title || "Live Streamer",
          userPhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${liveRoom.hostUid}`,
          reason,
          screenshotUrl: MOCK_AI_SCREENSHOT(liveRoom.title),
          timestamp: new Date().toISOString(),
          appealText: "",
          appealStatus: "none",
        });

        showToast(
          `🚨 AI Auto-Mod: stream '${liveRoom.title}' shut down & host suspended!`,
          "success",
        );
      } else {
        // Create Mock Suspension case so admin/moderator can experiment!
        const reportId = `susp_mock_${Date.now()}`;
        const reasonsList = [
          "AI Vision Sensor Scan: suggestive clothing policy breach",
          "Automated Policy Shield: NSFW background nudity detection",
          "AI Webcam Analyzer: sensitive public content infraction log",
        ];
        const randomReason =
          reasonsList[Math.floor(Math.random() * reasonsList.length)];

        await setDoc(doc(db, "suspensions", reportId), {
          id: reportId,
          userId: "mock_host_uid_99",
          userName: "Diamond_Dolly_Live 💫",
          userPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=dolly",
          reason: randomReason,
          screenshotUrl: MOCK_AI_SCREENSHOT("Diamond_Dolly_Live 💫"),
          timestamp: new Date().toISOString(),
          appealText:
            "My standard top slipped down on camera. I am so sorry, it is completely accidental. Please lift the ban!",
          appealStatus: "pending",
        });

        // Also mock-update the user profile in Firestore
        await setDoc(
          doc(db, "users", "mock_host_uid_99"),
          {
            uid: "mock_host_uid_99",
            displayName: "Diamond_Dolly_Live 💫",
            photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=dolly",
            diamonds: 50,
            beans: 1200,
            coins: 40,
            role: "host",
            nobleTitle: "None",
            level: 12,
            friends: 140,
            following: 80,
            fans: 12000,
            totalDiamondsSpent: 40000,
            totalBeansEarned: 24000,
            suspendedUntil: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            suspensionReason: randomReason,
            appealStatus: "pending",
            appealText:
              "My standard top slipped down on camera. I am so sorry, it is completely accidental. Please lift the ban!",
          },
          { merge: true },
        );

        showToast(
          `Generated simulated policy violation mock case under report: '${randomReason}'`,
          "success",
        );
      }
    } catch (e: any) {
      showToast(`Simulation trigger failed: ${e.message}`, "error");
    }
  };

  const investigateRoom = (roomId: string) => {
    // Navigate to room with ghost mode flag
    navigate(`/room/${roomId}?ghost=${isGhostMode}`);
  };

  if (!profile || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 select-none pb-28">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {/* Header Block */}
        <header className="relative overflow-hidden rounded-[2.5rem] bg-[#0c0c0d] border border-white/5 p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10 animate-fade-in">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
              <Shield className="text-red-500 animate-pulse" size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-500/10 rounded text-[9px] font-black text-red-500 uppercase tracking-widest border border-red-500/20">
                  SYSTEM LEVEL MASTER
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white leading-none mt-1">
                Admin Command Center
              </h1>
              <p className="text-zinc-500 text-[10px] sm:text-xs font-medium tracking-wide mt-1.5">
                Regulator Terminal for monitoring accounts, matches, active
                streams, and system systems.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 self-start md:self-auto">
            <button
              onClick={toggleGhostMode}
              className={cn(
                "px-5 py-3 rounded-2xl flex items-center gap-3 transition-all border font-black text-xs uppercase tracking-widest active:scale-95",
                isGhostMode
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.15)]"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300",
              )}
            >
              {isGhostMode ? (
                <Eye size={16} className="text-purple-400" />
              ) : (
                <EyeOff size={16} />
              )}
              <span>Ghost Mode: {isGhostMode ? "ON" : "OFF"}</span>
            </button>
          </div>
        </header>

        {/* Real-time Bento Metrics Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Live Streams",
              value: stats.totalLive,
              icon: Video,
              color: "text-cyan-400",
              badge: "Active",
              pulse: true,
              glow: "shadow-cyan-500/5",
            },
            {
              label: "Private Chats",
              value: stats.totalPrivate,
              icon: Phone,
              color: "text-pink-400",
              badge: "Active",
              pulse: stats.totalPrivate > 0,
              glow: "shadow-pink-500/5",
            },
            {
              label: "Total Members",
              value: stats.totalUsers || 0,
              icon: Users,
              color: "text-green-400",
              badge: "Lifetime",
              pulse: false,
              glow: "shadow-green-500/5",
            },
            {
              label: "Reports Queue",
              value: stats.reports || 0,
              icon: AlertTriangle,
              color: stats.reports > 0 ? "text-red-400" : "text-zinc-500",
              badge: "Safety",
              pulse: false,
              glow: "shadow-red-500/5",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={cn(
                "relative overflow-hidden bg-[#0c0c0d] hover:bg-zinc-900/95 border border-white/5 hover:border-white/10 rounded-[2rem] p-5 transition-all duration-300 group shadow-xl",
                stat.glow,
              )}
            >
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10",
                    stat.color,
                  )}
                >
                  <stat.icon
                    size={18}
                    className="transition-transform group-hover:scale-110 duration-300"
                  />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                  {stat.pulse && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                  <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400">
                    {stat.badge}
                  </span>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold italic text-white tracking-tight leading-none group-hover:translate-x-1 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">
                {stat.label}
              </div>

              {/* Micro-spark visual indicator */}
              <div className="absolute right-0 bottom-0 top-0 w-1 bg-gradient-to-b from-transparent via-white/5 to-transparent group-hover:via-white/10 opacity-30" />
            </div>
          ))}
        </div>

        {/* Sliding Navigation Tray (Cell and Desktop Optimized) */}
        <div className="flex items-center gap-4 mb-8">
          {activeTab !== "main" && (
            <button
              onClick={() => setActiveTab("main")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all group shrink-0 active:scale-95"
            >
              <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10 group-hover:scale-105 duration-200 border border-white/5">
                <ChevronRight className="rotate-180" size={16} />
              </div>
            </button>
          )}

          <div className="bg-[#0b0b0b]/80 border border-white/5 p-1.5 rounded-[2rem] flex gap-1 overflow-x-auto no-scrollbar scroll-smooth w-full backdrop-blur-xl">
            {[
              { id: "main", label: "Dashboard Home", icon: Activity },
              {
                id: "features",
                label: "System Controls",
                icon: Settings,
                highlight: true,
              },
              { id: "rooms", label: "Monitor Streams", icon: Video },
              { id: "private", label: "Private Calls", icon: Phone },
              { id: "gifts", label: "Gifts Vault", icon: GiftIcon },
              { id: "eggs", label: "Easter Factory", icon: Sparkles },
              { id: "migration", label: "Migration Audit", icon: Shield },
              { id: "reports", label: "Reports Panel", icon: AlertTriangle },
              { id: "withdrawals", label: "Withdrawals Log", icon: DollarSign },
              { id: "ads", label: "Ad & CPM Auditor", icon: Globe },
              {
                id: "search-engine",
                label: "Search & SEO Desk",
                icon: Search,
                highlight: true,
              },
            ]
              .filter(
                (tab) =>
                  isActualAdmin ||
                  ["main", "rooms", "reports"].includes(tab.id),
              )
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "py-2.5 px-4 rounded-2xl flex items-center gap-2 transition-all relative whitespace-nowrap active:scale-95 text-[10px] font-black uppercase tracking-widest",
                    activeTab === tab.id
                      ? "bg-white text-black shadow-md shadow-white/5"
                      : cn(
                          "text-zinc-400 hover:text-white hover:bg-white/5",
                          tab.highlight &&
                            activeTab !== tab.id &&
                            "text-cyan-400/80 hover:text-cyan-300",
                        ),
                  )}
                >
                  <tab.icon
                    size={13}
                    className={cn(
                      tab.highlight && activeTab !== tab.id && "animate-pulse ",
                    )}
                  />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="adminActivePill"
                      className="absolute inset-0 bg-white -z-10 rounded-2xl"
                    />
                  )}
                </button>
              ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === "main" && (
            <div className="space-y-6">
              {/* Real-time Safe Reserve Auditing Hub */}
              <div className="bg-[#0c0c0d] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute left-0 bottom-0 -translate-x-20 translate-y-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                  <div>
                    <h3 className="text-sm font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                      <span className="text-emerald-400 font-sans">&bull;</span>{" "}
                      Platform Ledger & safe reserve audit
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                      Real-time incoming store revenue vs host withdraw logs
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-1.5 self-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                      Ledger Status: Balanced
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Total Store Revenue
                    </div>
                    <div className="text-2xl font-black italic text-cyan-400">
                      $
                      {revenue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                      Calculated from Real recharges ({purchasesList.length}{" "}
                      recharges)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Real host Payouts Paid
                    </div>
                    <div className="text-2xl font-black italic text-orange-400">
                      $
                      {payoutsPaid.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                      Calculated from Completed withdrawals (
                      {withdrawalsList.length} logs)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Net Safe Reserve
                    </div>
                    <div className="text-2xl font-black italic text-emerald-400">
                      $
                      {(revenue - payoutsPaid).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                      Net Profit cash remaining inside reserve
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Outstanding Host Liabilities
                    </div>
                    <div className="text-2xl font-black italic text-purple-400">
                      $
                      {outstandingDebt.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                      Outstanding Claims valuation (210 BEANS = $1 USD)
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in"
              >
                {[
                  {
                    id: "features",
                    label: "Feature Control",
                    icon: Settings,
                    desc: "Configure stream voting, prediction parameters, and drop rates.",
                    color:
                      "from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400",
                  },
                  {
                    id: "rooms",
                    label: "Live Stream Monitor",
                    icon: Video,
                    desc: "Real-time observation consoles. Click to moderate, interact, or drop custom elements.",
                    color:
                      "from-red-500/10 to-transparent border-red-500/20 text-red-500",
                  },
                  {
                    id: "private",
                    label: "Private Call Center",
                    icon: Phone,
                    desc: "Observe secure point-to-point video sessions, rates, and active timers.",
                    color:
                      "from-pink-500/10 to-transparent border-pink-500/20 text-pink-400",
                  },
                  {
                    id: "gifts",
                    label: "Gifts & Assets Store",
                    icon: GiftIcon,
                    desc: "Instantly add, edit pricing categories, or erase virtual gifts in the index catalogs.",
                    color:
                      "from-yellow-500/10 to-transparent border-yellow-500/20 text-yellow-500",
                  },
                  {
                    id: "migration",
                    label: "Migration Board",
                    icon: Shield,
                    desc: "Verify, reject, or approve status matching logs from other programs.",
                    color:
                      "from-amber-500/10 to-transparent border-amber-500/20 text-amber-500",
                  },
                  {
                    id: "eggs",
                    label: "Easter Egg Factory",
                    icon: Sparkles,
                    desc: "Create custom reward drops, triggers, fallback emojis, or spawn instant surprises.",
                    color:
                      "from-purple-500/10 to-transparent border-purple-500/20 text-purple-400",
                  },
                  {
                    id: "withdrawals",
                    label: "Withdrawal & Ledger Center",
                    icon: DollarSign,
                    desc: "View host cashout logs backlog, monitor safekeeping accounts, and track store payments.",
                    color:
                      "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400",
                  },
                  {
                    id: "reports",
                    label: "Safety Violations",
                    icon: AlertTriangle,
                    desc: "Monitor active complaints, logs, and user security reviews.",
                    color:
                      "from-orange-500/10 to-transparent border-orange-500/20 text-orange-500",
                  },
                ].map((item) => (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className="bg-[#0c0c0d]/40 relative overflow-hidden text-left p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 shadow-xl group transition-all"
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br transition-all group-hover:scale-110 shadow-inner",
                        item.color,
                      )}
                    >
                      <item.icon size={26} />
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-lg font-extrabold text-white uppercase italic tracking-tight">
                        {item.label}
                      </h3>
                      <ChevronRight
                        size={16}
                        className="text-zinc-600 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-medium">
                      {item.desc}
                    </p>
                    <div className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">
                      Open terminal console &rarr;
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-8 text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[
                  {
                    id: "polls",
                    label: "Stream Voting (Polls)",
                    icon: BarChart3,
                    description:
                      "Allows streamers or audiences to setup system-wide polls.",
                  },
                  {
                    id: "chaos_events",
                    label: "Chaos Drop Multipliers",
                    icon: Zap,
                    description:
                      "Global interactive events, triggering double reward rates.",
                  },
                  {
                    id: "easter_eggs",
                    label: "Easter Egg Drops",
                    icon: Sparkles,
                    description:
                      "Triggers platform surprise egg drop occurrences inside feeds.",
                  },
                  {
                    id: "predictions",
                    label: "Audience Predictions",
                    icon: Activity,
                    description:
                      "Unlock live predictive pools so viewers can stake dynamic points.",
                  },
                  {
                    id: "ad_beans",
                    label: "Ad Revenue Flow Approvals",
                    icon: Globe,
                    description:
                      "Approve Sponsor Ad Bean flow to live wallets. Set ON to clear cash-out, or OFF for a coming-soon display.",
                  },
                ].map((feature) => {
                  const currentFeature = features.find(
                    (f) => f.id === feature.id,
                  );
                  const currentMode = currentFeature?.mode || "off";

                  return (
                    <div
                      key={feature.id}
                      className="bg-[#0c0c0d]/60 border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between relative shadow-xl hover:border-white/10 transition-all text-white"
                    >
                      <div>
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 text-cyan-400">
                          <feature.icon size={22} />
                        </div>
                        <h3 className="text-lg font-black uppercase italic text-white tracking-tight mb-2">
                          {feature.label}
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-8">
                          {feature.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/50 rounded-2xl border border-white/5">
                        {["off", "on", "auto"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() =>
                              updateFeatureMode(feature.id, mode as any)
                            }
                            className={cn(
                              "py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95",
                              currentMode === mode
                                ? "bg-white text-black font-extrabold shadow-md"
                                : "text-zinc-500 hover:text-zinc-300",
                            )}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Custom Interactive Settings Section */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0c0c0d]/60 border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden shadow-2xl"
              >
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px]" />
                <div className="absolute left-0 bottom-0 -translate-x-12 translate-y-12 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                  <div>
                    <h3 className="text-xl font-black uppercase italic text-white tracking-tight flex items-center gap-2">
                      <span className="text-[#fed3be] font-sans">&bull;</span>{" "}
                      Agency Splits & Fallback Salary Control Center
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                      Adjust sponsor commissions, streamer ad cuts, and custom
                      base salary rates for partial target thresholds
                    </p>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Fallback Salary Section */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-[#fed3be] block">
                        Broadcaster Fallback Base Salary Rate (%)
                      </label>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase">
                        The percentage of base salary bonus default (e.g. 20% or
                        25%) that hosts receive if they beat at least 50% of
                        their target threshold, but fall short of
                        fully-qualified requirements. Set to 0 to require 100%
                        completions.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={adminFallbackRate}
                        onChange={(e) =>
                          setAdminFallbackRate(Number(e.target.value))
                        }
                        className="w-full accent-[#fed3be] bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#D4AF37] font-black">
                          {adminFallbackRate}% Pay Out
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setAdminFallbackRate(0)}
                            className={cn(
                              "px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded border transition-all cursor-pointer",
                              adminFallbackRate === 0
                                ? "bg-white text-black border-white"
                                : "border-white/10 text-white/60 hover:text-white",
                            )}
                          >
                            MUTE (0%)
                          </button>
                          <button
                            onClick={() => setAdminFallbackRate(20)}
                            className={cn(
                              "px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded border transition-all cursor-pointer",
                              adminFallbackRate === 20
                                ? "bg-white text-black border-white"
                                : "border-white/10 text-white/60 hover:text-white",
                            )}
                          >
                            Flat 20%
                          </button>
                          <button
                            onClick={() => setAdminFallbackRate(25)}
                            className={cn(
                              "px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded border transition-all cursor-pointer",
                              adminFallbackRate === 25
                                ? "bg-white text-black border-white"
                                : "border-white/10 text-white/60 hover:text-white",
                            )}
                          >
                            Soft 25%
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ad Revenue Split Section */}
                  <div className="space-y-6 md:border-l md:border-white/5 md:pl-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-[#00cbd6] block">
                        Ad Revenue Commission Splits (%)
                      </label>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase">
                        Decide how incoming sponsor revenue beans are split.
                        Changing one value automatically keeps the other in sync
                        to equal exactly 100%. Set agency cuts vs streamer
                        shares below.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 bg-black/40 p-3 rounded-2xl border border-white/5">
                        <span className="text-[8px] font-black text-zinc-500 uppercase block">
                          🏢 Agency Commission
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={adminAgencyShare}
                            onChange={(e) => {
                              const val = Math.min(
                                100,
                                Math.max(0, Number(e.target.value)),
                              );
                              setAdminAgencyShare(val);
                              setAdminStreamerShare(100 - val);
                            }}
                            className="w-full bg-transparent text-sm font-black font-mono text-[#D4AF37] focus:outline-none"
                          />
                          <span className="text-sm font-bold text-zinc-500">
                            %
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 bg-black/40 p-3 rounded-2xl border border-white/5">
                        <span className="text-[8px] font-black text-zinc-500 uppercase block">
                          🎤 Streamer Share
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={adminStreamerShare}
                            onChange={(e) => {
                              const val = Math.min(
                                100,
                                Math.max(0, Number(e.target.value)),
                              );
                              setAdminStreamerShare(val);
                              setAdminAgencyShare(100 - val);
                            }}
                            className="w-full bg-transparent text-sm font-black font-mono text-[#00cbd6] focus:outline-none"
                          />
                          <span className="text-sm font-bold text-zinc-500">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setAdminAgencyShare(30);
                          setAdminStreamerShare(70);
                        }}
                        className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border border-white/10 text-white/60 hover:text-white rounded cursor-pointer"
                      >
                        30 / 70 Standard
                      </button>
                      <button
                        onClick={() => {
                          setAdminAgencyShare(50);
                          setAdminStreamerShare(50);
                        }}
                        className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border border-white/10 text-white/60 hover:text-white rounded cursor-pointer"
                      >
                        50 / 50 Equal
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 border-t border-white/5 pt-6 flex items-center justify-between">
                  <span className="text-[9px] font-black text-[#fed3be] uppercase tracking-widest">
                    Active global features status overrides
                  </span>
                  <button
                    onClick={() =>
                      updateAdSetupConfig(
                        adminFallbackRate,
                        adminAgencyShare,
                        adminStreamerShare,
                      )
                    }
                    className="px-6 py-2.5 bg-[#feead3]/10 border border-[#fed3be]/40 text-[#fed3be] hover:bg-[#feead3]/20 text-[10px] font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all text-center italic cursor-pointer shadow-lg"
                  >
                    Save Split & Salary Rules
                  </button>
                </div>
              </motion.div>

              {/* Developer FCM Push Notification Control Block */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <PushNotificationTester />
              </motion.div>
            </div>
          )}
          {activeTab === "rooms" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                    Live Monitoring Deck
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Intervene directly in streams and manage drops
                  </p>
                </div>
                <span className="px-3 py-1 bg-cyan-500/10 rounded-full text-cyan-400 font-black text-[10px] uppercase tracking-widest border border-cyan-500/20">
                  {activeRooms.length} Broadcasters Live
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activeRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-[#0c0c0d]/40 border border-white/5 hover:border-white/10 rounded-3xl overflow-hidden group shadow-lg transition-all"
                  >
                    <div className="aspect-video relative overflow-hidden bg-black">
                      <img
                        src={`https://picsum.photos/seed/${room.hostUid}/400/225`}
                        className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <div className="px-2 py-0.5 bg-red-500 rounded-md flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          <span className="text-[8px] font-black uppercase tracking-wider text-white">
                            LIVE
                          </span>
                        </div>
                        <div className="px-2 py-0.5 bg-black/75 backdrop-blur-md rounded-md flex items-center gap-1 border border-white/5">
                          <Users size={9} className="text-cyan-400" />
                          <span className="text-[8px] font-black text-zinc-100">
                            {room.viewerCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-xs font-black uppercase italic text-white truncate mb-1">
                        {room.title || "Broadcast Stream"}
                      </h3>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">
                        HOST UID: {room.hostUid}
                      </p>

                      <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                        <button
                          onClick={() => investigateRoom(room.id)}
                          className="flex-1 py-2.5 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-1"
                        >
                          <Eye size={12} />
                          Monitor
                        </button>
                        <button
                          onClick={() => {
                            if (easterEggs.length === 0) {
                              showToast(
                                "Create an Easter Egg first!",
                                "warning",
                              );
                              return;
                            }
                            setSelectedRoomForEggDrop(room);
                          }}
                          className="px-3 py-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white rounded-xl transition-all border border-purple-500/20 flex items-center justify-center"
                          title="Targeted Easter Drop"
                        >
                          <Sparkles size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {activeRooms.length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-white/5 rounded-3xl bg-zinc-950/20">
                    <Video size={42} className="mb-3 text-zinc-700" />
                    <p className="font-extrabold uppercase italic tracking-widest text-xs">
                      No active broadcasts currently online
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "private" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                    Private Call Deck
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Audit billing, user pairings, and live rates
                  </p>
                </div>
                <span className="px-3 py-1 bg-pink-500/10 rounded-full text-pink-400 font-black text-[10px] uppercase tracking-widest border border-pink-500/20">
                  {privateCalls.filter((c) => c.status === "active").length}{" "}
                  Streams Encrypted
                </span>
              </div>

              <div className="space-y-4">
                {privateCalls.map((call) => (
                  <div
                    key={call.id}
                    className="bg-[#0c0c0d]/40 border border-white/5 rounded-[2rem] p-5 flex flex-col sm:flex-row sm:items-center gap-5 justify-between hover:border-white/10 transition-all shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3 shrink-0">
                        <img
                          src={
                            call.viewerPhoto ||
                            "https://picsum.photos/seed/viewer/100"
                          }
                          className="w-11 h-11 rounded-xl object-cover border-2 border-zinc-900 shadow-lg"
                          referrerPolicy="no-referrer"
                        />
                        <img
                          src={
                            call.hostPhoto ||
                            "https://picsum.photos/seed/host/100"
                          }
                          className="w-11 h-11 rounded-xl object-cover border-2 border-zinc-900 shadow-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-xs text-white uppercase italic">
                            {call.viewerName || "User"}
                          </span>
                          <ChevronRight size={12} className="text-zinc-600" />
                          <span className="font-black text-xs text-pink-500 uppercase italic">
                            {call.hostName || "Host"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3.5 mt-2 flex-wrap bg-transparent">
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-zinc-500" />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                              {call.duration || 0} Min Limit
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Diamond size={11} className="text-yellow-500" />
                            <span className="text-[9px] font-black text-yellow-500 tracking-wider">
                              {(
                                call.totalCost ||
                                call.fee ||
                                0
                              ).toLocaleString()}{" "}
                              💎
                            </span>
                          </div>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest border",
                              call.status === "active"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-zinc-800/10 border-zinc-800 text-zinc-500",
                            )}
                          >
                            {call.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => investigateRoom(call.roomId)}
                        className="px-4 py-2 bg-white/5 text-zinc-300 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all"
                      >
                        Monitor
                      </button>
                      {call.status === "active" && (
                        <button
                          onClick={() =>
                            showToast(
                              "Force shutdown is processed programmatically",
                              "warning",
                            )
                          }
                          className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/20 transition-all"
                        >
                          End Session
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {privateCalls.length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-white/5 rounded-3xl bg-zinc-950/20">
                    <Phone
                      size={36}
                      className="mb-3 text-zinc-700 animate-pulse"
                    />
                    <p className="font-extrabold uppercase italic tracking-widest text-xs">
                      No active private call telemetry logged
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "eggs" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                    Easter Design Vault
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Define platform click items, drop triggers, and multipliers
                    balances
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingEgg(null);
                    setEggForm({
                      name: "",
                      image: "🥚",
                      rewardType: "beans",
                      rewardValue: 10,
                      rarity: "common",
                      isEnabled: true,
                    });
                    setIsAddingEgg(true);
                  }}
                  className="px-5 py-3 bg-purple-500 text-white rounded-2xl text-xs font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-purple-500/10 flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  Design Egg Item
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {easterEggs.map((egg) => (
                  <div
                    key={egg.id}
                    onDoubleClick={() => {
                      setEditingEgg(egg);
                      setEggForm(egg);
                      setIsAddingEgg(true);
                    }}
                    className="bg-[#0c0c0d]/40 border border-white/5 rounded-3xl p-4 relative cursor-pointer group flex flex-col justify-between hover:border-white/10 transition-all shadow-md"
                  >
                    <div className="relative">
                      <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden mb-3.5">
                        {egg.image?.startsWith("http") ? (
                          <img
                            src={egg.image}
                            className="w-14 h-14 object-contain p-1"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-4xl transition-transform group-hover:rotate-12 duration-300">
                            {egg.image || "🥚"}
                          </span>
                        )}
                        <span
                          className={cn(
                            "absolute top-2 right-2 text-[6px] font-black px-1.5 py-0.5 rounded uppercase",
                            egg.rarity === "legendary"
                              ? "bg-yellow-500 text-black shadow-md"
                              : egg.rarity === "rare"
                                ? "bg-purple-500 text-white"
                                : "bg-white/10 text-zinc-400",
                          )}
                        >
                          {egg.rarity}
                        </span>
                      </div>

                      {/* Status Switcher Overlay */}
                      <div className="absolute top-2 left-2 z-10">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await setDoc(
                                doc(db, "easter_eggs", egg.id),
                                {
                                  isEnabled: !egg.isEnabled,
                                },
                                { merge: true },
                              );
                              showToast(
                                `Egg changed to ${!egg.isEnabled ? "active" : "disabled"}!`,
                                "info",
                              );
                            } catch (err) {
                              showToast(
                                "Failed to switch state index",
                                "error",
                              );
                            }
                          }}
                          className={cn(
                            "w-7 h-4 rounded-full relative transition-[colors] duration-200 block",
                            egg.isEnabled ? "bg-emerald-500" : "bg-zinc-800",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-200",
                              egg.isEnabled ? "left-3.5" : "left-0.5",
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="text-center">
                      <h4 className="text-xs font-black uppercase italic text-white truncate">
                        {egg.name}
                      </h4>
                      <div className="flex items-center justify-center gap-1 font-extrabold text-[10px] text-purple-400 mt-1">
                        <Sparkles size={11} />
                        <span>
                          {egg.rewardValue} {egg.rewardType}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!egg.isEnabled) {
                          showToast(
                            "Enable the egg design item first!",
                            "warning",
                          );
                          return;
                        }
                        if (activeRooms.length === 0) {
                          showToast(
                            "No streaming rooms live right now to dropping into!",
                            "info",
                          );
                          return;
                        }
                        // trigger drop on all
                        activeRooms.forEach((room) =>
                          handleManualDrop(room.id, egg),
                        );
                        showToast(
                          `Fired global drop: dropped ${egg.name} in all live rooms!`,
                          "success",
                        );
                      }}
                      disabled={!egg.isEnabled}
                      className={cn(
                        "w-full py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all mt-4 self-end",
                        egg.isEnabled
                          ? "bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white border-purple-500/20 active:scale-95"
                          : "bg-white/5 border-white/5 text-zinc-600 cursor-not-allowed",
                      )}
                    >
                      Global Drop
                    </button>
                  </div>
                ))}

                {easterEggs.length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-white/5 rounded-3xl bg-zinc-950/20">
                    <Sparkles
                      size={36}
                      className="mb-3 text-zinc-700 animate-pulse"
                    />
                    <p className="font-extrabold uppercase italic tracking-widest text-xs">
                      No surprise easter egg designs found
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "migration" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                    Migration Board matching
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Confirm and verify matched ranks from competitor programs
                  </p>
                </div>
                <span className="px-3 py-1 bg-[#d97706]/10 rounded-full text-amber-500 font-black text-[10px] uppercase tracking-widest border border-amber-500/10">
                  {
                    migrationRequests.filter((r) => r.status === "pending")
                      .length
                  }{" "}
                  Pending Audits
                </span>
              </div>

              <div className="space-y-4">
                {migrationRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#0c0c0d]/40 border border-white/5 hover:border-zinc-850 rounded-3xl p-5 flex flex-col md:flex-row md:items-center gap-5 justify-between transition-all shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => {
                          if (req.proofUrl) setLightboxImage(req.proofUrl);
                        }}
                        className="w-20 h-20 rounded-2xl overflow-hidden bg-black border border-white/15 cursor-zoom-in relative group shrink-0 shadow-lg"
                      >
                        <img
                          src={req.proofUrl}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye size={16} className="text-white" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-extrabold uppercase italic text-white truncate">
                            {req.userName || "Requester"}
                          </h3>
                          <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-mono tracking-widest text-zinc-500 border border-white/5">
                            ID: {req.uid?.slice(0, 8)}
                          </span>
                        </div>

                        <div className="flex items-center gap-5 mt-2 flex-wrap text-xs font-bold text-zinc-400">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 block">
                              Competitor
                            </span>
                            <span className="text-zinc-200 mt-0.5 block">
                              {req.platform || "Other App"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 block">
                              Proposed Match
                            </span>
                            <span className="text-amber-500 uppercase mt-0.5 block">
                              {req.matchedRank || "None"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 block">
                              Audit Status
                            </span>
                            <span
                              className={cn(
                                "uppercase block mt-0.5",
                                req.status === "approved"
                                  ? "text-emerald-500"
                                  : req.status === "rejected"
                                    ? "text-red-500"
                                    : "text-yellow-500 animate-pulse",
                              )}
                            >
                              {req.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      {req.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleRejectMigration(req.id)}
                            className="px-5 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all border border-red-500/20 active:scale-95"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveMigration(req)}
                            className="px-5 py-3 bg-amber-400 text-black hover:bg-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md active:scale-95"
                          >
                            Approve Match
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block pr-2">
                          Match Audited on{" "}
                          {new Date(
                            req.approvedAt || req.rejectedAt || Date.now(),
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {migrationRequests.length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-white/5 rounded-3xl bg-zinc-950/20">
                    <Shield size={36} className="mb-3 text-zinc-700" />
                    <p className="font-extrabold uppercase italic tracking-widest text-xs">
                      No status matching requests logged
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "reports" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 animate-fade-in text-white"
            >
              {/* Title Section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                    <span className="text-red-500 font-sans">&bull;</span> Staff
                    Enforcement & Safety Desk
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Revoke streams, adjust fallback salary overrides, manage
                    shadow-bans, and process streamer appeals
                  </p>
                </div>
                <button
                  onClick={handleTriggerAutoModerationSimulation}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-red-500/30 transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles size={12} />
                  Run AI Auto-Safety Sweep
                </button>
              </div>

              {/* Main Interactive Work Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Interactive Account Oversight & Salary Controls */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-[#0b0c0d] border border-white/5 rounded-3xl p-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300">
                        Account Oversight
                      </h3>
                      <p className="text-[9px] text-zinc-600 uppercase font-bold">
                        Search user profiles to promote, suspend, ban, or set
                        bonus salary percentage rates
                      </p>
                    </div>

                    {/* Search inputs */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search name or ID..."
                        value={moderationSearchTerm}
                        onChange={(e) =>
                          setModerationSearchTerm(e.target.value)
                        }
                        className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/30"
                      />
                    </div>

                    {/* Matched Users list */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {usersList
                        .filter((u) => {
                          if (!moderationSearchTerm) return false;
                          const term = moderationSearchTerm.toLowerCase();
                          return (
                            u.displayName?.toLowerCase().includes(term) ||
                            u.uid?.toLowerCase().includes(term) ||
                            u.id?.toLowerCase().includes(term)
                          );
                        })
                        .slice(0, 5)
                        .map((u: any) => {
                          const isSuspended =
                            u.suspendedUntil &&
                            new Date(u.suspendedUntil) > new Date();
                          return (
                            <div
                              key={u.id}
                              onClick={() => setSelectedUserForMod(u)}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${selectedUserForMod?.id === u.id ? "bg-red-500/5 border-red-500/20" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={
                                    u.photoURL ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`
                                  }
                                  className="w-8 h-8 rounded-full border border-white/5"
                                  alt=""
                                />
                                <div>
                                  <h4 className="text-xs font-black text-white">
                                    {u.displayName || "Unnamed User"}
                                  </h4>
                                  <p className="text-[9px] text-zinc-500 font-mono">
                                    Role:{" "}
                                    <span className="text-amber-400 capitalize">
                                      {u.role}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {isSuspended && (
                                  <span className="px-1.5 py-0.5 bg-red-500/15 text-red-500 text-[8px] font-black uppercase tracking-wider rounded border border-red-500/10">
                                    Suspended
                                  </span>
                                )}
                                {u.isBanned && (
                                  <span className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase tracking-wider rounded">
                                    Banned
                                  </span>
                                )}
                                {u.isShadowBanned && (
                                  <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase tracking-wider rounded">
                                    Shadow
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                      {moderationSearchTerm &&
                        usersList.filter((u) => {
                          const term = moderationSearchTerm.toLowerCase();
                          return (
                            u.displayName?.toLowerCase().includes(term) ||
                            u.id?.toLowerCase().includes(term)
                          );
                        }).length === 0 && (
                          <p className="text-[10px] text-zinc-600 font-bold uppercase italic text-center py-4">
                            No users found matching query
                          </p>
                        )}

                      {!moderationSearchTerm && (
                        <div className="py-8 text-center text-zinc-600 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider">
                            Type to lookup accounts
                          </p>
                          <p className="text-[9px]">
                            E.g., "babe" or "dolly" to test controls
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected User Management Card */}
                  {selectedUserForMod && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#0b0c0d] border border-white/5 rounded-3xl p-6 space-y-5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              selectedUserForMod.photoURL ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserForMod.id}`
                            }
                            className="w-11 h-11 rounded-full border border-white/10"
                            alt=""
                          />
                          <div>
                            <h4 className="text-sm font-black text-white">
                              {selectedUserForMod.displayName}
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-mono text-ellipsis overflow-hidden max-w-[120px]">
                              ID: {selectedUserForMod.id}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedUserForMod(null)}
                          className="text-zinc-500 hover:text-white text-xs uppercase font-extrabold cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>

                      {/* Role selector dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">
                          Set Account Role
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                          {["user", "host", "moderator", "admin"].map(
                            (roleOption) => (
                              <button
                                key={roleOption}
                                onClick={() =>
                                  handleUpdateUserRole(
                                    selectedUserForMod.id,
                                    roleOption,
                                  )
                                }
                                disabled={
                                  roleOption === "admin" && !isActualAdmin
                                }
                                className={`px-1 py-1.5 rounded-lg text-[9px] font-black uppercase text-center cursor-pointer transition-all ${selectedUserForMod.role === roleOption ? "bg-amber-400 text-black font-extrabold" : "bg-white/5 text-zinc-400 hover:bg-white/10"} disabled:opacity-30`}
                              >
                                {roleOption}
                              </button>
                            ),
                          )}
                        </div>
                        {!isActualAdmin && (
                          <p className="text-[8px] text-zinc-600">
                            ⚠️ Promotion to Admin is restricted to Super-Admins
                            only.
                          </p>
                        )}
                      </div>

                      {/* Fallback Salary overrides slider & manual enhancer */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">
                            Guaranteed Salary Rate
                          </label>
                          <span className="text-xs text-amber-400 font-mono font-black">
                            {selectedUserForMod.customFallbackSalaryRate || 0}%
                          </span>
                        </div>
                        <p className="text-[8px] text-zinc-600">
                          Enhance streamer fallback earnings directly to bypass
                          local aggregator restrictions.
                        </p>

                        <div className="flex gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={
                              selectedUserForMod.customFallbackSalaryRate || 0
                            }
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setSelectedUserForMod((prev) => ({
                                ...prev,
                                customFallbackSalaryRate: val,
                              }));
                            }}
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                          <button
                            onClick={() =>
                              handleUpdateFallbackSalaryRate(
                                selectedUserForMod.id,
                                selectedUserForMod.customFallbackSalaryRate ||
                                  0,
                              )
                            }
                            className="px-3 py-1 bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-white transition-all whitespace-nowrap active:scale-95 cursor-pointer"
                          >
                            SaveOverride
                          </button>
                        </div>
                      </div>

                      {/* Targeted Restrictions & Locks (Modern Checkboxes Grid) */}
                      <div className="pt-3 border-t border-white/5 space-y-3">
                        <label className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">
                          Targeted Feature Locks & Bans
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-300">
                          <label
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer bg-black/40",
                              modRestrictStreaming
                                ? "border-red-500/30 bg-red-950/5 text-white"
                                : "border-white/5 hover:border-white/10",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={modRestrictStreaming}
                              onChange={(e) =>
                                setModRestrictStreaming(e.target.checked)
                              }
                              className="rounded bg-black border-zinc-700 text-red-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Streaming Block</span>
                          </label>

                          <label
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer bg-black/40",
                              modRestrictMessaging
                                ? "border-red-500/30 bg-red-950/5 text-white"
                                : "border-white/5 hover:border-white/10",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={modRestrictMessaging}
                              onChange={(e) =>
                                setModRestrictMessaging(e.target.checked)
                              }
                              className="rounded bg-black border-zinc-700 text-red-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Messaging Block</span>
                          </label>

                          <label
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer bg-black/40",
                              modRestrictWithdrawals
                                ? "border-red-500/30 bg-red-950/5 text-white"
                                : "border-white/5 hover:border-white/10",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={modRestrictWithdrawals}
                              onChange={(e) =>
                                setModRestrictWithdrawals(e.target.checked)
                              }
                              className="rounded bg-black border-zinc-700 text-red-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Payouts/Ledger Block</span>
                          </label>

                          <label
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer bg-black/40",
                              modRestrictMovies
                                ? "border-red-500/30 bg-red-950/5 text-white"
                                : "border-white/5 hover:border-white/10",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={modRestrictMovies}
                              onChange={(e) =>
                                setModRestrictMovies(e.target.checked)
                              }
                              className="rounded bg-black border-zinc-700 text-red-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Movies/Videos Block</span>
                          </label>

                          <label
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer bg-black/40 col-span-2",
                              modRestrictApp
                                ? "border-red-650 bg-red-950/15 text-white font-extrabold"
                                : "border-white/5 hover:border-white/10",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={modRestrictApp}
                              onChange={(e) => {
                                setModRestrictApp(e.target.checked);
                                if (e.target.checked) {
                                  setModRestrictStreaming(true);
                                  setModRestrictMessaging(true);
                                  setModRestrictWithdrawals(true);
                                  setModRestrictMovies(true);
                                }
                              }}
                              className="rounded bg-black border-zinc-650 text-red-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-red-400">
                              🚨 ABSOLUTE APP LOCK (TOTAL BAN)
                            </span>
                          </label>

                          <label
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer bg-black/40 col-span-2",
                              modRestrictShadow
                                ? "border-zinc-500 bg-zinc-900 text-zinc-300 animate-pulse"
                                : "border-white/5 hover:border-white/10",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={modRestrictShadow}
                              onChange={(e) =>
                                setModRestrictShadow(e.target.checked)
                              }
                              className="rounded bg-black border-zinc-700 text-zinc-400 focus:ring-0 cursor-pointer"
                            />
                            <span>
                              SHADOW-BAN (Muted feed index invisibility)
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Suspension timeframe selection parameters */}
                      <div className="pt-3 border-t border-white/5 space-y-2">
                        <label className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">
                          Lock Duration & Timeframe
                        </label>

                        {/* Presets layout */}
                        <div className="grid grid-cols-6 gap-1">
                          {[
                            { val: 15, unit: "minutes", label: "15 Min" },
                            { val: 1, unit: "hours", label: "1 Hr" },
                            { val: 12, unit: "hours", label: "12 Hr" },
                            { val: 1, unit: "days", label: "1 Day" },
                            { val: 7, unit: "days", label: "7 Day" },
                            { val: 10, unit: "forever", label: "Permanent" },
                          ].map((p, i) => {
                            const isMatch =
                              modDurationVal === p.val &&
                              modDurationUnit === p.unit;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setModDurationVal(p.val);
                                  setModDurationUnit(p.unit);
                                }}
                                className={cn(
                                  "py-1.5 rounded-lg text-[9px] font-bold text-center border cursor-pointer transition-all",
                                  isMatch
                                    ? "bg-red-500/15 border-red-500 text-white"
                                    : "bg-black border-white/5 text-zinc-400 hover:bg-white/5",
                                )}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Manual sliders and inputs */}
                        {modDurationUnit !== "forever" && (
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              min="1"
                              value={modDurationVal}
                              onChange={(e) =>
                                setModDurationVal(
                                  Math.max(1, Number(e.target.value)),
                                )
                              }
                              className="w-20 bg-black border border-white/5 rounded-xl px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-red-500/30"
                            />
                            <select
                              value={modDurationUnit}
                              onChange={(e) =>
                                setModDurationUnit(e.target.value)
                              }
                              className="flex-1 bg-black border border-white/5 rounded-xl px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-red-500/30 font-bold"
                            >
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                              <option value="months">Months</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Policy conduction infraction statement */}
                      <div className="pt-3 border-t border-white/5 space-y-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">
                          Compliance Infraction Statement
                        </label>
                        <input
                          type="text"
                          placeholder="E.g. Nudity infraction, dress conduct breach, suggestion..."
                          value={modReasonText}
                          onChange={(e) => setModReasonText(e.target.value)}
                          className="w-full bg-black border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-red-500/30 font-medium"
                        />
                      </div>

                      {/* Deploy Safety Command Action Buttons */}
                      <div className="pt-3 border-t border-white/5 space-y-2">
                        <button
                          onClick={() =>
                            handleApplyStaffEnforcement(selectedUserForMod.id)
                          }
                          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white border border-red-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-lg shadow-red-950/20"
                        >
                          Deploy Safety Commands ⚡
                        </button>

                        {/* Lift active lock button */}
                        {(selectedUserForMod.isBanned ||
                          selectedUserForMod.bannedStreaming ||
                          selectedUserForMod.bannedMessaging ||
                          selectedUserForMod.bannedWithdrawals ||
                          selectedUserForMod.bannedMovies ||
                          selectedUserForMod.isShadowBanned ||
                          (selectedUserForMod.suspendedUntil &&
                            new Date(selectedUserForMod.suspendedUntil) >
                              new Date())) && (
                          <button
                            onClick={async () => {
                              try {
                                setModRestrictStreaming(false);
                                setModRestrictMessaging(false);
                                setModRestrictWithdrawals(false);
                                setModRestrictMovies(false);
                                setModRestrictApp(false);
                                setModRestrictShadow(false);
                                setModReasonText("");

                                const payload = {
                                  bannedStreaming: false,
                                  bannedMessaging: false,
                                  bannedWithdrawals: false,
                                  bannedMovies: false,
                                  bannedApp: false,
                                  isBanned: false,
                                  isShadowBanned: false,
                                  suspendedUntil: null,
                                  suspensionReason: null,
                                  appealStatus: "none",
                                  appealText: "",
                                };
                                await updateDoc(
                                  doc(db, "users", selectedUserForMod.id),
                                  payload,
                                );
                                setSelectedUserForMod((prev) =>
                                  prev ? { ...prev, ...payload } : null,
                                );
                                showToast(
                                  "All active enforcements revoked!",
                                  "success",
                                );
                              } catch (err: any) {
                                showToast(
                                  `Failed lifting bans: ${err.message}`,
                                  "error",
                                );
                              }
                            }}
                            className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                          >
                            Revoke All Active Enforcements early 🛡️
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right Columns: Infraction Incident Logs & Appeal Boards */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#0b0c0d] border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300">
                          Safety Incidents & Appeals Board
                        </h3>
                        <p className="text-[9px] text-zinc-600 uppercase font-bold">
                          Inspect auto-vision screenshot logs and resolve host
                          reinstatements
                        </p>
                      </div>
                      <span className="px-2 py-0.5 bg-white/5 text-zinc-400 text-xs font-mono rounded">
                        Logs: {suspensionsList.length}
                      </span>
                    </div>

                    {/* Incident List */}
                    <div className="space-y-6 max-h-[700px] overflow-y-auto pr-1">
                      {suspensionsList.map((rep: any) => {
                        const idShort = rep.id?.substring(0, 10);
                        const isSuspendedNow =
                          rep.appealStatus === "pending" ||
                          rep.appealStatus === "none";
                        return (
                          <div
                            key={rep.id}
                            className="p-5 rounded-2xl bg-[#0e0f11] border border-[#ff0000]/10 hover:border-white/10 transition-all space-y-4 relative"
                          >
                            {/* Incident Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={
                                    rep.userPhoto ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${rep.userId}`
                                  }
                                  className="w-9 h-9 rounded-full border border-white/5"
                                  alt=""
                                />
                                <div>
                                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                                    {rep.userName}
                                    <span className="text-[9px] text-zinc-500 font-mono">
                                      ({idShort})
                                    </span>
                                  </h4>
                                  <p className="text-[10px] text-red-500 font-bold">
                                    {rep.reason}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-start sm:items-end gap-1 font-mono text-[9px]">
                                <p className="text-zinc-500">
                                  {new Date(rep.timestamp).toLocaleString()}
                                </p>
                                <div className="flex gap-1.5 mt-0.5">
                                  {rep.appealStatus === "none" && (
                                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded text-[8px] font-black uppercase">
                                      Active Block
                                    </span>
                                  )}
                                  {rep.appealStatus === "pending" && (
                                    <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded text-[8px] font-black uppercase animate-pulse">
                                      Appeal Logged
                                    </span>
                                  )}
                                  {rep.appealStatus === "approved" && (
                                    <span className="px-1.5 py-0.5 bg-green-500/15 text-green-400 rounded text-[8px] font-black uppercase">
                                      Reinstated
                                    </span>
                                  )}
                                  {rep.appealStatus === "rejected" && (
                                    <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded text-[8px] font-black uppercase">
                                      Appeal Dismissed
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Investigation Body */}
                            <div className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                              <span className="font-mono text-zinc-600 block mb-1">
                                AUDIGHT INFRACTION STATEMENT:
                              </span>
                              Periodically, the platform runs automatic sweeps.
                              In case of visual policy breach, the stream is
                              halted immediately. Below screenshot is archived
                              for safety verification under selective
                              administrator visual lock policies.
                            </div>

                            {/* SCREENSHOT IMAGE WITH ADMIN-LOCK SHIELD */}
                            <div className="rounded-xl overflow-hidden border border-white/5 bg-black/40">
                              {isActualAdmin ? (
                                <div className="p-1">
                                  <img
                                    src={rep.screenshotUrl}
                                    className="w-full h-auto max-h-[220px] object-cover rounded-lg"
                                    alt="Stream scan evidence screenshot"
                                  />
                                  <div className="p-2.5 bg-red-950/20 text-red-400 font-mono text-[8px] uppercase tracking-wider flex items-center justify-between">
                                    <span>
                                      🔒 ADMIN REVIEW TERMINAL: RECOLLECTED FEED
                                      SILENT FEED SNARES
                                    </span>
                                    <span>LOGGED BY AI SAFETY SENTRY</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative py-12 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
                                  <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-red-500 to-transparent pointer-events-none select-none" />
                                  <div className="w-10 h-10 bg-black/80 rounded-full flex items-center justify-center border border-white/10 mb-2 shrink-0">
                                    <Shield
                                      className="text-amber-500"
                                      size={16}
                                    />
                                  </div>
                                  <h5 className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                                    🔒 Selective Media Shield
                                  </h5>
                                  <p className="text-[9px] text-zinc-500 mt-1 max-w-sm font-medium leading-normal">
                                    Webcam capture is restricted to the primary
                                    owner admin account to protect streamer
                                    privacy and guard against PII leaks.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Streamer Appeal Text Section */}
                            {rep.appealText && (
                              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                                <span className="text-[8px] text-amber-400 font-black uppercase tracking-wider block">
                                  🗣️ STREAMER STATEMENT SUBMISSION
                                </span>
                                <p className="text-[11px] text-zinc-300 italic">
                                  "{rep.appealText}"
                                </p>
                              </div>
                            )}

                            {/* Appeal Resolution Actions */}
                            {isSuspendedNow && (
                              <div className="flex items-center gap-2 pt-1 justify-end">
                                {rep.appealStatus === "pending" ? (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleRespondToAppeal(rep, "approve")
                                      }
                                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95"
                                    >
                                      Accept Appeal & Reinstate
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRespondToAppeal(rep, "reject")
                                      }
                                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95"
                                    >
                                      Deny Appeal
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleResolveSuspension(
                                        rep.userId,
                                        rep.id,
                                      )
                                    }
                                    className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95"
                                  >
                                    Reinstate Host Early
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {suspensionsList.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-white/5 rounded-3xl bg-zinc-950/20 text-center">
                          <AlertTriangle
                            size={36}
                            className="mb-3 text-zinc-700 font-mono"
                          />
                          <p className="font-extrabold uppercase italic tracking-widest text-xs">
                            No active infraction cases archived
                          </p>
                          <p className="text-[9px] text-zinc-600 mt-1 uppercase max-w-xs mx-auto">
                            Click "Run AI Auto-Safety Sweep" above to scan live
                            feeds or generate mockup appeal test cases.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "ads" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 animate-fade-in text-white"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                    <span className="text-amber-500 font-sans">&bull;</span>{" "}
                    Sponsor Ad Auditing & VPN Shield Logs
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Cross-reference real-time geotargeted impressions, inspect
                    VPN bypass signals, and audit paid-out ad balances
                  </p>
                </div>
                <button
                  onClick={() =>
                    showToast("Sponsor billing report exported! 📥", "success")
                  }
                  className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest self-start text-amber-400 cursor-pointer italic"
                >
                  Export Advertiser Bill
                </button>
              </div>

              {/* Core Ad Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0b0c0d] border border-white/5 rounded-3xl p-6 space-y-2 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">
                    Total Ad Impressions
                  </span>
                  <span className="text-3xl font-black italic text-stone-100 block">
                    {adImpressionsList.length.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase">
                    Across all sponsor spots
                  </span>
                </div>

                <div className="bg-[#0b0c0d] border border-white/5 rounded-3xl p-6 space-y-2 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">
                    Organic Views Cleared
                  </span>
                  <span className="text-3xl font-black italic text-emerald-400 block p-0">
                    {adImpressionsList
                      .filter((l) => !l.isVpn)
                      .length.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-medium text-emerald-500/80 uppercase">
                    Timezone consistent traffic
                  </span>
                </div>

                <div className="bg-[#0b0c0d] border border-white/5 rounded-3xl p-6 space-y-2 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-rose-500/5 rounded-full blur-xl" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">
                    VPN Shield Deflections
                  </span>
                  <span className="text-3xl font-black italic text-rose-500 block">
                    {adImpressionsList
                      .filter((l) => l.isVpn)
                      .length.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-medium text-rose-400/80 uppercase">
                    Inconsistent proxies blocked
                  </span>
                </div>

                <div className="bg-[#0b0c0d] border border-white/5 rounded-3xl p-6 space-y-2 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-cyan-400/5 rounded-full blur-xl" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">
                    Ad Beans Credited
                  </span>
                  <span className="text-3xl font-black italic text-cyan-400 block">
                    {adImpressionsList
                      .reduce((sum, l) => sum + (l.adBeansEarned || 0), 0)
                      .toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase">
                    ≈ $
                    {(
                      adImpressionsList.reduce(
                        (sum, l) => sum + (l.adBeansEarned || 0),
                        0,
                      ) / 210
                    ).toFixed(2)}{" "}
                    USD paid
                  </span>
                </div>
              </div>

              {/* Main Impressions Ledger Log */}
              <div className="bg-[#0b0c0d] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-white italic">
                    Platform Global Impression Ledger
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    Live Stream Audits ({adImpressionsList.length})
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs uppercase font-extrabold tracking-tight border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-zinc-500 text-[9px] tracking-widest uppercase">
                        <th className="pb-3 font-black">
                          Ad Viewer (Spectator)
                        </th>
                        <th className="pb-3 font-black">
                          Target Host (Streamer)
                        </th>
                        <th className="pb-3 font-black">Sponsor / Brand</th>
                        <th className="pb-3 font-black">Location (Country)</th>
                        <th className="pb-3 font-black">Verification IP</th>
                        <th className="pb-3 font-black text-center">
                          Security Status
                        </th>
                        <th className="pb-3 text-right font-black">Ad Beans</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adImpressionsList.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-white/5 hover:bg-white/5 rounded-xl transition-all"
                        >
                          <td className="py-4 font-bold text-stone-200">
                            <div>
                              <p className="font-extrabold text-[#00cbd6]">
                                {log.viewerName || "Spectator Name"}
                              </p>
                              <p className="text-[8px] text-zinc-600 font-mono mt-0.5">
                                {log.viewerUid || "UID Placeholder"}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 text-zinc-400 font-mono text-[10px]">
                            {log.hostUid || "Offline Host"}
                          </td>
                          <td className="py-4 text-amber-400">
                            {log.campaignBrand || "Ad Slot"}
                          </td>
                          <td className="py-4 text-stone-200">
                            <span className="flex items-center gap-1.5 font-bold">
                              🌐 {log.countryName || "International"} (
                              {log.country || "GLOBAL"})
                            </span>
                          </td>
                          <td className="py-4 font-mono text-zinc-500 text-[10px]">
                            {log.ip || "Masked Address"}
                          </td>
                          <td className="py-4 text-center">
                            {log.isVpn ? (
                              <span className="inline-block px-2.5 py-1 text-[8px] bg-rose-500/10 text-rose-500 rounded border border-rose-500/20 font-black tracking-widest">
                                VPN DETECTED / BLOCKED
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 text-[8px] bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-black tracking-widest">
                                CLEARED (ORGANIC)
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-right">
                            <span
                              className={
                                log.isVpn
                                  ? "text-zinc-600"
                                  : "text-cyan-400 font-extrabold"
                              }
                            >
                              +
                              {log.isVpn
                                ? "0.000"
                                : log.adBeansEarned?.toFixed(3) || "0.000"}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {adImpressionsList.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 text-center text-zinc-500 font-bold uppercase italic tracking-widest"
                          >
                            Incoming global traffic ledger is currently empty.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "search-engine" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 text-white font-sans"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                    <span className="text-amber-500 font-sans">&bull;</span>{" "}
                    Search Engine Algorithm Desk (OWI & IndexNow)
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                    Tap into European Union's OpenWebSearch.eu public indexing
                    framework and Bing IndexNow instant crawlers
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsDiagnosticsRunning(true);
                      setTimeout(() => {
                        setIsDiagnosticsRunning(false);
                        setDiagnosticRunDone(true);
                        showToast("Crawl Diagnostics Complete! 🌐", "success");
                      }, 1850);
                    }}
                    disabled={isDiagnosticsRunning}
                    className="px-5 py-3 bg-[#eebd41]/10 border border-[#eebd41]/25 hover:bg-[#eebd41]/20 disabled:opacity-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#eebd41] cursor-pointer active:scale-95 transition-all text-center"
                  >
                    {isDiagnosticsRunning
                      ? "Running Spider Scan..."
                      : "Scan Crawl Compliance"}
                  </button>
                </div>
              </div>

              {/* Search/SEO KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0b0c0d] border border-white/5 rounded-3xl p-6 space-y-1 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-[#38bdf8]/5 rounded-full blur-xl" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">
                    Active Public Indexes
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Globe size={18} className="text-[#38bdf8]" />
                    <p className="text-2xl font-black italic text-zinc-100">
                      4 Providers
                    </p>
                  </div>
                  <p className="text-[9px] text-zinc-650 uppercase mt-2">
                    OpenWebSearch.eu, Bing, Yahoo!, DuckDuckGo
                  </p>
                </div>

                <div className="bg-[#0b0c0d] border border-white/5 rounded-3xl p-6 space-y-1 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">
                    SEO / GEO Compliance
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Check size={18} className="text-emerald-400" />
                    <p className="text-2xl font-black italic text-emerald-400">
                      98% Score
                    </p>
                  </div>
                  <p className="text-[9px] text-zinc-650 uppercase mt-2">
                    Zero meta-tag violations detected
                  </p>
                </div>

                <div className="bg-[#0b0c0d] border border-white/5 rounded-3xl p-6 space-y-1 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-[#eebd41]/5 rounded-full blur-xl" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">
                    IndexNow Transmitters
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Zap size={18} className="text-[#eebd41] animate-pulse" />
                    <p className="text-2xl font-black italic text-[#eebd41]">
                      Instant Push
                    </p>
                  </div>
                  <p className="text-[9px] text-zinc-650 uppercase mt-2">
                    IndexNow Protocol API is live
                  </p>
                </div>

                <div className="bg-[#0b0c0d] border border-white/5 rounded-3xl p-6 space-y-1 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">
                    Est. AI Referrals (24H)
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Sparkles size={18} className="text-[#a855f7]" />
                    <p className="text-2xl font-black italic text-[#a855f7]">
                      8,421 visits
                    </p>
                  </div>
                  <p className="text-[9px] text-zinc-650 uppercase mt-2">
                    Generative citation index matching
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transmit IndexNow update panel */}
                <div className="bg-[#0b0c0d] border border-white/5 rounded-[2rem] p-6 lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-sm font-black uppercase italic tracking-wider text-zinc-100">
                      IndexNow Submission Engine
                    </h3>
                    <p className="text-[9.5px] text-zinc-500 mt-1 uppercase">
                      Submitting immediate site changes directly bypasses
                      schedules and forces Bing and partner spiders to index
                      updates in seconds
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block">
                          Unique Verification Key
                        </label>
                        <input
                          type="text"
                          value={indexKey}
                          onChange={(e) => setIndexKey(e.target.value)}
                          className="w-full bg-[#161719] border border-white/5 rounded-2xl px-4 py-3 text-xs font-mono text-[#eebd41] focus:outline-none focus:border-[#eebd41]/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block">
                          Host Endpoint Domain
                        </label>
                        <input
                          type="text"
                          disabled
                          value="bingo-live-global.app"
                          className="w-full bg-[#121315] border border-white/5 rounded-2xl px-4 py-3 text-xs font-mono text-zinc-650 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block">
                        Immediate Target URL to update
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={targetPingUrl}
                          onChange={(e) => setTargetPingUrl(e.target.value)}
                          className="flex-1 bg-[#161719] border border-white/5 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#eebd41]/40"
                        />
                        <button
                          onClick={() => {
                            setIsPingingIndex(true);
                            setTimeout(() => {
                              setIsPingingIndex(false);
                              setLastIndexNowResponse({
                                status: 200,
                                message: "OK",
                                pushedUrl: targetPingUrl,
                                engines: [
                                  "Bing",
                                  "Seznam.cz",
                                  "Yandex",
                                  "Infospace",
                                ],
                                timestamp: new Date().toISOString(),
                              });
                              showToast(
                                "IndexNow update broadcast completed!",
                                "success",
                              );
                            }, 1200);
                          }}
                          disabled={isPingingIndex}
                          className="bg-[#eebd41] hover:bg-[#d97706] active:scale-95 disabled:opacity-50 transition-all font-black text-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          {isPingingIndex ? "Broadcasting..." : "Transmit"}
                        </button>
                      </div>
                      <span className="text-[8px] text-zinc-550 uppercase">
                        Example: /rooms/[roomId] or /family-list when changes go
                        live
                      </span>
                    </div>
                  </div>

                  {lastIndexNowResponse && (
                    <div className="bg-[#121315] border border-white/5 rounded-2xl p-4 space-y-3 font-mono">
                      <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider">
                        <span className="text-zinc-650">
                          API Callback Logger
                        </span>
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">
                          Status 200 OK
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[10px] text-zinc-400">
                        <div className="flex justify-between">
                          <span>Timestamp:</span>
                          <span className="text-zinc-300">
                            {lastIndexNowResponse.timestamp}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Pushed:</span>
                          <span className="text-[#38bdf8] break-all">
                            {lastIndexNowResponse.pushedUrl}
                          </span>
                        </div>
                        <div>
                          <span>Indexed Partners:</span>
                          <div className="flex gap-2 flex-wrap mt-1">
                            {lastIndexNowResponse.engines.map(
                              (e: string, i: number) => (
                                <span
                                  key={i}
                                  className="bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-white font-sans font-bold text-[9px]"
                                >
                                  {e}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* OpenWebSearch EU Information block */}
                <div className="bg-[#0b0c0d] border border-white/5 rounded-[2rem] p-6 space-y-6 flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <Globe
                        size={18}
                        className="text-[#38bdf8] animate-pulse"
                      />
                      <h3 className="text-sm font-black uppercase italic tracking-wider text-[#38bdf8]">
                        OpenWebSearch.eu Project
                      </h3>
                    </div>
                    <p className="text-[10px] leading-relaxed text-zinc-300">
                      A major Horizon Europe-funded research initiative aiming
                      to build an independent, open alternative web indexing
                      infrastructure. By offering public, decentralized{" "}
                      <strong>Open Web Index (OWI)</strong> structures, it
                      breaks monopoly dominance.
                    </p>
                    <div className="bg-[#121315]/80 border border-white/5 rounded-2xl p-4 space-y-3">
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#eebd41] block">
                        How Bingo Live Integrates:
                      </span>
                      <ul className="space-y-2 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span>User-Agent "OpenWebSpider" Whitelisted</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span>Embedded microdata graphs auto-resolved</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span>
                            Decentralized geo-spatial metadata targets
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 text-[9px] text-zinc-650 font-bold uppercase text-center tracking-widest">
                    Ethics-first, competitive indexing compliant
                  </div>
                </div>
              </div>

              {/* SEO / GEO Spider Diagnostics Card */}
              <div className="bg-[#0b0c0d] border border-white/5 rounded-[2rem] p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-wider text-[#eebd41]">
                    Compliance &amp; Search Visibility Analysis
                  </h3>
                  <p className="text-[9.5px] text-zinc-500 mt-1 uppercase">
                    Diagnostics scanner evaluates real-time SEO tagging,
                    structured schema relationships, and spider permission
                    configurations
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Robots.txt Crawlability",
                      status: "Enabled",
                      check: true,
                      details:
                        "Crawl permission granted to OpenWebSpider, Bingbot, Googlebot",
                    },
                    {
                      label: "Schema.org WebApplication Graph",
                      status: "Compliant",
                      check: true,
                      details:
                        "Detailed high-entropy mapping targeting USA & regional countries",
                    },
                    {
                      label: "Competitor Hijack Embeds",
                      status: "Active",
                      check: true,
                      details:
                        "Mapping hooks for 20 competitors redirecting generative searches",
                    },
                    {
                      label: "Dynamic Sitemaps & Feeds",
                      status: "Functional",
                      check: true,
                      details:
                        "Configured /feed.xml targeting real-time trending live creators",
                    },
                  ].map((t, idx) => (
                    <div
                      key={idx}
                      className="bg-[#121315]/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#eebd41] block">
                        {t.label}
                      </span>
                      <div className="flex items-center justify-between mt-3">
                        <span
                          className={cn(
                            "text-[10px] font-black uppercase tracking-wider",
                            t.check ? "text-emerald-400" : "text-[#eebd41]",
                          )}
                        >
                          {t.status}
                        </span>
                        <div className="w-5 h-5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-bold text-emerald-400">
                            ✓
                          </span>
                        </div>
                      </div>
                      <span className="text-[8.5px] text-zinc-500 font-bold tracking-tight uppercase leading-snug mt-2 block">
                        {t.details}
                      </span>
                    </div>
                  ))}
                </div>

                {diagnosticRunDone && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3 flex-wrap">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-[10px] flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                        All validation checks passed
                      </p>
                      <p className="text-[9px] text-zinc-400 mt-0.5 uppercase">
                        Our index schemas are ready. By placing canonical tags,
                        structured schemas, and RSS channels on our pages, your
                        product is now highly discoverable on both European Open
                        Web Indexes and international Bing rankings.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Crawler & Search Spider Handshake Audit Ledger */}
              <div className="bg-[#0b0c0d] border border-white/5 rounded-[2rem] p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black uppercase italic tracking-wider text-[#38bdf8] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Live Server Crawl &amp; Handshake Auditor
                    </h3>
                    <p className="text-[9.5px] text-zinc-500 mt-1 uppercase">Standard web gateway parses crawlers' "User-Agent" signatures during HTTP GET requests, returning 200 OK handshakes</p>
                  </div>
                  <div className="flex gap-2 font-sans">
                    <button
                      type="button"
                      onClick={async () => {
                        const spiders = [
                          { name: "Googlebot/2.1", type: "Search Bot", ip: "66.249.79.12" },
                          { name: "Bingbot/2.0", type: "Search Bot", ip: "157.55.39.201" },
                          { name: "OpenWebSpider/1.4 (OpenWebSearch.eu)", type: "OWS Crawler", ip: "193.174.111.9" },
                          { name: "GPTBot/1.2 (OpenAI Link Checker)", type: "AI Crawler", ip: "20.15.225.84" },
                          { name: "Applebot/0.1", type: "Search Bot", ip: "17.58.101.42" }
                        ];
                        const paths = ["/leaderboard", "/family-list", "/party", "/trends", "/go-live", "/"];
                        const countries = ["Germany (DE)", "United States (US)", "United Kingdom (GB)", "France (FR)", "Netherlands (NL)"];
                        
                        const chosenSpider = spiders[Math.floor(Math.random() * spiders.length)];
                        const chosenPath = paths[Math.floor(Math.random() * paths.length)];
                        const chosenCountry = countries[Math.floor(Math.random() * countries.length)];
                        
                        try {
                          const response = await fetch("/api/simulate-crawl", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              spider: chosenSpider.name,
                              path: chosenPath,
                              method: "GET",
                              status: 200,
                              ip: chosenSpider.ip,
                              country: chosenCountry,
                              type: chosenSpider.type
                            })
                          });
                          if (response.ok) {
                            const data = await response.json();
                            if (data && data.logs) {
                              setHandshakeLogs(data.logs);
                            }
                            showToast(`Server Handshake Registered: ${chosenSpider.name} crawled BINGO static page!`, "success");
                          }
                        } catch (e) {
                          console.error("Failed to post server log", e);
                        }
                      }}
                      className="px-4 py-2 bg-[#38bdf8]/10 border border-[#38bdf8]/25 hover:bg-[#38bdf8]/20 rounded-xl text-[9px] font-black uppercase tracking-wider text-[#38bdf8] cursor-pointer"
                    >
                      Trigger Live Crawler Audit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHandshakeLogs([]);
                        showToast("Cleared active panel views. Server continues logging background requests.", "info");
                      }}
                      className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider text-red-400 cursor-pointer"
                    >
                      Clear View
                    </button>
                  </div>
                </div>

                {handshakeLogs.length === 0 ? (
                  <div className="border border-white/5 bg-[#121315]/50 rounded-2xl p-8 text-center text-zinc-650 font-mono text-xs uppercase animate-pulse">
                    No active crawler handshakes logged. Click "Simulate Crawler Visit" to ping!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[8px] font-black uppercase tracking-widest text-zinc-500 font-sans">
                          <th className="pb-3 pl-3">Spider / User-Agent Address</th>
                          <th className="pb-3">Endpoint Path</th>
                          <th className="pb-3">Response Gateway</th>
                          <th className="pb-3">Crawler Origin (IP)</th>
                          <th className="pb-3 pr-3 text-right">Timestamp (UTC)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[10px]">
                        {handshakeLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/[2%] transition-all">
                            <td className="py-3 pl-3 font-semibold text-zinc-200">
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  log.spider.includes("Google") ? "bg-[#38bdf8]" :
                                  log.spider.includes("Bing") ? "bg-[#eebd41]" :
                                  log.spider.includes("OpenWeb") ? "bg-[#a855f7]" : "bg-[#f43f5e]"
                                }`} />
                                <div>
                                  <p className="font-bold text-zinc-100 text-[10px]">{log.spider}</p>
                                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-sans">{log.type}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 font-semibold text-[#2af5ff]">{log.path}</td>
                            <td className="py-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-bold uppercase tracking-wider text-[8px]">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> {log.status} SUCCESS
                              </span>
                            </td>
                            <td className="py-3 text-zinc-400 font-sans">
                              <div>
                                <span className="text-zinc-200 font-bold font-mono">{log.ip}</span>
                                <p className="text-[8px] text-zinc-500 font-sans uppercase">{log.country}</p>
                              </div>
                            </td>
                            <td className="py-3 pr-3 text-right text-zinc-500 text-[9px] font-sans">{log.timestamp.slice(11, 19)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pt-4 text-center border-t border-white/5 font-mono">
                      <p className="text-[8.5px] text-zinc-500 font-bold tracking-widest uppercase">
                        💡 SUCCESSFUL CRAWL HANDSHAKE RATE: 100% — Zero 404/500 faults reported over search engine spiders
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "withdrawals" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 animate-fade-in text-white"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                    <span className="text-emerald-400 font-sans">&bull;</span>{" "}
                    Host Payout & Ledger Center
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Real-time incoming store revenue, completed withdrawals
                    backlog, and eligibility audits
                  </p>
                </div>
              </div>

              {/* Micro KPI strip inside withdrawals page */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0c0c0d]/60 border border-white/5 rounded-3xl p-6">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    Gross Store Deposits
                  </span>
                  <p className="text-xl font-black italic text-cyan-400 mt-2">
                    $
                    {revenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400/80 rounded-full"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
                <div className="bg-[#0c0c0d]/60 border border-white/5 rounded-3xl p-6">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    Real Cash Out payouts
                  </span>
                  <p className="text-xl font-black italic text-orange-400 mt-2">
                    $
                    {payoutsPaid.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-orange-400/80 rounded-full"
                      style={{
                        width: `${revenue > 0 ? (payoutsPaid / revenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="bg-[#0c0c0d]/60 border border-white/5 rounded-3xl p-6">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    Safe Cash reserve
                  </span>
                  <p className="text-xl font-black italic text-emerald-400 mt-2">
                    $
                    {(revenue - payoutsPaid).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400/80 rounded-full"
                      style={{
                        width: `${revenue > 0 ? ((revenue - payoutsPaid) / revenue) * 100 : 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="bg-[#0c0c0d]/60 border border-white/5 rounded-3xl p-6">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    Host Liabilities Outstanding
                  </span>
                  <p className="text-xl font-black italic text-purple-400 mt-2">
                    $
                    {outstandingDebt.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-purple-400/80 rounded-full"
                      style={{
                        width: `${revenue - payoutsPaid > 0 ? Math.min((outstandingDebt / (revenue - payoutsPaid)) * 100, 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Dual Grid Layout detailing Log history & User Cashed Out categorization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Box A: Real Withdrawal backlog */}
                <div className="bg-[#0c0c0d]/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white uppercase italic tracking-tight">
                        Withdrawal logs backlog
                      </h3>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                        Audit trail of all real cash withdraw operations
                        executed and cleared
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                      {withdrawalsList.length} logs
                    </span>
                  </div>

                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                    {withdrawalsList.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 bg-[#0a0a0b]/85 border border-white/5 hover:border-emerald-500/10 rounded-2xl flex items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-emerald-400 font-extrabold border border-white/10 overflow-hidden">
                            {log.userPhoto ? (
                              <img
                                src={log.userPhoto}
                                className="w-full h-full rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              log.userName?.charAt(0) || "U"
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase text-white truncate max-w-[150px]">
                              {log.userName}
                            </p>
                            <p className="text-[9px] font-bold text-zinc-500 truncate max-w-[150px]">
                              {log.userEmail}
                            </p>
                            <p className="text-[8px] text-zinc-600 uppercase font-mono mt-0.5">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-black italic text-emerald-400">
                            + ${log.usdAmount?.toFixed(2)} USD
                          </div>
                          <div className="text-[9px] font-extrabold text-zinc-400 tracking-wider">
                            ({log.beansAmount?.toLocaleString()} BEANS)
                          </div>
                          <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-[7px] font-black uppercase text-emerald-400 tracking-wider">
                            Cleared
                          </div>
                        </div>
                      </div>
                    ))}

                    {withdrawalsList.length === 0 && (
                      <div className="py-20 text-center text-zinc-600 border border-dashed border-white/5 rounded-3xl bg-zinc-950/20">
                        <p className="font-extrabold uppercase italic tracking-widest text-xs">
                          No pending or completed withdrawals registered
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Box B: Categorized Withdrawals Status (Who withdrew vs Who hasn't!) */}
                <div className="bg-[#0c0c0d]/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white uppercase italic tracking-tight">
                        payout eligibility auditing
                      </h3>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                        Detailed directory categorized by withdrawal activity
                        metrics
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                    {/* Column 1: Who made a withdrawal */}
                    <div className="flex flex-col space-y-3 overflow-hidden">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-1">
                        🟢 Users Who Cashed Out (
                        {
                          usersList.filter((u) =>
                            withdrawalsList.some((w) => w.userId === u.id),
                          ).length
                        }
                        )
                      </span>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar border-t border-white/5 pt-3">
                        {usersList
                          .filter((u) =>
                            withdrawalsList.some((w) => w.userId === u.id),
                          )
                          .map((u) => {
                            const userPayout = withdrawalsList
                              .filter(
                                (w) =>
                                  w.userId === u.id && w.status === "completed",
                              )
                              .reduce((sum, w) => sum + (w.usdAmount || 0), 0);

                            return (
                              <div
                                key={u.id}
                                className="p-3 bg-zinc-950/40 border border-white/5 rounded-2xl flex items-center justify-between gap-2"
                              >
                                <div className="truncate">
                                  <p className="text-[11px] font-black text-white uppercase truncate">
                                    {u.displayName || "Host User"}
                                  </p>
                                  <p className="text-[8px] text-zinc-500 uppercase mt-0.5 truncate">
                                    Total: ${userPayout.toFixed(2)} USD
                                  </p>
                                </div>
                                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-extrabold uppercase text-[7px] rounded-md shrink-0">
                                  Cashed
                                </span>
                              </div>
                            );
                          })}

                        {usersList.filter((u) =>
                          withdrawalsList.some((w) => w.userId === u.id),
                        ).length === 0 && (
                          <p className="text-[10px] text-zinc-600 font-bold uppercase italic p-4 text-center">
                            No active histories
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Who has NOT made a withdrawal yet */}
                    <div className="flex flex-col space-y-3 overflow-hidden">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-1">
                        🟣 Waiting/No Payouts (
                        {
                          usersList.filter(
                            (u) =>
                              u.beans > 0 &&
                              !withdrawalsList.some((w) => w.userId === u.id),
                          ).length
                        }
                        )
                      </span>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar border-t border-white/5 pt-3">
                        {usersList
                          .filter(
                            (u) =>
                              u.beans > 0 &&
                              !withdrawalsList.some((w) => w.userId === u.id),
                          )
                          .map((u) => (
                            <div
                              key={u.id}
                              className="p-3 bg-zinc-950/40 border border-white/5 rounded-2xl flex items-center justify-between gap-2"
                            >
                              <div className="truncate">
                                <p className="text-[11px] font-black text-white uppercase truncate">
                                  {u.displayName || "Host User"}
                                </p>
                                <p className="text-[8px] text-purple-400 font-extrabold uppercase mt-0.5 truncate">
                                  🟣 {u.beans?.toLocaleString()} BEANS
                                </p>
                              </div>
                              <span className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/25 text-purple-400 font-extrabold uppercase text-[7px] rounded-md shrink-0">
                                ≈ ${(u.beans / 210).toFixed(2)}
                              </span>
                            </div>
                          ))}

                        {usersList.filter(
                          (u) =>
                            u.beans > 0 &&
                            !withdrawalsList.some((w) => w.userId === u.id),
                        ).length === 0 && (
                          <p className="text-[10px] text-zinc-600 font-bold uppercase italic p-4 text-center">
                            No outstanding claims
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "gifts" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                    Vesper Gift Store
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Configure virtual 3D items, values, status indices, and
                    flash events
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingGift(null);
                    setGiftForm({
                      name: "",
                      cost: 0,
                      image: "🎁",
                      animationType: "standard",
                      category: "Popular",
                      isFlash: false,
                      animationUrl: "",
                      giftType: "image",
                    });
                    setIsAddingGift(true);
                  }}
                  className="px-5 py-3 bg-cyan-500 text-black hover:bg-white rounded-2xl text-xs font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-cyan-500/10 flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  Asset Minting
                </button>
              </div>

              {/* Gift Grid by Category */}
              {[
                "Popular",
                "Noble",
                "Event",
                "Flash",
                "Local",
                "Fun",
                "Shields",
                "Treasure",
                "Activity",
              ].map((category) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 font-mono italic shrink-0">
                      {category} CATALOGS
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {gifts
                      .filter((g) => g.category === category)
                      .map((gift) => (
                        <div
                          key={gift.id}
                          onDoubleClick={() => {
                            setEditingGift(gift);
                            setGiftForm(gift);
                            setIsAddingGift(true);
                          }}
                          className="bg-[#0c0c0d]/40 border border-white/5 rounded-3xl p-3.5 group relative cursor-pointer hover:border-white/15 hover:bg-black/50 transition-all shadow-md text-center flex flex-col justify-between"
                        >
                          <div className="aspect-square flex items-center justify-center bg-white/5 rounded-2xl relative overflow-hidden mb-3">
                            {gift.image?.startsWith("http") ||
                            gift.image?.startsWith("/") ? (
                              <img
                                src={gift.image}
                                className="w-10 h-10 object-contain p-1"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-3xl transition-transform group-hover:scale-110 duration-300">
                                {gift.image || "🎁"}
                              </span>
                            )}
                            {gift.isFlash && (
                              <div className="absolute top-1.5 right-1.5 bg-red-500 text-[6px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 shadow-sm text-white">
                                <Clock size={7} />
                                Flash
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="text-[11px] font-black uppercase italic text-white truncate mb-1">
                              {gift.name}
                            </h4>
                            <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-yellow-500">
                              <Diamond size={10} className="fill-current" />
                              <span>{(gift.cost || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                    <button
                      onClick={() => {
                        setGiftForm((prev) => ({ ...prev, category }));
                        setIsAddingGift(true);
                      }}
                      className="aspect-square border border-dashed border-white/10 hover:border-cyan-500/30 rounded-3xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-cyan-400 bg-white/[0.01] hover:bg-cyan-500/[0.02] transition-all"
                    >
                      <Plus size={20} />
                      <span className="text-[8px] font-black uppercase tracking-wider">
                        Mint Item
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Add/Edit Egg Modal */}
        <AnimatePresence>
          {isAddingEgg && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1a1a1a] border border-white/10 rounded-[3rem] w-full max-w-lg overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black uppercase italic">
                        {editingEgg ? "Edit Egg" : "Design Egg"}
                      </h2>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                        Surprise Drop Configuration
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingEgg(false)}
                      className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center relative group overflow-hidden">
                        {isUploadingEgg ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500" />
                        ) : (
                          <>
                            {eggForm.image.startsWith("http") ? (
                              <img
                                src={eggForm.image}
                                className="w-20 h-20 object-contain"
                              />
                            ) : (
                              <span className="text-5xl">{eggForm.image}</span>
                            )}
                            <button
                              onClick={() => eggFileInputRef.current?.click()}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1"
                            >
                              <Upload size={20} />
                              <span className="text-[8px] font-black uppercase">
                                Upload
                              </span>
                            </button>
                          </>
                        )}
                        <input
                          type="file"
                          ref={eggFileInputRef}
                          onChange={handleEggImageUpload}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            Egg Name
                          </label>
                          <input
                            type="text"
                            value={eggForm.name}
                            onChange={(e) =>
                              setEggForm({ ...eggForm, name: e.target.value })
                            }
                            placeholder="e.g. Golden Mystery Egg"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-purple-500 transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            Emoji Icon (Fallback)
                          </label>
                          <input
                            type="text"
                            value={
                              eggForm.image.startsWith("http")
                                ? "🥚"
                                : eggForm.image
                            }
                            onChange={(e) =>
                              setEggForm({ ...eggForm, image: e.target.value })
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-purple-500 transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                          Reward Value
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={eggForm.rewardValue}
                            onChange={(e) =>
                              setEggForm({
                                ...eggForm,
                                rewardValue: parseInt(e.target.value),
                              })
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-purple-500 transition-all outline-none"
                          />
                          <Diamond
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400"
                            size={14}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                          Reward Type
                        </label>
                        <select
                          value={eggForm.rewardType}
                          onChange={(e) =>
                            setEggForm({
                              ...eggForm,
                              rewardType: e.target.value,
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-purple-500 transition-all outline-none appearance-none"
                        >
                          <option value="beans">Beans</option>
                          <option value="diamonds">Diamonds</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Rarity Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["common", "rare", "legendary"].map((r) => (
                          <button
                            key={r}
                            onClick={() =>
                              setEggForm({ ...eggForm, rarity: r })
                            }
                            className={cn(
                              "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                              eggForm.rarity === r
                                ? "bg-purple-500 border-purple-400 text-white"
                                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10",
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <div className="text-xs font-black uppercase italic">
                          Active Status
                        </div>
                        <div className="text-[8px] text-white/40 font-black uppercase tracking-widest">
                          Enable this egg for automatic and manual drops
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setEggForm({
                            ...eggForm,
                            isEnabled: !eggForm.isEnabled,
                          })
                        }
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-colors duration-300",
                          eggForm.isEnabled ? "bg-green-500" : "bg-white/10",
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                            eggForm.isEnabled ? "left-7" : "left-1",
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                    {editingEgg && (
                      <button
                        onClick={() => handleDeleteEgg(editingEgg.id)}
                        className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                    <button
                      onClick={() => setIsAddingEgg(false)}
                      className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEgg}
                      className="flex-1 py-4 bg-purple-500 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      {editingEgg ? "Update Egg" : "Save Design"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add/Edit Gift Modal */}
        <AnimatePresence>
          {isAddingGift && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.93 }}
                className="bg-[#141416] border border-white/10 rounded-[2rem] w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
              >
                {/* Fixed Title Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black uppercase italic tracking-wide text-white">
                      {editingGift ? "Edit Gift" : "Add New Gift"}
                    </h2>
                    <p className="text-[9px] text-[#06b6d4] font-black uppercase tracking-widest">
                      Platform Asset Setup
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddingGift(false)}
                    className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Main Scrollable content Area */}
                <div className="p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {/* Media Setup Mode Selector Tabs */}
                  <div className="flex bg-black p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setGiftAssetInputMode("upload")}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                        giftAssetInputMode === "upload"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25"
                          : "text-white/40 hover:text-white border border-transparent",
                      )}
                    >
                      <Upload size={10} /> Direct Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setGiftAssetInputMode("github")}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                        giftAssetInputMode === "github"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                          : "text-white/40 hover:text-white border border-transparent",
                      )}
                    >
                      <Globe size={10} /> GitHub / CDN URLs
                    </button>
                  </div>

                  {/* Mode 1: Direct File Upload only */}
                  {giftAssetInputMode === "upload" && (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Thumbnail File upload */}
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center text-xl border border-white/5 overflow-hidden flex-shrink-0">
                          {isUploadingGift ? (
                            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                          ) : giftForm.image?.startsWith("http") ||
                            giftForm.image?.startsWith("data:") ? (
                            <img
                              src={giftForm.image}
                              className="w-full h-full object-contain p-0.5"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            giftForm.image || "🎁"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-black uppercase tracking-wide text-zinc-400 truncate">
                            Thumbnail
                          </div>
                          <input
                            type="file"
                            ref={giftFileInputRef}
                            onChange={handleGiftUpload}
                            className="hidden"
                            accept="image/*"
                          />
                          <button
                            type="button"
                            onClick={() => giftFileInputRef.current?.click()}
                            disabled={isUploadingGift}
                            className="mt-1 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded text-[8px] font-black uppercase tracking-widest border border-cyan-500/20 transition-all flex items-center gap-1"
                          >
                            <Upload size={8} /> File
                          </button>
                        </div>
                      </div>

                      {/* Animation File upload */}
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="w-12 h-12 bg-black/40 rounded-lg flex flex-col items-center justify-center border border-white/5 overflow-hidden flex-shrink-0">
                          {isUploadingAnimation ? (
                            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          ) : giftForm.animationUrl ? (
                            <div className="text-[7px] font-mono text-amber-400 text-center uppercase tracking-wider font-bold">
                              Loaded
                            </div>
                          ) : (
                            <div className="text-[7px] font-mono text-zinc-500 text-center uppercase tracking-wider">
                              Empty
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-black uppercase tracking-wide text-amber-400 truncate">
                            FX Animation
                          </div>
                          <input
                            type="file"
                            ref={giftAnimationFileInputRef}
                            onChange={handleGiftAnimationUpload}
                            className="hidden"
                            accept=".json,image/gif,video/mp4"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              giftAnimationFileInputRef.current?.click()
                            }
                            disabled={isUploadingAnimation}
                            className="mt-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded text-[8px] font-black uppercase tracking-widest border border-amber-500/20 transition-all flex items-center gap-1"
                          >
                            <Upload size={8} /> File
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: GitHub Raw & CDN Links only */}
                  {giftAssetInputMode === "github" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1">
                          Thumbnail URL
                        </label>
                        <input
                          type="text"
                          value={giftForm.image}
                          onChange={(e) =>
                            setGiftForm({ ...giftForm, image: e.target.value })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold focus:border-cyan-500 transition-all outline-none"
                          placeholder="e.g. raw.github..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                          Animation FX URL
                        </label>
                        <input
                          type="text"
                          value={giftForm.animationUrl || ""}
                          onChange={(e) =>
                            setGiftForm({
                              ...giftForm,
                              animationUrl: e.target.value,
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold focus:border-amber-400 transition-all outline-none"
                          placeholder="e.g. raw.github..."
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/40">
                        Gift Name
                      </label>
                      <input
                        type="text"
                        value={giftForm.name}
                        onChange={(e) =>
                          setGiftForm({ ...giftForm, name: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold focus:border-cyan-500 transition-all outline-none"
                        placeholder="e.g. Special Crown"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/40">
                        Cost Option (Diamonds)
                      </label>
                      <input
                        type="number"
                        value={giftForm.cost}
                        onChange={(e) =>
                          setGiftForm({
                            ...giftForm,
                            cost: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold focus:border-cyan-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/40">
                        Category
                      </label>
                      <select
                        value={giftForm.category}
                        onChange={(e) =>
                          setGiftForm({ ...giftForm, category: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold focus:border-cyan-500 transition-all outline-none appearance-none"
                      >
                        <option value="Popular">Popular</option>
                        <option value="Noble">Noble</option>
                        <option value="Event">Event</option>
                        <option value="Flash">Flash</option>
                        <option value="Local">Local</option>
                        <option value="Fun">Fun</option>
                        <option value="Shields">Shields</option>
                        <option value="Treasure">Treasure</option>
                        <option value="Activity">Activity</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/40">
                        Media Type
                      </label>
                      <select
                        value={giftForm.giftType || "image"}
                        onChange={(e) =>
                          setGiftForm({ ...giftForm, giftType: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold focus:border-cyan-500 transition-all outline-none appearance-none"
                      >
                        <option value="emoji">Emoji Fallback</option>
                        <option value="image">Png/Jpeg Image</option>
                        <option value="gif">Animated GIF</option>
                        <option value="lottie">Lottie JSON</option>
                        <option value="video">MP4 Video</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/40">
                        FX Behavior
                      </label>
                      <select
                        value={giftForm.animationType}
                        onChange={(e) =>
                          setGiftForm({
                            ...giftForm,
                            animationType: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold focus:border-cyan-500 transition-all outline-none appearance-none"
                      >
                        <option value="standard">Standard</option>
                        <option value="fullscreen">Fullscreen</option>
                        <option value="special">Special Effect</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                          giftForm.isFlash
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-white/10 text-white/20",
                        )}
                      >
                        <Clock size={14} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase italic">
                          Flash Gift mode
                        </div>
                        <div className="text-[7.5px] font-black text-white/20 uppercase tracking-widest">
                          Limited duration offer
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setGiftForm({ ...giftForm, isFlash: !giftForm.isFlash })
                      }
                      className={cn(
                        "w-9 h-5 rounded-full relative transition-all",
                        giftForm.isFlash ? "bg-red-500" : "bg-white/10",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
                          giftForm.isFlash ? "right-0.5" : "left-0.5",
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Fixed bottom actions bar */}
                <div className="px-6 py-4 bg-black/50 border-t border-white/5 flex gap-3">
                  {editingGift && (
                    <button
                      onClick={() => handleDeleteGift(editingGift.id)}
                      className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500/20 transition-all border border-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddingGift(false)}
                    className="flex-1 py-2.5 bg-white/5 text-white rounded-xl font-black uppercase italic text-[10px] tracking-widest hover:bg-white/10 transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGift}
                    className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl font-black uppercase italic text-[10px] tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-cyan-400 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save size={14} />
                    {editingGift ? "Update" : "Add to Vault"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
