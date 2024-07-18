import lz from "lz-string";

const CURRENT_VERSION = 3;
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

export function blankSave(): Save {
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
  let save: Save = blankSave();
  save.wasBoughtOut = true;
  save.money = 40;
  return save;
}

export function updateSave(save: Save, data: Partial<Save>): Save {
  return { ...save, ...data };
}

export function encodeSave(save: Save): string {
  return lz.compressToBase64(JSON.stringify(save));
}

export function decodeSave(save: string): Save {
  return JSON.parse(lz.decompressFromBase64(save));
}

export function writeSaveToLocalStorage(save: Save): void {
  localStorage.setItem(ITEM_KEY, encodeSave(save));
  console.log("Wrote save to local storage.");
}

export function readSaveFromLocalStorage(): Save {
  const item = localStorage.getItem(ITEM_KEY);

  if (item === null) {
    console.log("Found no save in local storage.");
    return blankSave();
  }

  try {
    let save: Save = decodeSave(item);
    console.log("Read save from local storage.");
    return save;
  } catch (e) {
    console.error("Failed to read save from local storage.", e);
    console.log("Assuming old save. Having Nestlé buy them out.");
    return nestléSave();
  }
}

/**
 * Clean up save after loading from an external source (local storage, import).
 */
export function rectifySave(save: Save): Save {
  save = updateSave(blankSave(), save); // add all missing variables; also, mutating argument BAD!~ >:(

  if (save.version !== CURRENT_VERSION) {
    console.log(
      `Save version is ${save.version} while current version is ${CURRENT_VERSION}. Having Nestlé buy them out.`,
    );
    return nestléSave();
  }

  // compatibility for older saves (of same version, oops!)
  // can be removed next save version.
  if (save.robertSoldBottles > 0) {
    save.hasRobert = true;
  }
  if (save.specialistSoldBottles > 0) {
    save.hasSpecialist = true;
  }
  if (save.fillerFilledBottles > 0) {
    save.hasFiller = true;
  }

  return save;
}
