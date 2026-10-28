// Makes a "preview copy" of a document image (certificate, proof of work),
// in the browser, before upload:
// - shrinks it (max 1400px on the longest side): readable on screen, poor for printing
// - stamps your name and a note diagonally across the whole image, repeated
// Only this copy is uploaded. The original never leaves your computer.

const MAX_SIDE = 1400;

export async function watermarkImage(
  file: File,
  ownerName: string,
  note = "portfolio preview · not valid as proof",
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't prepare the image. Try Chrome or Edge.");

  ctx.fillStyle = "#ffffff"; // white behind transparent PNGs
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Repeated diagonal text, tiled across the whole picture
  const text = `${ownerName || "Portfolio"} · ${note}`;
  const fontSize = Math.max(14, Math.round(Math.min(width, height) / 22));
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
  ctx.textBaseline = "middle";
  const stepX = ctx.measureText(text).width + fontSize * 3;
  const stepY = fontSize * 5;

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 7); // about -25°
  const reach = Math.hypot(width, height); // cover the corners after rotating
  for (let y = -reach; y < reach; y += stepY) {
    // Offset every other row so the stamps form a brick pattern
    const offset = (Math.round(y / stepY) % 2) * (stepX / 2);
    for (let x = -reach - offset; x < reach; x += stepX) {
      // Dark text with a light edge, so it shows on both light and dark certificates
      ctx.lineWidth = Math.max(1, fontSize / 10);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
      ctx.fillText(text, x, y);
    }
  }
  ctx.restore();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("Couldn't prepare the image.");
  return new File([blob], "preview.jpg", { type: "image/jpeg" });
}
