import Phaser from 'phaser';
import type { PlayerState } from './RetroBoy';

export const RETROBOY_SHEET = 'retroboy-sheet';

export const RETROBOY_FRAME_WIDTH = 32;
export const RETROBOY_FRAME_HEIGHT = 48;

export const RETROBOY_ANIM: Record<PlayerState, string> = {
  idle: 'retroboy-idle',
  walk: 'retroboy-walk',
  run: 'retroboy-run',
  jump: 'retroboy-jump',
  fall: 'retroboy-fall',
  land: 'retroboy-land',
  crouch: 'retroboy-crouch',
};

type FrameSpec = {
  start: number;
  end: number;
  frameRate: number;
  repeat: number;
};

const FRAMES: Record<PlayerState, FrameSpec> = {
  idle: { start: 0, end: 1, frameRate: 2, repeat: -1 },
  walk: { start: 2, end: 5, frameRate: 8, repeat: -1 },
  run: { start: 6, end: 9, frameRate: 14, repeat: -1 },
  jump: { start: 10, end: 10, frameRate: 1, repeat: 0 },
  fall: { start: 11, end: 11, frameRate: 1, repeat: 0 },
  land: { start: 12, end: 12, frameRate: 1, repeat: 0 },
  crouch: { start: 13, end: 13, frameRate: 1, repeat: 0 },
};

export function registerRetroBoyAnimations(scene: Phaser.Scene): boolean {
  if (!scene.textures.exists(RETROBOY_SHEET)) {
    return false;
  }
  for (const state of Object.keys(FRAMES) as PlayerState[]) {
    const key = RETROBOY_ANIM[state];
    if (scene.anims.exists(key)) continue;
    const { start, end, frameRate, repeat } = FRAMES[state];
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(RETROBOY_SHEET, { start, end }),
      frameRate,
      repeat,
    });
  }
  return true;
}
