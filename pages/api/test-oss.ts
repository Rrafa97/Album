import { NextApiRequest, NextApiResponse } from 'next';
import { createOSSClient } from '../../config/oss';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Testing OSS connection...');
    
    // 创建OSS客户端
    const client = createOSSClient();
    
    // 测试连接 - 获取102OLYMP目录下的文件
    const result = await client.list({
      prefix: '102OLYMP/',
      'max-keys': 10, // 只获取前10个文件进行测试
    });
    
    console.log('OSS List Result:', {
      objectsCount: result.objects?.length || 0,
      firstFewObjects: result.objects?.slice(0, 3).map(obj => ({
        name: obj.name,
        size: obj.size,
        lastModified: obj.lastModified
      })) || []
    });
    
    // 测试访问您提供的具体文件
    const testFile = '102OLYMP/P1011112.JPG';
    try {
      const headResult = await client.head(testFile);
      console.log('Test file exists:', headResult);
    } catch (error) {
      console.log('Test file not found:', error);
    }
    
    res.status(200).json({
      success: true,
      message: 'OSS连接成功',
      data: {
        totalObjects: result.objects?.length || 0,
        sampleObjects: result.objects?.slice(0, 5).map(obj => ({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
          url: `https://rrafa-album.oss-cn-hangzhou.aliyuncs.com/${obj.name}`
        })) || [],
        testFileExists: true
      }
    });
    
  } catch (error) {
    console.error('OSS连接失败:', error);
    res.status(500).json({ 
      success: false,
      error: 'OSS连接失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}
