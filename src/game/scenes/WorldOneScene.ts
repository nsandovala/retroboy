import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

export class WorldOneScene extends Phaser.Scene {
  constructor() {
    super('WorldOneScene');
  }

  create(): void {
    this.drawBackground();
    this.drawTitles();
    this.drawRetroBoyPlaceholder();
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b0d14, 0x0b0d14, 0x1a1030, 0x1a1030, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const ground = this.add.graphics();
    ground.fillStyle(0x2a1a3a, 1);
    ground.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);
    ground.fillStyle(0x3d2a55, 1);
    ground.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 2);
  }

  private drawTitles(): void {
    const title = this.add.text(GAME_WIDTH / 2, 60, 'RETROBOY', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#f5d76e',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(
      GAME_WIDTH / 2,
      100,
      'WORLD 01 — POWER FACTORY',
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#c0c0d0',
      },
    );
    subtitle.setOrigin(0.5);
  }

  private drawRetroBoyPlaceholder(): void {
    const x = GAME_WIDTH / 2;
    const y = GAME_HEIGHT - 60;
    const g = this.add.graphics();
    g.fillStyle(0xf5d76e, 1);
    g.fillRect(x - 6, y - 16, 12, 12);
    g.fillStyle(0xe07a5f, 1);
    g.fillRect(x - 6, y - 4, 12, 14);
    g.fillStyle(0x2a1a3a, 1);
    g.fillRect(x - 4, y - 13, 2, 2);
    g.fillRect(x + 2, y - 13, 2, 2);
  }
}
