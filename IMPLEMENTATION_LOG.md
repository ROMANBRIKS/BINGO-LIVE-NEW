# Implementation Log & Feature Manifest

This file tracks all custom logic, features, and systems implemented in the Bingo Live application.

## 1. Noble System Logic
- **File**: `src/nobleGiftingLogic.ts`
- **Tiers**: Knight, Viscount, Earl, Marquis, Duke, King, Emperor.
- **Multipliers**: Tier-based gifting power (up to 2x for Emperor).
- **Badges**: Unique visual identifiers for each rank.
- **Entrance Logic**: Special triggers for high-tier users joining a room.

## 2. PK Enhanced Logic
- **File**: `src/pkEnhancedLogic.ts`
- **Snipe Window**: Final 60 seconds of a battle.
- **Snipe Multiplier**: 1.5x boost to all gifting power during the Snipe Window.
- **Forfeit System**: Random "punishments" for the loser (Pushups, Dance, etc.).
- **Result Calculation**: Logic to determine winners and assign forfeits.

## 3. PK Shield Logic
- **File**: `src/pkShieldLogic.ts`
- **Shield Tiers**: Light, Standard, Heavy, Emergency.
- **Absorption**: Blocks 30% to 100% of incoming opponent score.
- **Durability**: Point capacity (Max Absorption) before the shield breaks.
- **Health Calculation**: Real-time tracking of remaining durability and duration.

## 4. Mic Queue & Guest Seat Logic
- **File**: `src/micQueueLogic.ts`
- **Seat Management**: Initialization and assignment of guest seats in Multi-guest mode.
- **Mic Request Queue**: Handling users waiting for permission to speak.
- **Audio Control**: Mute/unmute logic for specific seats.

## 5. Follow & Engagement Logic
- **File**: `src/followLogic.ts`
- **Automated Thank You**: Personalized chat messages for new followers.
- **Follow Prompts**: Strategic UI prompts to encourage following the host.

## 6. Simulation & Interaction Logic
- **File**: `src/simulationLogic.ts`
- **Host Simulation**: Fake chat, gifts, and joins for the "Live" experience.
- **PK Simulation**: Opponent behavior, including random shield usage and snipe-phase gifting.

## 7. Visual & UI Logic
- **PK Shield Overlay**: (`src/components/PKShieldOverlay.tsx`) Immersive visual layer with glow and health bars.
- **Gift Combo Logic**: Animation and tracking of consecutive gifts.
- **Noble Entrance UI**: Special banners and animations for high-rank entries.
- **Noble Frame**: (`src/components/NobleFrame.tsx`) Premium visual border wrapping avatars based on Noble tier with animated glows for high ranks.
- **Fan Club Badge**: (`src/components/FanClubBadge.tsx`) Dynamic, color-coded badge for chat with level and host abbreviation.
- **Fan Club Welcome**: (`src/components/FanClubWelcome.tsx`) Dramatic entrance animation for top-tier Super Fans with sparkles and banners.
- **Family Badge**: (`src/components/FamilyBadge.tsx`) Unique identifier for family members with level-based colors and glow effects.
- **Mini-Game Overlay**: (`src/components/MiniGameOverlay.tsx`) High-energy interactive UI for live battles with real-time leaderboards and tap actions.

## 8. Data Model (Types)
- **File**: `src/types.ts`
- **Updates**: Expanded `Room` and `UserProfile` to support Noble titles, PK results, Shields, and Guest seats.

### 10. Bingo Beauty Filter (Bigo-Style)
- **Concept**: Professional-grade skin smoothing and brightening for live streaming.
- **Key Features**:
    - **Skin Smoothing**: Bilateral filtering to blur skin while preserving edges (eyes, mouth).
    - **Radiant Glow**: Subtle brightness boost for a "radiant" look.
    - **Detail Sharpening**: Blending sharp edges back into smooth skin for high quality.
    - **3D Tracking**: MediaPipe Face Mesh integration for precise effect positioning.
- **Conceptual Example (Python + OpenCV + MediaPipe)**:
    ```python
    import cv2
    import mediapipe as mp
    import numpy as np

    class BigoBeautyAR:
        def __init__(self):
            # Initialize MediaPipe Face Mesh
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            
            # Beauty Settings (Adjustable)
            self.smooth_strength = 9  # Higher = smoother skin
            self.brightness_boost = 15 # Higher = brighter face
            self.sharpen_strength = 0.8 # Keeps eyes/mouth sharp

        def apply_beauty_mode(self, frame):
            """Applies professional skin smoothing and face brightening."""
            # 1. Skin Smoothing (Bilateral Filter)
            smoothed = cv2.bilateralFilter(frame, d=self.smooth_strength, sigmaColor=75, sigmaSpace=75)
            
            # 2. Brightness & Glow
            brightened = cv2.convertScaleAbs(smoothed, alpha=1.1, beta=self.brightness_boost)
            
            # 3. Sharpening the Details
            final_frame = cv2.addWeighted(brightened, self.sharpen_strength, frame, 1 - self.sharpen_strength, 0)
            
            return final_frame

        def track_face(self, frame):
            """Tracks the face to ensure effects are applied correctly in 3D."""
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)
            
            if not results.multi_face_landmarks:
                return frame, None

            return frame, results.multi_face_landmarks[0]
    ```

### 11. Bigo-Style AR Filter Tool
- **Concept**: Advanced 3D face mapping and template capture for AR effects.
- **Key Features**:
    - **Face Template Capture**: Capturing a "base" frame to use for texture mapping.
    - **3D Mesh Tracking**: Real-time visualization of the 468-point face mesh (Tessellation).
    - **Contour Tracking**: Precise tracking of eyes, lips, and face shape.
    - **Dynamic Mapping**: Aligning virtual effects with head movement (rotation/pose).
- **Conceptual Example (Python + OpenCV + MediaPipe)**:
    ```python
    import cv2
    import mediapipe as mp
    import numpy as np

    class BigoStyleAR:
        def __init__(self):
            # Initialize MediaPipe Face Mesh
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            self.mp_drawing = mp.solutions.drawing_utils
            
            # Placeholder for the "template" mask
            self.mask_texture = None
            self.mask_landmarks = None

        def capture_template(self, frame):
            """Captures the current frame as the 'base' for face mapping."""
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)
            
            if results.multi_face_landmarks:
                self.mask_texture = frame.copy()
                self.mask_landmarks = results.multi_face_landmarks[0]
                return True
            return False

        def apply_filter(self, frame):
            """Maps the captured template or a generic effect onto the live face."""
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)
            
            if not results.multi_face_landmarks:
                return frame

            for face_landmarks in results.multi_face_landmarks:
                # 1. Draw the 3D Tesselation
                self.mp_drawing.draw_landmarks(
                    image=frame,
                    landmark_list=face_landmarks,
                    connections=self.mp_face_mesh.FACEMESH_TESSELATION,
                    landmark_drawing_spec=None,
                    connection_drawing_spec=mp.solutions.drawing_styles.get_default_face_mesh_tesselation_style()
                )
                
                # 2. Draw the Contours
                self.mp_drawing.draw_landmarks(
                    image=frame,
                    landmark_list=face_landmarks,
                    connections=self.mp_face_mesh.FACEMESH_CONTOURS,
                    landmark_drawing_spec=None,
                    connection_drawing_spec=mp.solutions.drawing_styles.get_default_face_mesh_contours_style()
                )
            return frame
    ```

## 12. Pinning PNG Masks to Facial Landmarks: A Guide
- **Concept**: Using MediaPipe 3D facial landmarks as "anchors" to pin transparent PNG masks (Crowns, Glasses, Mustaches) to specific facial features.
- **Key Principles**:
    - **Landmarks as Anchors**: Each of the 468 landmarks has X, Y, and Z coordinates.
    - **Anchor Examples**: Forehead for crowns, nose bridge for glasses, upper lip for mustaches.
- **Conceptual Steps**:
    1. **Design Your Mask**: Create a transparent PNG image.
    2. **Identify Anchor Landmarks**: Select specific landmark indices (e.g., forehead, nose bridge).
    3. **Calculate Position and Scale**: Use real-time 3D coordinates to determine center position and scale.
    4. **Handle Rotation**: Use MediaPipe's 3D Face Transform module for face pose (rotation matrix).
    5. **Overlay the PNG**: Use OpenCV or a graphics library to overlay the resized/rotated PNG onto the frame.
- **Conceptual Example (Python + OpenCV + MediaPipe)**:
    ```python
    import cv2
    import mediapipe as mp
    import numpy as np

    class MaskPinner:
        def __init__(self, mask_path):
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            
            # Load the transparent PNG mask
            self.mask_image = cv2.imread(mask_path, cv2.IMREAD_UNCHANGED)
            if self.mask_image is None:
                raise FileNotFoundError(f"Mask image not found at {mask_path}")
            if self.mask_image.shape[2] != 4: # Ensure it has an alpha channel
                raise ValueError("Mask image must be a transparent PNG with 4 channels (RGBA)")

        def overlay_transparent_image(self, background, overlay, x, y, scale=1.0):
            # Resize overlay if scale is not 1.0
            overlay_resized = cv2.resize(overlay, (int(overlay.shape[1] * scale), int(overlay.shape[0] * scale)))

            h, w, _ = background.shape
            h_ov, w_ov, _ = overlay_resized.shape

            # Calculate position, ensuring it stays within frame
            x = max(0, min(x, w - w_ov))
            y = max(0, min(y, h - h_ov))

            # Get alpha channel and inverse alpha
            alpha_channel = overlay_resized[:, :, 3] / 255.0
            inverse_alpha = 1.0 - alpha_channel

            # Apply overlay
            for c in range(0, 3):
                background[y:y+h_ov, x:x+w_ov, c] = (
                    background[y:y+h_ov, x:x+w_ov, c] * inverse_alpha + 
                    overlay_resized[:, :, c] * alpha_channel
                )
            return background

        def apply_mask_to_frame(self, frame):
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)

            if not results.multi_face_landmarks:
                return frame

            for face_landmarks in results.multi_face_landmarks:
                # Convert normalized landmarks to pixel coordinates
                h, w, _ = frame.shape
                landmark_points = []
                for landmark in face_landmarks.landmark:
                    landmark_points.append((int(landmark.x * w), int(landmark.y * h)))

                # Find approximate face center and width
                x_coords = [p[0] for p in landmark_points]
                y_coords = [p[1] for p in landmark_points]
                
                face_center_x = int(np.mean(x_coords))
                face_center_y = int(np.mean(y_coords))
                face_width = max(x_coords) - min(x_coords)

                # Adjust mask position and scale
                mask_scale = face_width / self.mask_image.shape[1] * 1.2
                mask_x = face_center_x - int(self.mask_image.shape[1] * mask_scale / 2)
                mask_y = min(y_coords) - int(self.mask_image.shape[0] * mask_scale / 2)

                frame = self.overlay_transparent_image(frame, self.mask_image, mask_x, mask_y, scale=mask_scale)

            return frame
    ```
- **Key Takeaways**:
    - **Transparent PNGs are essential**: They allow the background (the face) to show through.
    - **Landmarks are your guides**: MediaPipe provides the coordinates for key facial features.
    - **Calculations for placement**: Logic is needed to calculate X, Y position, scale, and rotation based on landmarks.
    - **Blending Utility**: An `overlay_transparent_image` function is used to correctly blend the background and the transparent PNG using alpha channels.
    - **Refinement**: Each specific mask (crown, glasses, etc.) requires tuned calculations for perfect tracking and placement.

## 13. Virtual Background Filter (Bigo-Style)
- **Concept**: Real-time background removal and replacement using MediaPipe Selfie Segmentation.
- **Key Features**:
    - **Selfie Segmentation**: High-performance person-to-background separation.
    - **Custom Backgrounds**: Support for loading and resizing custom images as backgrounds.
    - **Blurred Backgrounds**: Option to blur the original background for a professional look.
    - **Solid Color Backgrounds**: Fallback to solid colors (e.g., gray) for clean isolation.
- **Conceptual Example (Python + OpenCV + MediaPipe)**:
    ```python
    import cv2
    import mediapipe as mp
    import numpy as np

    class VirtualBackground:
        def __init__(self):
            self.mp_selfie_segmentation = mp.solutions.selfie_segmentation
            self.selfie_segmentation = self.mp_selfie_segmentation.SelfieSegmentation(model_selection=1)

            # Default background color
            self.bg_color = (192, 192, 192)
            self.background_image = None

        def set_background_image(self, image_path):
            """Loads a custom image to be used as the virtual background."""
            self.background_image = cv2.imread(image_path)

        def apply_virtual_background(self, frame):
            """Applies real-time background removal and replacement."""
            image = cv2.cvtColor(cv2.flip(frame, 1), cv2.COLOR_BGR2RGB)
            results = self.selfie_segmentation.process(image)
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            if results.segmentation_mask is None:
                return frame

            condition = np.stack((results.segmentation_mask,) * 3, axis=-1) > 0.1

            if self.background_image is not None:
                bg_to_use = cv2.resize(self.background_image, (image.shape[1], image.shape[0]))
            else:
                bg_to_use = np.zeros(image.shape, dtype=np.uint8)
                bg_to_use[:] = self.bg_color

            output_image = np.where(condition, image, bg_to_use)
            return output_image
    ```

## 14. Budget-Friendly Virtual Background Architecture
- **Concept**: High-quality, cost-effective real-time background replacement using Semantic Segmentation.
- **Core Principle**: Pixel-level classification to separate "person" (foreground) from "background" via an AI-generated segmentation mask.
- **Proposed Stack**: MediaPipe Selfie Segmentation (Open-Source, Mobile-optimized).
- **Architecture Components**:
    - **Video Input**: Live device camera feed.
    - **MediaPipe Model**: Pre-trained model producing a grayscale segmentation mask.
    - **Mask Refinement**: Optional joint bilateral filtering for better edge quality (e.g., hair).
    - **Background Source**: Static images, video loops, blurred original feed, or solid colors.
    - **Compositing Engine**: Blending logic using the mask to determine pixel source (Foreground vs. Background).
- **Step-by-Step Workflow**:
    1. **Capture**: Grab frame from camera.
    2. **Process**: Feed frame to MediaPipe.
    3. **Masking**: Generate person-outline mask.
    4. **Preparation**: Load or generate the replacement background.
    5. **Blending**: Combine person pixels with background pixels based on the mask.
    6. **Streaming**: Output the composite frame to the live stream.
- **Advantages**: No licensing costs (Open-Source), optimized for consumer hardware, high creative flexibility.
- **Technical Considerations**: Device-dependent performance, edge refinement challenges, and asset management requirements.

## 15. Fan Club Logic
- **Concept**: A social bonding system between streamers and supporters based on "Intimacy Points."
- **Key Features**:
    - **Intimacy Points**: Earned through gifting (10 pts/diamond), watching (5 pts/min), and daily check-ins (100 pts).
    - **Progression System**: Leveling up from 1 to 100+ based on total points.
    - **Tiered Rewards**: Badge colors and perks (Chat Highlight, Priority Queue, Exclusive Emotes) that unlock at specific levels (10, 30, 60, 90).
    - **Daily Check-in**: A retention mechanic allowing users to claim a daily bonus.
    - **Badge System**: Dynamic badges that display the user's fan level and tier color.
- **Conceptual Example (TypeScript)**:
    ```typescript
    export interface FanClubMember {
      uid: string;
      hostUid: string;
      level: number;
      intimacyPoints: number;
      lastCheckIn: number;
      isSuperFan: boolean;
    }

    export const calculateIntimacyPoints = (type: 'gifting' | 'watching' | 'checkin', value: number = 0): number => {
      switch (type) {
        case 'gifting': return value * 10;
        case 'watching': return Math.floor(value / 60) * 5;
        case 'checkin': return 100;
        default: return 0;
      }
    };

    export const getLevelFromPoints = (points: number): number => {
      return Math.floor(Math.sqrt(points / 50)) + 1;
    };

    export const getBadgeStyle = (level: number): { color: string; label: string } => {
      const tier = [...FAN_CLUB_LEVELS].reverse().find(l => level >= l.level) || FAN_CLUB_LEVELS[0];
      return { color: tier.badgeColor, label: `FAN ${level}` };
    };
    ```

## 16. Noble Expiration Logic
- **Concept**: Manages the 30-day Noble subscription cycle, including expiration tracking and renewal reminders.
- **Key Features**:
    - **Expiration Tracking**: Calculates days remaining based on a 30-day (2,592,000,000 ms) cycle.
    - **Renewal Reminders**: Automated triggers for 7-day, 3-day, and 1-day warnings.
    - **Renewal Discounts**: 10% discount for users who renew before their current status expires.
    - **Dynamic Messaging**: Context-aware messages based on the remaining time and Noble tier.
- **Conceptual Example (TypeScript)**:
    ```typescript
    export interface ExpirationStatus {
      isExpired: boolean;
      daysRemaining: number;
      shouldRemind: boolean;
      reminderType: '7d' | '3d' | '1d' | 'none';
    }

    export const calculateExpirationStatus = (user: UserProfile): ExpirationStatus => {
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      const timeElapsed = Date.now() - new Date(user.lastNoblePurchaseDate).getTime();
      const daysRemaining = Math.ceil((thirtyDaysInMs - timeElapsed) / (24 * 60 * 60 * 1000));

      return {
        isExpired: daysRemaining <= 0,
        daysRemaining: Math.max(0, daysRemaining),
        shouldRemind: [7, 3, 1].includes(daysRemaining),
        reminderType: daysRemaining === 7 ? '7d' : daysRemaining === 3 ? '3d' : daysRemaining === 1 ? '1d' : 'none'
      };
    };

    export const getNextRenewalCost = (baseCost: number, isActive: boolean): number => {
      return isActive ? Math.floor(baseCost * 0.9) : baseCost;
    };
    ```

## 17. Family Logic
- **Concept**: Manages in-app communities where streamers and viewers pool resources for collective benefits.
- **Key Features**:
    - **Shared Points Pool**: Members earn points for the family through gifting and watching.
    - **Family Multipliers**: 1.2x multiplier for points contributed to the family pool, boosted to 1.5x during PK battles.
    - **Family PK Bonus**: Up to 20% score boost (2% per member) when multiple family members are present in the same PK room.
    - **Progression System**: Family levels scale based on total pooled points.
    - **Role Management**: Tiered roles (Leader, Elder, Member) with specific contribution tracking.
- **Conceptual Example (TypeScript)**:
    ```typescript
    export interface Family {
      id: string;
      name: string;
      ownerUid: string;
      level: number;
      totalPoints: number;
    }

    export const calculateFamilyPoints = (basePoints: number, isPK: boolean): number => {
      const multiplier = isPK ? 1.5 : 1.2;
      return Math.floor(basePoints * multiplier);
    };

    export const getFamilyPKBonus = (memberCountInRoom: number): number => {
      const boost = Math.min(memberCountInRoom * 0.02, 0.20);
      return 1 + boost;
    };
    ```

## 18. Agency Logic
- **Concept**: Management layer for hosts and agencies, focusing on recruitment, performance-based tiers, and earnings distribution.
- **Key Features**:
    - **Agency Tiers (1-5)**: Progression based on host count and monthly earnings (Beans).
    - **Commission Rates**: Tiered earnings for agencies ranging from 10% to 20%.
    - **Host Salary Calculation**: Automated logic to calculate net earnings after platform fees (50%) and agency commissions.
    - **Performance Tracking**: Logic to determine tier upgrades based on monthly metrics.
    - **Recruitment Eligibility**: Checks to ensure only independent hosts can apply to agencies.
- **Conceptual Example (TypeScript)**:
    ```typescript
    export type AgencyTier = 1 | 2 | 3 | 4 | 5;

    export const calculateAgencyCommission = (beansEarned: number, agency: Agency): number => {
      const tierConfig = AGENCY_TIERS[agency.tier as AgencyTier] || AGENCY_TIERS[1];
      return Math.floor(beansEarned * tierConfig.commissionRate);
    };

    export const calculateHostSalary = (beansEarned: number, agency?: Agency): number => {
      const platformFee = 0.50;
      const netAfterPlatform = beansEarned * (1 - platformFee);
      if (!agency) return Math.floor(netAfterPlatform);
      const tierConfig = AGENCY_TIERS[agency.tier as AgencyTier] || AGENCY_TIERS[1];
      return Math.floor(netAfterPlatform * (1 - tierConfig.commissionRate));
    };
    ```

## 19. AI Live Assistant Logic
- **Concept**: An intelligent engine that monitors stream performance metrics and provides real-time, actionable advice to the host.
- **Key Features**:
    - **Performance Analysis**: Monitors chat velocity, gift frequency, lighting quality, and framing.
    - **Prioritized Suggestions**: Generates advice (High/Medium/Low priority) based on metric thresholds.
    - **Visual Quality Checks**: Detects dim lighting or poor framing using simulated video analysis scores.
    - **Engagement Boosters**: Suggests conversation topics when chat activity is low.
    - **Gifting Strategies**: Identifies opportunities to mention gift goals based on high chat activity but low gifting.
- **Conceptual Example (TypeScript)**:
    ```typescript
    export interface StreamMetric {
      chatVelocity: number;
      giftFrequency: number;
      lightingScore: number;
      framingScore: number;
    }

    export const analyzeStreamPerformance = (metrics: StreamMetric): AISuggestion[] => {
      const suggestions: AISuggestion[] = [];
      if (metrics.chatVelocity < 5) {
        suggestions.push({ type: 'topic', title: 'LOW CHAT ACTIVITY', priority: 'high', ... });
      }
      if (metrics.lightingScore < 40) {
        suggestions.push({ type: 'lighting', title: 'DIM LIGHTING', priority: 'medium', ... });
      }
      return suggestions.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);
    };
    ```

## 20. Nearby Discovery Logic
- **Concept**: A geolocation utility to filter and rank live streams based on their physical proximity to the user.
- **Key Features**:
    - **Haversine Distance Calculation**: Precise distance calculation between two coordinates in kilometers.
    - **Proximity Filtering**: Ability to filter streams within a specific radius (e.g., 50km).
    - **Distance Ranking**: Sorting streams from closest to farthest.
    - **User-Friendly Formatting**: Converting raw distances into readable strings (e.g., "500m away", "12.5km away").
- **Conceptual Example (TypeScript)**:
    ```typescript
    export interface Location {
      latitude: number;
      longitude: number;
    }

    export const calculateDistance = (loc1: Location, loc2: Location): number => {
      const R = 6371; // Earth radius in km
      const dLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
      const dLon = (loc2.longitude - loc1.longitude) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(loc1.latitude * (Math.PI / 180)) * Math.cos(loc2.latitude * (Math.PI / 180)) * 
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };

    export const getNearbyStreams = (userLoc: Location, streams: StreamLocation[], maxRadius: number = 50) => {
      return streams
        .map(s => ({ ...s, distance: calculateDistance(userLoc, s) }))
        .filter(s => s.distance <= maxRadius)
        .sort((a, b) => a.distance - b.distance);
    };
    ```

## 21. Virtual Avatar Logic
- **Concept**: A system to manage 2D/3D avatar states for anonymous streaming, allowing hosts to replace their real camera feed with a virtual character.
- **Key Features**:
    - **Avatar State Management**: Tracking active status, model URLs, and current expressions.
    - **Expression Control**: Dynamic switching between 'neutral', 'happy', 'surprised', and 'talking' states.
    - **Energy-Based Animation**: Adjusting animation speed based on streamer energy levels (e.g., chat velocity or volume).
    - **Visibility Toggling**: Seamless switching between real camera and virtual avatar.
    - **Tiered Avatar Models**: Providing premium models based on the user's level (Basic, Pro, Legendary).
- **Conceptual Example (TypeScript)**:
    ```typescript
    export type AvatarType = '2D' | '3D' | 'Emoji';

    export interface AvatarState {
      id: string;
      type: AvatarType;
      isActive: boolean;
      modelUrl: string;
      expression: 'neutral' | 'happy' | 'surprised' | 'talking';
    }

    export const getAvatarAnimationSpeed = (energyLevel: number): number => {
      return 0.5 + (energyLevel / 100);
    };

    export const getAvatarModelByLevel = (userLevel: number): string => {
      if (userLevel >= 90) return '/models/legendary_avatar.glb';
      if (userLevel >= 50) return '/models/pro_avatar.glb';
      return '/models/basic_avatar.glb';
    };
    ```

## 22. Mini-Game Logic
- **Concept**: A modular framework for interactive games between streamers and viewers (e.g., Tap Battle, Voting, Truth or Dare).
- **Key Features**:
    - **Game State Management**: Tracking game type, status (waiting, active, finished), and timing.
    - **Real-Time Scoring**: Updating participant scores dynamically during active gameplay.
    - **Live Leaderboard**: Sorting and displaying top participants by score.
    - **Winner Determination**: Logic to identify the winner and calculate total points once the game ends.
    - **Modular Config**: Support for custom game goals and rewards (e.g., Beans).
- **Conceptual Example (TypeScript)**:
    ```typescript
    export type GameType = 'TapBattle' | 'Voting' | 'TruthOrDare';
    export type GameStatus = 'waiting' | 'active' | 'finished';

    export interface MiniGame {
      id: string;
      type: GameType;
      status: GameStatus;
      scores: Record<string, number>;
    }

    export const updateGameScore = (game: MiniGame, uid: string, points: number): MiniGame => {
      if (game.status !== 'active') return game;
      const currentScore = game.scores[uid] || 0;
      return {
        ...game,
        scores: { ...game.scores, [uid]: currentScore + points }
      };
    };

    export const getGameLeaderboard = (game: MiniGame, limit: number = 5) => {
      return Object.entries(game.scores)
        .map(([uid, score]) => ({ uid, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    };
    ```

## 23. Short Video Logic
- **Concept**: Logic for TikTok-style vertical feed engagement, ranking, and discovery.
- **Key Features**:
    - **Engagement Scoring**: Weighted calculation (Likes=1, Comments=2, Shares=5) divided by views to determine video quality.
    - **Recommended Feed**: Personalized sorting of videos based on engagement scores.
    - **View Count Formatting**: User-friendly display (e.g., "1.2K", "3.5M").
    - **Interaction Logic**: Simple state management for liking/unliking videos.
- **Conceptual Example (TypeScript)**:
    ```typescript
    export interface ShortVideo {
      id: string;
      likes: number;
      comments: number;
      shares: number;
      views: number;
    }

    export const calculateEngagementScore = (video: ShortVideo): number => {
      if (video.views === 0) return 0;
      const totalEngagement = (video.likes * 1) + (video.comments * 2) + (video.shares * 5);
      return totalEngagement / video.views;
    };

    export const formatViewCount = (count: number): string => {
      if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
      if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
      return count.toString();
    };
    ```

## 24. Media Player & Professional Audio Mixer
- **Concept**: A pro-level streamer tool for playing media files (music/videos) while mixing live microphone audio without echo or distortion.
- **Architecture**:
    - **Input**: Local file/URL source.
    - **UI**: 25% width, 16:9 ratio, top-right absolute positioning (TikTok/Bigo style).
    - **Mixing Engine**: `AudioContext` based extraction and merging of 🎵 Music + 🎤 Voice.
    - **Output**: Unified `MediaStream` for WebRTC/Firebase delivery.
- **Key Logic (React + Web Audio API)**:
    ```typescript
    import React, { useRef, useState, useEffect } from "react";

    export default function MediaPlayerMixer() {
      const videoRef = useRef(null);
      const [file, setFile] = useState(null);
      const [audioContext, setAudioContext] = useState(null);

      useEffect(() => {
        if (file) {
          setupAudioMixer();
        }
      }, [file]);

      const setupAudioMixer = async () => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const video = videoRef.current;

        // Source 1: Video Audio
        const source = ctx.createMediaElementSource(video);

        // Source 2: Microphone
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const micSource = ctx.createMediaStreamSource(micStream);

        // Control: Gain nodes
        const videoGain = ctx.createGain();
        const micGain = ctx.createGain();
        videoGain.gain.value = 0.7; // Music
        micGain.gain.value = 1.0;   // Voice

        // Destination: Final mixed stream
        const destination = ctx.createMediaStreamDestination();

        // Connection
        source.connect(videoGain).connect(destination);
        micSource.connect(micGain).connect(destination);

        // Listen: Local monitoring
        source.connect(ctx.destination);
        micSource.connect(ctx.destination);

        setAudioContext({ ctx, outputStream: destination.stream });
      };

      return (
        <div style={{ position: "relative" }}>
          <input type="file" accept="video/*,audio/*" onChange={(e) => setFile(URL.createObjectURL(e.target.files[0]))} />
          {file && (
            <video
              ref={videoRef}
              src={file}
              controls
              autoPlay
              style={{
                position: "absolute", top: 10, right: 10, width: "25%", 
                maxWidth: "220px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.5)"
              }}
            />
          )}
        </div>
      );
    }
    ```
- **Next Integration Step**: Wire `audioContext.outputStream` to WebRTC `peerConnection.addTrack()`.

## 25. Multi-Guest Seat & Role System (Foundation)
- **Concept**: The foundational logic controlling the hierarchy and placement of users in a live room (Host, Guest, Viewer). This system governs audio permissions, gift targeting, and PK eligibility.
- **Architecture**:
    - **Hierarchy**: Host (Controller) > Guest (Active Participant) > Viewer (Audience).
    - **UI Mirror**: Direct mapping between data seats and the visual tile grid.
    - **Interaction**: Single-tap requests for viewers; full management (assign/remove) for hosts.
- **Core Data Structure**:
    ```typescript
    const initialRoomState = {
      hostId: "user_1",
      seats: [
        { seatId: 1, user: { id: "user_1", name: "Host" } },
        { seatId: 2, user: null },
        { seatId: 3, user: null },
        { seatId: 4, user: null }
      ],
      users: {
        "user_1": { role: "host", name: "Host" }
      }
    };
    ```
- **React Implementation (Stateful Logic)**:
    ```typescript
    import React, { useState } from "react";

    export default function SeatSystem({ currentUserId }) {
      const [room, setRoom] = useState({
        hostId: "user_1",
        seats: [
          { seatId: 1, user: { id: "user_1", name: "Host" } },
          { seatId: 2, user: null },
          { seatId: 3, user: null },
          { seatId: 4, user: null }
        ]
      });

      const isHost = currentUserId === room.hostId;

      const requestSeat = (seatId) => {
        // Integration Point: Connect to backend request queue
        alert("Request sent to host");
      };

      const assignSeat = (seatId, user) => {
        if (!isHost) return;
        setRoom((prev) => ({
          ...prev,
          seats: prev.seats.map((s) => s.seatId === seatId ? { ...s, user } : s)
        }));
      };

      const removeUserFromSeat = (seatId) => {
        if (!isHost) return;
        setRoom((prev) => ({
          ...prev,
          seats: prev.seats.map((s) => s.seatId === seatId ? { ...s, user: null } : s)
        }));
      };

      return (
        <div className="grid grid-cols-2 gap-2 p-2">
          {room.seats.map((seat) => (
            <div
              key={seat.seatId}
              className="h-32 bg-gray-800 text-white flex flex-col items-center justify-center rounded-xl cursor-pointer"
              onClick={() => {
                if (!seat.user) requestSeat(seat.seatId);
                else if (isHost) removeUserFromSeat(seat.seatId);
              }}
            >
              {seat.user ? (
                <div className="text-center">
                  <p className="font-bold">{seat.user.name}</p>
                  {isHost && <span className="text-[10px] text-red-400">Tap to remove</span>}
                </div>
              ) : (
                <p className="text-gray-500">Empty Seat</p>
              )}
            </div>
          ))}
        </div>
      );
    }
    ```
- **System Extensions**: Planned integration for Invite System, Seat Locking, Seat Swapping, and "Raise Hand" mechanics.

## 26. Audio Detection & Speaker Visualizer
- **Concept**: A real-time engagement system that identifies active speakers by analyzing audio stream volume and animating the visual UI. This provides focus in multi-guest rooms and makes the interface feel "alive."
- **Architecture**:
    - **Logic**: Audio Stream -> Web Audio API `AudioContext` -> Volume Threshold Analysis -> State Update.
    - **UI**: A dynamic, pulsing ring component (`AudioRing`) that sits behind or around the user's avatar.
    - **Feedback Thresholds**: Silent (<20), Speaking (20-60), High Energy/Music (>60).
- **Key Logic (React Hooks + Web Audio API)**:
    ```typescript
    import { useEffect, useState } from "react";

    export function useAudioLevel(stream: MediaStream | null) {
      const [level, setLevel] = useState(0);

      useEffect(() => {
        if (!stream) return;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        source.connect(analyser);
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          setLevel(sum / dataArray.length);
          requestAnimationFrame(update);
        };

        update();
        return () => audioContext.close();
      }, [stream]);

      return level;
    }

    // Visual Component
    export function AudioRing({ level }: { level: number }) {
      const scale = 1 + level / 200;
      return (
        <div
          className="absolute inset-0 rounded-full border-2 border-cyan-400 transition-transform duration-100 ease-linear"
          style={{
            transform: `scale(${scale})`,
            opacity: level > 20 ? 1 : 0.3,
          }}
        />
      );
    }
    ```
- **UI Integration**: Injected into `SeatTile` components to wrap avatars for Host and Guests.

## 27. PK System (Battle Mode)
- **Concept**: The core monetization and engagement engine where two streamers compete in a timed battle. Success is determined by viewer gifts (points), creating a direct link between competition and revenue.
- **Architecture**:
    - **Logic**: 60-second Countdown Timer -> Gift Listener (Point Accumulation) -> Winner Determination.
    - **UI**: A top-level overlay that splits the screen between Player A and Player B, displaying name, score, and a central timer.
    - **Gifting Bridge**: All incoming gifts are intercepted and added to the respective player's score via `addScore(target, value)`.
- **Core State**:
    ```typescript
    const initialPK = {
      active: false,
      playerA: null,
      playerB: null,
      scoreA: 0,
      scoreB: 0,
      timeLeft: 60
    };
    ```
- **React Implementation (Battle Logic & UI)**:
    ```typescript
    import React, { useState, useEffect } from "react";

    export default function PKSystem({ currentUser, guests }) {
      const [pk, setPK] = useState({
        active: false,
        playerA: null,
        playerB: null,
        scoreA: 0,
        scoreB: 0,
        timeLeft: 60
      });

      const startPK = (opponent) => {
        setPK({
          active: true,
          playerA: currentUser,
          playerB: opponent,
          scoreA: 0,
          scoreB: 0,
          timeLeft: 60
        });
      };

      useEffect(() => {
        if (!pk.active) return;
        const interval = setInterval(() => {
          setPK((prev) => {
            if (prev.timeLeft <= 1) {
              clearInterval(interval);
              return { ...prev, active: false };
            }
            return { ...prev, timeLeft: prev.timeLeft - 1 };
          });
        }, 1000);
        return () => clearInterval(interval);
      }, [pk.active]);

      const addScore = (player, amount) => {
        setPK((prev) => ({
          ...prev,
          scoreA: player.id === prev.playerA?.id ? prev.scoreA + amount : prev.scoreA,
          scoreB: player.id === prev.playerB?.id ? prev.scoreB + amount : prev.scoreB
        }));
      };

      return (
        <div className="relative">
          {!pk.active && (
            <button className="bg-red-600 text-white px-4 py-2 rounded-full" onClick={() => startPK(guests[0])}>
              ⚔️ Start PK
            </button>
          )}

          {pk.active && (
            <div className="flex justify-between items-center bg-black/60 p-4 rounded-b-2xl">
              <div className="text-center text-white">
                <p className="text-xs uppercase opacity-80">{pk.playerA?.name}</p>
                <p className="text-2xl font-black">{pk.scoreA}</p>
              </div>

              <div className="text-center">
                <p className="text-amber-400 font-black text-xl">{pk.timeLeft}s</p>
                <p className="text-white/40 text-[10px]">VS</p>
              </div>

              <div className="text-center text-white">
                <p className="text-xs uppercase opacity-80">{pk.playerB?.name}</p>
                <p className="text-2xl font-black">{pk.scoreB}</p>
              </div>
            </div>
          )}
        </div>
      );
    }
    ```
- **Planned Extensions**: Leaderboard Panel (Top Gifters), Winner Animations, and Rematch systems.

## 28. PK Leaderboard / Ranking Panel
- **Concept**: A real-time competitive ranking system that tracks and displays the top contributors (gifters) during a PK battle. This fuels competition between viewers and maximizes monetization.
- **Architecture**:
    - **Data Logic**: Map of User IDs to cumulative gift scores, sorted in descending order.
    - **UI**: A floating, toggleable overlay panel launched via a "🏆 Ranking" button near the active PK display.
    - **Integration**: Every gift event triggers an update to the leaderboard state.
- **Key Logic (React Implementation)**:
    ```typescript
    import React, { useState } from "react";

    export default function PKLeaderboard() {
      const [open, setOpen] = useState(false);
      const [leaders, setLeaders] = useState<{ userId: string; name: string; score: number }[]>([]);

      // Update Logic (Triggered by sendGift)
      const updateLeaderboard = (user: { id: string; name: string }, amount: number) => {
        setLeaders((prev) => {
          const existing = prev.find((u) => u.userId === user.id);
          let newList;
          if (existing) {
            newList = prev.map((u) => u.userId === user.id ? { ...u, score: u.score + amount } : u);
          } else {
            newList = [...prev, { userId: user.id, name: user.name, score: amount }];
          }
          return newList.sort((a, b) => b.score - a.score);
        });
      };

      return (
        <div className="relative">
          <button className="bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold" onClick={() => setOpen(!open)}>
            🏆 Ranking
          </button>

          {open && (
            <div className="absolute top-10 right-0 w-48 bg-black/80 backdrop-blur-md rounded-xl p-3 border border-white/10 z-50">
              <h3 className="text-white text-sm font-bold mb-2 border-b border-white/10 pb-1">Top Gifters</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {leaders.map((user, index) => (
                  <div key={user.userId} className="flex justify-between text-[11px] text-white">
                    <span className="opacity-50">{index + 1}. {user.name}</span>
                    <span className="text-amber-400 font-mono font-bold">{user.score}</span>
                  </div>
                ))}
                {leaders.length === 0 && <p className="text-[10px] text-white/30 text-center py-2">No contributors yet</p>}
              </div>
            </div>
          )}
        </div>
      );
    }
    ```
- **System Synchronization**:
    ```javascript
    const sendGift = (sender, receiver, gift) => {
       addScore(receiver, gift.value);       // Increases PK Battle Score
       updateLeaderboard(sender, gift.value); // Updates Gifter Ranking
    }
    ```

## 29. Watch + React Sync System
- **Concept**: A real-time synchronization engine ensuring all users in a live room see and hear the same media content exactly at the same time. This is critical for group reactions, dance sessions, and shared music experiences.
- **Architecture**:
    - **Master-Slave Pattern**: The Host (controller) emits playback events; all other clients (viewers) listen and synchronize their local players.
    - **Logic**: React hook (`useSyncPlayer`) managing socket listeners for `play`, `pause`, and `seek` events.
    - **Security**: Strict role-checking ensuring only the designated Host can emit control events to the room.
- **Key Logic (React Hook & Component)**:
    ```typescript
    import { useEffect } from "react";

    // Sync Engine Hook
    export function useSyncPlayer(videoRef: React.RefObject<HTMLVideoElement>, socket: any, isHost: boolean) {
      useEffect(() => {
        if (!socket) return;

        socket.on("video_play", () => videoRef.current?.play());
        socket.on("video_pause", () => videoRef.current?.pause());
        socket.on("video_seek", (time: number) => {
          if (videoRef.current) videoRef.current.currentTime = time;
        });
      }, [socket]);

      return {
        play: () => isHost && socket.emit("video_play"),
        pause: () => isHost && socket.emit("video_pause"),
        seek: (time: number) => isHost && socket.emit("video_seek", time),
      };
    }

    // Synced UI component
    export default function SyncedPlayer({ isHost, src, socket }: any) {
      const videoRef = React.useRef<HTMLVideoElement>(null);
      const { play, pause, seek } = useSyncPlayer(videoRef, socket, isHost);

      return (
        <div className="absolute top-4 right-4 z-50">
          <video ref={videoRef} src={src} className="w-[200px] rounded-lg shadow-2xl" />
          {isHost && (
            <div className="flex gap-2 mt-2 justify-center bg-black/40 p-1 rounded-md">
              <button onClick={play} className="text-white hover:text-cyan-400">▶</button>
              <button onClick={pause} className="text-white hover:text-cyan-400">⏸</button>
              <button onClick={() => videoRef.current && seek(videoRef.current.currentTime + 5)} className="text-white hover:text-cyan-400">⏩</button>
            </div>
          )}
        </div>
      );
    }
    ```
- **Sync Accuracy Enhancement**: Planned integration of periodic "Time Correction" pings to adjust local `currentTime` based on server-synced master timestamps.

## 30. Dance + Rating System
- **Concept**: A real-time engagement engine that allows viewers to rate the streamer's performance (dance, singing, or reactions). This creates a live feedback loop and fuels competition, especially during PK battles.
- **Architecture**:
    - **Logic**: Real-time Socket Events (`send_rating` -> `update_rating`) syncing average scores across all clients.
    - **UI**: A floating bottom-right star-rating component with a live average counter.
    - **Feedback loop**: High ratings (4+ stars) can trigger visual "Glow" effects and pop animations on the streamer's profile.
- **Key Logic (React Implementation)**:
    ```typescript
    import React, { useState } from "react";

    export default function RatingSystem({ targetUserId, socket }: { targetUserId: string, socket: any }) {
      const [rating, setRating] = useState(0);
      const [stats, setStats] = useState({ total: 0, count: 0, average: "0.0" });

      const sendRating = (value: number) => {
        setRating(value);
        socket.emit("send_rating", { userId: targetUserId, value });
      };

      // Listener for real-time updates
      socket.on("update_rating", (data: { userId: string, value: number }) => {
        if (data.userId !== targetUserId) return;
        setStats((prev) => {
          const total = prev.total + data.value;
          const count = prev.count + 1;
          return { total, count, average: (total / count).toFixed(1) };
        });
      });

      return (
        <div className="absolute bottom-24 right-4 text-center">
          <div className="flex gap-1 mb-1 bg-black/40 p-2 rounded-full backdrop-blur-sm">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xl cursor-pointer ${rating >= star ? 'text-amber-400' : 'text-gray-500'}`}
                onClick={() => sendRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-white text-xs font-bold drop-shadow-md">
            Rating: {stats.average} ⭐
          </p>
        </div>
      );
    }
    ```
- **PK Mode Integration**: In battle mode, dual rating systems are deployed, allowing viewers to choose who to support with high scores simultaneously.

## 31. Host Control Panel
- **Concept**: The "Central Command" for room management, granting the Host total authority to maintain order and structure. This includes moderation, guest orchestration, and PK initialization.
- **Architecture**:
    - **Logic**: Strict conditional rendering based on `isHost` status. Actions emit Socket events to the server for distribution.
    - **UI**: A kebab-menu (⋮) located within each guest `SeatTile`, revealing a context-aware action list.
    - **Actions**: Mute (audio kill), Kick (force removal), Swap (positioning), and Invite (audience-to-guest elevation).
- **Key Logic (React & Socket Implementation)**:
    ```typescript
    import React, { useState } from "react";

    export default function HostControls({ user, isHost, socket }: any) {
      const [open, setOpen] = useState(false);
      if (!isHost || !user) return null;

      const actions = [
        { label: "🔇 Mute", event: "mute_user" },
        { label: "❌ Kick", event: "kick_user" },
        { label: "🔄 Swap", event: "swap_seat" },
        { label: "➕ Invite", event: "invite_user" }
      ];

      return (
        <div className="absolute top-2 right-2 z-50">
          <button onClick={() => setOpen(!open)} className="text-white bg-black/40 rounded-full w-6 h-6 flex items-center justify-center">⋮</button>
          {open && (
            <div className="absolute right-0 mt-2 w-32 bg-black border border-white/10 rounded-lg shadow-xl p-1">
              {actions.map(action => (
                <button
                  key={action.event}
                  className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => {
                    socket.emit(action.event, user.id);
                    setOpen(false);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }
    ```
- **Backend Integrations**: Documented event listeners for handling mutes (WebRTC track state), kicks (seat state cleanup), and invites (viewer notification system).

## 32. UI Layering System (Z-Index Control)
- **Concept**: A rigorous architectural layout that manages visual priority and interaction flow across complex live-stream overlays. This prevents "UI Collision" where gifts, chat, or media players overlap and block critical interactions.
- **Architecture (The 7-Layer Stack)**:
    - **Layer 1 (Bottom, Z: 1)**: Primary Video/Camera Stream.
    - **Layer 2 (Z: 2)**: Media Player (Watch/React window).
    - **Layer 3 (Z: 3)**: Multi-guest Seat Tiles.
    - **Layer 4 (Z: 4)**: PK Battle Overlays.
    - **Layer 5 (Z: 5)**: High-Impact Gift Animations (set to `pointer-events: none`).
    - **Layer 6 (Z: 6)**: Interaction Layer (Chat feed, Action buttons, Rating stars).
    - **Layer 7 (Top, Z: 7)**: Popups, Context Menus, and Modal Leaderboards.
- **Key Logic (CSS/React Layout)**:
    ```typescript
    const UI_LAYERS = {
      CONTAINER: "relative w-full h-full overflow-hidden",
      VIDEO: "absolute inset-0 z-[1]",
      MEDIA: "absolute top-4 right-4 z-[2]",
      SEATS: "absolute inset-0 z-[3] flex items-center justify-center pointer-events-none",
      PK: "absolute top-20 left-0 w-full z-[4]",
      GIFTS: "absolute inset-0 z-[5] pointer-events-none",
      INTERACTION: "absolute inset-0 z-[6] flex flex-col justify-end p-4",
      POPUP: "absolute inset-0 z-[7] flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
    };
    ```
- **Critical Interaction Rules**:
    - **Animation Safety**: Layer 5 (Gifts) MUST use `pointer-events: none` to ensure viewers can still click buttons underneath during heavy gifting.
    - **Blocking Modals**: Layer 7 MUST capture all pointer events and provide a backdrop blur for focus.
    - **Media Spacing**: The Media Player is anchored top-right to preserve visibility of the streamer's face (center/top) and seat tiles (center).

## 33. Tile Interaction System
- **Concept**: A specialized interaction layer that makes static seat tiles into functional entry points for social engagement. Tapping a tile triggers a profile-centric popup containing critical social actions (Follow, Gift, Mute, Message).
- **Architecture**:
    - **Event Handling**: Tiles act as click listeners that pass the nested `user` object to a central state manager (`selectedUser`).
    - **UI**: A modal-style overlay (`UserPopup`) that floats above the content (Layer 7 of the UI Stack).
    - **Propagation Control**: Uses `e.stopPropagation()` to prevent clicks on the menu from closing the overlay prematurely.
- **Key Logic (React Implementation)**:
    ```typescript
    import React, { useState } from "react";

    // Sub-component: The Interaction Popup
    function UserPopup({ user, onClose }: { user: any, onClose: () => void }) {
      if (!user) return null;
      return (
        <div 
          className="fixed inset-0 z-[7] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <div 
            className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-[24px] p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4 border-2 border-white/20 overflow-hidden">
               <img src="/avatar_placeholder.png" alt="" />
            </div>
            <h3 className="text-white text-xl font-bold mb-6">{user.name}</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <button className="bg-red-500 text-white py-3 rounded-full font-bold active:scale-95 transition-transform">❤️ Follow</button>
              <button className="bg-amber-400 text-black py-3 rounded-full font-bold active:scale-95 transition-transform">🎁 Send Gift</button>
              <button className="bg-white/10 text-white py-3 rounded-full font-bold hover:bg-white/20 transition-colors">🔇 Mute</button>
            </div>
          </div>
        </div>
      );
    }
    ```
- **UX Flow**:
    - **Viewer**: Taps any tile -> Sees profile + Gifting options.
    - **Host**: Taps guest tile -> Sees profile + Moderation options.
    - **Guest**: Taps other guest -> Sees profile + Interaction options.

---
## 🚀 Planned Features (To Be Added)
### 9. Budget-Friendly AR Integration
- **Concept**: Real-time AR filters and masks using MediaPipe Face Mesh.
- **Components**:
    - **MediaPipe Face Mesh**: 3D landmark detection (468 points) for face geometry.
    - **Custom Texture Mapping**: Projecting user face screenshots onto 3D meshes.
    - **3D Mask Models**: Aligning .obj/.gltf models (animal faces, glasses) with facial landmarks.
- **Workflow**: Real-time rendering via WebGL/OpenGL, handling pose, scale, and rotation.
- **Conceptual Example (Python + OpenCV + MediaPipe)**:
    ```python
    import cv2
    import mediapipe as mp

    # Initialize MediaPipe Face Mesh
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, min_detection_confidence=0.5, min_tracking_confidence=0.5)

    # Load a simple mask image (replace with your custom texture/mask)
    mask_img = cv2.imread('path/to/your/mask.png', cv2.IMREAD_UNCHANGED) # Ensure it has an alpha channel

    def apply_mask(frame, landmarks, mask_image):
        h, w, _ = frame.shape
        if not landmarks:
            return frame

        # Example: Estimate a bounding box for the face based on landmarks
        x_coords = [landmark.x for landmark in landmarks.landmark]
        y_coords = [landmark.y for landmark in landmarks.landmark]

        min_x, max_x = int(min(x_coords) * w), int(max(x_coords) * w)
        min_y, max_y = int(min(y_coords) * h), int(max(y_coords) * h)

        face_width = max_x - min_x
        face_height = max_y - min_y

        if face_width <= 0 or face_height <= 0:
            return frame

        # Resize mask to fit the detected face area
        resized_mask = cv2.resize(mask_image, (face_width, face_height), interpolation=cv2.INTER_AREA)

        # Overlay the mask (assuming mask_image has an alpha channel)
        for c in range(0, 3):
            frame[min_y:max_y, min_x:max_x, c] = \
                frame[min_y:max_y, min_x:max_x, c] * (1 - resized_mask[:, :, 3] / 255.0) + \
                resized_mask[:, :, c] * (resized_mask[:, :, 3] / 255.0)

        return frame

    # Example for a static image:
    image = cv2.imread('path/to/your/face_image.jpg')
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(image_rgb)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            # Drawing landmarks for demonstration
            mp_drawing = mp.solutions.drawing_utils
            mp_drawing_styles = mp.solutions.drawing_styles
            
            mp_drawing.draw_landmarks(
                image=image,
                landmark_list=face_landmarks,
                connections=mp_face_mesh.FACEMESH_TESSELATION,
                landmark_drawing_spec=None,
                connection_drawing_spec=mp_drawing_styles
                .get_default_face_mesh_tesselation_style())
    ```
- **Next Steps for Implementation**:
    1. **Platform Selection**: Decide on iOS, Android, or Web (affects MediaPipe and 3D engine choice).
    2. **Deep Dive**: Study MediaPipe Face Mesh and 3D Face Transform modules.
    3. **3D Rendering Integration**: Select a library (SceneKit/ARKit, ARCore/OpenGL, Three.js/WebGL) for rendering textures/masks.
    4. **Asset Creation**: Develop/acquire 3D models compatible with MediaPipe face mesh topology.
