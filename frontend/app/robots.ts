import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/dashboard/new/', // Jangan indeks halaman form input
    },
    sitemap: 'https://dataion.vercel.app/sitemap.xml',
  }
}