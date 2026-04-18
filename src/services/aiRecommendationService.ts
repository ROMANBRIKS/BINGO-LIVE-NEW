import { GoogleGenAI } from "@google/genai";
import { Room, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface RecommendationResponse {
  recommendedRoomId: string;
  reason: string;
  score: number;
}

/**
 * Uses Gemini AI to analyze available live streams and recommend the best one 
 * based on psychological engagement triggers and streamer performance.
 */
export async function getAIStreamRecommendations(
  rooms: Room[], 
  availableProfiles: Record<string, UserProfile>
): Promise<RecommendationResponse[]> {
  if (rooms.length === 0) return [];

  // Prepare a condensed version of the data for the AI to analyze
  const streamData = rooms.map(room => {
    const host = availableProfiles[room.hostUid];
    return {
      id: room.id,
      title: room.title,
      viewers: room.viewerCount,
      beans: room.currentBeans,
      hostLevel: host?.level || 0,
      hostNoble: host?.nobleTitle || 'None'
    };
  });

  const prompt = `
    Analyze these live streaming rooms and recommend the top 3 and give a reason for each.
    Focus on "High Engagement" potential. Higher levels and noble titles are better.
    Rooms with many viewers but moderate beans are "Trending".
    Rooms with few viewers but high beans are "Whale Rooms".
    
    Data: ${JSON.stringify(streamData)}
    
    Return ONLY a JSON array of objects with keys: recommendedRoomId, reason, score (1-100).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result as RecommendationResponse[];
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    // Fallback: Just return top 3 by viewer count
    return rooms.slice(0, 3).map(r => ({
      recommendedRoomId: r.id,
      reason: "Popular Choice",
      score: 90
    }));
  }
}
