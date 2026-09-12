const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

const COUNT = 200;
const STEP = 0.3;
const TRAIL = 25;
const BG = "#04060b";

let W, H;
const particles = [];

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

function respawn(p) {
  p.x = Math.random() * W;
  p.y = Math.random() * H;
  p.life = 180 + Math.random() * 260;
  p.hist = [p.x, p.y];
}

function flow(x, y, t) {
  return (
    Math.sin(x * 0.0041 + t * 0.00012) +
    Math.cos(y * 0.0036 - t * 0.00009) +
    Math.sin((x + y) * 0.0019 + t * 0.00006)
  ) * 1.85;
}

function draw(t) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  ctx.lineWidth = 0.55;
  ctx.strokeStyle = "rgba(155, 205, 250, 0.30)";
  ctx.beginPath();

  for (const p of particles) {
    const angle = flow(p.x, p.y, t);
    p.x += Math.cos(angle) * STEP;
    p.y += Math.sin(angle) * STEP;
    p.life--;

    if (p.life < 0 || p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
      respawn(p);
      continue;
    }

    p.hist.push(p.x, p.y);
    if (p.hist.length > TRAIL * 2) p.hist.splice(0, 2);

    ctx.moveTo(p.hist[0], p.hist[1]);
    for (let i = 2; i < p.hist.length; i += 2) {
      ctx.lineTo(p.hist[i], p.hist[i + 1]);
    }
  }

  ctx.stroke();
  requestAnimationFrame(draw);
}

window.addEventListener("resize", sizeCanvas);

sizeCanvas();
for (let i = 0; i < COUNT; i++) {
  const p = {};
  respawn(p);
  p.life = Math.random() * 260;
  particles.push(p);
}
requestAnimationFrame(draw);