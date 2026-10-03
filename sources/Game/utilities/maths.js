function clamp(input, min, max)
{
    return Math.max(min, Math.min(input, max))
}

function remap(input, inLow, inHigh, outLow, outHigh)
{
    return ((input - inLow) * (outHigh - outLow)) / (inHigh - inLow) + outLow
}

function remapClamp(input, inLow, inHigh, outLow, outHigh)
{
    return clamp(((input - inLow) * (outHigh - outLow)) / (inHigh - inLow) + outLow, outLow < outHigh ? outLow : outHigh, outLow > outHigh ? outLow : outHigh)
}

function lerp(start, end, ratio)
{
    return (1 - ratio) * start + ratio * end
}

function smoothstep(value, min, max)
{
    const x = clamp((value - min) / (max - min), 0, 1)
    return x * x * (3 - 2 * x)
}

function safeMod(n, m)
{
    return ((n % m) + m) % m
}

function signedModDelta(a, b, mod)
{
    let delta = (b - a + mod) % mod
    if(delta > mod / 2)
        delta -= mod
    return delta
}

function segmentCircleIntersection(x1, y1, x2, y2, cx, cy, r)
{
    const dx = x2 - x1
    const dy = y2 - y1

    const fx = x1 - cx
    const fy = y1 - cy

    const a = dx * dx + dy * dy
    const b = 2 * (fx * dx + fy * dy)
    const c = fx * fx + fy * fy - r * r

    const discriminant = b * b - 4 * a * c
    if (discriminant < 0)
    {
        return [] // No intersection
    }

    const intersections = []
    const sqrtD = Math.sqrt(discriminant)

    const t1 = (-b - sqrtD) / (2 * a)
    const t2 = (-b + sqrtD) / (2 * a)

    if(t1 >= 0 && t1 <= 1)
    {
        intersections.push({ 
            x: x1 + t1 * dx, 
            y: y1 + t1 * dy 
        })
    }

    if(t2 >= 0 && t2 <= 1 && discriminant !== 0)
    {
        intersections.push({ 
            x: x1 + t2 * dx, 
            y: y1 + t2 * dy 
        })
    }

    return intersections
}

const TAU = 2 * Math.PI
var mod = function (a, n) { return ( a % n + n ) % n } // modulo

var equivalent = function (a) { return mod(a + Math.PI, TAU) - Math.PI } // [-π, +π]

function smallestAngle(current, target)
{
    return equivalent(target - current)
}

function dist(a, b)
{
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
}

function lineIntersectsCircle(p1, p2, center, radius)
{
    // Vector from p1 to p2
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y

    // Vector from p1 to circle center
    const fx = center.x - p1.x
    const fy = center.y - p1.y

    // Project fx,fy onto dx,dy — normalized t position
    const t = (fx * dx + fy * dy) / (dx * dx + dy * dy)

    let closest = null

    if(t < 0)
        closest = p1 // closest at segment start
    else if(t > 1)
        closest = p2 // closest at segment end
    else
        closest = { x: p1.x + t * dx, y: p1.y + t * dy } // projection point

    return dist(closest, center) <= radius
}

function pointInPolygon(point, poly)
{
    let inside = false

    for(let i = 0, j = poly.length - 1; i < poly.length; j = i++)
    {
        const xi = poly[i].x, yi = poly[i].y
        const xj = poly[j].x, yj = poly[j].y

        const intersect =
            ((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)

        if(intersect)
            inside = !inside
    }

    return inside
}

function circleIntersectsPolygon(center, radius, poly)
{
    // Check if any vertex of polygon is inside circle
    for (const p of poly)
    {
        if(dist(p, center) <= radius)
            return true
    }

    // Check if any edge intersects circle
    for(let i = 0; i < poly.length; i++)
    {
        const p1 = poly[i]
        const p2 = poly[(i + 1) % poly.length]
        if(lineIntersectsCircle(p1, p2, center, radius))
            return true
    }

    // Check if circle center is inside polygon
    if(pointInPolygon(center, poly))
        return true

    return false
}

export {
    clamp,
    remap,
    remapClamp,
    lerp,
    smoothstep,
    safeMod,
    signedModDelta,
    smallestAngle,
    segmentCircleIntersection,
    dist,
    lineIntersectsCircle,
    pointInPolygon,
    circleIntersectsPolygon
}
