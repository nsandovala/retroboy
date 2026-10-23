import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { RetroBoy } from '../entities/RetroBoy';

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = GAME_HEIGHT;
const GROUND_HEIGHT = 32;

type PlatformRect = { x: number; y: number; w: number; h: number };

const PLATFORMS: PlatformRect[] = [
  { x: 220, y: WORLD_HEIGHT - GROUND_HEIGHT - 44, w: 96, h: 12 },
  { x: 380, y: WORLD_HEIGHT - GROUND_HEIGHT - 72, w: 96, h: 12 },
  { x: 560, y: WORLD_HEIGHT - GROUND_HEIGHT - 82, w: 120, h: 12 },
  { x: 820, y: WORLD_HEIGHT - GROUND_HEIGHT - 60, w: 160, h: 12 },
  { x: 1120, y: WORLD_HEIGHT - GROUND_HEIGHT - 78, w: 140, h: 12 },
];

const STEP_RECT: PlatformRect = {
  x: 1320,
  y: WORLD_HEIGHT - GROUND_HEIGHT - 24,
  w: 220,
  h: 24,
};

const CEILING_BARS: PlatformRect[] = [
  { x: 720, y: WORLD_HEIGHT - GROUND_HEIGHT - 30, w: 80, h: 10 },
];

export class WorldOneScene extends Phaser.Scene {
  private player!: RetroBoy;
  private debugText!: Phaser.GameObjects.Text;

  constructor() {
    super('WorldOneScene');
  }

  create(): void {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.drawBackground();

    const solids = this.physics.add.staticGroup();
    this.addGround(solids);
    for (const rect of PLATFORMS) {
      this.addPlatform(solids, rect, 0x8b5a2b, 0xc98a55);
    }
    this.addPlatform(solids, STEP_RECT, 0x3f3f46, 0x71717a);
    for (const bar of CEILING_BARS) {
      this.addPlatform(solids, bar, 0xb45309, 0xf59e0b);
    }

    this.player = new RetroBoy(this, 60, WORLD_HEIGHT - GROUND_HEIGHT - 4);
    this.physics.add.collider(this.player.sprite, solids);

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(40, 20);

    this.debugText = this.add
      .text(6, 6, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#a7f3d0',
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.add
      .text(GAME_WIDTH / 2, 12, 'WORLD 01 — POWER FACTORY', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#c0c0d0',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1000);
  }

  override update(time: number, delta: number): void {
    this.player.update(time, delta);

    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    this.debugText.setText([
      `STATE: ${this.player.state}`,
      `VX: ${body.velocity.x.toFixed(0)}`,
      `VY: ${body.velocity.y.toFixed(0)}`,
      `JUMPS: ${this.player.jumpsUsed}/2`,
      `ON GROUND: ${onGround}`,
    ]);
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b0d14, 0x0b0d14, 0x1a1030, 0x1a1030, 1);
    bg.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    bg.setScrollFactor(0.4);

    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 60; i++) {
      const sx = (i * 137) % WORLD_WIDTH;
      const sy = (i * 53) % (WORLD_HEIGHT - 80);
      stars.fillRect(sx, sy, 1, 1);
    }
    stars.setScrollFactor(0.6);
  }

  private addGround(group: Phaser.Physics.Arcade.StaticGroup): void {
    const y = WORLD_HEIGHT - GROUND_HEIGHT;
    const g = this.add.graphics();
    g.fillStyle(0x2a1a3a, 1);
    g.fillRect(0, y, WORLD_WIDTH, GROUND_HEIGHT);
    g.fillStyle(0x5b3a7a, 1);
    g.fillRect(0, y, WORLD_WIDTH, 2);

    const body = group.create(
      WORLD_WIDTH / 2,
      y + GROUND_HEIGHT / 2,
      undefined as unknown as string,
    ) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    body.setDisplaySize(WORLD_WIDTH, GROUND_HEIGHT);
    (body.body as Phaser.Physics.Arcade.StaticBody).setSize(
      WORLD_WIDTH,
      GROUND_HEIGHT,
    );
    (body.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
  }

  private addPlatform(
    group: Phaser.Physics.Arcade.StaticGroup,
    rect: PlatformRect,
    fill: number,
    top: number,
  ): void {
    const g = this.add.graphics();
    g.fillStyle(fill, 1);
    g.fillRect(rect.x, rect.y, rect.w, rect.h);
    g.fillStyle(top, 1);
    g.fillRect(rect.x, rect.y, rect.w, 2);

    const body = group.create(
      rect.x + rect.w / 2,
      rect.y + rect.h / 2,
      undefined as unknown as string,
    ) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    body.setDisplaySize(rect.w, rect.h);
    (body.body as Phaser.Physics.Arcade.StaticBody).setSize(rect.w, rect.h);
    (body.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
  }
}
