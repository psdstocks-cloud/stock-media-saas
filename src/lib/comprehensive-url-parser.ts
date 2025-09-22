// A comprehensive URL parser that replicates the nehtw.com idExtractor logic
// This ensures perfect compatibility with the external API

interface SiteMatcher {
  name: string;
  regex: RegExp;
  idGroup: number; // Which capture group contains the ID
}

// Complete set of regex patterns from nehtw.com idExtractor
const siteMatchers: SiteMatcher[] = [
  // Shutterstock patterns
  {
    name: 'shutter',
    regex: /shutterstock\.com(|\/[a-z]*)\/video\/clip-([0-9]*)/,
    idGroup: 2
  },
  {
    name: 'mshutter',
    regex: /shutterstock\.com(.*)music\/(.*)track-([0-9]*)-/,
    idGroup: 3
  },
  {
    name: 'shutter',
    regex: /shutterstock\.com\/(.*)(image-vector|image-photo|image-illustration|image|image-generated|editorial)\/([0-9a-zA-Z-_]*)-([0-9a-z]*)/,
    idGroup: 4
  },
  {
    name: 'shutter',
    regex: /shutterstock\.com\/(.*)(image-vector|image-photo|image-illustration|image-generated|editorial)\/([0-9a-z]*)/,
    idGroup: 3
  },
  
  // Adobe Stock patterns
  {
    name: 'adobestock',
    regex: /stock\.adobe\.com\/(..\/||.....\/)(images|templates|3d-assets|stock-photo|video)\/([a-zA-Z0-9-%.,]*)\/([0-9]*)/,
    idGroup: 4
  },
  {
    name: 'adobestock',
    regex: /stock\.adobe\.com(.*)asset_id=([0-9]*)/,
    idGroup: 2
  },
  {
    name: 'adobestock',
    regex: /stock\.adobe\.com(.*)search\/audio\?(k|keywords)=([0-9]*)/,
    idGroup: 3
  },
  {
    name: 'adobestock',
    regex: /stock\.adobe\.com\/(..\/||.....\/)([0-9]*)/,
    idGroup: 2
  },
  
  // Depositphotos patterns
  {
    name: 'depositphotos',
    regex: /depositphotos\.com(.*)depositphotos_([0-9]*)(.*)\.jpg/,
    idGroup: 2
  },
  {
    name: 'depositphotos_video',
    regex: /depositphotos\.com\/([0-9]*)\/stock-video(.*)/,
    idGroup: 1
  },
  {
    name: 'depositphotos',
    regex: /depositphotos\.com\/([0-9]*)\/(stock-photo|stock-illustration|free-stock)(.*)/,
    idGroup: 1
  },
  {
    name: 'depositphotos',
    regex: /depositphotos\.com(.*)qview=([0-9]*)/,
    idGroup: 2
  },
  {
    name: 'depositphotos',
    regex: /depositphotos\.com(.*)\/(photo|editorial|vector|illustration)\/([0-9a-z-]*)-([0-9]*)/,
    idGroup: 4
  },
  
  // 123RF patterns
  {
    name: '123rf',
    regex: /123rf\.com\/(photo|free-photo)_([0-9]*)_/,
    idGroup: 2
  },
  {
    name: '123rf',
    regex: /123rf\.com\/(.*)mediapopup=([0-9]*)/,
    idGroup: 2
  },
  {
    name: '123rf',
    regex: /123rf\.com\/stock-photo\/([0-9]*)\.html/,
    idGroup: 1
  },
  
  // iStockphoto patterns
  {
    name: 'istockphoto',
    regex: /istockphoto\.com\/(.*)gm([0-9A-Z_]*)-/,
    idGroup: 2
  },
  {
    name: 'istockphoto',
    regex: /gettyimages\.com\/(.*)\/([0-9]*)/,
    idGroup: 2
  },
  
  // Freepik patterns
  {
    name: 'vfreepik',
    regex: /freepik\.(.*)\/(.*)-?video-?(.*)\/([0-9a-z-]*)_([0-9]*)/,
    idGroup: 5
  },
  {
    name: 'freepik',
    regex: /freepik\.(.*)(.*)_([0-9]*)\.htm/,
    idGroup: 3
  },
  {
    name: 'flaticon',
    regex: /freepik\.com\/(icon|icone)\/(.*)_([0-9]*)/,
    idGroup: 3
  },
  {
    name: 'flaticon',
    regex: /flaticon\.com\/(.*)\/([0-9a-z-]*)_([0-9]*)/,
    idGroup: 3
  },
  {
    name: 'flaticonpack',
    regex: /flaticon\.com\/(.*)(packs|stickers-pack)\/([0-9a-z-]*)/,
    idGroup: 3
  },
  
  // Envato patterns
  {
    name: 'envato',
    regex: /elements\.envato\.com(.*)\/([0-9a-zA-Z-]*)-([0-9A-Z]*)/,
    idGroup: 3
  },
  
  // Dreamstime patterns
  {
    name: 'dreamstime',
    regex: /dreamstime(.*)-image([0-9]*)/,
    idGroup: 2
  },
  
  // PNGTree patterns
  {
    name: 'pngtree',
    regex: /pngtree\.com(.*)_([0-9]*)\.html/,
    idGroup: 2
  },
  
  // VectorStock patterns
  {
    name: 'vectorstock',
    regex: /vectorstock\.com\/([0-9a-zA-Z-]*)\/([0-9a-zA-Z-]*)-([0-9]*)/,
    idGroup: 3
  },
  
  // MotionArray patterns
  {
    name: 'motionarray',
    regex: /motionarray\.com\/([a-zA-Z0-9-]*)\/([a-zA-Z0-9-]*)-([0-9]*)/,
    idGroup: 3
  },
  
  // Alamy patterns
  {
    name: 'alamy',
    regex: /(alamy|alamyimages)\.(com|es|de|it|fr)\/(.*)(-|image)([0-9]*)\.html/,
    idGroup: 5
  },
  
  // MotionElements patterns
  {
    name: 'motionelements',
    regex: /motionelements\.com\/(([a-z-]*\/)|)(([a-z-3]*)|(product|davinci-resolve-template))(\/|-)([0-9]*)-/,
    idGroup: 7
  },
  
  // Storyblocks patterns
  {
    name: 'storyblocks',
    regex: /storyblocks\.com\/(video|images|audio)\/stock\/([0-9a-z-]*)-([0-9a-z_]*)/,
    idGroup: 3
  },
  
  // EpidemicSound patterns
  {
    name: 'epidemicsound',
    regex: /epidemicsound\.com\/(.*)tracks?\/([a-zA-Z0-9-]*)/,
    idGroup: 2
  },
  
  // YellowImages patterns
  {
    name: 'yellowimages',
    regex: /yellowimages\.com\/(stock\/|(.*)p=)([0-9a-z-]*)/,
    idGroup: 3
  },
  
  // Vecteezy patterns
  {
    name: 'vecteezy',
    regex: /vecteezy\.com\/([\/a-zA-Z-]*)\/([0-9]*)/,
    idGroup: 2
  },
  
  // CreativeFabrica patterns
  {
    name: 'creativefabrica',
    regex: /creativefabrica\.com\/(.*)product\/([a-z0-9-]*)/,
    idGroup: 2
  },
  
  // LovePik patterns
  {
    name: 'lovepik',
    regex: /lovepik\.com\/([a-z]*)-([0-9]*)\//,
    idGroup: 2
  },
  
  // RawPixel patterns
  {
    name: 'rawpixel',
    regex: /rawpixel\.com\/image\/([0-9]*)/,
    idGroup: 1
  },
  
  // DEEEZY patterns
  {
    name: 'deeezy',
    regex: /deeezy\.com\/product\/([0-9]*)/,
    idGroup: 1
  },
  
  // FootageCrate patterns
  {
    name: 'footagecrate',
    regex: /(productioncrate|footagecrate|graphicscrate)\.com\/([a-z0-9-]*)\/([a-zA-Z0-9-_]*)/,
    idGroup: 3
  },
  
  // ArtGrid patterns
  {
    name: 'artgrid_HD',
    regex: /artgrid\.io\/clip\/([0-9]*)\//,
    idGroup: 1
  },
  
  // PixelSquid patterns
  {
    name: 'pixelsquid',
    regex: /pixelsquid\.com(.*)-([0-9]*)\?image=(...)/,
    idGroup: 2
  },
  {
    name: 'pixelsquid',
    regex: /pixelsquid\.com(.*)-([0-9]*)/,
    idGroup: 2
  },
  
  // UI8 patterns
  {
    name: 'ui8',
    regex: /ui8\.net\/(.*)\/(.*)\/([0-9a-zA-Z-]*)/,
    idGroup: 3
  },
  
  // IconScout patterns
  {
    name: 'iconscout',
    regex: /iconscout\.com\/((\w{2})\/?$|(\w{2})\/|)([0-9a-z-]*)\/([0-9a-z-]*)/,
    idGroup: 5
  },
  
  // Designi patterns
  {
    name: 'designi',
    regex: /designi\.com\.br\/([0-9a-zA-Z]*)/,
    idGroup: 1
  },
  
  // MockupCloud patterns
  {
    name: 'mockupcloud',
    regex: /mockupcloud\.com\/(product|scene|graphics\/product)\/([a-z0-9-]*)/,
    idGroup: 2
  },
  
  // Artlist patterns
  {
    name: 'artlist_footage',
    regex: /artlist\.io\/(stock-footage|video-templates)\/(.*)\/([0-9]*)/,
    idGroup: 3
  },
  {
    name: 'artlist_sound',
    regex: /artlist\.io\/(sfx|royalty-free-music)\/(.*)\/([0-9]*)/,
    idGroup: 3
  },
  
  // Pixeden patterns
  {
    name: 'pixeden',
    regex: /pixeden\.com\/([0-9a-z-]*)\/([0-9a-z-]*)/,
    idGroup: 2
  },
  
  // Uplabs patterns
  {
    name: 'uplabs',
    regex: /uplabs\.com\/posts\/([0-9a-z-]*)/,
    idGroup: 1
  },
  
  // PixelBuddha patterns
  {
    name: 'pixelbuddha',
    regex: /pixelbuddha\.net\/(premium|)(.*)\/([0-9a-z-]*)/,
    idGroup: 3
  },
  
  // UIHut patterns
  {
    name: 'uihut',
    regex: /uihut\.com\/designs\/([0-9]*)/,
    idGroup: 1
  },
  
  // Craftwork patterns
  {
    name: 'craftwork',
    regex: /craftwork\.design\/product\/([0-9a-z-]*)/,
    idGroup: 1
  },
  
  // BaixarDesign patterns
  {
    name: 'baixardesign',
    regex: /baixardesign\.com\.br\/arquivo\/([0-9a-z]*)/,
    idGroup: 1
  },
  
  // SoundStripe patterns
  {
    name: 'soundstripe',
    regex: /soundstripe\.com\/(.*)\/([0-9]*)/,
    idGroup: 2
  },
  
  // MrMockup patterns
  {
    name: 'mrmockup',
    regex: /mrmockup\.com\/product\/([0-9a-z-]*)/,
    idGroup: 1
  },
  
  // DesignBR patterns
  {
    name: 'designbr',
    regex: /designbr\.com\.br\/(.*)modal=([^&]+)/,
    idGroup: 2
  }
];

/**
 * Parses a stock media URL to extract the site name and asset ID.
 * This function replicates the nehtw.com idExtractor logic for perfect compatibility.
 * @param url The stock media URL to parse.
 * @returns An object with the site, id, and original url, or null if no match is found.
 */
export function comprehensiveParseStockUrl(url: string): { site: string; id: string; url: string } | null {
  for (const matcher of siteMatchers) {
    const match = url.match(matcher.regex);
    if (match && match[matcher.idGroup]) {
      return {
        site: matcher.name,
        id: match[matcher.idGroup],
        url: url,
      };
    }
  }

  // If no match is found after trying all matchers, return null.
  return null;
}