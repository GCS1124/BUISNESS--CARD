import type { DesignSettings } from './types'

export type CardTemplate = {
  id: string
  name: string
  category: string
  description: string
  useCase: string
  design: Partial<DesignSettings>
  role: string
  company: string
  headline: string
  imageUrl: string
  imageAlt: string
  featured?: boolean
}

type TemplateSeed = {
  name: string
  category: string
  colors: [string, string, string, string]
  description: string
}

const templateSeeds: TemplateSeed[] = [
  { name: 'Violet Facet', category: 'Geometric', colors: ['#24134b', '#151025', '#a457ff', '#faf6ff'], description: 'Layered violet facets with a confident studio finish.' },
  { name: 'Cobalt Editorial', category: 'Editorial', colors: ['#f3f5f8', '#ffffff', '#315ed7', '#17213a'], description: 'A crisp editorial grid for clear, considered work.' },
  { name: 'Coral Current', category: 'Gradient', colors: ['#ee573f', '#fff2eb', '#ff9a45', '#3b201f'], description: 'A warm liquid gradient that keeps introductions bright.' },
  { name: 'Acid Kinetic', category: 'Dark', colors: ['#171b1a', '#0b0e0d', '#c7e833', '#f6ffe9'], description: 'High-contrast kinetic lines for a sharper point of view.' },
  { name: 'Teal Glassline', category: 'Tech', colors: ['#0e5962', '#effcf8', '#64e7e2', '#123337'], description: 'A glassy teal system with calm, technical precision.' },
  { name: 'Sand Botanica', category: 'Organic', colors: ['#d5b994', '#fff8ed', '#b9693d', '#3c2c26'], description: 'Soft sand tones and organic detail for thoughtful brands.' },
  { name: 'Chrome Drift', category: 'Minimal', colors: ['#b8d5e4', '#f7fbff', '#7d9eb3', '#1e3442'], description: 'Icy chrome curves with a quietly premium finish.' },
  { name: 'Burgundy Foil', category: 'Luxe', colors: ['#531b35', '#fff4ed', '#d1a04c', '#2d1724'], description: 'Deep burgundy and foil geometry made for elegant introductions.' },
  { name: 'Neon Orbit', category: 'Gradient', colors: ['#1a185c', '#111439', '#f33bc1', '#f6f1ff'], description: 'Electric blue and pink light for culture-forward work.' },
  { name: 'Forest Contour', category: 'Organic', colors: ['#173b2c', '#f5f2df', '#dbd5a6', '#17261f'], description: 'Topographic lines that feel grounded, warm, and memorable.' },
  { name: 'Terracotta Stack', category: 'Geometric', colors: ['#a64a2b', '#fff4e8', '#e27648', '#35211d'], description: 'Tactile terracotta blocks with a confident architectural rhythm.' },
  { name: 'Lavender Collage', category: 'Editorial', colors: ['#b6a8d2', '#f8f4fb', '#74628f', '#2a2338'], description: 'A soft paper collage for independent minds and makers.' },
  { name: 'Emerald Cut', category: 'Luxe', colors: ['#0b5b4a', '#edfff8', '#5fe1ad', '#102e28'], description: 'Jewel-like emerald depth for a polished personal brand.' },
  { name: 'Amber Arch', category: 'Gradient', colors: ['#c66716', '#fff2d4', '#f9a333', '#3b2510'], description: 'A sunlit amber arch that brings warmth to every share.' },
  { name: 'Red Laser Grid', category: 'Dark', colors: ['#22191b', '#0f1114', '#f04432', '#fff0ec'], description: 'A red laser grid for builders with momentum.' },
  { name: 'Blue Tidal', category: 'Minimal', colors: ['#8db9dc', '#f6fbff', '#426f9b', '#1d3650'], description: 'Paper-blue waves with a calm, editorial presence.' },
  { name: 'Memphis Pulse', category: 'Playful', colors: ['#f46b2e', '#fff5dd', '#f7c62e', '#341b2b'], description: 'Playful primary shapes for a bright, open introduction.' },
  { name: 'Liquid Ultraviolet', category: 'Gradient', colors: ['#3d185f', '#f7eaff', '#a665ff', '#281232'], description: 'Chrome-like violet flow with a bold digital edge.' },
  { name: 'Moss Branch', category: 'Organic', colors: ['#5d6643', '#f6f2e5', '#e4d6a0', '#283022'], description: 'Fine botanical lines for a considered, human tone.' },
  { name: 'Bauhaus Cream', category: 'Editorial', colors: ['#eadcc1', '#fffdf6', '#252222', '#222222'], description: 'Warm Bauhaus geometry with a timeless visual voice.' },
  { name: 'Graphite Signal', category: 'Dark', colors: ['#202226', '#101113', '#e1e5eb', '#f6f7f9'], description: 'A monochrome signal system for clear technical work.' },
  { name: 'Mint Frost', category: 'Minimal', colors: ['#b7dfd1', '#f8fffc', '#64b7a8', '#17352e'], description: 'Frosted mint surfaces for an easy, modern first impression.' },
  { name: 'Celestial Rings', category: 'Luxe', colors: ['#183b81', '#eff4ff', '#d29b45', '#152441'], description: 'Orbiting cobalt rings with a touch of quiet luxury.' },
  { name: 'Terrazzo Rose', category: 'Playful', colors: ['#eccbc1', '#fff7f2', '#b96b7d', '#4c2831'], description: 'A soft terrazzo mix for studios, shops, and makers.' },
  { name: 'Copper Blueprint', category: 'Tech', colors: ['#15375c', '#f2f6fa', '#c48251', '#17283b'], description: 'Blueprint lines and copper detail for trusted expertise.' },
  { name: 'Lemon Ribbon', category: 'Gradient', colors: ['#f0d34d', '#fffce0', '#c99f25', '#463c13'], description: 'A bright, folded ribbon that feels optimistic and useful.' },
  { name: 'Deep Relief', category: 'Organic', colors: ['#154b4a', '#eff8f0', '#62b4a3', '#142c2d'], description: 'Layered relief lines for a steady, grounded identity.' },
  { name: 'Iridescent Paper', category: 'Gradient', colors: ['#a89fdf', '#fff4fb', '#62c9ef', '#29204f'], description: 'Iridescent facets with just enough color to stand out.' },
  { name: 'Retro Sunline', category: 'Playful', colors: ['#b64333', '#fff0d7', '#edb35b', '#41201f'], description: 'A retro sunburst with a warm, human rhythm.' },
  { name: 'Circuit Aqua', category: 'Tech', colors: ['#16212a', '#effcff', '#28c2db', '#15232d'], description: 'Aqua circuit paths for product, data, and digital work.' },
  { name: 'Velvet Wine', category: 'Luxe', colors: ['#54162c', '#fff4f0', '#dc6b88', '#321522'], description: 'Velvet folds that make a personal introduction feel rich.' },
  { name: 'Ink Wash', category: 'Organic', colors: ['#d8d4ca', '#fbfbf7', '#2f4263', '#232d3d'], description: 'An ink-wash study for calm, craft-led identities.' },
  { name: 'Vapor Horizon', category: 'Gradient', colors: ['#ea4c8b', '#fff0f6', '#8b45df', '#351937'], description: 'A vivid horizon for fast-moving creative work.' },
  { name: 'Woven Eucalyptus', category: 'Organic', colors: ['#a7b9a0', '#f8fbf2', '#3f6d5a', '#24382e'], description: 'Woven greens that feel tactile, calm, and close to nature.' },
  { name: 'Steel Swirl', category: 'Minimal', colors: ['#7187a0', '#f6fbff', '#cbd8e4', '#233344'], description: 'Liquid steel movement for a sharp modern profile.' },
  { name: 'Art Deco Cocoa', category: 'Luxe', colors: ['#5e3c2a', '#fff5e8', '#d59b54', '#2b1b16'], description: 'Cocoa and brass fan shapes with a confident vintage note.' },
  { name: 'Periwinkle Cut', category: 'Playful', colors: ['#9297e4', '#fff5f2', '#f08b83', '#2f315b'], description: 'Soft-cut color blocks for expressive creative teams.' },
  { name: 'Black Gold Vein', category: 'Luxe', colors: ['#27272a', '#fdf9f1', '#c58a39', '#1c1c1d'], description: 'Black marble and gold veins for an unmistakable finish.' },
  { name: 'Pistachio Pebble', category: 'Organic', colors: ['#a8bd85', '#fbfaed', '#4d6042', '#243126'], description: 'Rounded pistachio forms that keep the tone friendly.' },
  { name: 'Aurora Field', category: 'Gradient', colors: ['#1d5e84', '#f4fbff', '#7e5cf3', '#142441'], description: 'Aurora light for bold ideas and new directions.' },
  { name: 'Plum Network', category: 'Tech', colors: ['#431343', '#fff0fc', '#f055bb', '#30152f'], description: 'A glowing network field for connected, digital work.' },
  { name: 'Herbarium Wash', category: 'Organic', colors: ['#ede8da', '#fffdf6', '#99805e', '#3f372e'], description: 'Pressed botanical forms for a craft-led introduction.' },
  { name: 'Ocean Foam', category: 'Organic', colors: ['#14526e', '#effcff', '#99e7ef', '#17333d'], description: 'Ocean foam textures with a confident coastal energy.' },
  { name: 'Chrome Ember', category: 'Gradient', colors: ['#ba4b24', '#fff1e3', '#7d27d2', '#351a28'], description: 'Copper and violet chrome for a more magnetic profile.' },
  { name: 'Emerald Shard', category: 'Dark', colors: ['#18241f', '#0f1513', '#4e9b72', '#edfff2'], description: 'Faceted emerald depth for a focused, premium feel.' },
  { name: 'Navy Seam', category: 'Minimal', colors: ['#a8c7db', '#f9fcff', '#213e64', '#1f2e3c'], description: 'A tailored navy seam that feels quietly capable.' },
  { name: 'Crimson Shard', category: 'Geometric', colors: ['#9c1c24', '#fff1ee', '#f06e59', '#401318'], description: 'Layered crimson shards for a decisive first impression.' },
  { name: 'Rose Mist', category: 'Gradient', colors: ['#dca7a8', '#fff5f1', '#ef8e93', '#54282e'], description: 'A rose mist gradient for soft confidence and warmth.' },
  { name: 'Pixel Night', category: 'Tech', colors: ['#242661', '#f2f3ff', '#5467eb', '#1c1b46'], description: 'A pixel mosaic with a playful digital pulse.' },
  { name: 'Brass Orbit', category: 'Luxe', colors: ['#25231f', '#fff8e8', '#c79745', '#24211b'], description: 'Concentric brass rings for a composed, executive feel.' },
  { name: 'Clay Current', category: 'Organic', colors: ['#dfcbb4', '#fffaf1', '#b58c67', '#44362c'], description: 'Soft clay waves that bring tactility to your profile.' },
  { name: 'Prism Tide', category: 'Gradient', colors: ['#1c79bb', '#f4fbff', '#3cd0c5', '#17294d'], description: 'Prismatic color breaks for bright, modern identities.' },
  { name: 'Lilac Contour', category: 'Organic', colors: ['#9d8bab', '#fffafd', '#c1a155', '#352d3b'], description: 'A contour-map texture with a soft, artful finish.' },
  { name: 'Leather Stitch', category: 'Luxe', colors: ['#543d32', '#faf1e4', '#cb9860', '#2e211b'], description: 'Leather stitch detail for a trusted, crafted presence.' },
  { name: 'Laser Bloom', category: 'Dark', colors: ['#111b45', '#0d132f', '#28d1ff', '#fff6ff'], description: 'Neon bloom lines for digital makers and night owls.' },
  { name: 'Mediterranean Tile', category: 'Editorial', colors: ['#e7d7ba', '#fffaf0', '#2d5c8e', '#263a4b'], description: 'Mediterranean pattern with a collected editorial feel.' },
  { name: 'Coral Woven', category: 'Playful', colors: ['#f38b82', '#fff2eb', '#d94b62', '#522534'], description: 'Woven coral texture for warm, welcoming brands.' },
  { name: 'Brushed Graphite', category: 'Minimal', colors: ['#3c4144', '#f2f5f6', '#aeb9bc', '#222629'], description: 'Brushed graphite planes for a serious modern profile.' },
  { name: 'Optical Chartreuse', category: 'Playful', colors: ['#838d1c', '#faf8e6', '#cfdb39', '#343414'], description: 'An optical chartreuse pattern with unexpected energy.' },
  { name: 'Scallop Rouge', category: 'Geometric', colors: ['#762335', '#fff0e6', '#e79b82', '#421623'], description: 'Scalloped rouge curves for a more personable edge.' },
  { name: 'Indigo Wireframe', category: 'Tech', colors: ['#401044', '#fff1ff', '#ee4bb7', '#2b1630'], description: 'A wireframe landscape for connected, ambitious work.' },
  { name: 'Sepia Branch', category: 'Organic', colors: ['#d5c4a3', '#fffaf0', '#8d7353', '#423527'], description: 'An inked sepia branch with quiet, natural authority.' },
  { name: 'Tidal Glass', category: 'Minimal', colors: ['#1f607b', '#f1fcff', '#4bc8df', '#17323e'], description: 'Ocean glass and foam for a clean, refreshing profile.' },
  { name: 'Violet Flame', category: 'Gradient', colors: ['#7b2477', '#fff0ff', '#f08d2f', '#381d3c'], description: 'Violet and ember chrome for work with a little heat.' },
  { name: 'Jade Gem', category: 'Luxe', colors: ['#183b32', '#f5fff7', '#5baa78', '#1a2a25'], description: 'Jade gemstone geometry with a jewel-box finish.' },
  { name: 'Tailored Wave', category: 'Minimal', colors: ['#9bbacf', '#f7fbff', '#2f5578', '#223246'], description: 'A tailored wave that keeps your details easy to scan.' },
  { name: 'Red Origami', category: 'Geometric', colors: ['#b31322', '#fff2ef', '#f16a58', '#43151c'], description: 'Origami-inspired red folds for decisive, active brands.' },
  { name: 'Peach Silk', category: 'Gradient', colors: ['#efaaa7', '#fff7ef', '#e55d65', '#55252c'], description: 'Peach silk gradients with an easy, generous energy.' },
  { name: 'Blue Mosaic', category: 'Tech', colors: ['#183d8d', '#f0f4ff', '#6e7df5', '#172952'], description: 'A tiled blue mosaic for product minds and systems thinkers.' },
  { name: 'Obsidian Halo', category: 'Dark', colors: ['#1a1a1d', '#0d0e10', '#c99a46', '#fff8e7'], description: 'Obsidian circles and warm metal for quiet authority.' },
  { name: 'Ivory Fold', category: 'Minimal', colors: ['#e9dfd1', '#fffdf8', '#b6a694', '#3d352e'], description: 'Sculptural ivory folds with a soft, gallery-like feel.' },
  { name: 'Holographic Shift', category: 'Gradient', colors: ['#1667a5', '#f3fbff', '#8c5cf4', '#1e2e57'], description: 'A holographic shift for people shaping what comes next.' },
  { name: 'Contour Pearl', category: 'Organic', colors: ['#aea1b6', '#fff9ff', '#bd9960', '#3f3440'], description: 'Pearl contour lines for a softly distinctive signature.' },
  { name: 'Riveted Leather', category: 'Luxe', colors: ['#4d2d27', '#fff3e5', '#d59e62', '#2b1d19'], description: 'Riveted leather seams for a confident, crafted introduction.' },
  { name: 'Electric Crossfade', category: 'Dark', colors: ['#141a47', '#0e102e', '#f32dba', '#effdff'], description: 'Crossfading light for high-energy digital identities.' },
  { name: 'Cobalt Ceramic', category: 'Editorial', colors: ['#d9c9a9', '#fffaf1', '#2b5e9c', '#25384c'], description: 'Cobalt ceramic pattern with a collected, editorial tone.' },
  { name: 'Textile Blush', category: 'Playful', colors: ['#ee8c8c', '#fff4ef', '#d85666', '#502934'], description: 'Blush textile texture for warm and expressive work.' },
  { name: 'Silver Fold', category: 'Minimal', colors: ['#4e555a', '#f6f8f8', '#bfc7ca', '#202528'], description: 'Silver folded planes for a precise, modern signal.' },
  { name: 'Chartreuse Tunnel', category: 'Playful', colors: ['#717b1e', '#faf7de', '#d7e73f', '#302f14'], description: 'A chartreuse tunnel that makes your introduction impossible to miss.' },
  { name: 'Peach Fan', category: 'Geometric', colors: ['#762336', '#fff1e8', '#efad89', '#4b1e2c'], description: 'Peach fan geometry for a polished but approachable profile.' },
  { name: 'Amethyst Fold', category: 'Geometric', colors: ['#4a2079', '#fff0fd', '#f08a28', '#2e1a43'], description: 'Amethyst and orange folds with a bold editorial contrast.' },
  { name: 'Alpine Lines', category: 'Organic', colors: ['#1f6655', '#f4f8ed', '#e5ddb3', '#19382f'], description: 'Alpine contours for grounded, quietly adventurous work.' },
  { name: 'Ink Ribbon', category: 'Dark', colors: ['#17191b', '#0c0d0e', '#d9dde0', '#f8fafb'], description: 'Expressive ink ribbons for confident creative direction.' },
  { name: 'Blush Mesh', category: 'Gradient', colors: ['#ed827f', '#fff6f2', '#ecb1b8', '#57252d'], description: 'A blush mesh gradient that feels warm and current.' },
  { name: 'Copper Circuit', category: 'Tech', colors: ['#142d4b', '#f1f7fc', '#d08a52', '#172c42'], description: 'Copper circuits for operators who make systems move.' },
  { name: 'Lilac Shell', category: 'Playful', colors: ['#b2a5d9', '#fffdf0', '#d0a754', '#403257'], description: 'Lilac shell arcs with an optimistic, tactile rhythm.' },
  { name: 'Coral Reef', category: 'Organic', colors: ['#16818a', '#effffc', '#f26e5a', '#143b40'], description: 'Coral reef forms for a vivid, human-first introduction.' },
  { name: 'Art Deco Fan', category: 'Luxe', colors: ['#29231d', '#fff8e7', '#d2a15d', '#28211a'], description: 'Art deco fans for a composed, high-touch personal brand.' },
  { name: 'Blue Architecture', category: 'Geometric', colors: ['#1457ae', '#f5f8fc', '#d3dbe5', '#172d4a'], description: 'Blue architectural folds for a structured, modern profile.' },
  { name: 'Sunlit Olive', category: 'Organic', colors: ['#626321', '#fff9e7', '#eaa02e', '#383514'], description: 'Sunlit olive arches for confident work with warmth.' },
  { name: 'Magenta Prism', category: 'Gradient', colors: ['#5e144e', '#fff0ff', '#f235a9', '#27142d'], description: 'Magenta prism shards for a sharper creative signature.' },
  { name: 'Mist Valley', category: 'Minimal', colors: ['#a6b9ca', '#f7fbff', '#667e98', '#2a3b4b'], description: 'A mist valley palette for calm, spacious communication.' },
  { name: 'Jade Filigree', category: 'Luxe', colors: ['#17665c', '#f7fff6', '#d7b45b', '#193d38'], description: 'Jade filigree detail for a refined, memorable profile.' },
  { name: 'Ruby Glass', category: 'Dark', colors: ['#73151a', '#1b1012', '#f05444', '#fff1ec'], description: 'Ruby glass movement for bold founders and makers.' },
  { name: 'Leaf Press', category: 'Organic', colors: ['#cfc8a6', '#fffdf6', '#70834b', '#313628'], description: 'Pressed leaves for an approachable, thoughtful visual system.' },
  { name: 'Isometric Peach', category: 'Geometric', colors: ['#193c5d', '#fff6ec', '#f09b7b', '#1f3141'], description: 'Isometric peach blocks for product-minded professionals.' },
  { name: 'Copper Swirl', category: 'Gradient', colors: ['#bf6547', '#fff2e7', '#e9a07e', '#4a2827'], description: 'An iridescent copper swirl with a little movement.' },
  { name: 'Mint Checker', category: 'Playful', colors: ['#8fcfc2', '#f4fffc', '#173a52', '#18302f'], description: 'A mint checkerboard that keeps the tone fresh and easy.' },
  { name: 'Sunset Longshadow', category: 'Gradient', colors: ['#ec6824', '#fff0d8', '#31305b', '#24203b'], description: 'Sunset long shadows for work with a clear horizon.' },
  { name: 'Rainbow Ribbon', category: 'Dark', colors: ['#14131d', '#0b0b12', '#f246d5', '#f9feff'], description: 'Rainbow light ribbons for a distinct digital point of view.' },
]

const starterCopy: Record<string, { role: string; company: string; headline: string; useCase: string }> = {
  Geometric: { role: 'Brand strategist', company: 'Independent studio', headline: 'Clear thinking, made visible.', useCase: 'For founders, designers, and teams with a point of view.' },
  Editorial: { role: 'Creative consultant', company: 'Field notes studio', headline: 'Make the details do the talking.', useCase: 'For thoughtful professionals who value clarity and craft.' },
  Gradient: { role: 'Product founder', company: 'New signal', headline: 'Building what comes next.', useCase: 'For fresh ideas, modern teams, and optimistic builders.' },
  Dark: { role: 'Creative developer', company: 'Night shift studio', headline: 'Ideas with a point of view.', useCase: 'For studios, developers, and bold personal brands.' },
  Tech: { role: 'Systems designer', company: 'Signal works', headline: 'Making complex things feel simple.', useCase: 'For product, data, and digital specialists.' },
  Organic: { role: 'Independent maker', company: 'Common ground', headline: 'Useful things, made with care.', useCase: 'For people-led practices, makers, and advisors.' },
  Minimal: { role: 'Designer & maker', company: 'Independent', headline: 'Less noise. More signal.', useCase: 'For creators who let their work do the talking.' },
  Luxe: { role: 'Strategy advisor', company: 'Private practice', headline: 'A considered way forward.', useCase: 'For leaders, advisors, and senior operators.' },
  Playful: { role: 'Creative director', company: 'Studio practice', headline: 'Making useful things feel alive.', useCase: 'For artists, marketers, and culture builders.' },
}

export const cardTemplates: CardTemplate[] = templateSeeds.map((seed, index) => {
  const [headerColor, cardBackground, accentColor, textColor] = seed.colors
  const copy = starterCopy[seed.category]
  const imageNumber = String(index + 1).padStart(3, '0')
  return {
    id: `template-${imageNumber}`,
    name: seed.name,
    category: seed.category,
    description: seed.description,
    useCase: copy.useCase,
    design: {
      headerColor,
      cardBackground,
      accentColor,
      textColor,
      mode: textColor.startsWith('#f') || textColor.startsWith('#e') ? 'dark' : 'light',
      fontFamily: ['Manrope', 'DM Sans', 'Space Grotesk'][index % 3],
      buttonStyle: (['solid', 'soft', 'outline'] as const)[index % 3],
      borderRadius: 14 + ((index * 3) % 22),
      coverImageUrl: `/template-assets/template-${imageNumber}.jpg`,
    },
    role: copy.role,
    company: copy.company,
    headline: copy.headline,
    imageUrl: `/template-assets/template-${imageNumber}.jpg`,
    imageAlt: `${seed.name} abstract business card artwork`,
    featured: index < 3,
  }
})

