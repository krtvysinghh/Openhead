import struct
import zlib
import os

def create_png(width, height, output_path):
    raw_data = bytearray()
    cx, cy = width / 2.0, height / 2.0
    radius = width * 0.45
    inner_radius = width * 0.28
    
    for y in range(height):
        raw_data.append(0) # filter type 0
        for x in range(width):
            dx = x - cx
            dy = y - cy
            dist = (dx * dx + dy * dy) ** 0.5
            
            corner_limit = width * 0.48
            if abs(dx) > corner_limit or abs(dy) > corner_limit:
                r, g, b, a = 0, 0, 0, 0
            else:
                if inner_radius * 0.65 <= dist <= radius:
                    factor = (y / height)
                    r = int(79 + factor * 60)
                    g = int(70 + factor * 30)
                    b = int(229 + factor * 20)
                    a = 255
                elif dist < inner_radius * 0.65:
                    r, g, b, a = 15, 23, 42, 255
                else:
                    r, g, b, a = 30, 41, 59, 255
            
            raw_data.extend([r, g, b, a])

    png_signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    ihdr_chunk = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    compressed_data = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed_data) & 0xffffffff
    idat_chunk = struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', idat_crc)
    
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    with open(output_path, 'wb') as f:
        f.write(png_signature + ihdr_chunk + idat_chunk + iend_chunk)

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

def main():
    icons_dir = os.path.join(os.path.dirname(__file__), '..', 'src-tauri', 'icons')
    os.makedirs(icons_dir, exist_ok=True)
    
    p32 = os.path.join(icons_dir, '32x32.png')
    p128 = os.path.join(icons_dir, '128x128.png')
    p256 = os.path.join(icons_dir, '128x128@2x.png')
    p512 = os.path.join(icons_dir, 'icon.png')
    p_ico = os.path.join(icons_dir, 'icon.ico')
    p_icns = os.path.join(icons_dir, 'icon.icns')
    
    print('Generating Openhead icons...')
    create_png(32, 32, p32)
    create_png(128, 128, p128)
    create_png(256, 256, p256)
    create_png(512, 512, p512)
    create_ico(p32, p128, p_ico)
    create_png(512, 512, p_icns)
    print(f'Successfully generated all icons in {icons_dir}')

if __name__ == '__main__':
    main()
