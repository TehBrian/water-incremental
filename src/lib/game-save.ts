import lz from "lz-string";

const CURRENT_VERSION = 2;
const ITEM_KEY = "water-incremental-save";

export type Save = {
  version: number;
  wasBoughtOut: boolean;
  money: number;
  hasBoughtBottle: boolean;
  emptyBottles: number;
  hasFilledBottle: boolean;
  filledBottles: number;
  hasSoldBottle: boolean;
  soldBottles: number;
  helpCount: number;
  brandName: string | null;
  hasRobert: boolean;
  robertSoldBottles: number;
  payingRobert: boolean;
  hasSpecialist: boolean;
  specialistSoldBottles: number;
  hasFiller: boolean;
  fillerFilledBottles: number;
};

function emptySave(): Save {
  return {
    version: CURRENT_VERSION,
    wasBoughtOut: false,
    money: 5,
    hasBoughtBottle: false,
    emptyBottles: 0,
    hasFilledBottle: false,
    filledBottles: 0,
    hasSoldBottle: false,
    soldBottles: 0,
    helpCount: 0,
    brandName: null,
    hasRobert: false,
    robertSoldBottles: 0,
    payingRobert: false,
    hasSpecialist: false,
    specialistSoldBottles: 0,
    hasFiller: false,
    fillerFilledBottles: 0,
  } satisfies Save;
}

function nestléSave(): Save {
  let save: Save = emptySave();
  save.wasBoughtOut = true;
  save.money = 25;
  return save;
}

export let activeSave: Save = emptySave();

export function updateActiveSave(data: Partial<Save>): void {
  activeSave = { ...activeSave, ...data };
}

function writeSave(save: Save): void {
  localStorage.setItem(ITEM_KEY, lz.compressToBase64(JSON.stringify(save)));
  console.log("Wrote save to local storage.");
}

export function writeActiveSave(): void {
  writeSave(activeSave);
}

function readSave(): Save {
  const item = localStorage.getItem(ITEM_KEY);

  if (item === null) {
    console.log("Found no save in local storage.");
    return emptySave();
  }

  try {
    let save: Save = JSON.parse(lz.decompressFromBase64(item));
    console.log("Read save from local storage.");

    if (save.version !== CURRENT_VERSION) {
      console.log(
        `Save version is ${save.version} while current version is ${CURRENT_VERSION}. Having Nestlé buy them out.`,
      );
      return nestléSave();
    }

    return save;
  } catch (e) {
    console.error("Failed to read save from local storage.", e);
    console.log("Assuming old save. Having Nestlé buy them out.");
    return nestléSave();
  }
}

export function readActiveSave(): void {
  activeSave = readSave();
}
