import collections
from PIL import Image, ImageDraw

def flood_clean_pink(image_path, output_path):
    print(f"Surgical cleaning {image_path}...")
    try:
        img = Image.open(image_path).convert("RGBA")
        width, height = img.size
        data = img.load()
        
        # Pass 1: Aggressive Color Keying with wide tolerance
        for y in range(height):
            for x in range(width):
                r, g, b, a = data[x, y]
                dist = ((r - 255)**2 + (g - 0)**2 + (b - 255)**2)**0.5
                if dist < 190: # Even more aggressive
                    data[x, y] = (0, 0, 0, 0)
        
        # Pass 2: Border Executioner (Kill 3px on all sides to avoid tiling seams)
        # This is CRITICAL for 640x640 blobs that bleed at edges
        for y in range(height):
            for x in range(width):
                if x < 3 or x > width - 4 or y < 3 or y > height - 4:
                    data[x, y] = (0, 0, 0, 0)

        img.save(output_path, "PNG")
        print(f"Saved to {output_path}")
    except Exception as e:
        print(f"Error cleaning {image_path}: {e}")

brain_dir = "/Users/nitchachantakarn/.gemini/antigravity/brain/1234bfda-bc68-40ea-9600-895d0e9bfae8"
assets = [
    ("perfect_player_sheet_png_1774326581676.png", "player_v4.png"),
    ("perfect_water_png_1774326599208.png", "water_v4.png"),
    ("perfect_tree_png_1774326160134.png", "tree_v4.png"),
    ("perfect_crystal_png_1774326176886.png", "crystal_v4.png"),
    ("perfect_pillar_png_1774326194341.png", "pillar_v4.png"),
    ("perfect_bridge_png_1774326221758.png", "bridge_v4.png"),
    ("perfect_grass_png_1774326243443.png", "grass_v4.png"),
    ("perfect_path_png_1774326257253.png", "path_v4.png")
]

dest_dir = "/Users/nitchachantakarn/Desktop/realchemma/frontend/public/assets"

for src, dest in assets:
    flood_clean_pink(f"{brain_dir}/{src}", f"{dest_dir}/{dest}")
