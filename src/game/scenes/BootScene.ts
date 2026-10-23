import Phaser from 'phaser';

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
  }

  create(): void {
    this.scene.start('WorldOneScene');
  }
}
