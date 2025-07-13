import confetti from "canvas-confetti";

export function launchConfetti(score: number, total: number) {
  // More confetti for higher scores
  const ratio = score / total;
  let particleCount = 100;
  let spread = 70;
  let colors = ["#00C48C", "#FFD600", "#FF647C"];
  if (ratio > 0.8) {
    particleCount = 200;
    spread = 120;
    colors = ["#00C48C", "#FFD600", "#FF647C", "#4F8CFF"];
  } else if (ratio > 0.5) {
    particleCount = 150;
    spread = 90;
  }
  confetti({
    particleCount,
    spread,
    origin: { y: 0.7 },
    colors,
  });
}
