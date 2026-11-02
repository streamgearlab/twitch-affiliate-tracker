# Twitch Affiliate Progress Tracker

Track your progress to Twitch Affiliate: enter followers, stream days, minutes and viewer days from the last 30 days to see what is missing and get a simple plan.

**Live tool:** https://streamgearlab.com/tools/twitch-affiliate-tracker/

## Features

- Progress bars for all four goals the tool checks: 25 followers, 240 minutes (4 hours) streamed, 4 unique stream days and 4 days averaging 3+ viewers in the last 30 days
- Sanity checks for impossible numbers (more viewer days than stream days, minutes vs. seconds)
- Suggested plan based on how many days a week you stream and your usual stream length
- Optional "Remember on this device" (stored only in your browser's localStorage)
- No tracking, no build step, works offline

## Usage

No install and no build step. It's plain HTML, CSS and JavaScript.

- **Online:** use the live tool at https://streamgearlab.com/tools/twitch-affiliate-tracker/ or the GitHub Pages demo at https://streamgearlab.github.io/twitch-affiliate-tracker/
- **Locally:** download or clone this repo and open `index.html` in your browser (it works straight from `file://`).

```sh
git clone https://github.com/streamgearlab/twitch-affiliate-tracker.git
cd twitch-affiliate-tracker
open index.html   # macOS; use xdg-open on Linux or just double-click it on Windows
```

You can prefill the form from the URL with these parameters: `followers`, `days`, `minutes`, `vdays`, `avg`, `perweek`, `len`. Example: `index.html?followers=12&days=3&minutes=150&vdays=1`

## Files

- `index.html`: page and form
- `app.js`: tool logic
- `style.css`: styles

## License

[MIT](LICENSE) © StreamGearLab

---

Made by [StreamGearLab](https://streamgearlab.com): free, no-nonsense tools and guides for streamers.
