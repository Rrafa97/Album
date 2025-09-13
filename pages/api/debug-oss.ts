import { NextApiRequest, NextApiResponse } from 'next';
import { createOSSClient } from '../../config/oss';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('=== OSS Debug Test ===');
    
    // 创建OSS客户端
    const client = createOSSClient();
    console.log('✓ OSS Client created');
    
    // 测试1: 列出所有文件（不限制前缀）
    console.log('Test 1: List all files in bucket...');
    const allFiles = await client.list({ 'max-keys': 10 });
    console.log('All files result:', {
      count: allFiles.objects?.length || 0,
      files: allFiles.objects?.map(obj => obj.name) || []
    });
    
    // 测试2: 列出102OLYMP目录下的文件
    console.log('Test 2: List files in 102OLYMP/ directory...');
    const olympFiles = await client.list({ 
      prefix: '102OLYMP/', 
      'max-keys': 10 
    });
    console.log('102OLYMP files result:', {
      count: olympFiles.objects?.length || 0,
      files: olympFiles.objects?.map(obj => obj.name) || []
    });
    
    // 测试3: 检查特定文件是否存在
    console.log('Test 3: Check if P1011112.JPG exists...');
    try {
      const headResult = await client.head('102OLYMP/P1011112.JPG');
      console.log('✓ P1011112.JPG exists:', headResult);
    } catch (error) {
      console.log('✗ P1011112.JPG not found:', error);
    }
    
    res.status(200).json({
      success: true,
      tests: {
        allFiles: {
          count: allFiles.objects?.length || 0,
          sample: allFiles.objects?.slice(0, 5).map(obj => obj.name) || []
        },
        olympFiles: {
          count: olympFiles.objects?.length || 0,
          files: olympFiles.objects?.map(obj => obj.name) || []
        },
        testFile: 'P1011112.JPG exists'
      }
    });
    
  } catch (error) {
    console.error('OSS Debug Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
