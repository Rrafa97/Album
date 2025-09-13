const fs = require('fs');
const path = require('path');

// 生成静态图片数据
function generateStaticData() {
  const imagesDir = path.join(process.cwd(), 'public', '102OLYMP');
  
  try {
    const files = fs.readdirSync(imagesDir);
    
    // 检查文件是否为支持的图片格式
    const isSupportedImage = (filename) => {
      if (!filename) return false;
      const lastDotIndex = filename.lastIndexOf('.');
      if (lastDotIndex <= 0) return false;
      const ext = filename.toLowerCase().substring(lastDotIndex);
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    };
    
    // 过滤出图片文件
    const imageFiles = files
      .filter(filename => isSupportedImage(filename) && !filename.startsWith('.'))
      .map(filename => {
        const filePath = path.join(imagesDir, filename);
        const stats = fs.statSync(filePath);
        const lastDotIndex = filename.lastIndexOf('.');
        const ext = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
        const nameWithoutExt = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
        
        return {
          id: nameWithoutExt,
          filename,
          path: `/102OLYMP/${filename}`,
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => {
        // 按文件名排序
        return a.filename.localeCompare(b.filename);
      });
    
    // 创建静态数据文件
    const staticData = {
      images: imageFiles,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalImages: imageFiles.length,
        hasNextPage: false,
        hasPrevPage: false,
      }
    };
    
    // 写入到public目录
    const outputPath = path.join(process.cwd(), 'public', 'static-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(staticData, null, 2));
    
    console.log(`✅ 生成了静态数据文件: ${outputPath}`);
    console.log(`📊 包含 ${imageFiles.length} 张图片`);
    
  } catch (error) {
    console.error('❌ 生成静态数据失败:', error);
    process.exit(1);
  }
}

generateStaticData();
