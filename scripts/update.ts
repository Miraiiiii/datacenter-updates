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

async function updateYml(exePath: string): Promise<void> {
  const fileName = path.basename(exePath);
  const publicDir = path.join(process.cwd(), 'public');
  const ymlPath = path.join(publicDir, 'latest.yml');

  // 确保 public 目录存在
  await fs.mkdir(publicDir, { recursive: true });

  // 复制安装文件到 public 目录
  await fs.copyFile(exePath, path.join(publicDir, fileName));

  const sha512Value = await calculateSha512(exePath);
  const sizeValue = await getFileSize(exePath);

  // 从版本号中提取版本信息
  const versionMatch = fileName.match(/\d+\.\d+\.\d+/);
  const version = versionMatch ? versionMatch[0] : '0.0.1';

  const ymlContent = {
    version,
    files: [
      {
        url: fileName,
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
}

// 从命令行参数获取 exe 路径
const exePath = process.argv[2];
if (!exePath) {
  console.error('❌ Please provide the path to the exe file');
  console.error('Usage: npm run update <path-to-exe>');
  process.exit(1);
}

updateYml(exePath).catch((error) => {
  console.error('❌ Error updating yml:', error);
  process.exit(1);
});
  console.error('❌ Error updating yml:', error);
  process.exit(1);
});
