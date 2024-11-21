import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import yaml from 'js-yaml';

async function calculateSha512(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash('sha512');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

async function updateYml(exePath: string): Promise<void> {
  try {
    // 确保文件存在
    await fs.access(exePath);

    // 获取文件名
    const fileName = path.basename(exePath);
    
    // 计算 SHA512
    const sha512 = await calculateSha512(exePath);
    
    // 获取文件大小
    const size = await getFileSize(exePath);

    // 获取版本号（从文件名中提取）
    const versionMatch = fileName.match(/\d+\.\d+\.\d+/);
    if (!versionMatch) {
      throw new Error('Version number not found in file name');
    }
    const version = versionMatch[0];

    // 构建 yml 内容
    const ymlContent = {
      version,
      files: [
        {
          url: `https://github.com/Miraiiiii/datacenter-auto-upload/releases/download/v${version}/${fileName}`,
          sha512,
          size
        }
      ],
      path: fileName,
      sha512,
      releaseDate: new Date().toISOString()
    };

    // 将内容写入 latest.yml
    const outputPath = path.join('public', 'latest.yml');
    await fs.writeFile(outputPath, yaml.dump(ymlContent));
    
    console.log('✅ Successfully updated latest.yml');
    console.log(`Version: ${version}`);
    console.log(`File: ${fileName}`);
    console.log(`SHA512: ${sha512}`);
    console.log(`Size: ${size} bytes`);
  } catch (err) {
    throw new Error(`Failed to update yml: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// 从命令行参数获取 exe 路径
const exePath = process.argv[2];
if (!exePath) {
  console.error('❌ Please provide the path to the exe file');
  console.error('Usage: npm run update <path-to-exe>');
  process.exit(1);
}

updateYml(exePath).catch((err: Error) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
