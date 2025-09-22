// src/lib/official-url-parser.ts
// Official URL parser based on nehtw.com idExtractor function

type ParseResult = {
  source: string;
  id: string;
  url: string;
} | false;

type SourceMatch = {
  match: RegExp;
  result: (matches: RegExpMatchArray) => { source: string; id: string; url: string };
};

// Helper function for idMapping (simplified version)
function idMapping(source: string, arr: string[]): string {
  // For most cases, we'll use the last non-empty element
  // This is a simplified implementation - the original might have more complex logic
  return arr.filter(item => item && item.trim() !== '').pop() || '';
}

export function officialParseStockUrl(str: string): ParseResult {
  const sourceMatch: SourceMatch[] = [
    {
      match: /shutterstock.com(|\/[a-z]*)\/video\/clip-([0-9]*)/,
      result: (string) => {
        const stockSource = 'vshutter';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /shutterstock.com(.*)music\/(.*)track-([0-9]*)-/,
      result: (string) => {
        const stockSource = 'mshutter';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /shutterstock\.com\/(.*)(image-vector|image-photo|image-illustration|image|image-generated|editorial)\/([0-9a-zA-Z-_]*)-([0-9a-z]*)/,
      result: (string) => {
        const stockSource = 'shutterstock';
        const stockId = string[4];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /shutterstock\.com\/(.*)(image-vector|image-photo|image-illustration|image-generated|editorial)\/([0-9a-z]*)/,
      result: (string) => {
        const stockSource = 'shutterstock';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /stock\.adobe.com\/(..\/||.....\/)(images|templates|3d-assets|stock-photo|video)\/([a-zA-Z0-9-%.,]*)\/([0-9]*)/,
      result: (string) => {
        const stockSource = 'adobestock';
        const stockId = string[4];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /stock\.adobe.com(.*)asset_id=([0-9]*)/,
      result: (string) => {
        const stockSource = 'adobestock';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /stock\.adobe.com\/(.*)search\/audio\?(k|keywords)=([0-9]*)/,
      result: (string) => {
        const stockSource = 'adobestock';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /stock\.adobe\.com\/(..\/||.....\/)([0-9]*)/,
      result: (string) => {
        const stockSource = 'adobestock';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /depositphotos\.com(.*)depositphotos_([0-9]*)(.*)\.jpg/,
      result: (string) => {
        const stockSource = 'depositphotos';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /depositphotos\.com\/([0-9]*)\/stock-video(.*)/,
      result: (string) => {
        const stockSource = 'depositphotos_video';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /depositphotos\.com\/([0-9]*)\/(stock-photo|stock-illustration|free-stock)(.*)/,
      result: (string) => {
        const stockSource = 'depositphotos';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /depositphotos.com(.*)qview=([0-9]*)/,
      result: (string) => {
        const stockSource = 'depositphotos';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /depositphotos.com(.*)\/(photo|editorial|vector|illustration)\/([0-9a-z-]*)-([0-9]*)/,
      result: (string) => {
        const stockSource = 'depositphotos';
        const stockId = string[4];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /123rf\.com\/(photo|free-photo)_([0-9]*)_/,
      result: (string) => {
        const stockSource = '123rf';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /123rf\.com\/(.*)mediapopup=([0-9]*)/,
      result: (string) => {
        const stockSource = '123rf';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /123rf\.com\/stock-photo\/([0-9]*).html/,
      result: (string) => {
        const stockSource = '123rf';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /istockphoto\.com\/(.*)gm([0-9A-Z_]*)-/,
      result: (string) => {
        const stockSource = 'istockphoto';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /gettyimages\.com\/(.*)\/([0-9]*)/,
      result: (string) => {
        const stockSource = 'istockphoto';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /freepik.(.*)\/(.*)-?video-?(.*)\/([0-9a-z-]*)_([0-9]*)/,
      result: (string) => {
        const stockSource = 'vfreepik';
        const stockId = string[5];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /freepik\.(.*)(.*)_([0-9]*).htm/,
      result: (string) => {
        const stockSource = 'freepik';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /freepik.com\/(icon|icone)\/(.*)_([0-9]*)/,
      result: (string) => {
        const stockSource = 'flaticon';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /flaticon.com\/(.*)\/([0-9a-z-]*)_([0-9]*)/,
      result: (string) => {
        const stockSource = 'flaticon';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /flaticon.com\/(.*)(packs|stickers-pack)\/([0-9a-z-]*)/,
      result: (string) => {
        const stockSource = 'flaticonpack';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /elements\.envato\.com(.*)\/([0-9a-zA-Z-]*)-([0-9A-Z]*)/,
      result: (string) => {
        const stockSource = 'envato';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /dreamstime(.*)-image([0-9]*)/,
      result: (string) => {
        const stockSource = 'dreamstime';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /pngtree\.com(.*)_([0-9]*).html/,
      result: (string) => {
        const stockSource = 'pngtree';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /vectorstock.com\/([0-9a-zA-Z-]*)\/([0-9a-zA-Z-]*)-([0-9]*)/,
      result: (string) => {
        const stockSource = 'vectorstock';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /motionarray.com\/([a-zA-Z0-9-]*)\/([a-zA-Z0-9-]*)-([0-9]*)/,
      result: (string) => {
        const stockSource = 'motionarray';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /(alamy|alamyimages)\.(com|es|de|it|fr)\/(.*)(-|image)([0-9]*).html/,
      result: (string) => {
        const stockSource = 'alamy';
        const stockId = string[5];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /motionelements\.com\/(([a-z-]*\/)|)(([a-z-3]*)|(product|davinci-resolve-template))(\/|-)([0-9]*)-/,
      result: (string) => {
        const stockSource = 'motionelements';
        const getVar = [3, 7];
        const arr: string[] = [];
        for (let i = 0; i < string.length; i++) {
          if (getVar.includes(i)) {
            arr.push(string[i]);
          }
        }
        const stockId = idMapping(stockSource, arr);
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /storyblocks\.com\/(video|images|audio)\/stock\/([0-9a-z-]*)-([0-9a-z_]*)/,
      result: (string) => {
        const stockSource = 'storyblocks';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /epidemicsound.com\/(.*)tracks?\/([a-zA-Z0-9-]*)/,
      result: (string) => {
        const stockSource = 'epidemicsound';
        const getVar = [1, 2];
        const arr: string[] = [];
        for (let i = 0; i < string.length; i++) {
          if (getVar.includes(i)) {
            arr.push(string[i]);
          }
        }
        const stockId = idMapping(stockSource, arr);
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /yellowimages\.com\/(stock\/|(.*)p=)([0-9a-z-]*)/,
      result: (string) => {
        const stockSource = 'yellowimages';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /vecteezy.com\/([\/a-zA-Z-]*)\/([0-9]*)/,
      result: (string) => {
        const stockSource = 'vecteezy';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /creativefabrica.com\/(.*)product\/([a-z0-9-]*)/,
      result: (string) => {
        const stockSource = 'creativefabrica';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /lovepik.com\/([a-z]*)-([0-9]*)\//,
      result: (string) => {
        const stockSource = 'lovepik';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /rawpixel\.com\/image\/([0-9]*)/,
      result: (string) => {
        const stockSource = 'rawpixel';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /deeezy\.com\/product\/([0-9]*)/,
      result: (string) => {
        const stockSource = 'deeezy';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /(productioncrate|footagecrate|graphicscrate)\.com\/([a-z0-9-]*)\/([a-zA-Z0-9-_]*)/,
      result: (string) => {
        const stockSource = 'footagecrate';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /artgrid\.io\/clip\/([0-9]*)\//,
      result: (string) => {
        const stockSource = 'artgrid_HD';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /pixelsquid.com(.*)-([0-9]*)\?image=(...)/,
      result: (string) => {
        const stockSource = 'pixelsquid';
        const getVar = [2, 3];
        const arr: string[] = [];
        for (let i = 0; i < string.length; i++) {
          if (getVar.includes(i)) {
            arr.push(string[i]);
          }
        }
        const stockId = idMapping(stockSource, arr);
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /pixelsquid.com(.*)-([0-9]*)/,
      result: (string) => {
        const stockSource = 'pixelsquid';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /ui8\.net\/(.*)\/(.*)\/([0-9a-zA-Z-]*)/,
      result: (string) => {
        const stockSource = 'ui8';
        const stockId = string[3];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /iconscout.com\/((\w{2})\/?$|(\w{2})\/|)([0-9a-z-]*)\/([0-9a-z-_]*)/,
      result: (string) => {
        const stockSource = 'iconscout';
        const stockId = string[5];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /designi.com.br\/([0-9a-zA-Z]*)/,
      result: (string) => {
        const stockSource = 'designi';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /mockupcloud.com\/(product|scene|graphics\/product)\/([a-z0-9-]*)/,
      result: (string) => {
        const stockSource = 'mockupcloud';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /artlist.io\/(stock-footage|video-templates)\/(.*)\/([0-9]*)/,
      result: (string) => {
        const stockSource = 'artlist_footage';
        const getVar = [1, 3];
        const arr: string[] = [];
        for (let i = 0; i < string.length; i++) {
          if (getVar.includes(i)) {
            arr.push(string[i]);
          }
        }
        const stockId = idMapping(stockSource, arr);
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /artlist.io\/(sfx|royalty-free-music)\/(.*)\/([0-9]*)/,
      result: (string) => {
        const stockSource = 'artlist_sound';
        const getVar = [1, 3];
        const arr: string[] = [];
        for (let i = 0; i < string.length; i++) {
          if (getVar.includes(i)) {
            arr.push(string[i]);
          }
        }
        const stockId = idMapping(stockSource, arr);
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /pixeden.com\/([0-9a-z-]*)\/([0-9a-z-]*)/,
      result: (string) => {
        const stockSource = 'pixeden';
        const getVar = [1, 2];
        const arr: string[] = [];
        for (let i = 0; i < string.length; i++) {
          if (getVar.includes(i)) {
            arr.push(string[i]);
          }
        }
        const stockId = idMapping(stockSource, arr);
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /uplabs.com\/posts\/([0-9a-z-]*)/,
      result: (string) => {
        const stockSource = 'uplabs';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /pixelbuddha.net\/(premium|)(.*)\/([0-9a-z-]*)/,
      result: (string) => {
        const stockSource = 'pixelbuddha';
        const getVar = [1, 2, 3];
        const arr: string[] = [];
        for (let i = 0; i < string.length; i++) {
          if (getVar.includes(i)) {
            arr.push(string[i]);
          }
        }
        const stockId = idMapping(stockSource, arr);
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /uihut.com\/designs\/([0-9]*)/,
      result: (string) => {
        const stockSource = 'uihut';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /craftwork.design\/product\/([0-9a-z-]*)/,
      result: (string) => {
        const stockSource = 'craftwork';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /baixardesign.com.br\/arquivo\/([0-9a-z]*)/,
      result: (string) => {
        const stockSource = 'baixardesign';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /soundstripe.com\/(.*)\/([0-9]*)/,
      result: (string) => {
        const stockSource = 'soundstripe';
        const getVar = [1, 2];
        const arr: string[] = [];
        for (let i = 0; i < string.length; i++) {
          if (getVar.includes(i)) {
            arr.push(string[i]);
          }
        }
        const stockId = idMapping(stockSource, arr);
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /mrmockup.com\/product\/([0-9a-z-]*)/,
      result: (string) => {
        const stockSource = 'mrmockup';
        const stockId = string[1];
        return { source: stockSource, id: stockId, url: str };
      }
    },
    {
      match: /designbr\.com\.br\/(.*)modal=([^&]+)/,
      result: (string) => {
        const stockSource = 'designbr';
        const stockId = string[2];
        return { source: stockSource, id: stockId, url: str };
      }
    }
  ];

  const item = sourceMatch.filter(item => str.match(item.match));
  
  // Is invalid
  if (item.length < 1) return false;
  
  // Item
  const matchedItem = item[0];
  
  // Apply match
  const match = str.match(matchedItem.match);
  if (!match) return false;
  
  // Get result
  return matchedItem.result(match);
}

// Export for backward compatibility
export { officialParseStockUrl as comprehensiveParseStockUrl };
