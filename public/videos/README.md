# Hero background video

The hero section uses a background video for impact. You can provide it in either way below.

## Option 1: Local file (recommended)

1. Download a free **engineering / building / construction** video (e.g. builders, workers, tools, welding, carpentry, construction site).
2. Rename it to **`hero-bg.mp4`** and place it in this folder: `public/videos/hero-bg.mp4`.

**Suggested sources (free, no watermark):**

- **Mixkit** – Carpenter, tools, construction, drilling, welding:  
  https://mixkit.co/free-stock-video/tools/  
  https://mixkit.co/free-stock-video/construction/  
  e.g. "A carpenter working at his workshop", "Drilling holes into wood", "Welding by hand"
- **Pexels** – Search “maintenance”, “plumber”, “technician”, “repair”:  
  https://www.pexels.com/search/videos/construction/  
  https://www.pexels.com/search/videos/engineering/
- **Coverr** – Engineering, construction:  
  https://coverr.co/stock-video-footage/engineering  
  https://coverr.co/stock-video-footage/construction

Use a horizontal clip (landscape), ideally 10–30 seconds, so it can loop smoothly.

## Option 2: External URL

If you have a direct MP4 URL (e.g. from a CDN or storage), set:

```env
NEXT_PUBLIC_HERO_VIDEO_URL=https://example.com/your-video.mp4
```

in `.env.local`. The hero will use this URL instead of the local file.

## Optional: poster image

To show a frame before the video loads, add `public/videos/hero-poster.jpg` and the component can be updated to use it as the video `poster`.
