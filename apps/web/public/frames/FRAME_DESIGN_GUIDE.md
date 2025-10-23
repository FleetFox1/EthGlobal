# 🖼️ Frame Overlay Instructions

## What Are Frame Overlays?

Frame overlays are PNG images that sit **on top** of your NFT cards to give them that authentic Pokemon/trading card look. They add decorative borders, corner embellishments, and visual flair.

## 📁 Where to Put Them

Place your PNG files in this exact location:

```
apps/web/public/frames/
  ├── legendary.png   # Orange/red holographic frame
  ├── epic.png        # Purple/pink gradient frame
  ├── rare.png        # Blue/cyan shimmer frame
  ├── uncommon.png    # Green/emerald frame
  └── common.png      # Gray standard frame
```

## 🎨 Design Specifications

### Technical Requirements

- **Format**: PNG with alpha transparency
- **Size**: 600x800 pixels (3:4 aspect ratio)
- **Color Mode**: RGB + Alpha
- **Resolution**: 72 DPI minimum (higher is better)

### Visual Guidelines

1. **Transparent Background**: Must have alpha channel (transparent background)
2. **Border Design**: Frame should have decorative border around edges
3. **Corner Elements**: Add ornamental corners matching rarity theme
4. **Center Area**: Leave center transparent for NFT image to show through
5. **Safe Area**: Keep decorations within outer 80-100px border

### Recommended Dimensions

```
Total canvas: 600x800px

Border thickness:
  - Top: 80px
  - Bottom: 120px (space for name/description)
  - Left/Right: 60px each

Image area: 480x600px (centered)
```

## 🎯 Design Ideas by Rarity

### Legendary (✨ Orange/Red)
- Thick ornate gold/bronze borders
- Flame-like corner decorations
- Holographic pattern overlay
- Sunburst or starburst effects
- Colors: #ff6b00, #ff0844, #ffaa00

### Epic (💎 Purple/Pink)
- Jewel-encrusted corners
- Crystalline border patterns
- Diamond/gem motifs
- Royal/regal styling
- Colors: #a855f7, #ec4899, #c026d3

### Rare (💠 Blue/Cyan)
- Icy crystal borders
- Water droplet/wave corners
- Lightning bolt accents
- Sleek metallic edges
- Colors: #3b82f6, #06b6d4, #0ea5e9

### Uncommon (🟢 Green/Emerald)
- Nature-inspired corners (leaves, vines)
- Organic flowing borders
- Earth/plant motifs
- Subtle glow effects
- Colors: #22c55e, #10b981, #059669

### Common (⚪ Gray)
- Simple clean border
- Minimal corner decorations
- Subtle texture only
- Professional/understated
- Colors: #6b7280, #9ca3af, #d1d5db

## 🛠️ How to Create Frames

### Option 1: Photoshop/GIMP

1. Create 600x800px canvas
2. Fill with transparent background
3. Add decorative border layers
4. Leave center transparent (use layer mask if needed)
5. Export as PNG-24 with transparency

### Option 2: Figma/Sketch

1. Create 600x800px frame
2. Design border elements on separate layers
3. Export as PNG with transparent background
4. Ensure "Export background" is unchecked

### Option 3: AI Generation (Midjourney/DALL-E)

Prompt template:
```
ornate [rarity] trading card frame border, [color scheme] gradient,
decorative corners, transparent center, fantasy style,
high detail, flat design, white background to be removed
```

Then use online PNG transparency tools to remove white background.

### Option 4: Use Assets from Template Sites

Search for:
- "Trading card frame PNG"
- "Pokemon card border transparent"
- "Fantasy card frame overlay"
- "Collectible card template"

Sites: DeviantArt, Freepik, Vecteezy, OpenGameArt

## 🚫 What NOT to Do

❌ Don't fill the entire canvas - leave center transparent  
❌ Don't use JPEG (no transparency support)  
❌ Don't make borders too thick (covers NFT image)  
❌ Don't use pure white/black (won't match holographic effects)  
❌ Don't forget to export with alpha channel

## ✅ Testing Your Frames

After adding frames to `/public/frames/`:

1. Visit `http://localhost:3000/cards` (demo page)
2. Check each rarity tier card
3. Verify frames don't obscure NFT images
4. Test hover effects (foil shine should work)
5. Check mobile responsiveness

## 🎭 Quick Start: No Frames Yet?

**The component works WITHOUT frames!** If frame PNGs are missing:
- Cards still render beautifully
- CSS gradients provide border effects
- Holographic shimmer still works
- Only the PNG overlay won't show

This lets you test the component immediately while designing frames.

## 📦 Example Frame Resources

### Free Resources
- [OpenGameArt.org](https://opengameart.org/) - Search "card frame"
- [Freepik](https://www.freepik.com/) - "trading card border PNG"
- [Vecteezy](https://www.vecteezy.com/) - "game card frame transparent"

### Paid Resources
- [Creative Market](https://creativemarket.com/) - Premium card assets
- [Envato Elements](https://elements.envato.com/) - UI frame packs

### DIY Tools
- [Canva](https://www.canva.com/) - Card border templates
- [Figma](https://www.figma.com/) - Design from scratch
- [Photopea](https://www.photopea.com/) - Free Photoshop alternative

## 💡 Pro Tips

1. **Layer Multiple PNGs**: You can overlay multiple frame images for depth
2. **Match CSS Colors**: Frame colors should complement `nft-effects.css` gradients
3. **Subtle is Better**: Don't overwhelm the NFT image itself
4. **Test Contrast**: Frames should work with both light and dark bug images
5. **Version Control**: Keep .psd/.fig source files for future edits

## 🆘 Need Help?

If you're stuck on frame design:
1. Start with simple rectangular borders
2. Use CSS-only effects first (already implemented)
3. Gradually add PNG overlays as you create them
4. Community members may share their frame designs

---

**Current Status**: Component is ready! Add frames whenever you want to enhance the visual design. The cards look great with just CSS effects too. 🎴✨
