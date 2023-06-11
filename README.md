# 💣 Tiny pixel art style minesweeper game

![Preview](.github/preview.png)

## How To Play
- Website: [LINK](https://pixel-art-minesweeper.netlify.app/)
- Play Locally:
  ```sh
  npm install && npm run dev 
  ```
  Automatically open in your browser with [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
  `(Requires Node.js 16 and recommends using PNPM)`

## Game Rules
- Clicking on a mine ends the game.
- Clicking on a square with an adjacent mine clears that square and shows the number of mines touching it.
- Clicking on a square with no adjacent mine clears that square and clicks all adjacent squares.
- The first click can never be a mine.
- The numbers reflect the number of mines touching a square.
- Right-clicking on a square places a flag on it. The flagged square can't be opened by a click.
- If the number in a square is equal to the number of squares touching that square that are flagged, double-clicking on the number opens up all remaining squares around the number. (Note: this won't work on touch screen devices)
- When the time countdown is over, you will lose 1 HP every 10 seconds. If you run out of HP, the game is over.
- You have 5 chances to use the "Super Star" to revert to the previous clicked step and restore full HP.
- When you complete the current rank, you will restore 1 HP.


## TDOD List

- [ ] Add more items
- [ ] Implement rank completed rewards
- [ ] Add a dungeon-like mode
- [ ] Support responsive web design (RWD)
