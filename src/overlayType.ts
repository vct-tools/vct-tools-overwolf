type PlayerOverlayFeatures = {
  playerAbilities: boolean;
  playerHealth: boolean;
  agentImages: boolean;
  playerKDA: boolean;
};

type GameOverviewVisible = {
  KDA: boolean;
  loadout: boolean;
  abilities: boolean;
  shields: boolean;
  agentImages: boolean;
  matchLog: boolean;
};

type OtherOverlayFeatures = {
  gameOverviewDuringBuyPhase: boolean;
  roundOutcomeBanner: boolean;
};

type RoundOutcomeBanner = {
  clutch: boolean;
  flawless: boolean;
  ace: boolean;
  teamAce: boolean;
  thrifty: boolean;
};

type SeriesInformation = {
  maps: string[];
  brandingImg: string | null;
  showBrandingImg: boolean;
  seriesName: string;
};

type SponsorInformation = {
  sponsorEnabled: boolean;
  sponsorImgs: string[];
};

type OverlaySettings = {
  playerOverlayFeatures: PlayerOverlayFeatures;
  gameOverviewVisible: GameOverviewVisible;
  otherOverlayFeatures: OtherOverlayFeatures;
  roundOutcomeBanner: RoundOutcomeBanner;
  nameType: "Name" | "Name and tagline";
  redTeamName: string;
  blueTeamName: string;
  series: SeriesInformation;
  sponsors: SponsorInformation;
};

function createDefaultOverlaySettings(): OverlaySettings {
  return {
    nameType: "Name",
    redTeamName: "TEAM2",
    blueTeamName: "TEAM1",
    playerOverlayFeatures: {
      playerAbilities: true,
      playerHealth: true,
      agentImages: true,
      playerKDA: true
    },
    gameOverviewVisible: {
      KDA: true,
      loadout: true,
      abilities: true,
      shields: true,
      agentImages: true,
      matchLog: true
    },
    otherOverlayFeatures: {
      gameOverviewDuringBuyPhase: true,
      roundOutcomeBanner: true
    },
    roundOutcomeBanner: {
      clutch: true,
      flawless: true,
      ace: true,
      teamAce: true,
      thrifty: true
    },
    series: {
      maps: ["Ascent (TEAM1)", "Bind (TEAM2)", "Fracture (DECIDER)"],
      brandingImg: null,
      showBrandingImg: false,
      seriesName: "Tournament Name - Lower Bracket Series 1"
    },
    sponsors: {
      sponsorEnabled: false,
      sponsorImgs: []
    }
  };
}

export { type OverlaySettings, createDefaultOverlaySettings };
