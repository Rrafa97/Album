import { NextApiRequest, NextApiResponse } from 'next';
import { createOSSClient, isSupportedImage, parseImageInfo } from '../../../config/oss';
import { IMAGE_RANGE_CONFIG } from '../../../config/imageRange';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = '1', limit = '20', timeFilter = 'all' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const filterType = timeFilter as string;
    
    console.log('Fetching images from OSS...');
    
    // 创建OSS客户端
    const client = createOSSClient();
    console.log('OSS Client created successfully');
    
    try {
      // 获取OSS中的文件列表
      const result = await client.list({
        prefix: '102OLYMP/',
        'max-keys': 1000, // 一次最多获取1000个文件
      });
      
      console.log('OSS List API Response:', {
        objectsCount: result.objects?.length || 0,
        isTruncated: result.isTruncated,
        nextMarker: result.nextMarker,
        firstObject: result.objects?.[0] || null
      });
      
      if (!result.objects || result.objects.length === 0) {
        console.log('No objects found in 102OLYMP/ directory');
        return res.status(404).json({ 
          error: '在102OLYMP/目录下没有找到文件',
          debug: {
            prefix: '102OLYMP/',
            bucket: 'rrafa-album',
            region: 'oss-cn-hangzhou'
          }
        });
      }
    
    // 获取当前时间用于筛选
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    // 过滤出图片文件，按修改时间倒序排列
    const imageFiles = (result.objects || [])
      .filter((obj: any) => {
        const filename = obj.name.split('/').pop() || '';
        return isSupportedImage(filename) && !filename.startsWith('.');
      })
      .map((obj: any) => {
        const filename = obj.name.split('/').pop() || '';
        const mtime = new Date(obj.lastModified);
        return {
          filename,
          objectName: obj.name,
          mtime,
          size: obj.size,
          // 检查是否有有效的时间信息
          hasValidTime: mtime.getTime() > 0 && mtime.getFullYear() > 1970
        };
      })
      .filter((item: any) => {
        // 根据时间筛选条件过滤
        if (filterType === 'all') return true;
        if (filterType === 'no-time') return !item.hasValidTime;
        if (filterType === 'has-time') return item.hasValidTime;
        if (filterType === 'today') return item.hasValidTime && item.mtime >= today;
        if (filterType === 'yesterday') return item.hasValidTime && item.mtime >= yesterday && item.mtime < today;
        if (filterType === 'this-week') return item.hasValidTime && item.mtime >= thisWeek;
        if (filterType === 'this-month') return item.hasValidTime && item.mtime >= thisMonth;
        if (filterType === 'this-year') return item.hasValidTime && item.mtime >= thisYear;
        return true;
      })
      .sort((a: any, b: any) => {
        // 检查是否在指定范围内
        const isInRange = IMAGE_RANGE_CONFIG.isInPriorityRange;
        
        const aInRange = isInRange(a.filename);
        const bInRange = isInRange(b.filename);
        
        // 第一优先级：指定范围内的图片排在最前面
        if (aInRange && !bInRange) return -1;
        if (!aInRange && bInRange) return 1;
        
        // 都在指定范围内时，按数字顺序排序
        if (aInRange && bInRange) {
          const aMatch = a.filename.match(IMAGE_RANGE_CONFIG.pattern);
          const bMatch = b.filename.match(IMAGE_RANGE_CONFIG.pattern);
          if (aMatch && bMatch) {
            const aNum = parseInt(aMatch[1]);
            const bNum = parseInt(bMatch[1]);
            return aNum - bNum; // 按数字从小到大排序
          }
          return a.filename.localeCompare(b.filename);
        }
        
        // 都不在指定范围内时，按原来的逻辑排序
        // 第二优先级：没有时间的图片排在前面
        if (!a.hasValidTime && b.hasValidTime) return -1;
        if (a.hasValidTime && !b.hasValidTime) return 1;
        
        // 都有时间或都没有时间时，按时间倒序排列
        if (a.hasValidTime && b.hasValidTime) {
          return b.mtime.getTime() - a.mtime.getTime();
        }
        
        // 都没有时间时，按文件名排序
        return a.filename.localeCompare(b.filename);
      });
    
    console.log('Image files found:', imageFiles.length);
    
    // 统计有时间和无时间的图片数量
    const filesWithTime = imageFiles.filter((item: any) => item.hasValidTime).length;
    
    // 统计指定范围内的图片数量
    const filesInRange = imageFiles.filter((item: any) => 
      IMAGE_RANGE_CONFIG.isInPriorityRange(item.filename)
    ).length;
    
    console.log(`Files with valid time: ${filesWithTime}, Files without time: ${imageFiles.length - filesWithTime}`);
    console.log(`Files in range P1011112-P1011270: ${filesInRange}`);
    console.log(`Filter applied: ${filterType}, Filtered files: ${imageFiles.length}`);
    
    // 显示前10个文件的排序结果
    const first10Files = imageFiles.slice(0, 10).map((item: any) => ({
      filename: item.filename,
      inRange: IMAGE_RANGE_CONFIG.isInPriorityRange(item.filename),
      hasValidTime: item.hasValidTime
    }));
    console.log('First 10 files after sorting:', first10Files);
    
    // 分页处理
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedFiles = imageFiles.slice(startIndex, endIndex);
    
    // 获取文件信息
    const images = paginatedFiles.map((imageInfo: any) => {
      const parsedInfo = parseImageInfo(imageInfo.objectName);
      
      return {
        id: parsedInfo.nameWithoutExt,
        filename: parsedInfo.filename,
        path: parsedInfo.url,
        size: imageInfo.size,
        created: imageInfo.mtime,
        modified: imageInfo.mtime,
        objectName: imageInfo.objectName,
      };
    }).filter(Boolean);
    
      res.status(200).json({
        images,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(imageFiles.length / limitNum),
          totalImages: imageFiles.length,
          hasNextPage: endIndex < imageFiles.length,
          hasPrevPage: pageNum > 1,
        }
      });
      
    } catch (ossError) {
      console.error('OSS API Error:', ossError);
      res.status(500).json({ 
        error: 'OSS API调用失败',
        details: ossError instanceof Error ? ossError.message : '未知OSS错误',
        debug: {
          bucket: 'rrafa-album',
          prefix: '102OLYMP/',
          region: 'oss-cn-hangzhou'
        }
      });
    }
    
  } catch (error) {
    console.error('General Error:', error);
    res.status(500).json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}