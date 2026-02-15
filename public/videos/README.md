# Hero background video

The hero section uses a background video so the site feels real and professional. Use a clip that matches **home & office maintenance** (AC, plumbing, electrical, cleaning, handyman).

## Option 1: Local file (recommended)

1. Download a **free** clip that fits your services (see suggestions below).
2. Rename it to **`hero-bg.mp4`** and put it here: `public/videos/hero-bg.mp4`.

**Best search terms for a real, service-focused feel:**

- **Handyman / technician:** "handyman", "technician at work", "maintenance worker", "repair service"
- **AC / HVAC:** "HVAC technician", "air conditioning repair", "technician fixing AC"
- **Plumbing / electrical:** "plumber", "electrician", "wiring", "pipe repair"
- **General:** "home maintenance", "building maintenance", "property repair", "tool repair"
- **Atmosphere:** "worker with tools", "professional technician", "service call", "before and after repair"

Use a **landscape** clip, about **10–30 seconds**, so it loops smoothly. Prefer well-lit, professional shots over chaotic construction sites.

### Free stock video sites (no watermark)

| Site | Try these searches |
|------|---------------------|
| **Pexels** | [maintenance](https://www.pexels.com/search/videos/maintenance/), [technician](https://www.pexels.com/search/videos/technician/), [plumber](https://www.pexels.com/search/videos/plumber/), [electrician](https://www.pexels.com/search/videos/electrician/), [HVAC](https://www.pexels.com/search/videos/hvac/), [handyman](https://www.pexels.com/search/videos/handyman/) |
| **Pixabay** | [repair](https://pixabay.com/videos/search/repair/), [technician](https://pixabay.com/videos/search/technician/), [plumbing](https://pixabay.com/videos/search/plumbing/) |
| **Mixkit** | [tools](https://mixkit.co/free-stock-video/tools/), [construction](https://mixkit.co/free-stock-video/construction/), [worker](https://mixkit.co/free-stock-video/worker/) |
| **Coverr** | [engineering](https://coverr.co/stock-video-footage/engineering), [construction](https://coverr.co/stock-video-footage/construction) |

Pick something that looks **real** (actual technicians, tools, or repairs) rather than generic construction.

## Option 2: External URL

If your video is hosted elsewhere (CDN, storage), set in `.env.local`:

```env
NEXT_PUBLIC_HERO_VIDEO_URL=https://example.com/your-video.mp4
```

The hero will use this URL instead of the local file.

## Optional: poster image (recommended for fast load)

The hero **waits for the page to load** before loading the video, so the site feels fast. To show a nice frame **right away**:

1. Export one frame from your video (or use a similar photo).
2. Save it as **`hero-poster.jpg`** in this folder: `public/videos/hero-poster.jpg` (keep it under ~200 KB).

The hero uses this as the video poster. Use a landscape image (e.g. 1920×1080 or 16:9). For even faster load, compress the main video (e.g. 720p, 1–2 Mbps) so it streams quickly.
