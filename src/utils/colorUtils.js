import chroma from 'chroma-js';

const COLOR_SCHEMES = {
  ANALOGOUS: 'analogous',
  TRIADIC: 'triadic',
  COMPLEMENTARY: 'complementary',
  SPLIT_COMPLEMENTARY: 'split-complementary',
  MONOCHROMATIC: 'monochromatic'
};

const generateColorScheme = (baseColor, scheme) => {
  const base = chroma(baseColor || chroma.random());
  const baseHue = base.get('hsl.h');
  let colors = [];

  switch (scheme) {
    case COLOR_SCHEMES.ANALOGOUS:
      colors = [
        base.set('hsl.h', (baseHue - 30) % 360),
        base,
        base.set('hsl.h', (baseHue + 30) % 360),
        base.set('hsl.h', (baseHue + 60) % 360),
        base.set('hsl.h', (baseHue + 90) % 360)
      ];
      break;

    case COLOR_SCHEMES.TRIADIC:
      colors = [
        base,
        base.set('hsl.h', (baseHue + 120) % 360),
        base.set('hsl.h', (baseHue + 240) % 360),
        base.set('hsl.h', (baseHue + 120) % 360).brighten(1),
        base.set('hsl.h', (baseHue + 240) % 360).brighten(1)
      ];
      break;

    case COLOR_SCHEMES.COMPLEMENTARY:
      const complement = base.set('hsl.h', (baseHue + 180) % 360);
      colors = [
        base.darken(1.5),
        base,
        base.brighten(1),
        complement.darken(0.5),
        complement.brighten(1)
      ];
      break;

    case COLOR_SCHEMES.SPLIT_COMPLEMENTARY:
      colors = [
        base,
        base.set('hsl.h', (baseHue + 150) % 360),
        base.set('hsl.h', (baseHue + 210) % 360),
        base.set('hsl.h', (baseHue + 150) % 360).brighten(1),
        base.set('hsl.h', (baseHue + 210) % 360).brighten(1)
      ];
      break;

    case COLOR_SCHEMES.MONOCHROMATIC:
      colors = [
        base.darken(2),
        base.darken(1),
        base,
        base.brighten(1),
        base.brighten(2)
      ];
      break;

    default:
      colors = generateColorScheme(base, COLOR_SCHEMES.COMPLEMENTARY);
  }

  // Sort colors by luminance (dark to light)
  return colors.sort((a, b) => a.luminance() - b.luminance());
};

export const generatePalette = (baseColor) => {
  try {
    // Randomly select a color scheme
    const schemes = Object.values(COLOR_SCHEMES);
    const randomScheme = schemes[Math.floor(Math.random() * schemes.length)];
    
    // Generate and sort colors
    const colors = generateColorScheme(baseColor, randomScheme);
    
    return {
      colors: colors.map(c => c.hex()),
      metadata: {
        baseColor: baseColor || colors[2].hex(), // Middle color is base
        scheme: randomScheme
      }
    };
  } catch (error) {
    console.error('Error generating palette:', error);
    return null;
  }
};

export const validateContrast = (color1, color2) => {
  return chroma.contrast(color1, color2) >= 4.5;
};

export const adjustLightness = (color, targetLightness) => {
  const c = chroma(color);
  return c.set('hsl.l', targetLightness).hex();
};
