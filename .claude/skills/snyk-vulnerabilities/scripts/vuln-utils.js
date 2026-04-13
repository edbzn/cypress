/**
 * Semver ordering for X.Y.Z and optional pre-release (no build metadata).
 * Pre-release versions sort lower than the same core release.
 */
function parseSemverCore(v) {
  const s = String(v).replace(/^v/i, '')
  const plus = s.indexOf('+')
  const noBuild = plus === -1 ? s : s.slice(0, plus)
  const dash = noBuild.indexOf('-')
  const core = dash === -1 ? noBuild : noBuild.slice(0, dash)
  const prerelease = dash === -1 ? null : noBuild.slice(dash + 1)
  const parts = core.split('.').map((p) => parseInt(p, 10))
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return null
  }
  return { major: parts[0], minor: parts[1], patch: parts[2], prerelease }
}

function comparePrereleaseId(a, b) {
  const aNum = /^\d+$/.test(a)
  const bNum = /^\d+$/.test(b)
  if (aNum && bNum) {
    const na = parseInt(a, 10)
    const nb = parseInt(b, 10)
    if (na !== nb) return na < nb ? -1 : 1
    return 0
  }
  if (aNum !== bNum) return aNum ? -1 : 1
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function comparePrerelease(pa, pb) {
  if (pa === null && pb === null) return 0
  if (pa === null) return 1
  if (pb === null) return -1
  const aIds = pa.split('.')
  const bIds = pb.split('.')
  const n = Math.max(aIds.length, bIds.length)
  for (let i = 0; i < n; i++) {
    const ai = aIds[i]
    const bi = bIds[i]
    if (ai === undefined && bi === undefined) return 0
    if (ai === undefined) return -1
    if (bi === undefined) return 1
    const c = comparePrereleaseId(ai, bi)
    if (c !== 0) return c
  }
  return 0
}

function compareVersions(a, b) {
  const pa = parseSemverCore(a)
  const pb = parseSemverCore(b)
  if (!pa || !pb) {
    throw new TypeError(`Invalid semver: ${!pa ? JSON.stringify(a) : JSON.stringify(b)}`)
  }
  if (pa.major !== pb.major) return pa.major < pb.major ? -1 : 1
  if (pa.minor !== pb.minor) return pa.minor < pb.minor ? -1 : 1
  if (pa.patch !== pb.patch) return pa.patch < pb.patch ? -1 : 1
  return comparePrerelease(pa.prerelease, pb.prerelease)
}

module.exports = { compareVersions }
