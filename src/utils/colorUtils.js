import chroma from 'chroma-js';

export const generatePalette = (baseColor) => {
  try {
    // Generate base colors
    const base = chroma(baseColor || chroma.random());
    const complementary = base.set('hsl.h', (base.get('hsl.h') + 180) % 360);
    const analogous = base.set('hsl.h', (base.get('hsl.h') + 30) % 360);

    // Create dark and light variations
    const darkColor = base.darken(2);
    const lightColor1 = base.brighten(2);
    const lightColor2 = complementary.brighten(2);

    return {
      colors: [
        darkColor.hex(),
        base.hex(),
        complementary.hex(),
        lightColor1.hex(),
        lightColor2.hex(),
      ],
      metadata: {
        baseColor: base.hex(),
        scheme: 'complementary'
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
  const hsl = chroma(color).hsl();
  return chroma.hsl(hsl[0], hsl[1], targetLightness);
};
