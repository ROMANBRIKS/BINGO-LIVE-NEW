# 🎬 Bingo Live Cinemas: Integration & Streaming Roadmap

This document serves as our architectural blueprint and pending to-do item list for coupling movies, user libraries, and live co-watching rooms.

---

## 🧭 Phase 1: Core Streamer Movie integration Modes
To keep security tight and prevent app-breaking dependencies, we have ruled out direct third-party API token authentications on client devices (saving user keys). Instead, we will support the following two light-footprint options:

### 📦 Option A: Self-Hosted / Direct URL Sourcing (Active Link Casting)
* **Concept**: Streamers or hosts input a direct video resource link (`.mp4`, `.mkv`, `.m3u8` IPTV stream, or WebM URL).
* **How it works**:
  1. The host provides the URL in their room settings interface.
  2. The video is loaded globally to the client players in the room.
  3. Safe-checks sanitize the header requests to ensure secure loading of CORS-compliant streams natively in React.
* **Status**: Highly feasible, no auth key management required.

### 🎥 Option B: Shared Public Domain & Metadata Libraries (Built-in Aggregators)
* **Concept**: Pulling rich metadata arrays (trailers, summaries, posters) from open aggregators (e.g., **The Movie Database - TMDB**) while keeping actual video players aligned with embeddable open sources (e.g., Internet Archive, public IP feeds, trailers).
* **Status**: Planned for layout and design exploration.

---

## 🛠️ Pending To-Do Features (Development Track)

### 1. Livestream Media Control Synchronization (Host-to-Room Sink)
* [ ] Integrate low-latency state listeners (e.g., socket relays) that synchronize `PLAY`, `PAUSE`, and `SEEK` actions.
* [ ] When the room premium Host pauses the player or triggers subtitles, all active audience players in the co-watch sync instantly without manual reloads.

### 2. User Dynamic Custom Playlist Casting
* [ ] Implement an "Add personal URL" drawer directly inside `/movies` and the live Room controls.
* [ ] Render private playlists stored locally on standard `localStorage` indices so individual streamers maintain their favorite libraries without bloating servers.

### 3. Audio & Voice Co-hosting Mics (Virtual theater seat overlays)
* [ ] Connect the 4 virtual theater mic slots in `/movies` directly to active WebRTC audio bridges.
* [ ] Allow up to 4 fans to hold active commentary seats, with ambient noise gates, while watching the screening together.
