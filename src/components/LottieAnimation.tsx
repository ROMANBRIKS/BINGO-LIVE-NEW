import Lottie, { LottieComponentProps } from "lottie-react";
import { useEffect, useState } from "react";

interface LottieAnimationProps extends Omit<LottieComponentProps, 'animationData'> {
  animationUrl: string;
}

export function LottieAnimation({ animationUrl, ...props }: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!animationUrl) return;

    const trimmed = animationUrl.trim();

    // 1. Check if the animationUrl itself is a raw JSON string
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        setAnimationData(parsed);
        return;
      } catch (err) {
        console.error("Failed to parse raw JSON animationUrl:", err);
      }
    }

    // 2. Check if the animationUrl is a Base64 JSON data URI
    if (trimmed.startsWith('data:application/json;base64,') || trimmed.startsWith('data:text/json;base64,') || trimmed.startsWith('data:application/octet-stream;base64,')) {
      try {
        const base64Data = trimmed.split(',')[1];
        // Safe Unicode decoding for base64 values
        const decodedUTF8 = decodeURIComponent(
          atob(base64Data)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        setAnimationData(JSON.parse(decodedUTF8));
        return;
      } catch (err) {
        try {
          const base64Data = trimmed.split(',')[1];
          setAnimationData(JSON.parse(atob(base64Data)));
          return;
        } catch (innerErr) {
          console.error("Failed to parse base64 Lottie animation:", innerErr);
          setError(true);
          return;
        }
      }
    }

    // 3. Fallback check if base64 encoded without prefix
    if (!trimmed.startsWith('http') && !trimmed.startsWith('/') && !trimmed.startsWith('.') && trimmed.length > 50) {
      try {
        const decoded = atob(trimmed);
        if (decoded.trim().startsWith('{') || decoded.trim().startsWith('[')) {
          setAnimationData(JSON.parse(decoded));
          return;
        }
      } catch (e) {
        // Not simple base64, proceed to fetch
      }
    }

    // 4. Standard Fetch URL flow
    fetch(animationUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load animation");
        return res.json();
      })
      .then((data) => setAnimationData(data))
      .catch((err) => {
        console.error("Lottie Fetch Load Error:", err);
        setError(true);
      });
  }, [animationUrl]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center animate-bounce">
        <span className="text-7xl drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] select-none">🎁</span>
        <span className="text-[9px] font-black uppercase text-cyan-400 mt-2 tracking-widest text-center">Custom Gifting Magic</span>
      </div>
    );
  }

  if (!animationData) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-neutral-950/20 rounded-2xl min-h-[120px]">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-[8px] font-black uppercase text-neutral-500 tracking-widest mt-3 animate-pulse">Syncing FX...</span>
      </div>
    );
  }

  return <Lottie animationData={animationData} {...props} />;
}
