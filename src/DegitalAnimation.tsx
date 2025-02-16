import { onCleanup, onMount } from "solid-js";

export default function DigitalAnimation() {
  let canvas: HTMLCanvasElement | undefined;
  let animationFrame: number = 0;

  onMount(() => {
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    // キャンバスのサイズをセット
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.floor(canvas.width / 20);
    const drops = new Array(cols).fill(1);

    function draw() {
      if (!ctx || !canvas) return;
      // 少し透過した黒で前の描画を引き伸ばす
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 緑色の文字の描画
      ctx.fillStyle = "#0F0";
      ctx.font = "20px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillText(text, i * 20, drops[i] * 20);
        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrame = requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    onCleanup(() => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
    });
  });

  return (
    <canvas
      ref={canvas}
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        "z-index": "-1",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
