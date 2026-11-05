// The arcade's games, shared by the pet's menu (desktop) and the arcade button (touch screens).
// To add a game: build it, then set `ready: true` here and open it where the menus call `onPlay`.
export type GameInfo = { id: string; name: string; blurb: string; ready: boolean };

export const GAMES: GameInfo[] = [
  { id: "bug-hunt", name: "Bug Hunt", blurb: "Stop the bugs before they reach production.", ready: true },
  { id: "deploy-run", name: "Deploy Run", blurb: "Dodge the blockers on the way to release.", ready: false },
  { id: "ship-it", name: "Ship It", blurb: "Catch the good commits, dodge the bugs.", ready: false },
];

export const BUG_HUNT_BEST_KEY = "bug-hunt-best";

export const readBest = () => {
  try {
    return Number(localStorage.getItem(BUG_HUNT_BEST_KEY) ?? 0);
  } catch {
    return 0;
  }
};
