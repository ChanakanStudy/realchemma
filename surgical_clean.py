from PIL import Image

def surgical_clean(image_path, output_path):
    print(f"Cleaning {image_path}...")
    try:
        img = Image.open(image_path).convert("RGBA")
        data = img.getdata()
        new_data = []
        threshold = 245 
        for item in data:
            if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
                new_data.append((0, 0, 0, 0))
            else:
                new_data.append(item)
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Saved to {output_path}")
    except Exception as e:
        print(f"Error cleaning {image_path}: {e}")

brain_dir = "/Users/nitchachantakarn/.gemini/antigravity/brain/1234bfda-bc68-40ea-9600-895d0e9bfae8"
assets = [
    ("player_sheet_ultimate_png_1774325059453.png", "player_sheet.png"),
    ("individual_tree_png_1774325359751.png", "tree.png"),
    ("individual_crystal_png_1774325378452.png", "crystal.png"),
    ("individual_pillar_png_1774325394973.png", "pillar.png"),
    ("individual_bridge_png_1774325424934.png", "bridge.png"),
    ("individual_grass_png_1774325438073.png", "grass.png"),
    ("individual_path_png_1774325451786.png", "path.png")
]

dest_dir = "/Users/nitchachantakarn/Desktop/realchemma/frontend/public/assets"

for src, dest in assets:
    surgical_clean(f"{brain_dir}/{src}", f"{dest_dir}/{dest}")
