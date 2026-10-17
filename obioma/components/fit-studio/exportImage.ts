/**
 * Rasterise the avatar SVG to a PNG with a small branded caption.
 * CSS custom properties are resolved first, since a standalone SVG image
 * cannot see the page's stylesheet.
 */
export async function exportAvatarPng(svg: SVGSVGElement, caption: string, filename: string) {
  const styles = getComputedStyle(document.documentElement);
  const resolveVars = (s: string) =>
    s.replace(/var\((--[\w-]+)\)/g, (_, name: string) => styles.getPropertyValue(name).trim() || 'currentColor');

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', '960');
  clone.setAttribute('height', '1640');
  const markup = resolveVars(new XMLSerializer().serializeToString(clone)).replace(/mix-blend-mode:\s*multiply;?/g, '');

  const img = new Image();
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Could not render image'));
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d')!;
  const ivory = styles.getPropertyValue('--color-ivory').trim();
  const obsidian = styles.getPropertyValue('--color-obsidian').trim();
  const gold = styles.getPropertyValue('--color-gold').trim();
  ctx.fillStyle = ivory;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 60, 60, 960, 1640);
  URL.revokeObjectURL(url);

  ctx.fillStyle = gold;
  ctx.fillRect(500, 1730, 80, 1);
  ctx.fillStyle = obsidian;
  ctx.textAlign = 'center';
  ctx.font = '500 34px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('O B I O M A', 540, 1790);
  ctx.font = '400 22px Manrope, system-ui, sans-serif';
  ctx.fillText(caption, 540, 1840);

  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename;
  a.click();
}
