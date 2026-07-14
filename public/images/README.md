# Product images

`be6.svg`, `xev9e.svg`, `xev9s.svg` and `hero.svg` are original abstract vector illustrations (not photos of the real vehicles), used because Mahindra's official site does not publish a press kit licensed for third-party redistribution. They're colour-coded to match the model colours used across the analytics dashboard (BE 6 = blue, XEV 9e = aqua, XEV 9S = amber).

If you later obtain real product photos you have redistribution rights to (e.g. from Mahindra's press/media team directly, or your own photography), replace these files — `src/data/carData.ts` and `src/pages/Home.tsx` reference them by filename, so a same-named `.jpg`/`.webp` works as a drop-in replacement (update the extension in those two files). `CarImage` falls back to a gradient placeholder if a referenced file is ever missing.
