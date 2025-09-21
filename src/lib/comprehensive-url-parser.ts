// A defined structure for each site's parser configuration
type SiteParser = {
  name: string;
  regexes: RegExp[];
};

// An array containing the configurations for all supported stock media sites
const siteParsers: SiteParser[] = [
  {
    name: 'shutterstock',
    regexes: [
      /shutterstock\.com\/(?:image-photo|image-vector|image-illustration|image|image-generated|editorial)\/.*?-(\d+)/,
      /shutterstock\.com\/.+?\/(\d+)$/
    ]
  },
  {
    name: 'adobestock',
    regexes: [
      /stock\.adobe\.com\/(?:[a-z]{2,5}\/)?(?:images?|templates|3d-assets|stock-photo|video)\/.*?\/(\d+)/,
      /stock\.adobe\.com\/.*(?:asset_id=|&k=)(\d+)/
    ]
  },
  {
    name: 'dreamstime',
    regexes: [/dreamstime\.com\/.*-image(\d+)/]
  },
  {
    name: 'depositphotos',
    regexes: [
      /depositphotos\.com\/(?:photo|editorial|vector|illustration)\/.*?-(\d+)/,
      /depositphotos\.com\/(\d+)\/stock-(?:photo|illustration|video)/,
      /depositphotos\.com\/.*(?:qview=)(\d+)/
    ]
  },
  {
    name: '123rf',
    regexes: [
      /123rf\.com\/(?:photo|free-photo)_(\d+)_/,
      /123rf\.com\/stock-photo\/(\d+)\.html/,
      /123rf\.com\/.*(?:mediapopup=)(\d+)/
    ]
  },
  {
    name: 'istockphoto',
    regexes: [/istockphoto\.com\/.*gm(\d+)-/]
  },
  {
    name: 'gettyimages',
    regexes: [/gettyimages\.com\/.*?\/(\d+)/]
  },
  {
    name: 'freepik',
    regexes: [/freepik\.com\/.*_(\d+)\.htm/]
  },
  {
    name: 'flaticon',
    regexes: [/flaticon\.com\/.*_(\d+)/]
  },
  {
    name: 'envato',
    regexes: [/elements\.envato\.com\/.*-([A-Z0-9]+)$/]
  },
  {
    name: 'vecteezy',
    regexes: [/vecteezy\.com\/.*\/(?:\w+-)*(\d+)/]
  },
  {
    name: 'alamy',
    regexes: [/alamy\.com\/.*(?:-|image)(\w+)\.html/]
  },
  {
    name: 'storyblocks',
    regexes: [/storyblocks\.com\/(?:video|images|audio)\/stock\/.*-([a-zA-Z0-9_]+)$/]
  },
  {
    name: 'rawpixel',
    regexes: [/rawpixel\.com\/image\/(\d+)/]
  },
];

/**
 * Parses a stock media URL to extract the site name and asset ID.
 * @param url The stock media URL to parse.
 * @returns An object with the site, id, and original url, or null if no match is found.
 */
export function comprehensiveParseStockUrl(url: string): { site: string; id: string; url: string } | null {
  for (const parser of siteParsers) {
    for (const regex of parser.regexes) {
      const match = url.match(regex);
      // We expect the ID to be in the first capture group
      if (match && match[1]) {
        return {
          site: parser.name,
          id: match[1],
          url: url,
        };
      }
    }
  }

  // If no match is found after trying all parsers, return null.
  return null;
}