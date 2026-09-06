"""
generate_icons.py — Openhead icon generator.

Usage:
  python3 scripts/generate_icons.py [source.png]

If [source.png] is provided, it is used as the base image (resized to
multiple sizes via Pillow if available, or raw-copied for 512x512).
If no argument is provided, a programmatic placeholder is generated.
"""

import struct
import zlib
import os
import sys


def create_placeholder_png(width, height, output_path):
    """Generate a simple circular Openhead-branded icon without Pillow."""
    raw_data = bytearray()
    cx, cy = width / 2.0, height / 2.0
    radius = width * 0.45
    inner_radius = width * 0.28

    for y in range(height):
        raw_data.append(0)
        for x in range(width):
            dx = x - cx
            dy = y - cy
            dist = (dx * dx + dy * dy) ** 0.5

            corner_limit = width * 0.48
            if abs(dx) > corner_limit or abs(dy) > corner_limit:
                r, g, b, a = 0, 0, 0, 0
            elif inner_radius * 0.65 <= dist <= radius:
                r, g, b, a = 245, 240, 225, 255
            elif dist < inner_radius * 0.65:
                r, g, b, a = 15, 23, 42, 255
            else:
                r, g, b, a = 0, 0, 0, 0

            raw_data.extend([r, g, b, a])

    _write_png_bytes(raw_data, width, height, output_path)


def _write_png_bytes(raw_data, width, height, output_path):
    png_signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xFFFFFFFF
    ihdr_chunk = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)

    compressed_data = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed_data) & 0xFFFFFFFF
    idat_chunk = struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', idat_crc)

    iend_crc = zlib.crc32(b'IEND') & 0xFFFFFFFF
    iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)

    with open(output_path, 'wb') as f:
        f.write(png_signature + ihdr_chunk + idat_chunk + iend_chunk)


def resize_with_pillow(source_path, width, height, output_path):
    try:
        from PIL import Image
        img = Image.open(source_path).convert('RGBA')
        img = img.resize((width, height), Image.LANCZOS)
        img.save(output_path, 'PNG')
        return True
    except ImportError:
        return False


def copy_png(source_path, output_path):
    with open(source_path, 'rb') as f:
        data = f.read()
    with open(output_path, 'wb') as f:
        f.write(data)


def create_ico(png_32_path, png_128_path, output_path):
    with open(png_32_path, 'rb') as f:
        png32_data = f.read()
    with open(png_128_path, 'rb') as f:
        png128_data = f.read()

    ico_header = struct.pack('<HHH', 0, 1, 2)
    offset = 6 + 16 * 2
    entry1 = struct.pack('<BBBBHHII', 32, 32, 0, 0, 1, 32, len(png32_data), offset)
    offset += len(png32_data)
    entry2 = struct.pack('<BBBBHHII', 128, 128, 0, 0, 1, 32, len(png128_data), offset)

    with open(output_path, 'wb') as f:
        f.write(ico_header + entry1 + entry2 + png32_data + png128_data)


def create_icns(png_512_path, output_path):
    with open(png_512_path, 'rb') as f:
        png_data = f.read()

    chunk_type = b'ic10'
    chunk_length = 8 + len(png_data)
    chunk = chunk_type + struct.pack('>I', chunk_length) + png_data

    total_length = 8 + len(chunk)
    header = b'icns' + struct.pack('>I', total_length)

    with open(output_path, 'wb') as f:
        f.write(header + chunk)


def main():
    icons_dir = os.path.join(os.path.dirname(__file__), '..', 'src-tauri', 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    source_png = sys.argv[1] if len(sys.argv) > 1 else None

    p32   = os.path.join(icons_dir, '32x32.png')
    p128  = os.path.join(icons_dir, '128x128.png')
    p256  = os.path.join(icons_dir, '128x128@2x.png')
    p512  = os.path.join(icons_dir, 'icon.png')
    p_ico  = os.path.join(icons_dir, 'icon.ico')
    p_icns = os.path.join(icons_dir, 'icon.icns')

    if source_png:
        print(f'Using source logo: {source_png}')
        pillow_ok = resize_with_pillow(source_png, 32, 32, p32)
        if not pillow_ok:
            print('  Pillow not found — generating placeholder for small sizes')
            create_placeholder_png(32, 32, p32)
        resize_with_pillow(source_png, 128, 128, p128) or create_placeholder_png(128, 128, p128)
        resize_with_pillow(source_png, 256, 256, p256) or create_placeholder_png(256, 256, p256)
        if not resize_with_pillow(source_png, 512, 512, p512):
            copy_png(source_png, p512)
    else:
        print('No source PNG — generating programmatic placeholder icons.')
        create_placeholder_png(32, 32, p32)
        create_placeholder_png(128, 128, p128)
        create_placeholder_png(256, 256, p256)
        create_placeholder_png(512, 512, p512)

    create_ico(p32, p128, p_ico)
    create_icns(p512, p_icns)
    print(f'Done. Icons written to: {icons_dir}')


if __name__ == '__main__':
    main()
