import { describe, it, expect } from "vitest";
import { playerKeyAction } from "../playerKeys";

const key = (k: string, mods: Partial<{ ctrlKey: boolean; metaKey: boolean; altKey: boolean }> = {}) => ({
  key: k,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  ...mods,
});

describe("playerKeyAction", () => {
  it("maps the documented shortcuts", () => {
    expect(playerKeyAction(key(" "), false)).toBe("toggle");
    expect(playerKeyAction(key("ArrowRight"), false)).toBe("forward");
    expect(playerKeyAction(key("ArrowLeft"), false)).toBe("back");
    expect(playerKeyAction(key("r"), false)).toBe("reset");
    expect(playerKeyAction(key("R"), false)).toBe("reset");
  });

  it("leaves Space alone when a button has focus, so the button still activates", () => {
    expect(playerKeyAction(key(" "), true)).toBeNull();
  });

  it("still steps with the arrow keys when a button has focus", () => {
    expect(playerKeyAction(key("ArrowRight"), true)).toBe("forward");
    expect(playerKeyAction(key("ArrowLeft"), true)).toBe("back");
  });

  it("ignores browser and OS shortcuts such as Ctrl+R and Cmd+R", () => {
    expect(playerKeyAction(key("r", { ctrlKey: true }), false)).toBeNull();
    expect(playerKeyAction(key("r", { metaKey: true }), false)).toBeNull();
    expect(playerKeyAction(key("ArrowLeft", { altKey: true }), false)).toBeNull();
  });

  it("ignores unrelated keys", () => {
    expect(playerKeyAction(key("Enter"), false)).toBeNull();
    expect(playerKeyAction(key("a"), false)).toBeNull();
  });
});
