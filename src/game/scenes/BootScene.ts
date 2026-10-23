import Phaser from 'phaser';
import {
  RETROBOY_RUN_FRAME_HEIGHT,
  RETROBOY_RUN_FRAME_WIDTH,
  RETROBOY_RUN_SHEET,
} from '../entities/retroboy-animations';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image('retroboy-placeholder', '/assets/retroboy/idle.png');
    this.load.image('retroboy-placeholder-crouch', '/assets/retroboy/crouch-v2.png');
    this.load.image('retroboy-jump', '/assets/retroboy/jump.png');
    this.load.image('retroboy-double-jump', '/assets/retroboy/double-jump.png');
    this.load.image('retroboy-fall', '/assets/retroboy/fall.png');
    this.load.image('retroboy-turn', '/assets/retroboy/turn.png');
    this.load.spritesheet(RETROBOY_RUN_SHEET, '/assets/retroboy/run-cycle.png', {
      frameWidth: RETROBOY_RUN_FRAME_WIDTH,
      frameHeight: RETROBOY_RUN_FRAME_HEIGHT,
    });
  }

  create(): void {
    this.scene.start('WorldOneScene');
  }
}
