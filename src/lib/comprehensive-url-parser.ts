// src/lib/comprehensive-url-parser.ts

type SiteMatcher = {
  name: string;
  regex: RegExp;
  idIndex?: number;
};

// A comprehensive list of matchers based on the nehtw.com source code
const siteMatchers: SiteMatcher[] = [
    { name: 'shutterstock', regex: /shutterstock\.com\/(?:image-photo|image-vector|image-illustration|image|image-generated|editorial)\/[a-zA-Z0-9-]*?-(\d+)/ },
    { name: 'shutterstock', regex: /shutterstock\.com\/(?:image-photo|image-vector|image-illustration|image-generated|editorial)\/([0-9a-z]+)/, idIndex: 1 },
    { name: 'vshutter', regex: /shutterstock\.com\/(?:|\/[a-z]*)\/video\/clip-([0-9]*)/, idIndex: 1 },
    { name: 'mshutter', regex: /shutterstock\.com\/music\/track-([0-9]*)-/, idIndex: 1 },
    { name: 'adobestock', regex: /stock\.adobe\.com\/(?:[a-z]{2,5}\/)?(?:images|templates|3d-assets|stock-photo|video)\/.*?\/(\d+)/ },
    { name: 'adobestock', regex: /stock\.adobe\.com\/.*(?:asset_id=|&k=)(\d+)/ },
    { name: 'depositphotos', regex: /depositphotos\.com\/(?:photo|editorial|vector|illustration)\/.*?-(\d+)/ },
    { name: 'depositphotos_video', regex: /depositphotos\.com\/([0-9]*)\/stock-video/ },
    { name: 'dreamstime', regex: /dreamstime\.com\/.*-image(\d+)/ },
    { name: 'dreamstime', regex: /dreamstime\.com\/.*-image(\d+)\// },
    { name: 'dreamstime', regex: /dreamstime\.com\/.*image(\d+)/ },
    { name: '123rf', regex: /123rf\.com\/(?:photo|free-photo)_([0-9]*)_/ },
    { name: 'istockphoto', regex: /istockphoto\.com\/.*gm([0-9A-Z_]*)-/ },
    { name: 'gettyimages', regex: /gettyimages\.com\/.*?\/(\d+)/ },
    { name: 'vfreepik', regex: /freepik\.com\/video\/.*_(\d+)\.htm/ },
    { name: 'freepik', regex: /freepik\.com\/.*_(\d+)\.htm/ },
    { name: 'flaticon', regex: /flaticon\.com\/.*_(\d+)/ },
    { name: 'envato', regex: /elements\.envato\.com\/.*-([A-Z0-9]+)$/ },
    { name: 'pngtree', regex: /pngtree\.com\/.*_(\d+)\.html/ },
    { name: 'vectorstock', regex: /vectorstock\.com\/.*-([0-9]*)$/ },
    { name: 'motionarray', regex: /motionarray\.com\/.*-([0-9]*)$/ },
    { name: 'alamy', regex: /(?:alamy|alamyimages)\.com\/.*(?:-|image)(\w+)\.html/ },
    { name: 'storyblocks', regex: /storyblocks\.com\/(?:video|images|audio)\/stock\/.*-([a-zA-Z0-9_]+)$/ },
    { name: 'vecteezy', regex: /vecteezy\.com\/.*\/(?:\w+-)*(\d+)/ },
    { name: 'creativefabrica', regex: /creativefabrica\.com\/.*\/([a-z0-9-]+)\/?$/ },
    { name: 'lovepik', regex: /lovepik\.com\/[a-z]+-(\d+)\// },
    { name: 'rawpixel', regex: /rawpixel\.com\/image\/(\d+)/ },
    { name: 'epidemicsound', regex: /epidemicsound\.com\/sound-effects\/tracks\/([a-f0-9-]+)/ },
    { name: 'epidemicsound', regex: /epidemicsound\.com\/music\/tracks\/([a-f0-9-]+)/ },
    { name: 'epidemicsound', regex: /epidemicsound\.com\/.*tracks?\/([a-f0-9-]+)/ },
];

export function comprehensiveParseStockUrl(url: string): { site: string; id: string; url: string } | null {
  for (const matcher of siteMatchers) {
    const match = url.match(matcher.regex);
    if (match && (match[matcher.idIndex || 1])) {
        return {
        site: matcher.name,
        id: match[matcher.idIndex || 1],
        url: url,
      };
    }
  }
  return null;
}