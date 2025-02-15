import type { OverlaySettings } from "./overlayType";

export function ceromonyFilter(ceromony: string, settings: OverlaySettings) {
  if (ceromony == "Round Win") return "Round Win";
  if (ceromony == "Clutch") {
    if (settings.roundOutcomeBanner.clutch) return "Clutch";
    else return "Round Win";
  }
  if (ceromony == "Flawless") {
    if (settings.roundOutcomeBanner.flawless) return "Flawless";
    else return "Round Win";
  }
  if (ceromony == "Ace") {
    if (settings.roundOutcomeBanner.ace) return "Ace";
    else return "Round Win";
  }
  if (ceromony == "Team Ace") {
    if (settings.roundOutcomeBanner.teamAce) return "Team Ace";
    else return "Round Win";
  }
  if (ceromony == "Thrifty") {
    if (settings.roundOutcomeBanner.thrifty) return "Thrifty";
    else return "Round Win";
  }

  return "Round Win";
}

export function nameFilter(name: string, tagline: string, settings: OverlaySettings) {
  if (settings.nameType == "Name") return name;
  else return name + "#" + tagline;
}
