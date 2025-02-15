import type { Ref } from "vue";
import type { OverlaySettings } from "./overlayType";
import { loadImg } from "@/load_img";
import agents from "./agents";
import { nameFilter } from "@/overlayPreParse";

type AbilityData = {
  maxUses: number;
  remainingUses: number;
};

type Gun = {
  name: string;
};

type LoadoutData = {
  sidearm: Gun | null;
  firearm: Gun | null;
  shield: number;
};

type PlayerData = {
  name: string;
  tagline: string;
  agent: string;
  health: number;
  credits: number;
  abilities: {
    Ability1: AbilityData;
    Ability2: AbilityData;
    Signature: AbilityData;
    Ultimate: AbilityData;
  };
  loadout: LoadoutData;
  KDA: [number, number, number];
};

type Round = {
  roundNumber: number;
  winner: "attacker" | "defender";
  cause: "defuse" | "elimination" | "time" | "detonation";
};

type GameData = {
  round: number;
  phase: string;
  matchLog: Round[];
  attackerScore: number;
  defenderScore: number;
  attackers: PlayerData[];
  defenders: PlayerData[];
};

const atkC = "243, 68, 83";
const defC = "50, 175, 138";
const headerC = "224, 235, 185";
const accent = "134, 191, 42";

const agentImages: Record<string, HTMLImageElement> = {};
const abilityImages: Record<
  string,
  {
    Ability1: HTMLImageElement;
    Ability2: HTMLImageElement;
    Signature: HTMLImageElement;
    Ultimate: HTMLImageElement;
  }
> = {};
const sponsorImages: HTMLImageElement[] = [];

let brandingImage: HTMLImageElement | null = null;

const shownInformation = {
  roundWin: {
    trigger: (
      ceromony: string,
      winningTeamName: string,
      winningTeamSide: string,
      roundNum: number
    ) => {
      shownInformation.roundWin.i.data = { ceromony, winningTeamName, winningTeamSide, roundNum };
      shownInformation.roundWin.i.t = 0;
      shownInformation.roundWin.i.running = true;
    },
    i: {
      t: 0,
      running: false,
      data: {
        ceromony: "",
        winningTeamName: "",
        winningTeamSide: "",
        roundNum: 0
      },
      animation: {
        stall: 120
      }
    }
  },
  gameOverview: {
    shown: false,
    lastShown: false,
    running: false,
    t: 0
  },
  playerInformation: {
    shown: true,
    lastShown: true,
    running: false,
    t: 0
  }
};

function bgGradient(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createRadialGradient(1920 / 2, 1080 / 2, 20, 1920 / 2, 1080 / 2, 1080);
  gradient.addColorStop(0.05, "rgb(46, 89, 121)");
  gradient.addColorStop(1, "rgb(2, 35, 41)");
  ctx.fillStyle = gradient;
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = "center",
  baseline: CanvasTextBaseline = "alphabetic",
  yOffset: number = 0
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  const metrics = ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || metrics.emHeightAscent || 0;
  const descent = metrics.actualBoundingBoxDescent || 0;

  ctx.fillText(text, x, y + ascent / 2 - descent / 2 + yOffset);
}

function easeInOutExpo(v0: number, v1: number, x: number): number {
  return x === 0
    ? v0
    : x === 1
      ? v1
      : x < 0.5
        ? ((v1 - v0) * Math.pow(2, 20 * x - 10)) / 2 + v0
        : ((v1 - v0) * (2 - Math.pow(2, -20 * x + 10))) / 2 + v0;
}

function animationDelay(min: number, max: number, animationProgress: number): number {
  if (animationProgress <= min) return 0;
  if (animationProgress >= max) return 1;

  return (animationProgress - min) / (max - min);
}

export function renderLoop(
  gameData: Ref<GameData> | null,
  settings: Ref<OverlaySettings>,
  ctx: CanvasRenderingContext2D
): void {
  const targetFps = 60;
  const frameTime = 1000 / targetFps;
  let lastFrameTime = performance.now();

  const r = (timestamp: number) => {
    const deltaTime = timestamp - lastFrameTime;

    if (deltaTime >= frameTime) {
      lastFrameTime = timestamp - (deltaTime % frameTime);
      renderOverlay(ctx, settings.value, gameData ? gameData.value : null);
    }

    requestAnimationFrame(r);
  };

  requestAnimationFrame(r);
}

const stalls = {
  roundWin: 0
};

export function renderOverlay(
  ctx: CanvasRenderingContext2D,
  settings: OverlaySettings,
  gameData: GameData | null
): void {
  ctx.clearRect(0, 0, 1920, 1080);

  if (!brandingImage) {
    if (settings.series.showBrandingImg && settings.series.brandingImg) {
      loadImg(settings.series.brandingImg).then((img) => {
        brandingImage = img;
      });
    } else {
      brandingImage = null;
    }
  } else {
    if (!settings.series.showBrandingImg) {
      brandingImage = null;
    } else if (settings.series.brandingImg != brandingImage.src && settings.series.brandingImg) {
      loadImg(settings.series.brandingImg).then((img) => {
        brandingImage = img;
      });
    }
  }

  if (shownInformation.roundWin.i.running) {
    if (settings.otherOverlayFeatures.roundOutcomeBanner) {
      roundWin(
        ctx,
        shownInformation.roundWin.i.data.ceromony,
        shownInformation.roundWin.i.data.winningTeamName,
        shownInformation.roundWin.i.data.winningTeamSide,
        shownInformation.roundWin.i.data.roundNum,
        shownInformation.roundWin.i.t / 100,
        settings
      );
      if (shownInformation.roundWin.i.t == 90) {
        stalls.roundWin += 1;
        if (stalls.roundWin >= shownInformation.roundWin.i.animation.stall) {
          stalls.roundWin = 0;
          shownInformation.roundWin.i.t += 2;
        }
      } else {
        shownInformation.roundWin.i.t += 2;
      }
      if (shownInformation.roundWin.i.t >= 100) shownInformation.roundWin.i.running = false;
    } else {
      shownInformation.roundWin.i.running = false;
    }
  }

  score(ctx, {
    attackerScore: 4,
    defenderScore: 5,
    attackerName: settings.redTeamName,
    defenderName: settings.blueTeamName,
    roundNum: 7
  });

  for (let i = 0; i < 5; i++) {
    playerLeft(
      ctx,
      25,
      1080 - 25 - i * 115,
      {
        name: `Player ${i + 1}`,
        tagline: "1234",
        agent: "Breach",
        health: (i + 1) * 20,
        credits: 4000,
        abilities: {
          Ability1: { maxUses: 2, remainingUses: 2 },
          Ability2: { maxUses: 1, remainingUses: 1 },
          Signature: { maxUses: 1, remainingUses: 0 },
          Ultimate: { maxUses: 9, remainingUses: 6 }
        },
        loadout: {
          sidearm: { name: "Sheriff" },
          firearm: { name: "Vandal" },
          shield: 25
        },
        KDA: [15, 5, 3]
      },
      i != 3 ? true : false,
      settings
    );

    playerRight(
      ctx,
      1920 - 25,
      1080 - 25 - i * 115,
      {
        name: `Player ${i + 6}`,
        tagline: "5678",
        agent: "Reyna",
        health: (i + 1) * 20,
        credits: 4000,
        abilities: {
          Ability1: { maxUses: 2, remainingUses: 2 },
          Ability2: { maxUses: 1, remainingUses: 1 },
          Signature: { maxUses: 1, remainingUses: 0 },
          Ultimate: { maxUses: 9, remainingUses: 9 }
        },
        loadout: {
          sidearm: { name: "Sheriff" },
          firearm: { name: "Vandal" },
          shield: 25
        },
        KDA: [15, 5, 3]
      },
      i != 3 ? true : false,
      settings
    );
  }

  if (shownInformation.playerInformation.shown && !shownInformation.playerInformation.lastShown) {
    shownInformation.playerInformation.running = true;
    shownInformation.playerInformation.t = 0;
  }

  if (shownInformation.playerInformation.running) {
  }

  // Draw overlay overlay
  if (settings.series.maps.length > 0) {
    seriesMaps(ctx, settings);
  }

  const gradient = ctx.createLinearGradient(0, 0, 500, 0);
  gradient.addColorStop(0, `rgba(0, 0, 0, 1)`);
  gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
  ctx.fillStyle = gradient;

  ctx.fillRect(0, 25, 500, 25);

  drawCenteredText(
    ctx,
    settings.series.seriesName,
    5,
    12.5 + 25,
    "20px 'Din Next'",
    "white",
    "left",
    "middle"
  );

  if (settings.sponsors.sponsorEnabled) {
    // Update sponsor images with new data
    if (settings.sponsors.sponsorImgs.length > 0) {
      settings.sponsors.sponsorImgs.forEach((img, i) => {
        if (sponsorImages[i]) {
          if (sponsorImages[i].src != img) {
            loadImg(img).then((img) => {
              sponsorImages[i] = img;
            });
          }
        } else {
          loadImg(img).then((img) => {
            sponsorImages[i] = img;
          });
        }
      });
    }

    sponsors(ctx, settings);
  }
}

function sponsors(ctx: CanvasRenderingContext2D, settings: OverlaySettings): void {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  const w = 350;
  const h = 150;
  ctx.fillRect(1920 - w, 0, w, h);

  function getIndexFromTime(timestamp: number, delay: number, listLength: number) {
    return Math.floor(timestamp / delay) % listLength;
  }

  try {
    if (settings.sponsors.sponsorImgs.length > 0) {
      const index = getIndexFromTime(
        performance.now(),
        100000,
        settings.sponsors.sponsorImgs.length
      );

      const iH = 100;
      const aspect = sponsorImages[index].width / sponsorImages[index].height;

      const iW = iH * aspect;
      ctx.drawImage(sponsorImages[index], 1920 - w / 2 - iW / 2, 25, iW, iH);
    }
  } catch {}
}

function seriesMaps(ctx: CanvasRenderingContext2D, settings: OverlaySettings): void {
  const gradient = ctx.createLinearGradient(0, 0, 500, 0);
  gradient.addColorStop(0, `rgba(0, 0, 0, 0.5)`);
  gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
  ctx.fillStyle = gradient;

  ctx.fillRect(0, 0, 500, 25);
  for (let i = 0; i < settings.series.maps.length; i++) {
    drawCenteredText(
      ctx,
      settings.series.maps[i],
      200 * i + 5,
      12.5,
      "20px 'Din Next'",
      "white",
      "left",
      "middle"
    );
  }
}

function roundWin(
  ctx: CanvasRenderingContext2D,
  ceromony: string,
  winningTeamName: string,
  winningTeamSide: string,
  roundNum: number,
  animationProgress: number = 0,
  settings: OverlaySettings
): void {
  bgGradient(ctx);
  ctx.filter = "none";
  const width = easeInOutExpo(800, 1000, animationDelay(0.2, 0.9, animationProgress));
  const height = easeInOutExpo(300, 200, animationDelay(0.2, 0.9, animationProgress));
  const roundInfoWidth = 250;
  const roundInfoHeight = 60;
  const locationY =
    animationProgress < 0.9
      ? easeInOutExpo(1080 / 2, 1080 - height / 2, animationDelay(0.2, 0.9, animationProgress))
      : easeInOutExpo(
          1080 - height / 2,
          1080 - height / 2 + height * 2,
          animationDelay(0.9, 1, animationProgress)
        );

  ctx.fillRect(1920 / 2 - width / 2, locationY - height / 2, width, height);
  ctx.fillStyle = `rgba(${atkC})`;
  ctx.fillRect(
    1920 / 2 - width / 2 + width / 2 - roundInfoWidth / 2,
    locationY - height / 2 - roundInfoHeight / 2,
    roundInfoWidth,
    roundInfoHeight
  );

  drawCenteredText(
    ctx,
    `ROUND ${roundNum}`,
    1920 / 2 - width / 2 + width / 2,
    locationY - height / 2,
    "40px 'Din Next'",
    "white",
    "center",
    "middle"
  );

  ctx.font = `${easeInOutExpo(150, 100, animationDelay(0.2, 0.9, animationProgress))}px 'Tungsten'`;

  if (settings.series.showBrandingImg && brandingImage) {
    // Calculate image size
    const brandingHeight = easeInOutExpo(80, 60, animationDelay(0.2, 0.9, animationProgress));
    const aspectRatio = brandingImage.width / brandingImage.height;
    const brandingWidth = brandingHeight * aspectRatio;
    ctx.drawImage(
      brandingImage,
      easeInOutExpo(
        1920 / 2 - brandingWidth / 2,
        1920 / 2 -
          width / 2 +
          25 +
          ctx.measureText(ceromony.toUpperCase()).width / 2 -
          brandingWidth / 2,
        animationDelay(0.2, 0.9, animationProgress)
      ),
      locationY - easeInOutExpo(100, 70, animationDelay(0.2, 0.9, animationProgress)),
      brandingWidth,
      brandingHeight
    );
  }

  drawCenteredText(
    ctx,
    ceromony.toUpperCase(),
    easeInOutExpo(
      1920 / 2 - ctx.measureText(ceromony.toUpperCase()).width / 2,
      1920 / 2 - width / 2 + 25,
      animationDelay(0.2, 0.9, animationProgress)
    ),
    locationY +
      (settings.series.showBrandingImg
        ? easeInOutExpo(50, 40, animationDelay(0.2, 0.9, animationProgress))
        : 0),
    `${easeInOutExpo(150, 100, animationDelay(0.2, 0.9, animationProgress))}px 'Tungsten'`,
    `rgb(${headerC})`,
    "left",
    "middle"
  );

  // Animation big box
  if (animationProgress <= 0.2) {
    ctx.fillStyle = `rgb(${accent})`;
    ctx.fillRect(
      1920 / 2 -
        width / 2 -
        10 +
        easeInOutExpo(0, width + 20, animationDelay(0, 0.2, animationProgress)),
      locationY - height / 2 - roundInfoHeight / 2 - 10,
      width + 20 - easeInOutExpo(0, width + 20, animationDelay(0, 0.2, animationProgress)),
      height + roundInfoHeight + 20
    );
  }

  drawCenteredText(
    ctx,
    winningTeamName.toUpperCase(),
    1920 / 2 + width / 2 - 25,
    locationY - 25,
    "60px 'Din Next'",
    `rgba(255, 255, 255, ${animationDelay(0.5, 0.9, animationProgress)})`,
    "right",
    "middle"
  );

  drawCenteredText(
    ctx,
    winningTeamSide.toUpperCase(),
    1920 / 2 + width / 2 - 25,
    locationY + 25,
    "60px 'Din Next'",
    winningTeamSide === "Attack"
      ? `rgba(${atkC}, ${animationDelay(0.5, 0.9, animationProgress)})`
      : `rgba(${defC}, ${animationDelay(0.5, 0.9, animationProgress)})`,
    "right",
    "middle"
  );
}

function score(
  ctx: CanvasRenderingContext2D,
  gameData: {
    attackerScore: number;
    defenderScore: number;
    attackerName: string;
    defenderName: string;
    roundNum: number;
  }
): void {
  const color = "15, 25, 35";
  const timerWidth = 140;
  const timerHeight = 72;

  const width = 200;
  ctx.filter = "none";

  // Draw left
  ctx.beginPath();
  ctx.moveTo(1920 / 2 - timerWidth / 2 - 1, timerHeight);
  ctx.lineTo(1920 / 2 - timerWidth / 2 - width, timerHeight);
  ctx.lineTo(1920 / 2 - timerWidth / 2 - width - timerHeight / 2, 0);
  ctx.lineTo(1920 / 2 - timerWidth / 2 - 1, 0);
  ctx.fillStyle = `rgb(${color})`;
  ctx.fill();
  ctx.closePath();

  // Draw right
  ctx.beginPath();
  ctx.moveTo(1920 / 2 + timerWidth / 2 + 1, timerHeight);
  ctx.lineTo(1920 / 2 + timerWidth / 2 + width, timerHeight);
  ctx.lineTo(1920 / 2 + timerWidth / 2 + width + timerHeight / 2, 0);
  ctx.lineTo(1920 / 2 + timerWidth / 2 + 1, 0);
  ctx.fillStyle = `rgb(${color})`;
  ctx.fill();
  ctx.closePath();

  // Draw outline around both
  ctx.beginPath();
  ctx.moveTo(1920 / 2 - timerWidth / 2 - width - timerHeight / 2 - 10, -5);
  ctx.lineTo(1920 / 2 - timerWidth / 2 - width - 5, timerHeight + 6);
  ctx.lineTo(1920 / 2 + timerWidth / 2 + width + 5, timerHeight + 6);
  ctx.lineTo(1920 / 2 + timerWidth / 2 + width + timerHeight / 2 + 10, -5);
  ctx.strokeStyle = `rgb(${color})`;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  // Draw branding
  drawCenteredText(
    ctx,
    "VCTTools.net",
    1920 / 2,
    timerHeight + 20,
    "20px 'Din Next'",
    `rgba(${color}, 0.5)`,
    "center",
    "middle"
  );

  // Attacker score and name
  drawCenteredText(
    ctx,
    gameData.attackerName.toUpperCase(),
    1920 / 2 - timerWidth / 2 - 20,
    timerHeight / 2 + 10,
    "42px Tungsten",
    "white",
    "right",
    "middle"
  );

  drawCenteredText(
    ctx,
    "ATK",
    1920 / 2 - timerWidth / 2 - 20,
    timerHeight / 2 - 20,
    "20px 'Din Next'",
    "white",
    "right",
    "middle"
  );

  drawCenteredText(
    ctx,
    gameData.attackerScore.toString(),
    1920 / 2 - timerWidth / 5 - width,
    timerHeight / 2 + 10,
    "42px Tungsten",
    `rgb(${atkC})`,
    "center",
    "middle"
  );

  // Time
  drawCenteredText(
    ctx,
    `ROUND ${gameData.roundNum}`,
    1920 / 2,
    timerHeight / 2 - 20,
    "20px 'Din Next'",
    "white",
    "center",
    "middle"
  );

  // Defender score and name
  drawCenteredText(
    ctx,
    gameData.defenderName.toUpperCase(),
    1920 / 2 + timerWidth / 2 + 20,
    timerHeight / 2 + 10,
    "42px Tungsten",
    "white",
    "left",
    "middle"
  );

  drawCenteredText(
    ctx,
    "DEF",
    1920 / 2 + timerWidth / 2 + 20,
    timerHeight / 2 - 20,
    "20px 'Din Next'",
    "white",
    "left",
    "middle"
  );

  drawCenteredText(
    ctx,
    gameData.defenderScore.toString(),
    1920 / 2 + timerWidth / 5 + width,
    timerHeight / 2 + 10,
    "42px Tungsten",
    `rgb(${defC})`,
    "center",
    "middle"
  );
}

async function playerLeft(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  player: PlayerData,
  alive: boolean,
  settings: OverlaySettings
): Promise<void> {
  const playerHealth = player.health;
  const ultProgress = [player.abilities.Ultimate.remainingUses, player.abilities.Ultimate.maxUses];
  const playerShields = player.loadout.shield;
  const agent = player.agent;
  const kda = player.KDA;
  const agentData = agents.find((a) => a.name == agent);
  if (!agentData) return;

  // get agent image
  if (!agentImages[agent]) {
    agentImages[agent] = await loadImg(agentData.icon);
  }

  if (!abilityImages[agent]) {
    abilityImages[agent] = {
      Ability1: await loadImg(agentData.abilities.Ability1.icon),
      Ability2: await loadImg(agentData.abilities.Ability2.icon),
      Signature: await loadImg(agentData.abilities.Signature.icon),
      Ultimate: await loadImg(agentData.abilities.Ultimate.icon)
    };
  }

  ctx.filter = alive ? "" : "grayscale(1)";
  ctx.fillStyle = `rgba(${defC}, 0.5)`;
  ctx.beginPath();
  ctx.roundRect(x, y - 30, alive ? 400 : 300, 30, [0, 0, 10, 10]);
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = `rgba(100, 100, 100, 1)`;
  ctx.fillRect(x, y - 30 - 10, alive ? 400 : 300, 10);

  if (alive) {
    ctx.fillStyle = `rgba(${defC}, 1)`;
    ctx.fillRect(x, y - 30 - 10, playerHealth * 4, 10);
  }

  drawCenteredText(
    ctx,
    nameFilter(player.name, player.tagline, settings),
    x + 6,
    y - 15,
    "bold 20px 'Din Next'",
    "white",
    "left",
    "middle"
  );

  ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
  ctx.beginPath();
  ctx.roundRect(x, y - 30 - 10 - 70, alive ? 400 : 300, 70, [10, 10, 0, 0]);
  ctx.fill();
  ctx.closePath();

  if (alive) {
    if (settings.playerOverlayFeatures.playerAbilities) {
      if (ultProgress[0] != ultProgress[1]) {
        (() => {
          const spacing = 12;
          const pointCount = ultProgress[1];
          const totalWidth = (pointCount - 1) * spacing;
          const location = x + 250 - totalWidth / 2;

          for (let i = 0; i < pointCount; i++) {
            ctx.fillStyle = ultProgress[0] > i ? "white" : "rgb(58, 58, 58)";
            ctx.beginPath();
            ctx.moveTo(location + i * spacing, y - 15);
            ctx.lineTo(location + 5 + i * spacing, y - 20);
            ctx.lineTo(location + 10 + i * spacing, y - 15);
            ctx.lineTo(location + 5 + i * spacing, y - 10);
            ctx.closePath();
            ctx.fill();
          }
        })();
      } else {
        ctx.fillStyle = `rgba(${defC}, 0.6)`;
        ctx.fillRect(x + 250 - 30, y - 30, 60, 30);

        // Draw ultimate icon
        ctx.drawImage(abilityImages[agent].Ultimate, x + 250 - 10, y - 25, 20, 20);
      }
    }

    // draw shield
    if (settings.playerOverlayFeatures.playerHealth) {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      const xSl = x + 335;
      const ySl = y - 27;

      ctx.beginPath();
      ctx.moveTo(xSl + 21, ySl + 11);
      ctx.bezierCurveTo(xSl + 21, ySl + 16.55, xSl + 17.16, ySl + 21.74, xSl + 12, ySl + 23);
      ctx.bezierCurveTo(xSl + 6.84, ySl + 21.74, xSl + 3, ySl + 16.55, xSl + 3, ySl + 11);
      ctx.lineTo(xSl + 3, ySl + 5);
      ctx.lineTo(xSl + 12, ySl + 1);
      ctx.lineTo(xSl + 21, ySl + 5);
      ctx.lineTo(xSl + 21, ySl + 11);
      ctx.closePath();
      ctx.stroke();

      // Draw health and shields
      drawCenteredText(
        ctx,
        playerHealth.toString(),
        x + 395,
        y - 15,
        "bold 20px 'Din Next'",
        "white",
        "right",
        "middle"
      );

      drawCenteredText(
        ctx,
        playerShields.toString(),
        x + 347,
        y - 15,
        "12px 'Din Next'",
        "white",
        "center",
        "middle"
      );
    }

    // Draw abilities
    if (settings.playerOverlayFeatures.playerAbilities) {
      if (player.abilities.Ability1.remainingUses == 0) ctx.filter = "opacity(0.3)";
      ctx.drawImage(abilityImages[agent].Ability1, x + 100, y - 30 - 10 - 70 + 35 / 2, 35, 35);
      ctx.filter = "none";

      if (player.abilities.Ability2.remainingUses == 0) ctx.filter = "opacity(0.3)";
      ctx.drawImage(abilityImages[agent].Ability2, x + 160, y - 30 - 10 - 70 + 35 / 2, 35, 35);
      ctx.filter = "none";

      if (player.abilities.Signature.remainingUses == 0) ctx.filter = "opacity(0.3)";
      ctx.drawImage(abilityImages[agent].Signature, x + 220, y - 30 - 10 - 70 + 35 / 2, 35, 35);
      ctx.filter = "none";
    }

    // Draw KDA
    if (settings.playerOverlayFeatures.playerKDA) {
      drawCenteredText(
        ctx,
        `${kda[0]} / ${kda[1]} / ${kda[2]}`,
        x + 330,
        y - 30 - 10 - 70 + 35,
        "20px 'Din Next'",
        "white",
        "center",
        "middle"
      );
    }
  }

  // Draw agent
  if (settings.playerOverlayFeatures.agentImages) {
    ctx.drawImage(agentImages[agent], x, y - 30 - 10 - 70, 70, 70);
  }
  ctx.filter = "none";
}

async function playerRight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  player: PlayerData,
  alive: boolean,
  settings: OverlaySettings
): Promise<void> {
  const playerHealth = player.health;
  const ultProgress = [player.abilities.Ultimate.remainingUses, player.abilities.Ultimate.maxUses];
  const playerShields = player.loadout.shield;
  const agent = player.agent;
  const kda = player.KDA;
  const agentData = agents.find((a) => a.name == agent);
  if (!agentData) return;

  // get agent image
  if (!agentImages[agent]) {
    agentImages[agent] = await loadImg(agentData.icon);
  }

  if (!abilityImages[agent]) {
    abilityImages[agent] = {
      Ability1: await loadImg(agentData.abilities.Ability1.icon),
      Ability2: await loadImg(agentData.abilities.Ability2.icon),
      Signature: await loadImg(agentData.abilities.Signature.icon),
      Ultimate: await loadImg(agentData.abilities.Ultimate.icon)
    };
  }

  ctx.filter = alive ? "" : "grayscale(1)";
  ctx.fillStyle = `rgba(${atkC}, 0.5)`;
  ctx.beginPath();
  ctx.roundRect(x - (alive ? 400 : 300), y - 30, alive ? 400 : 300, 30, [0, 0, 10, 10]);
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = `rgba(100, 100, 100, 1)`;
  ctx.fillRect(x - (alive ? 400 : 300), y - 30 - 10, alive ? 400 : 300, 10);

  if (alive) {
    ctx.fillStyle = `rgba(${atkC}, 1)`;
    ctx.fillRect(x - playerHealth * 4, y - 30 - 10, playerHealth * 4, 10);
  }

  drawCenteredText(
    ctx,
    nameFilter(player.name, player.tagline, settings),
    x - 6,
    y - 15,
    "bold 20px 'Din Next'",
    "white",
    "right",
    "middle"
  );

  ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
  ctx.beginPath();
  ctx.roundRect(x - (alive ? 400 : 300), y - 30 - 10 - 70, alive ? 400 : 300, 70, [10, 10, 0, 0]);
  ctx.fill();
  ctx.closePath();

  if (alive) {
    if (settings.playerOverlayFeatures.playerAbilities) {
      if (ultProgress[0] != ultProgress[1]) {
        (() => {
          const spacing = 12;
          const pointCount = ultProgress[1];
          const totalWidth = (pointCount - 1) * spacing;
          const location = x - 250 - totalWidth / 2;

          for (let i = 0; i < pointCount; i++) {
            ctx.fillStyle = ultProgress[0] > i ? "white" : "rgb(58, 58, 58)";
            ctx.beginPath();
            ctx.moveTo(location + i * spacing, y - 15);
            ctx.lineTo(location + 5 + i * spacing, y - 20);
            ctx.lineTo(location + 10 + i * spacing, y - 15);
            ctx.lineTo(location + 5 + i * spacing, y - 10);
            ctx.closePath();
            ctx.fill();
          }
        })();
      } else {
        ctx.fillStyle = `rgba(${atkC}, 0.6)`;
        ctx.fillRect(x - 250 - 30, y - 30, 60, 30);

        // Draw ultimate icon
        ctx.drawImage(abilityImages[agent].Ultimate, x - 250 - 10, y - 25, 20, 20);
      }
    }

    // draw shield
    if (settings.playerOverlayFeatures.playerHealth) {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      const xSl = x - 359;
      const ySl = y - 27;

      ctx.beginPath();
      ctx.moveTo(xSl + 21, ySl + 11);
      ctx.bezierCurveTo(xSl + 21, ySl + 16.55, xSl + 17.16, ySl + 21.74, xSl + 12, ySl + 23);
      ctx.bezierCurveTo(xSl + 6.84, ySl + 21.74, xSl + 3, ySl + 16.55, xSl + 3, ySl + 11);
      ctx.lineTo(xSl + 3, ySl + 5);
      ctx.lineTo(xSl + 12, ySl + 1);
      ctx.lineTo(xSl + 21, ySl + 5);
      ctx.lineTo(xSl + 21, ySl + 11);
      ctx.closePath();
      ctx.stroke();

      // Draw health and shields
      drawCenteredText(
        ctx,
        playerHealth.toString(),
        x - 395,
        y - 15,
        "bold 20px 'Din Next'",
        "white",
        "left",
        "middle"
      );

      drawCenteredText(
        ctx,
        playerShields.toString(),
        x - 347,
        y - 15,
        "12px 'Din Next'",
        "white",
        "center",
        "middle"
      );
    }

    // Draw abilities
    if (settings.playerOverlayFeatures.playerAbilities) {
      if (player.abilities.Ability1.remainingUses == 0) ctx.filter = "opacity(0.3)";
      ctx.drawImage(abilityImages[agent].Ability1, x - 255, y - 30 - 10 - 70 + 35 / 2, 35, 35);
      ctx.filter = "none";

      if (player.abilities.Ability2.remainingUses == 0) ctx.filter = "opacity(0.3)";
      ctx.drawImage(abilityImages[agent].Ability2, x - 195, y - 30 - 10 - 70 + 35 / 2, 35, 35);
      ctx.filter = "none";

      if (player.abilities.Signature.remainingUses == 0) ctx.filter = "opacity(0.3)";
      ctx.drawImage(abilityImages[agent].Signature, x - 135, y - 30 - 10 - 70 + 35 / 2, 35, 35);
      ctx.filter = "none";
    }

    // Draw KDA
    if (settings.playerOverlayFeatures.playerKDA) {
      drawCenteredText(
        ctx,
        `${kda[0]} / ${kda[1]} / ${kda[2]}`,
        x - 330,
        y - 30 - 10 - 70 + 35,
        "20px 'Din Next'",
        "white",
        "center",
        "middle"
      );
    }
  }

  // Draw agent
  if (settings.playerOverlayFeatures.agentImages) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(agentImages[agent], -x, y - 30 - 10 - 70, 70, 70);
    ctx.restore();
  }
  ctx.filter = "none";
}

export {
  type GameData,
  type PlayerData,
  type LoadoutData,
  type AbilityData,
  type Gun,
  type Round,
  shownInformation
};
