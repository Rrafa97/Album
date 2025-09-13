import React, { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface ImageItemProps {
  image: {
    id: string;
    filename: string;
    path: string;
    size: number;
    created: string;
    modified: string;
  };
  multiSelectMode?: boolean;
  selected?: boolean;
  isMobile?: boolean;
  onSelect?: (imageId: string) => void;
  onDownload?: (image: any) => void;
  onDelete?: (imageId: string) => void;
  onView?: (image: any) => void;
}

const ImageItem: React.FC<ImageItemProps> = ({ 
  image, 
  multiSelectMode = false, 
  selected = false, 
  isMobile = false,
  onSelect, 
  onDownload, 
  onDelete,
  onView
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView && imgRef.current && !loaded && !error) {
      const img = new Image();
      img.onload = () => {
        setLoaded(true);
        if (imgRef.current) {
          setImageHeight(imgRef.current.offsetHeight);
        }
      };
      img.onerror = () => {
        setError(true);
      };
      img.src = image.path;
    }
  }, [inView, image.path, loaded, error]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(image);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(image.id);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(image.id);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(image);
    }
  };

  const handleImageClick = () => {
    if (isMobile && !multiSelectMode && onView) {
      onView(image);
    }
  };

  return (
    <div 
      ref={ref} 
      className={`image-item ${multiSelectMode ? 'multi-select' : ''} ${selected ? 'selected' : ''}`}
      onClick={multiSelectMode ? handleSelect : handleImageClick}
    >
      {!loaded && !error && (
        <div className="image-placeholder" style={{ height: imageHeight || 200 }}>
          <div className="image-loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      )}
      
      {error ? (
        <div style={{ 
          height: 200, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          color: '#6c757d'
        }}>
          图片加载失败
        </div>
      ) : (
        <img
          ref={imgRef}
          src={image.path}
          alt=""
          style={{ 
            display: loaded ? 'block' : 'none',
            width: '100%',
            height: 'auto'
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {/* 多选复选框 */}
      <div className="image-checkbox" onClick={handleSelect}>
        {selected && '✓'}
      </div>

      {/* 悬停操作按钮 */}
      {!multiSelectMode && !isMobile && (
        <div className="image-overlay">
          <div className="image-actions">
            <button 
              className="action-btn view" 
              onClick={handleView}
              title="查看高清图"
            >
              🔍
            </button>
            <button 
              className="action-btn download" 
              onClick={handleDownload}
              title="下载"
            >
              ⬇
            </button>
            <button 
              className="action-btn delete" 
              onClick={handleDelete}
              title="删除"
            >
              🗑
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageItem;
