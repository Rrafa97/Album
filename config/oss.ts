import OSS from 'ali-oss';

// OSS配置 - 从环境变量读取
export const OSS_CONFIG = {
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
  bucket: process.env.OSS_BUCKET || 'rrafa-album',
  endpoint: process.env.OSS_ENDPOINT || 'https://oss-cn-hangzhou.aliyuncs.com',
  // 图片存储路径前缀
  imagePrefix: '102OLYMP/',
  // 支持的图片格式
  supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

// 创建OSS客户端实例
export const createOSSClient = () => {
  return new OSS({
    region: OSS_CONFIG.region,
    accessKeyId: OSS_CONFIG.accessKeyId,
    accessKeySecret: OSS_CONFIG.accessKeySecret,
    bucket: OSS_CONFIG.bucket,
    endpoint: OSS_CONFIG.endpoint,
  });
};

// 生成图片访问URL（带签名）
export const getImageUrl = (objectName: string): string => {
  const client = createOSSClient();
  try {
    // 生成带签名的URL，有效期1小时
    return client.signatureUrl(objectName, {
      expires: 3600, // 1小时
      method: 'GET'
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    // 如果签名失败，返回普通URL
    return `${OSS_CONFIG.endpoint}/${OSS_CONFIG.bucket}/${objectName}`;
  }
};

// 生成不带签名的URL（用于测试）
export const getImageUrlUnsigned = (objectName: string): string => {
  return `${OSS_CONFIG.endpoint}/${OSS_CONFIG.bucket}/${objectName}`;
};

// 检查文件是否为支持的图片格式
export const isSupportedImage = (filename: string): boolean => {
  if (!filename) return false;
  
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex <= 0) return false;
  
  const ext = filename.toLowerCase().substring(lastDotIndex);
  return OSS_CONFIG.supportedFormats.includes(ext);
};

// 从文件名提取图片信息
export const parseImageInfo = (objectName: string) => {
  const filename = objectName.split('/').pop() || '';
  
  if (!filename) {
    return {
      filename: '',
      nameWithoutExt: '',
      extension: '',
      objectName,
      url: getImageUrl(objectName),
    };
  }
  
  const lastDotIndex = filename.lastIndexOf('.');
  const ext = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
  const nameWithoutExt = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  
  return {
    filename,
    nameWithoutExt,
    extension: ext,
    objectName,
    url: getImageUrl(objectName),
  };
};
