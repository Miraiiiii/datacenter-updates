import hashlib
import os
import yaml
import sys
from datetime import datetime

def calculate_sha512(file_path):
    """计算文件的 SHA512 哈希值"""
    sha512_hash = hashlib.sha512()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            sha512_hash.update(chunk)
    return sha512_hash.hexdigest()

def get_file_size(file_path):
    """获取文件大小（以字节为单位）"""
    return os.path.getsize(file_path)

def update_yml(exe_path):
    """更新 latest.yml 文件"""
    yml_path = os.path.join(os.path.dirname(exe_path), 'public', 'latest.yml')
    
    # 计算文件的哈希值和大小
    sha512_value = calculate_sha512(exe_path)
    size_value = get_file_size(exe_path)
    
    # 读取现有的 yml 文件
    with open(yml_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    
    # 更新值
    if 'files' in data and len(data['files']) > 0:
        data['files'][0]['sha512'] = sha512_value
        data['files'][0]['size'] = size_value
    
    data['sha512'] = sha512_value
    data['releaseDate'] = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
    
    # 写回文件
    with open(yml_path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True)
    
    print(f'SHA512: {sha512_value}')
    print(f'Size: {size_value} bytes')
    print(f'Successfully updated {yml_path}')

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python update_hash.py <path-to-exe>')
        sys.exit(1)
    
    exe_path = sys.argv[1]
    if not os.path.exists(exe_path):
        print(f'Error: File {exe_path} does not exist')
        sys.exit(1)
        
    update_yml(exe_path)
