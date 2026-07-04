import { describe, expect, it } from "vitest";
import FAMILIES, {
  LEAF_ORDER,
  familyOfLeaf,
  modeOfLeaf,
  announceLabel,
  pathForLeaf,
  leafForPath,
} from "./tabs";

describe("tabs data model", () => {
  it("exposes four ID families with UUID first", () => {
    expect(FAMILIES.map((f) => f.id)).toEqual(["uuid", "ulid", "nanoid", "ksuid"]);
  });

  it("flattens to six leaves in the keyboard jump order", () => {
    expect(LEAF_ORDER).toEqual([
      "generator",
      "validator",
      "converter",
      "ulid",
      "nanoid",
      "ksuid",
    ]);
  });

  it("models UUID with three modes and the others with one", () => {
    expect(FAMILIES[0].modes).toHaveLength(3);
    expect(FAMILIES[1].modes).toHaveLength(1);
    expect(FAMILIES[2].modes).toHaveLength(1);
    expect(FAMILIES[3].modes).toHaveLength(1);
  });
});

describe("familyOfLeaf / modeOfLeaf", () => {
  it("maps each UUID leaf back to the uuid family", () => {
    for (const leaf of ["generator", "validator", "converter"]) {
      expect(familyOfLeaf(leaf).id).toBe("uuid");
    }
  });

  it("maps the standalone leaves to their own family", () => {
    expect(familyOfLeaf("ulid").id).toBe("ulid");
    expect(familyOfLeaf("nanoid").id).toBe("nanoid");
    expect(familyOfLeaf("ksuid").id).toBe("ksuid");
  });

  it("returns the mode descriptor for a leaf", () => {
    expect(modeOfLeaf("validator").id).toBe("validate");
    expect(modeOfLeaf("validator").label).toBe("Validate");
  });

  it("falls back to the default family/mode for unknown leaves", () => {
    expect(familyOfLeaf("nope").id).toBe("uuid");
    expect(modeOfLeaf("nope").id).toBe("generate");
  });
});

describe("announceLabel", () => {
  it("names family and mode for multi-mode families", () => {
    expect(announceLabel("generator")).toBe("UUID Generate");
    expect(announceLabel("validator")).toBe("UUID Validate");
    expect(announceLabel("converter")).toBe("UUID Convert");
  });

  it("names only the family for single-mode families", () => {
    expect(announceLabel("ulid")).toBe("ULID");
    expect(announceLabel("nanoid")).toBe("NanoID");
    expect(announceLabel("ksuid")).toBe("KSUID");
  });

  it("returns the raw value for an unknown leaf", () => {
    expect(announceLabel("mystery")).toBe("mystery");
  });
});

describe("pathForLeaf", () => {
  it("returns canonical family/mode paths", () => {
    expect(pathForLeaf("generator")).toBe("/uuid/generate");
    expect(pathForLeaf("validator")).toBe("/uuid/validate");
    expect(pathForLeaf("converter")).toBe("/uuid/convert");
    expect(pathForLeaf("ulid")).toBe("/ulid");
    expect(pathForLeaf("nanoid")).toBe("/nanoid");
    expect(pathForLeaf("ksuid")).toBe("/ksuid");
  });
});

describe("leafForPath", () => {
  it("resolves canonical paths", () => {
    expect(leafForPath("/uuid/generate")).toBe("generator");
    expect(leafForPath("/uuid/validate")).toBe("validator");
    expect(leafForPath("/uuid/convert")).toBe("converter");
    expect(leafForPath("/ulid")).toBe("ulid");
    expect(leafForPath("/nanoid")).toBe("nanoid");
    expect(leafForPath("/ksuid")).toBe("ksuid");
  });

  it("resolves a bare /uuid to the first UUID mode", () => {
    expect(leafForPath("/uuid")).toBe("generator");
  });

  it("resolves legacy single-segment paths", () => {
    expect(leafForPath("/generator")).toBe("generator");
    expect(leafForPath("/validator")).toBe("validator");
    expect(leafForPath("/bulk")).toBe("validator");
    expect(leafForPath("/converter")).toBe("converter");
  });

  it("defaults unknown paths to the generator leaf", () => {
    expect(leafForPath("/")).toBe("generator");
    expect(leafForPath("/totally-unknown")).toBe("generator");
  });

  it("round-trips every leaf through its canonical path", () => {
    for (const leaf of LEAF_ORDER) {
      expect(leafForPath(pathForLeaf(leaf))).toBe(leaf);
    }
  });
});
