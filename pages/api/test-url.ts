import { NextApiRequest, NextApiResponse } from 'next';
import { createOSSClient, getImageUrl, getImageUrlUnsigned } from '../../config/oss';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = createOSSClient();
    
    // 测试文件
    const testObjectName = '102OLYMP/P1011122.JPG';
    
    // 1. 检查文件是否存在
    let fileExists = false;
    try {
      await client.head(testObjectName);
      fileExists = true;
      console.log(`File ${testObjectName} exists`);
    } catch (error: any) {
      console.log(`File ${testObjectName} does not exist or no access:`, error.message);
    }
    
    // 2. 生成带签名的URL
    let signedUrl = '';
    try {
      signedUrl = client.signatureUrl(testObjectName, {
        expires: 3600, // 1小时
        method: 'GET'
      });
      console.log('Signed URL generated successfully');
    } catch (error: any) {
      console.error('Error generating signed URL:', error.message);
    }
    
    // 3. 生成不带签名的URL
    const unsignedUrl = getImageUrlUnsigned(testObjectName);
    
    // 4. 测试存储桶权限
    let bucketAccessible = false;
    try {
      const bucketInfo = await client.getBucketInfo('rrafa-album');
      bucketAccessible = bucketInfo.res.status === 200;
      console.log('Bucket access test:', bucketAccessible);
    } catch (error: any) {
      console.error('Bucket access error:', error.message);
    }
    
    res.status(200).json({
      message: 'OSS URL测试结果',
      testFile: testObjectName,
      fileExists,
      bucketAccessible,
      urls: {
        signed: signedUrl,
        unsigned: unsignedUrl
      },
      recommendations: {
        useSignedUrl: true,
        reason: '存储桶可能设置为私有访问，需要使用签名URL'
      }
    });
    
  } catch (error: any) {
    console.error('Test URL Error:', error);
    res.status(500).json({
      error: '测试失败',
      details: error.message
    });
  }
}
