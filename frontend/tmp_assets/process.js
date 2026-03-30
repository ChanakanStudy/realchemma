const Jimp = require('jimp');

const PREFIX = '/Users/nitchachantakarn/.gemini/antigravity/brain/100d5c17-6ee9-471f-b2e9-c999590a9293';
const ASSETS_DIR = '/Users/nitchachantakarn/Desktop/realchemma/frontend/public/assets';

async function processImage(inputPath, outputPath, targetW, targetH, removeBg = true) {
    console.log(`[START] Processing ${outputPath}...`);
    try {
        const img = await Jimp.read(inputPath);
        
        if (removeBg) {
            // Remove pure white background
            img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
                const r = this.bitmap.data[idx + 0];
                const g = this.bitmap.data[idx + 1];
                const b = this.bitmap.data[idx + 2];
                // High threshold for white
                if (r > 235 && g > 235 && b > 235) {
                    this.bitmap.data[idx + 3] = 0; // Set Alpha to 0
                }
            });
            // Autocrop to remove newly generated empty space around the sprite
            img.autocrop();
        }

        // Resize
        img.resize(targetW, targetH);
        
        await img.writeAsync(outputPath);
        console.log(`[SUCCESS] Saved ${outputPath}`);
    } catch(err) {
        console.error("[ERROR] Failed to process " + inputPath, err);
    }
}

async function main() {
    // 1. Textures (Seamless, No bg removal)
    await processImage(`${PREFIX}/real_grass_1774840791251.png`, `${ASSETS_DIR}/t_grass.png`, 48, 48, false);
    await processImage(`${PREFIX}/real_dirt_1774840853940.png`, `${ASSETS_DIR}/t_dirt.png`, 48, 48, false);

    // 2. Sprites & Props (Remove bg, Crop, Resize)
    await processImage(`${PREFIX}/real_player_1774840825217.png`, `${ASSETS_DIR}/player.png`, 48, 64, true);
    await processImage(`${PREFIX}/real_tree_1774840873025.png`, `${ASSETS_DIR}/t_pine_tree.png`, 96, 96, true);
    
    // 3. Large Structures
    // The house is roughly 4x4 tiles spanning 192x192
    await processImage(`${PREFIX}/real_house_1774840808849.png`, `${ASSETS_DIR}/house.png`, 192, 192, true);
    // Duplicate house as a placeholder for building until Batch 2
    await processImage(`${PREFIX}/real_house_1774840808849.png`, `${ASSETS_DIR}/building.png`, 192, 192, true);
    
    console.log("All realistic assets processed successfully.");
}

main();
