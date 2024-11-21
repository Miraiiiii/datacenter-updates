/** @type {import('next').NextConfig} */
const nextConfig = {
  // 配置 headers 允许跨域访问
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
