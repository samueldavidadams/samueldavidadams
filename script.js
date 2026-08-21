const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

const SPEED = 100;
const MAX_SATS = 75;
const maxDist = 60;
const start = Date.now();

const points = [];
const sats = [];

let W, H;

function sizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

async function loadSats() {
  try {
    const response = await fetch("/tle.txt");
    const text = await response.text();
    const lines = text.trim().split("\n");

    const total = Math.floor(lines.length / 3);
    const step = Math.max(1, Math.floor(total / MAX_SATS));

    for (let i = 0; i < lines.length; i += 3 * step) {
      const l1 = lines[i + 1];
      const l2 = lines[i + 2];
      if (!l1 || !l2) continue;

      sats.push({
        name: lines[i].trim(),
        rec: satellite.twoline2satrec(l1.trim(), l2.trim())
      });
    }

    console.log(sats.length + " satellites parsed");
  } catch (error) {
    console.error("TLE load failed:", error);
  }
}

function updatePositions() {
  const time = new Date(start + (Date.now() - start) * SPEED);
  const gmst = satellite.gstime(time);

  points.length = 0;

  for (const s of sats) {
    const pv = satellite.propagate(s.rec, time);
    if (!pv || !pv.position) continue;

    const geo = satellite.eciToGeodetic(pv.position, gmst);
    const lon = satellite.degreesLong(geo.longitude);
    const lat = satellite.degreesLat(geo.latitude);
    if (isNaN(lon) || isNaN(lat)) continue;

    points.push({
      x: (lon + 180) / 360 * W,
      y: (90 - lat) / 180 * H,
      name: s.name
    });
  }
}

function draw() {
  // clear
  ctx.fillStyle = "rgba(4, 6, 11, 0.9)";
  ctx.fillRect(0, 0, W, H);

  // pass 1 — positions from orbital elements
  updatePositions();

  // pass 2 — lines
  ctx.lineWidth = 0.8;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        ctx.strokeStyle = "rgba(135, 195, 245, " + (1 - dist / maxDist) * 0.35 + ")";
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }
  }

  // pass 3 — dots
  ctx.fillStyle = "rgba(205, 232, 255, 0.2)";

  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

window.addEventListener("resize", sizeCanvas);

sizeCanvas();
loadSats();
draw();