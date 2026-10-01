export type PlayerKeyAction = "toggle" | "forward" | "back" | "reset";

interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

/**
 * Keyboard shortcuts for the algorithm player. Space is left to a focused
 * button (it activates it natively), and browser shortcuts like Ctrl+R pass through.
 */
export function playerKeyAction(e: KeyLike, targetIsButton: boolean): PlayerKeyAction | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  switch (e.key) {
    case " ":
      return targetIsButton ? null : "toggle";
    case "ArrowRight":
      return "forward";
    case "ArrowLeft":
      return "back";
    case "r":
    case "R":
      return "reset";
    default:
      return null;
  }
}
