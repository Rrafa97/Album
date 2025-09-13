import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { filename } = req.query;
    
    if (!filename || Array.isArray(filename)) {
      return res.status(400).json({ error: '无效的文件名' });
    }
    
    console.log('Attempting to delete local file:', filename);
    
    // 构建本地文件路径
    const filePath = path.join(process.cwd(), 'public', '102OLYMP', filename);
    
    try {
      // 检查文件是否存在
      fs.accessSync(filePath, fs.constants.F_OK);
    } catch (error) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    // 删除本地文件
    fs.unlinkSync(filePath);
    
    console.log('File deleted successfully from local storage:', filename);
    
    res.status(200).json({ 
      message: '文件删除成功',
      filename: filename 
    });
    
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: '删除文件失败' });
  }
}
