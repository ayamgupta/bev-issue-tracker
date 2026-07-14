# Product images

`be6.png`, `xev9e.png`, `xev9s.png` and `hero.png` are official product photos, supplied directly by the site owner (confirmed to have redistribution rights).

`src/data/carData.ts` and `src/pages/Home.tsx` reference these by filename. `CarImage` (`src/components/CarImage.tsx`) falls back to a gradient placeholder if a referenced file is ever missing, so swapping or removing a file won't break the layout.
