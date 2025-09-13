/**
 * Advanced URL Parser for Stock Media Sites
 * Supports 30+ stock sites with comprehensive regex patterns
 */

export interface ParsedUrl {
  source: string
  id: string
  url: string
}

export interface UrlParserConfig {
  match: RegExp
  result: (matches: RegExpMatchArray) => ParsedUrl
}

export class UrlParser {
  private static readonly SOURCE_PATTERNS: UrlParserConfig[] = [
    // Shutterstock patterns
    {
      match: /shutterstock.com(|\/[a-z]*)\/video\/clip-([0-9]*)/,
      result: (matches) => ({
        source: 'vshutter',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /shutterstock.com(.*)music\/(.*)track-([0-9]*)-/,
      result: (matches) => ({
        source: 'mshutter',
        id: matches[3],
        url: matches.input || ''
      })
    },
    {
      match: /shutterstock\.com\/(.*)(image-vector|image-photo|image-illustration|image|image-generated|editorial)\/([0-9a-zA-Z-_]*)-([0-9a-z]*)/,
      result: (matches) => ({
        source: 'shutterstock',
        id: matches[4],
        url: matches.input || ''
      })
    },
    {
      match: /shutterstock\.com\/(.*)(image-vector|image-photo|image-illustration|image-generated|editorial)\/([0-9a-z]*)/,
      result: (matches) => ({
        source: 'shutterstock',
        id: matches[3],
        url: matches.input || ''
      })
    },
    {
      match: /shutterstock\.com\/image-photo\/[^\/]*-([0-9]+)$/,
      result: (matches) => ({
        source: 'shutterstock',
        id: matches[1],
        url: matches.input || ''
      })
    },
    
    // Adobe Stock patterns
    {
      match: /stock\.adobe.com\/(..\/||.....\/)(images|templates|3d-assets|stock-photo|video)\/([a-zA-Z0-9-%.,]*)\/([0-9]*)/,
      result: (matches) => ({
        source: 'adobestock',
        id: matches[4],
        url: matches.input || ''
      })
    },
    {
      match: /stock\.adobe.com(.*)asset_id=([0-9]*)/,
      result: (matches) => ({
        source: 'adobestock',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /stock\.adobe.com\/(.*)search\/audio\?(k|keywords)=([0-9]*)/,
      result: (matches) => ({
        source: 'adobestock',
        id: matches[3],
        url: matches.input || ''
      })
    },
    {
      match: /stock\.adobe\.com\/(..\/||.....\/)([0-9]*)/,
      result: (matches) => ({
        source: 'adobestock',
        id: matches[2],
        url: matches.input || ''
      })
    },
    
    // Depositphotos patterns
    {
      match: /depositphotos\.com(.*)depositphotos_([0-9]*)(.*)\.jpg/,
      result: (matches) => ({
        source: 'depositphotos',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /depositphotos\.com\/([0-9]*)\/stock-video(.*)/,
      result: (matches) => ({
        source: 'depositphotos_video',
        id: matches[1],
        url: matches.input || ''
      })
    },
    {
      match: /depositphotos\.com\/([0-9]*)\/(stock-photo|stock-illustration|free-stock)(.*)/,
      result: (matches) => ({
        source: 'depositphotos',
        id: matches[1],
        url: matches.input || ''
      })
    },
    {
      match: /depositphotos.com(.*)qview=([0-9]*)/,
      result: (matches) => ({
        source: 'depositphotos',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /depositphotos.com(.*)\/(photo|editorial|vector|illustration)\/([0-9a-z-]*)-([0-9]*)/,
      result: (matches) => ({
        source: 'depositphotos',
        id: matches[4],
        url: matches.input || ''
      })
    },
    
    // 123RF patterns
    {
      match: /123rf\.com\/(photo|free-photo)_([0-9]*)_/,
      result: (matches) => ({
        source: '123rf',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /123rf\.com\/(.*)mediapopup=([0-9]*)/,
      result: (matches) => ({
        source: '123rf',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /123rf\.com\/stock-photo\/([0-9]*).html/,
      result: (matches) => ({
        source: '123rf',
        id: matches[1],
        url: matches.input || ''
      })
    },
    
    // iStock/Getty Images patterns
    {
      match: /istockphoto\.com\/(.*)gm([0-9A-Z_]*)-/,
      result: (matches) => ({
        source: 'istockphoto',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /gettyimages\.com\/(.*)\/([0-9]*)/,
      result: (matches) => ({
        source: 'istockphoto',
        id: matches[2],
        url: matches.input || ''
      })
    },
    
    // Freepik patterns
    {
      match: /freepik.(.*)\/(.*)-?video-?(.*)\/([0-9a-z-]*)_([0-9]*)/,
      result: (matches) => ({
        source: 'vfreepik',
        id: matches[5],
        url: matches.input || ''
      })
    },
    {
      match: /freepik\.(.*)(.*)_([0-9]*).htm/,
      result: (matches) => ({
        source: 'freepik',
        id: matches[3],
        url: matches.input || ''
      })
    },
    {
      match: /freepik.com\/(icon|icone)\/(.*)_([0-9]*)/,
      result: (matches) => ({
        source: 'flaticon',
        id: matches[3],
        url: matches.input || ''
      })
    },
    
    // Flaticon patterns
    {
      match: /flaticon.com\/(.*)\/([0-9a-z-]*)_([0-9]*)/,
      result: (matches) => ({
        source: 'flaticon',
        id: matches[3],
        url: matches.input || ''
      })
    },
    {
      match: /flaticon.com\/(.*)(packs|stickers-pack)\/([0-9a-z-]*)/,
      result: (matches) => ({
        source: 'flaticonpack',
        id: matches[3],
        url: matches.input || ''
      })
    },
    
    // Envato patterns
    {
      match: /elements\.envato\.com(.*)\/([0-9a-zA-Z-]*)-([0-9A-Z]*)/,
      result: (matches) => ({
        source: 'envato',
        id: matches[3],
        url: matches.input || ''
      })
    },
    
    // Dreamstime patterns
    {
      match: /dreamstime(.*)-image([0-9]*)/,
      result: (matches) => ({
        source: 'dreamstime',
        id: matches[2],
        url: matches.input || ''
      })
    },
    
    // PNGTree patterns
    {
      match: /pngtree\.com(.*)_([0-9]*).html/,
      result: (matches) => ({
        source: 'pngtree',
        id: matches[2],
        url: matches.input || ''
      })
    },
    
    // VectorStock patterns
    {
      match: /vectorstock.com\/([0-9a-zA-Z-]*)\/([0-9a-zA-Z-]*)-([0-9]*)/,
      result: (matches) => ({
        source: 'vectorstock',
        id: matches[3],
        url: matches.input || ''
      })
    },
    
    // MotionArray patterns
    {
      match: /motionarray.com\/([a-zA-Z0-9-]*)\/([a-zA-Z0-9-]*)-([0-9]*)/,
      result: (matches) => ({
        source: 'motionarray',
        id: matches[3],
        url: matches.input || ''
      })
    },
    
    // Alamy patterns
    {
      match: /(alamy|alamyimages)\.(com|es|de|it|fr)\/(.*)(-|image)([0-9]*).html/,
      result: (matches) => ({
        source: 'alamy',
        id: matches[5],
        url: matches.input || ''
      })
    },
    
    // MotionElements patterns
    {
      match: /motionelements\.com\/(([a-z-]*\/)|)(([a-z-3]*)|(product|davinci-resolve-template))(\/|-)([0-9]*)-/,
      result: (matches) => {
        const getVar = [3, 7]
        const arr = []
        for (let i = 0; i < matches.length; i++) {
          if (getVar.includes(i)) {
            arr.push(matches[i])
          }
        }
        const stockId = this.idMapping('motionelements', arr)
        return {
          source: 'motionelements',
          id: stockId,
          url: matches.input || ''
        }
      }
    },
    
    // Storyblocks patterns
    {
      match: /storyblocks\.com\/(video|images|audio)\/stock\/([0-9a-z-]*)-([0-9a-z_]*)/,
      result: (matches) => ({
        source: 'storyblocks',
        id: matches[3],
        url: matches.input || ''
      })
    },
    
    // Epidemic Sound patterns
    {
      match: /epidemicsound.com\/(.*)tracks?\/([a-zA-Z0-9-]*)/,
      result: (matches) => {
        const getVar = [1, 2]
        const arr = []
        for (let i = 0; i < matches.length; i++) {
          if (getVar.includes(i)) {
            arr.push(matches[i])
          }
        }
        const stockId = this.idMapping('epidemicsound', arr)
        return {
          source: 'epidemicsound',
          id: stockId,
          url: matches.input || ''
        }
      }
    },
    
    // Additional patterns for other sites...
    {
      match: /yellowimages\.com\/(stock\/|(.*)p=)([0-9a-z-]*)/,
      result: (matches) => ({
        source: 'yellowimages',
        id: matches[3],
        url: matches.input || ''
      })
    },
    {
      match: /vecteezy.com\/([\/a-zA-Z-]*)\/([0-9]*)/,
      result: (matches) => ({
        source: 'vecteezy',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /creativefabrica.com\/(.*)product\/([a-z0-9-]*)/,
      result: (matches) => ({
        source: 'creativefabrica',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /lovepik.com\/([a-z]*)-([0-9]*)\//,
      result: (matches) => ({
        source: 'lovepik',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /rawpixel\.com\/image\/([0-9]*)/,
      result: (matches) => ({
        source: 'rawpixel',
        id: matches[1],
        url: matches.input || ''
      })
    },
    {
      match: /deeezy\.com\/product\/([0-9]*)/,
      result: (matches) => ({
        source: 'deeezy',
        id: matches[1],
        url: matches.input || ''
      })
    },
    {
      match: /(productioncrate|footagecrate|graphicscrate)\.com\/([a-z0-9-]*)\/([a-zA-Z0-9-_]*)/,
      result: (matches) => ({
        source: 'footagecrate',
        id: matches[3],
        url: matches.input || ''
      })
    },
    {
      match: /artgrid\.io\/clip\/([0-9]*)\//,
      result: (matches) => ({
        source: 'artgrid_HD',
        id: matches[1],
        url: matches.input || ''
      })
    },
    {
      match: /pixelsquid.com(.*)-([0-9]*)\?image=(...)/,
      result: (matches) => {
        const getVar = [2, 3]
        const arr = []
        for (let i = 0; i < matches.length; i++) {
          if (getVar.includes(i)) {
            arr.push(matches[i])
          }
        }
        const stockId = this.idMapping('pixelsquid', arr)
        return {
          source: 'pixelsquid',
          id: stockId,
          url: matches.input || ''
        }
      }
    },
    {
      match: /pixelsquid.com(.*)-([0-9]*)/,
      result: (matches) => ({
        source: 'pixelsquid',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /ui8\.net\/(.*)\/(.*)\/([0-9a-zA-Z-]*)/,
      result: (matches) => ({
        source: 'ui8',
        id: matches[3],
        url: matches.input || ''
      })
    },
    {
      match: /iconscout.com\/((\w{2})\/?$|(\w{2})\/|)([0-9a-z-]*)\/([0-9a-z-]*)/,
      result: (matches) => ({
        source: 'iconscout',
        id: matches[5],
        url: matches.input || ''
      })
    },
    {
      match: /designi.com.br\/([0-9a-zA-Z]*)/,
      result: (matches) => ({
        source: 'designi',
        id: matches[1],
        url: matches.input || ''
      })
    },
    {
      match: /mockupcloud.com\/(product|scene|graphics\/product)\/([a-z0-9-]*)/,
      result: (matches) => ({
        source: 'mockupcloud',
        id: matches[2],
        url: matches.input || ''
      })
    },
    {
      match: /artlist.io\/(stock-footage|video-templates)\/(.*)\/([0-9]*)/,
      result: (matches) => {
        const getVar = [1, 3]
        const arr = []
        for (let i = 0; i < matches.length; i++) {
          if (getVar.includes(i)) {
            arr.push(matches[i])
          }
        }
        const stockId = this.idMapping('artlist_footage', arr)
        return {
          source: 'artlist_footage',
          id: stockId,
          url: matches.input || ''
        }
      }
    },
    {
      match: /artlist.io\/(sfx|royalty-free-music)\/(.*)\/([0-9]*)/,
      result: (matches) => {
        const getVar = [1, 3]
        const arr = []
        for (let i = 0; i < matches.length; i++) {
          if (getVar.includes(i)) {
            arr.push(matches[i])
          }
        }
        const stockId = this.idMapping('artlist_sound', arr)
        return {
          source: 'artlist_sound',
          id: stockId,
          url: matches.input || ''
        }
      }
    },
    {
      match: /pixeden.com\/([0-9a-z-]*)\/([0-9a-z-]*)/,
      result: (matches) => {
        const getVar = [1, 2]
        const arr = []
        for (let i = 0; i < matches.length; i++) {
          if (getVar.includes(i)) {
            arr.push(matches[i])
          }
        }
        const stockId = this.idMapping('pixeden', arr)
        return {
          source: 'pixeden',
          id: stockId,
          url: matches.input || ''
        }
      }
    },
    {
      match: /uplabs.com\/posts\/([0-9a-z-]*)/,
      result: (matches) => ({
        source: 'uplabs',
        id: matches[1],
        url: matches.input || ''
      })
    },
    {
      match: /pixelbuddha.net\/(premium|)(.*)\/([0-9a-z-]*)/,
      result: (matches) => {
        const getVar = [1, 2, 3]
        const arr = []
        for (let i = 0; i < matches.length; i++) {
          if (getVar.includes(i)) {
            arr.push(matches[i])
          }
        }
        const stockId = this.idMapping('pixelbuddha', arr)
        return {
          source: 'pixelbuddha',
          id: stockId,
          url: matches.input || ''
        }
      }
    },
    {
      match: /uihut.com\/designs\/([0-9]*)/,
      result: (matches) => ({
        source: 'uihut',
        id: matches[1],
        url: matches.input || ''
      })
    },
    {
      match: /craftwork.design\/product\/([0-9a-z-]*)/,
      result: (matches) => ({
        source: 'craftwork',
        id: matches[1],
        url: matches.input || ''
      })
    },
    {
      match: /baixardesign.com.br\/arquivo\/([0-9a-z]*)/,
      result: (matches) => ({
        source: 'baixardesign',
        id: matches[1],
        url: matches.input || ''
      })
    },
    {
      match: /soundstripe.com\/(.*)\/([0-9]*)/,
      result: (matches) => {
        const getVar = [1, 2]
        const arr = []
        for (let i = 0; i < matches.length; i++) {
          if (getVar.includes(i)) {
            arr.push(matches[i])
          }
        }
        const stockId = this.idMapping('soundstripe', arr)
        return {
          source: 'soundstripe',
          id: stockId,
          url: matches.input || ''
        }
      }
    },
    {
      match: /mrmockup.com\/product\/([0-9a-z-]*)/,
      result: (matches) => ({
        source: 'mrmockup',
        id: matches[1],
        url: matches.input || ''
      })
    },
    {
      match: /designbr\.com\.br\/(.*)modal=([^&]+)/,
      result: (matches) => ({
        source: 'designbr',
        id: matches[2],
        url: matches.input || ''
      })
    }
  ]

  /**
   * Parse URL and extract stock site information
   */
  static parseUrl(url: string): ParsedUrl | null {
    try {
      console.log('Parsing URL:', url)
      
      const matchingPatterns = this.SOURCE_PATTERNS.filter(pattern => 
        url.match(pattern.match)
      )
      
      if (matchingPatterns.length === 0) {
        console.log('No matching patterns found for URL:', url)
        return null
      }
      
      const pattern = matchingPatterns[0]
      const matches = url.match(pattern.match)
      
      if (!matches) {
        console.log('Pattern matched but no capture groups found')
        return null
      }
      
      const result = pattern.result(matches)
      console.log('Parsed URL result:', result)
      
      return result
    } catch (error) {
      console.error('Error parsing URL:', error)
      return null
    }
  }

  /**
   * ID mapping for complex patterns
   */
  private static idMapping(source: string, arr: string[]): string {
    // Simple implementation - can be enhanced based on specific requirements
    return arr.join('_')
  }

  /**
   * Validate if URL is supported
   */
  static isSupportedUrl(url: string): boolean {
    return this.parseUrl(url) !== null
  }

  /**
   * Get supported sites list
   */
  static getSupportedSites(): string[] {
    return [
      'Shutterstock', 'Adobe Stock', 'Depositphotos', '123RF', 'iStock',
      'Freepik', 'Flaticon', 'Envato', 'Dreamstime', 'PNGTree',
      'VectorStock', 'MotionArray', 'Alamy', 'MotionElements', 'Storyblocks',
      'Epidemic Sound', 'Yellow Images', 'Vecteezy', 'Creative Fabrica',
      'LovePik', 'Rawpixel', 'Deezzy', 'FootageCrate', 'ArtGrid',
      'Pixelsquid', 'UI8', 'IconScout', 'Designi', 'MockupCloud',
      'Artlist', 'Pixeden', 'Uplabs', 'PixelBuddha', 'UIHut',
      'Craftwork', 'BaixarDesign', 'Soundstripe', 'MrMockup', 'DesignBR'
    ]
  }
}
