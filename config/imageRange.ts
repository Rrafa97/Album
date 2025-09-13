// 图片文件名范围配置
export const IMAGE_RANGE_CONFIG = {
  // 指定要显示在最前面的图片文件名范围
  priorityRange: {
    start: 1011112,  // P1011112 (根据您提供的示例)
    end: 1011270     // P1011270
  },
  
  // 文件名模式匹配
  pattern: /P(\d+)/,
  
  // 检查文件名是否在优先范围内
  isInPriorityRange: (filename: string): boolean => {
    const match = filename.match(IMAGE_RANGE_CONFIG.pattern);
    if (!match) return false;
    const num = parseInt(match[1]);
    return num >= IMAGE_RANGE_CONFIG.priorityRange.start && 
           num <= IMAGE_RANGE_CONFIG.priorityRange.end;
  }
};
