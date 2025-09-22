// src/lib/supported-sites.ts
// Complete list of supported websites from nehtw.com API documentation

export interface SupportedSite {
  id: string;
  name: string;
  displayName: string;
  category: 'photos' | 'videos' | 'audio' | 'graphics' | 'icons' | 'templates' | '3d' | 'mixed';
  website: string;
  cost: number;
  description: string;
}

export const SUPPORTED_SITES: SupportedSite[] = [
  // Photography & Images
  {
    id: 'shutterstock',
    name: 'shutterstock',
    displayName: 'Shutterstock',
    category: 'photos',
    website: 'https://www.shutterstock.com',
    cost: 10,
    description: 'High-quality stock photos, vectors, and illustrations'
  },
  {
    id: 'adobestock',
    name: 'adobestock',
    displayName: 'Adobe Stock',
    category: 'photos',
    website: 'https://stock.adobe.com',
    cost: 10,
    description: 'Professional stock photos, vectors, and 3D assets'
  },
  {
    id: 'depositphotos',
    name: 'depositphotos',
    displayName: 'Depositphotos',
    category: 'photos',
    website: 'https://depositphotos.com',
    cost: 10,
    description: 'Stock photos, vectors, and videos'
  },
  {
    id: 'dreamstime',
    name: 'dreamstime',
    displayName: 'Dreamstime',
    category: 'photos',
    website: 'https://www.dreamstime.com',
    cost: 10,
    description: 'Royalty-free stock photos and illustrations'
  },
  {
    id: '123rf',
    name: '123rf',
    displayName: '123RF',
    category: 'photos',
    website: 'https://www.123rf.com',
    cost: 10,
    description: 'Stock photos, vectors, and illustrations'
  },
  {
    id: 'istockphoto',
    name: 'istockphoto',
    displayName: 'iStock Photo',
    category: 'photos',
    website: 'https://www.istockphoto.com',
    cost: 10,
    description: 'Premium stock photos and vectors'
  },
  {
    id: 'gettyimages',
    name: 'istockphoto', // Note: gettyimages maps to istockphoto in the API
    displayName: 'Getty Images',
    category: 'photos',
    website: 'https://www.gettyimages.com',
    cost: 10,
    description: 'Premium editorial and creative stock photos'
  },
  {
    id: 'alamy',
    name: 'alamy',
    displayName: 'Alamy',
    category: 'photos',
    website: 'https://www.alamy.com',
    cost: 10,
    description: 'Stock photos and editorial images'
  },
  {
    id: 'rawpixel',
    name: 'rawpixel',
    displayName: 'Rawpixel',
    category: 'photos',
    website: 'https://www.rawpixel.com',
    cost: 10,
    description: 'Free and premium stock photos'
  },
  {
    id: 'unsplash',
    name: 'unsplash',
    displayName: 'Unsplash',
    category: 'photos',
    website: 'https://unsplash.com',
    cost: 10,
    description: 'Free high-resolution photos'
  },
  {
    id: 'pexels',
    name: 'pexels',
    displayName: 'Pexels',
    category: 'photos',
    website: 'https://www.pexels.com',
    cost: 10,
    description: 'Free stock photos and videos'
  },
  {
    id: 'pixabay',
    name: 'pixabay',
    displayName: 'Pixabay',
    category: 'photos',
    website: 'https://pixabay.com',
    cost: 10,
    description: 'Free images, videos, and music'
  },

  // Videos
  {
    id: 'vshutter',
    name: 'vshutter',
    displayName: 'Shutterstock Video',
    category: 'videos',
    website: 'https://www.shutterstock.com/video',
    cost: 10,
    description: 'Stock video footage and motion graphics'
  },
  {
    id: 'depositphotos_video',
    name: 'depositphotos_video',
    displayName: 'Depositphotos Video',
    category: 'videos',
    website: 'https://depositphotos.com/video',
    cost: 10,
    description: 'Stock video footage'
  },
  {
    id: 'vfreepik',
    name: 'vfreepik',
    displayName: 'Freepik Video',
    category: 'videos',
    website: 'https://www.freepik.com/videos',
    cost: 10,
    description: 'Free and premium video content'
  },
  {
    id: 'storyblocks',
    name: 'storyblocks',
    displayName: 'Storyblocks',
    category: 'videos',
    website: 'https://www.storyblocks.com',
    cost: 10,
    description: 'Unlimited stock video, audio, and images'
  },
  {
    id: 'motionarray',
    name: 'motionarray',
    displayName: 'Motion Array',
    category: 'videos',
    website: 'https://motionarray.com',
    cost: 10,
    description: 'Video templates, stock footage, and music'
  },
  {
    id: 'motionelements',
    name: 'motionelements',
    displayName: 'Motion Elements',
    category: 'videos',
    website: 'https://www.motionelements.com',
    cost: 10,
    description: 'Video templates and stock footage'
  },
  {
    id: 'artlist_footage',
    name: 'artlist_footage',
    displayName: 'Artlist Footage',
    category: 'videos',
    website: 'https://artlist.io',
    cost: 10,
    description: 'Stock footage and video templates'
  },
  {
    id: 'artgrid_HD',
    name: 'artgrid_HD',
    displayName: 'Artgrid HD',
    category: 'videos',
    website: 'https://artgrid.io',
    cost: 10,
    description: '4K stock footage'
  },
  {
    id: 'footagecrate',
    name: 'footagecrate',
    displayName: 'Footage Crate',
    category: 'videos',
    website: 'https://footagecrate.com',
    cost: 10,
    description: 'Free and premium video effects'
  },
  {
    id: 'videoblocks',
    name: 'videoblocks',
    displayName: 'VideoBlocks',
    category: 'videos',
    website: 'https://www.videoblocks.com',
    cost: 10,
    description: 'Stock video and motion graphics'
  },
  {
    id: 'pond5',
    name: 'pond5',
    displayName: 'Pond5',
    category: 'videos',
    website: 'https://www.pond5.com',
    cost: 10,
    description: 'Stock video, audio, and music'
  },

  // Audio & Music
  {
    id: 'mshutter',
    name: 'mshutter',
    displayName: 'Shutterstock Music',
    category: 'audio',
    website: 'https://www.shutterstock.com/music',
    cost: 10,
    description: 'Royalty-free music and sound effects'
  },
  {
    id: 'epidemicsound',
    name: 'epidemicsound',
    displayName: 'Epidemic Sound',
    category: 'audio',
    website: 'https://www.epidemicsound.com',
    cost: 10,
    description: 'Royalty-free music and sound effects'
  },
  {
    id: 'artlist_sound',
    name: 'artlist_sound',
    displayName: 'Artlist Music',
    category: 'audio',
    website: 'https://artlist.io',
    cost: 10,
    description: 'Royalty-free music and sound effects'
  },
  {
    id: 'soundstripe',
    name: 'soundstripe',
    displayName: 'Soundstripe',
    category: 'audio',
    website: 'https://www.soundstripe.com',
    cost: 10,
    description: 'Royalty-free music for creators'
  },

  // Graphics & Icons
  {
    id: 'freepik',
    name: 'freepik',
    displayName: 'Freepik',
    category: 'graphics',
    website: 'https://www.freepik.com',
    cost: 10,
    description: 'Free and premium vectors, photos, and PSD files'
  },
  {
    id: 'flaticon',
    name: 'flaticon',
    displayName: 'Flaticon',
    category: 'icons',
    website: 'https://www.flaticon.com',
    cost: 10,
    description: 'Free vector icons and stickers'
  },
  {
    id: 'flaticonpack',
    name: 'flaticonpack',
    displayName: 'Flaticon Packs',
    category: 'icons',
    website: 'https://www.flaticon.com/packs',
    cost: 10,
    description: 'Icon packs and sticker collections'
  },
  {
    id: 'vecteezy',
    name: 'vecteezy',
    displayName: 'Vecteezy',
    category: 'graphics',
    website: 'https://www.vecteezy.com',
    cost: 10,
    description: 'Free vectors, stock photos, and videos'
  },
  {
    id: 'vectorstock',
    name: 'vectorstock',
    displayName: 'VectorStock',
    category: 'graphics',
    website: 'https://www.vectorstock.com',
    cost: 10,
    description: 'Vector illustrations and graphics'
  },
  {
    id: 'creativefabrica',
    name: 'creativefabrica',
    displayName: 'Creative Fabrica',
    category: 'graphics',
    website: 'https://www.creativefabrica.com',
    cost: 10,
    description: 'Fonts, graphics, and craft files'
  },
  {
    id: 'lovepik',
    name: 'lovepik',
    displayName: 'Lovepik',
    category: 'graphics',
    website: 'https://www.lovepik.com',
    cost: 10,
    description: 'Free PNG images and vectors'
  },
  {
    id: 'pngtree',
    name: 'pngtree',
    displayName: 'PNGTree',
    category: 'graphics',
    website: 'https://pngtree.com',
    cost: 10,
    description: 'Free PNG images and backgrounds'
  },
  {
    id: 'iconscout',
    name: 'iconscout',
    displayName: 'IconScout',
    category: 'icons',
    website: 'https://iconscout.com',
    cost: 10,
    description: 'Icons, illustrations, and 3D assets'
  },
  {
    id: 'ui8',
    name: 'ui8',
    displayName: 'UI8',
    category: 'graphics',
    website: 'https://ui8.net',
    cost: 10,
    description: 'UI/UX design resources'
  },
  {
    id: 'uplabs',
    name: 'uplabs',
    displayName: 'UpLabs',
    category: 'graphics',
    website: 'https://www.uplabs.com',
    cost: 10,
    description: 'Design resources and inspiration'
  },
  {
    id: 'pixelbuddha',
    name: 'pixelbuddha',
    displayName: 'Pixel Buddha',
    category: 'graphics',
    website: 'https://pixelbuddha.net',
    cost: 10,
    description: 'Free and premium design resources'
  },
  {
    id: 'uihut',
    name: 'uihut',
    displayName: 'UI Hut',
    category: 'graphics',
    website: 'https://uihut.com',
    cost: 10,
    description: 'UI/UX design templates and resources'
  },
  {
    id: 'craftwork',
    name: 'craftwork',
    displayName: 'Craftwork',
    category: 'graphics',
    website: 'https://craftwork.design',
    cost: 10,
    description: 'Design resources and templates'
  },
  {
    id: 'pixeden',
    name: 'pixeden',
    displayName: 'Pixeden',
    category: 'graphics',
    website: 'https://www.pixeden.com',
    cost: 10,
    description: 'Free design resources and templates'
  },
  {
    id: 'yellowimages',
    name: 'yellowimages',
    displayName: 'Yellow Images',
    category: 'graphics',
    website: 'https://yellowimages.com',
    cost: 10,
    description: 'Design mockups and templates'
  },
  {
    id: 'deeezy',
    name: 'deeezy',
    displayName: 'Deeezy',
    category: 'graphics',
    website: 'https://deeezy.com',
    cost: 10,
    description: 'Free design resources'
  },
  {
    id: 'designi',
    name: 'designi',
    displayName: 'Designi',
    category: 'graphics',
    website: 'https://designi.com.br',
    cost: 10,
    description: 'Design resources and templates'
  },
  {
    id: 'mockupcloud',
    name: 'mockupcloud',
    displayName: 'Mockup Cloud',
    category: 'templates',
    website: 'https://mockupcloud.com',
    cost: 10,
    description: 'Free mockup templates'
  },
  {
    id: 'mrmockup',
    name: 'mrmockup',
    displayName: 'Mr. Mockup',
    category: 'templates',
    website: 'https://mrmockup.com',
    cost: 10,
    description: 'Free mockup templates'
  },
  {
    id: 'designbr',
    name: 'designbr',
    displayName: 'Design BR',
    category: 'graphics',
    website: 'https://designbr.com.br',
    cost: 10,
    description: 'Brazilian design resources'
  },
  {
    id: 'baixardesign',
    name: 'baixardesign',
    displayName: 'Baixar Design',
    category: 'graphics',
    website: 'https://baixardesign.com.br',
    cost: 10,
    description: 'Free design resources'
  },

  // 3D & Templates
  {
    id: 'pixelsquid',
    name: 'pixelsquid',
    displayName: 'Pixelsquid',
    category: '3d',
    website: 'https://www.pixelsquid.com',
    cost: 10,
    description: '3D objects and mockups'
  },
  {
    id: 'envato',
    name: 'envato',
    displayName: 'Envato Elements',
    category: 'mixed',
    website: 'https://elements.envato.com',
    cost: 10,
    description: 'Unlimited downloads of creative assets'
  }
];

// Helper function to get sites by category
export function getSitesByCategory(category: SupportedSite['category']): SupportedSite[] {
  return SUPPORTED_SITES.filter(site => site.category === category);
}

// Helper function to get site by name
export function getSiteByName(name: string): SupportedSite | undefined {
  return SUPPORTED_SITES.find(site => site.name === name);
}

// Helper function to get all categories
export function getAllCategories(): SupportedSite['category'][] {
  return Array.from(new Set(SUPPORTED_SITES.map(site => site.category)));
}
