import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import yaml from 'js-yaml';

async function calculateSha512(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash('sha512');
  hashSum.update(fileBuffer);
  return hashSum.digest('base64');
}

async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

async function updateYml(exePath: string, releaseUrl: string): Promise<void> {
  const fileName = path.basename(exePath);
  const publicDir = path.join(process.cwd(), 'public');
  const ymlPath = path.join(publicDir, 'latest.yml');

  // 确保 public 目录存在
  await fs.mkdir(publicDir, { recursive: true });

  const sha512Value = await calculateSha512(exePath);
  const sizeValue = await getFileSize(exePath);

  // 从版本号中提取版本信息
  const versionMatch = fileName.match(/\d+\.\d+\.\d+/);
  const version = versionMatch ? versionMatch[0] : '0.0.1';

  const ymlContent = {
    version,
    files: [
      {
        url: `${releaseUrl}/${fileName}`,
        sha512: sha512Value,
        size: sizeValue,
      },
    ],
    path: fileName,
    sha512: sha512Value,
    releaseDate: new Date().toISOString(),
  };

  await fs.writeFile(ymlPath, yaml.dump(ymlContent, { lineWidth: -1 }));

  console.log('✅ Update successful!');
  console.log(`Version: ${version}`);
  console.log(`SHA512: ${sha512Value}`);
  console.log(`Size: ${sizeValue} bytes`);
  console.log(`File: ${fileName}`);
  console.log('\n接下来的步骤：');
  console.log('1. 创建 GitHub Release（标签：v${version}）');
  console.log('2. 上传安装文件到 Release');
  console.log('3. 提交 latest.yml 到仓库');
  console.log('\n下载链接将是：${releaseUrl}/${fileName}');
}

// 从命令行参数获取 exe 路径和 release URL
const [exePath, releaseUrl] = process.argv.slice(2);
if (!exePath || !releaseUrl) {
  console.error('❌ 请提供安装文件路径和 GitHub Release URL');
  console.error('Usage: npm run update <path-to-exe> <release-url>');
  console.error('Example: npm run update "path/to/app.exe" "https://github.com/Miraiiiii/datacenter-updates/releases/download/v1.0.0"');
  process.exit(1);
}

updateYml(exePath, releaseUrl).catch((error) => {
  console.error('❌ Error updating yml:', error);
  process.exit(1);
});
