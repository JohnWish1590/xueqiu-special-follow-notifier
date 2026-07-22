"""Generate 16/48/128 icon sizes from source PNG (with proper transparency)."""
from PIL import Image
import os, sys

src = sys.argv[1] if len(sys.argv) > 1 else 'generated-images/Premium_Chrome_extension_toolb_2026-07-20T13-32-38.png'
out_dir = os.path.dirname(os.path.abspath(__file__))

img = Image.open(src).convert('RGBA')
for size in [16, 48, 128]:
    resized = img.resize((size, size), Image.LANCZOS)
    out = os.path.join(out_dir, f'icon{size}.png')
    resized.save(out, 'PNG')
    print(f'  {out}  ({resized.size})')
print('Done.')
