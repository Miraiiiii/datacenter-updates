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
  // 禁用遥测
  telemetry: false,
  // 输出模式
  output: 'standalone',
  // 实验性功能
  experimental: {
    // 启用 app 目录
    appDir: true,
  },
}

module.exports = nextConfig
