import Lottie, { LottieComponentProps } from "lottie-react";
import { useEffect, useState } from "react";

interface LottieAnimationProps extends Omit<LottieComponentProps, 'animationData'> {
  animationUrl: string;
}

export function LottieAnimation({ animationUrl, ...props }: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    fetch(animationUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load animation");
        return res.json();
      })
      .then((data) => setAnimationData(data))
      .catch((err) => {
        console.error("Lottie Load Error:", err);
        setError(true);
      });
  }, [animationUrl]);

  if (error) {
    return <div className="hidden" />;
  }

  if (!animationData) {
    return <div className="animate-pulse bg-gray-100 rounded-lg aspect-square" />;
  }

  return <Lottie animationData={animationData} {...props} />;
}
