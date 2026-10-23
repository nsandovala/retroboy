import Phaser from 'phaser';
import {
  RETROBOY_ANIM,
  RETROBOY_SHEET,
  registerRetroBoyAnimations,
} from './retroboy-animations';

export type PlayerState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'fall'
  | 'land'
  | 'crouch';

const WIDTH = 20;
const HEIGHT = 44;
const CROUCH_HEIGHT = 22;
const DRAW_WIDTH = 32;
const DRAW_HEIGHT = 48;
const DRAW_CROUCH_HEIGHT = 26;

const WALK_SPEED = 120;
const RUN_SPEED = 210;
const CROUCH_SPEED = 55;
const ACCELERATION = 1000;
const DECELERATION = 1500;
const AIR_CONTROL = 0.6;

const GRAVITY = 1500;
const JUMP_VELOCITY = -520;
const DOUBLE_JUMP_VELOCITY = -480;
const JUMP_CUT_VELOCITY = -160;
const MAX_FALL_SPEED = 560;

const COYOTE_TIME_MS = 100;
const JUMP_BUFFER_MS = 100;
const LAND_STATE_MS = 90;

const TEX_STAND = 'retroboy-placeholder';
const TEX_CROUCH = 'retroboy-placeholder-crouch';
const TEX_JUMP = 'retroboy-jump';
const TEX_DOUBLE_JUMP = 'retroboy-double-jump';
const TEX_FALL = 'retroboy-fall';

type Keys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  run: Phaser.Input.Keyboard.Key;
  leftArrow: Phaser.Input.Keyboard.Key;
  rightArrow: Phaser.Input.Keyboard.Key;
  downArrow: Phaser.Input.Keyboard.Key;
};

export class RetroBoy {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  state: PlayerState = 'idle';
  facing: 1 | -1 = 1;

  get jumpsUsed(): number {
    return this.jumpConsumed ? (this.doubleJumpActive ? 2 : 1) : 0;
  }

  private readonly scene: Phaser.Scene;
  private readonly keys: Keys;

  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private landTimer = 0;
  private wasOnGround = false;
  private jumpConsumed = false;
  private airJumpAvailable = false;
  private doubleJumpActive = false;
  private crouching = false;
  private readonly useAnimations: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    ensurePlaceholderTextures(scene);
    this.useAnimations = registerRetroBoyAnimations(scene);

    const initialTexture = this.useAnimations ? RETROBOY_SHEET : TEX_STAND;
    this.sprite = scene.physics.add.sprite(x, y, initialTexture);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setCollideWorldBounds(true);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(WIDTH, HEIGHT);
    body.setOffset((DRAW_WIDTH - WIDTH) / 2, DRAW_HEIGHT - HEIGHT);
    body.setGravityY(GRAVITY);
    body.setMaxVelocity(RUN_SPEED, MAX_FALL_SPEED);

    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard plugin not available');
    }
    this.keys = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      jump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      run: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      leftArrow: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      rightArrow: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      downArrow: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
    };
  }

  update(_time: number, deltaMs: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const dt = deltaMs / 1000;
    const onGround = body.blocked.down || body.touching.down;

    const leftDown = this.keys.left.isDown || this.keys.leftArrow.isDown;
    const rightDown = this.keys.right.isDown || this.keys.rightArrow.isDown;
    const downDown = this.keys.down.isDown || this.keys.downArrow.isDown;
    const runDown = this.keys.run.isDown;
    const jumpJustPressed = Phaser.Input.Keyboard.JustDown(this.keys.jump);
    const jumpJustReleased = Phaser.Input.Keyboard.JustUp(this.keys.jump);

    const wantsCrouch = downDown && onGround;
    if (wantsCrouch && !this.crouching) {
      this.setCrouch(true);
    } else if (!wantsCrouch && this.crouching && this.canStand()) {
      this.setCrouch(false);
    }

    if (onGround) {
      this.coyoteTimer = COYOTE_TIME_MS;
      this.jumpConsumed = false;
      this.airJumpAvailable = false;
      this.doubleJumpActive = false;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - deltaMs);
    }

    if (jumpJustPressed) {
      this.jumpBufferTimer = JUMP_BUFFER_MS;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - deltaMs);
    }

    const inputDir = (rightDown ? 1 : 0) - (leftDown ? 1 : 0);
    if (inputDir !== 0) {
      this.facing = inputDir as 1 | -1;
    }

    const maxSpeed = this.crouching
      ? CROUCH_SPEED
      : runDown
        ? RUN_SPEED
        : WALK_SPEED;
    const targetSpeed = inputDir * maxSpeed;
    const control = onGround ? 1 : AIR_CONTROL;
    const accel = (inputDir !== 0 ? ACCELERATION : DECELERATION) * control;
    body.velocity.x = approach(body.velocity.x, targetSpeed, accel * dt);

    const canJump = !this.crouching || this.canStand();
    if (
      canJump &&
      this.jumpBufferTimer > 0 &&
      this.coyoteTimer > 0 &&
      !this.jumpConsumed
    ) {
      if (this.crouching) {
        this.setCrouch(false);
      }
      body.velocity.y = JUMP_VELOCITY;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.jumpConsumed = true;
      this.airJumpAvailable = true;
      this.doubleJumpActive = false;
    } else if (
      canJump &&
      !onGround &&
      this.jumpBufferTimer > 0 &&
      this.airJumpAvailable
    ) {
      body.velocity.y = DOUBLE_JUMP_VELOCITY;
      this.jumpBufferTimer = 0;
      this.airJumpAvailable = false;
      this.doubleJumpActive = true;
    }

    if (jumpJustReleased && body.velocity.y < JUMP_CUT_VELOCITY) {
      body.velocity.y = JUMP_CUT_VELOCITY;
    }

    if (onGround && !this.wasOnGround) {
      this.landTimer = LAND_STATE_MS;
    }
    this.landTimer = Math.max(0, this.landTimer - deltaMs);
    this.wasOnGround = onGround;

    this.state = this.resolveState(onGround, inputDir, runDown, body.velocity);
    this.sprite.setFlipX(this.facing === -1);

    if (this.useAnimations) {
      this.sprite.anims.play(RETROBOY_ANIM[this.state], true);
    } else {
      const nextTexture = this.crouching
        ? TEX_CROUCH
        : this.state === 'jump'
          ? this.doubleJumpActive ? TEX_DOUBLE_JUMP : TEX_JUMP
          : this.state === 'fall'
            ? TEX_FALL
            : TEX_STAND;
      if (this.sprite.texture.key !== nextTexture) {
        this.sprite.setTexture(nextTexture);
      }
    }
  }

  private resolveState(
    onGround: boolean,
    inputDir: number,
    runDown: boolean,
    velocity: Phaser.Math.Vector2,
  ): PlayerState {
    if (!onGround) {
      return velocity.y < 0 ? 'jump' : 'fall';
    }
    if (this.crouching) {
      return 'crouch';
    }
    if (this.landTimer > 0) {
      return 'land';
    }
    if (inputDir === 0 || Math.abs(velocity.x) < 8) {
      return 'idle';
    }
    return runDown ? 'run' : 'walk';
  }

  private setCrouch(on: boolean): void {
    if (this.crouching === on) return;
    this.crouching = on;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (on) {
      if (!this.useAnimations) this.sprite.setTexture(TEX_CROUCH);
      body.setSize(WIDTH, CROUCH_HEIGHT);
      body.setOffset((DRAW_WIDTH - WIDTH) / 2, DRAW_CROUCH_HEIGHT - CROUCH_HEIGHT);
    } else {
      if (!this.useAnimations) this.sprite.setTexture(TEX_STAND);
      body.setSize(WIDTH, HEIGHT);
      body.setOffset((DRAW_WIDTH - WIDTH) / 2, DRAW_HEIGHT - HEIGHT);
    }
  }

  private canStand(): boolean {
    const x = this.sprite.x;
    const y = this.sprite.y;
    const testW = WIDTH;
    const testH = HEIGHT - CROUCH_HEIGHT;
    const testX = x - testW / 2;
    const testY = y - HEIGHT;
    const bodies = this.scene.physics.overlapRect(
      testX,
      testY,
      testW,
      testH,
      false,
      true,
    );
    return bodies.length === 0;
  }
}

function approach(current: number, target: number, delta: number): number {
  if (current < target) {
    return Math.min(current + delta, target);
  }
  if (current > target) {
    return Math.max(current - delta, target);
  }
  return current;
}

function ensurePlaceholderTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists(TEX_STAND)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);

    // jeans
    g.fillStyle(0x1e3a8a, 1);
    g.fillRect(6, 30, 20, 18);
    // boots
    g.fillStyle(0xb91c1c, 1);
    g.fillRect(4, 44, 10, 4);
    g.fillRect(18, 44, 10, 4);
    // jacket
    g.fillStyle(0xdc2626, 1);
    g.fillRect(4, 18, 24, 14);
    // shirt stripe
    g.fillStyle(0xf5f5f5, 1);
    g.fillRect(12, 20, 8, 10);
    // head
    g.fillStyle(0xf1c27d, 1);
    g.fillRect(8, 4, 16, 14);
    // cap
    g.fillStyle(0xdc2626, 1);
    g.fillRect(6, 0, 20, 6);
    g.fillStyle(0xf5f5f5, 1);
    g.fillRect(8, 2, 4, 2);
    g.fillStyle(0xdc2626, 1);
    g.fillRect(20, 4, 8, 2);
    // eyes
    g.fillStyle(0x111111, 1);
    g.fillRect(14, 10, 2, 2);
    g.fillRect(20, 10, 2, 2);

    g.generateTexture(TEX_STAND, DRAW_WIDTH, DRAW_HEIGHT);
    g.destroy();
  }

  if (!scene.textures.exists(TEX_CROUCH)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);

    // boots
    g.fillStyle(0xb91c1c, 1);
    g.fillRect(4, 22, 10, 4);
    g.fillRect(18, 22, 10, 4);
    // jeans (compressed)
    g.fillStyle(0x1e3a8a, 1);
    g.fillRect(6, 16, 20, 8);
    // jacket (compressed)
    g.fillStyle(0xdc2626, 1);
    g.fillRect(4, 8, 24, 10);
    g.fillStyle(0xf5f5f5, 1);
    g.fillRect(12, 10, 8, 6);
    // head (tucked)
    g.fillStyle(0xf1c27d, 1);
    g.fillRect(8, 2, 16, 8);
    // cap
    g.fillStyle(0xdc2626, 1);
    g.fillRect(6, 0, 20, 4);
    g.fillStyle(0xf5f5f5, 1);
    g.fillRect(8, 1, 4, 2);
    // eyes
    g.fillStyle(0x111111, 1);
    g.fillRect(14, 6, 2, 2);
    g.fillRect(20, 6, 2, 2);

    g.generateTexture(TEX_CROUCH, DRAW_WIDTH, DRAW_CROUCH_HEIGHT);
    g.destroy();
  }
}
