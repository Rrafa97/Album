import { NextApiRequest, NextApiResponse } from 'next';
import { createOSSClient } from '../../../../config/oss';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { filename } = req.query;
    
    if (!filename || Array.isArray(filename)) {
      return res.status(400).json({ error: '无效的文件名' });
    }
    
    console.log('Attempting to delete file from OSS:', filename);
    
    // 创建OSS客户端
    const client = createOSSClient();
    
    // 构建OSS对象名称（文件在102OLYMP/目录下）
    const objectName = `102OLYMP/${filename}`;
    
    try {
      // 检查文件是否存在
      await client.head(objectName);
    } catch (error) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    // 删除OSS中的文件
    await client.delete(objectName);
    
    console.log('File deleted successfully from OSS:', filename);
    
    res.status(200).json({ 
      message: '文件删除成功',
      filename: filename 
    });
    
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: '删除文件失败' });
  }
}
