import * as A from "./kit/audit.mjs";
import * as M from "./mechanism.mjs";
import { instrument, recordMechanism } from "./instrument.mjs";

export function auditPose(mode, time = 0.22, eccentricity = 0.094) {
  const fixed = instrument();
  const R = recordMechanism(M.mechanismItems(mode, time, eccentricity), fixed.recorder);
  A.settle(R, M.PROJECTION, { step: 0.8, states: [0] });
  R.items.forEach((item, index) => { item.key = index; });
  console.log(`Pose: era ${mode + 1}, time ${time}, eccentricity ${eccentricity}`);
  return A.auditOrExit(R, M.PROJECTION, { argv: ["--audit"], apart: false, frames: [0] });
}

if (process.argv[1]?.endsWith("audit.mjs")) {
  const mode = Number(process.argv.find((arg) => arg.startsWith("--mode="))?.split("=")[1] ?? 0);
  const time = Number(process.argv.find((arg) => arg.startsWith("--time="))?.split("=")[1] ?? 0.22);
  const e = Number(process.argv.find((arg) => arg.startsWith("--ecc="))?.split("=")[1] ?? 0.094);
  auditPose(mode, time, e);
}
