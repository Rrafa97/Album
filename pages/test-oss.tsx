import React, { useState, useEffect } from 'react';

export default function TestOSSPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ossInfo, setOssInfo] = useState<any>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/images?page=1&limit=10');
        const data = await response.json();
        
        if (response.ok) {
          setImages(data.images);
          setOssInfo({
            totalImages: data.pagination.totalImages,
            currentPage: data.pagination.currentPage,
            totalPages: data.pagination.totalPages,
          });
          console.log('OSS API Response:', data);
        } else {
          setError(data.error || 'API请求失败');
        }
      } catch (err) {
        setError('网络错误: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>正在从OSS加载图片...</h2>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>OSS连接错误</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1>OSS相册测试页面</h1>
      
      {ossInfo && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>OSS信息</h3>
          <p><strong>总图片数:</strong> {ossInfo.totalImages}</p>
          <p><strong>当前页:</strong> {ossInfo.currentPage} / {ossInfo.totalPages}</p>
          <p><strong>显示图片:</strong> {images.length} 张</p>
        </div>
      )}
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        {images.map((image, index) => (
          <div key={image.id} style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <img 
              src={image.path} 
              alt={image.filename}
              style={{ 
                width: '100%', 
                height: '200px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                console.error('图片加载失败:', image.path);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              onLoad={() => {
                console.log('图片加载成功:', image.filename);
              }}
            />
            <div style={{ padding: '10px' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                {image.filename}
              </h4>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                大小: {Math.round(image.size / 1024)} KB
              </p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                修改时间: {new Date(image.modified).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {images.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>没有找到图片</h3>
          <p>请检查OSS配置和图片路径是否正确</p>
        </div>
      )}
    </div>
  );
}
