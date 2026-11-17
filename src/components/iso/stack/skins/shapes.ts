// Path builders for the line-art skins: absolute M/L/H/V/A/Z only, numbers rounded to 2 decimals.

function n (value: number): string {
  return String(Math.round(value * 100) / 100)
}

// A rectangle, rounded when `r` > 0 (drawn clockwise from the top-left corner).
export function rect (x: number, y: number, w: number, h: number, r = 0): string {
  if (r <= 0) return `M${n(x)} ${n(y)} H${n(x + w)} V${n(y + h)} H${n(x)} Z`
  const arc = (ex: number, ey: number): string => `A${n(r)} ${n(r)} 0 0 1 ${n(ex)} ${n(ey)}`
  return [
    `M${n(x + r)} ${n(y)}`, `H${n(x + w - r)}`, arc(x + w, y + r),
    `V${n(y + h - r)}`, arc(x + w - r, y + h),
    `H${n(x + r)}`, arc(x, y + h - r),
    `V${n(y + r)}`, arc(x + r, y), 'Z',
  ].join(' ')
}

// A full circle as two half arcs.
export function circle (cx: number, cy: number, r: number): string {
  return `M${n(cx - r)} ${n(cy)} A${n(r)} ${n(r)} 0 1 1 ${n(cx + r)} ${n(cy)} A${n(r)} ${n(r)} 0 1 1 ${n(cx - r)} ${n(cy)} Z`
}

// A pill: a rounded rect whose radius is half its height.
export function pill (x: number, y: number, w: number, h: number): string {
  return rect(x, y, w, h, h / 2)
}

export function hline (x: number, y: number, w: number): string {
  return `M${n(x)} ${n(y)} H${n(x + w)}`
}

export function vline (x: number, y: number, h: number): string {
  return `M${n(x)} ${n(y)} V${n(y + h)}`
}

// An open (or closed) polyline through the points.
export function poly (points: [number, number][], close = false): string {
  const d = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${n(x)} ${n(y)}`).join(' ')
  return close ? `${d} Z` : d
}
