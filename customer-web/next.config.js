const nextConfig = {
  basePath: '/web',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
    ],
  },
  async rewrites() {
    return [{ source: '/', destination: '/home' }]
  },
}
module.exports = nextConfig
