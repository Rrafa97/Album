import React, { useState, useEffect, useCallback } from 'react';
import ImageItem from './ImageItem';
import TimeFilter from './TimeFilter';

interface Image {
  id: string;
  filename: string;
  path: string;
  size: number;
  created: string;
  modified: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalImages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface WaterfallGalleryProps {
  columns?: number;
}

const WaterfallGallery: React.FC<WaterfallGalleryProps> = ({ columns = 3 }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<Image | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [timeFilter, setTimeFilter] = useState('all');

  const fetchImages = useCallback(async (page: number, append = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // 使用静态数据文件
      const response = await fetch('/static-data.json');
      
      if (!response.ok) {
        throw new Error('获取图片失败');
      }

      const data = await response.json();
      
      // 应用时间筛选
      let filteredImages = data.images;
      if (timeFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisYear = new Date(now.getFullYear(), 0, 1);

        filteredImages = data.images.filter((image: Image) => {
          const mtime = new Date(image.modified);
          const hasValidTime = mtime.getTime() > 0 && mtime.getFullYear() > 1970;
          
          if (timeFilter === 'no-time') return !hasValidTime;
          if (timeFilter === 'has-time') return hasValidTime;
          if (timeFilter === 'today') return hasValidTime && mtime >= today;
          if (timeFilter === 'yesterday') return hasValidTime && mtime >= yesterday && mtime < today;
          if (timeFilter === 'this-week') return hasValidTime && mtime >= thisWeek;
          if (timeFilter === 'this-month') return hasValidTime && mtime >= thisMonth;
          if (timeFilter === 'this-year') return hasValidTime && mtime >= thisYear;
          return true;
        });
      }
      
      // 分页处理
      const limit = 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedImages = filteredImages.slice(startIndex, endIndex);
      
      if (append) {
        setImages(prev => [...prev, ...paginatedImages]);
      } else {
        setImages(paginatedImages);
      }
      
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(filteredImages.length / limit),
        totalImages: filteredImages.length,
        hasNextPage: endIndex < filteredImages.length,
        hasPrevPage: page > 1,
      });
      setCurrentPage(page);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchImages(1);
  }, [fetchImages]);

  // 当筛选条件改变时重新加载
  useEffect(() => {
    setCurrentPage(1);
    setImages([]);
    fetchImages(1);
  }, [timeFilter]);

  const loadMore = () => {
    if (pagination?.hasNextPage && !loadingMore) {
      fetchImages(currentPage + 1, true);
    }
  };

  const toggleMultiSelect = () => {
    setMultiSelectMode(!multiSelectMode);
    if (multiSelectMode) {
      setSelectedImages(new Set());
    }
  };

  const handleImageSelect = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleDownload = async (image: Image) => {
    try {
      const response = await fetch(image.path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const handleDelete = async (imageId: string) => {
    // 静态网站不支持删除功能
    alert('静态网站不支持删除功能');
  };

  const handleBatchDownload = async () => {
    const selectedImageObjects = images.filter(img => selectedImages.has(img.id));
    
    for (const image of selectedImageObjects) {
      await handleDownload(image);
      // 添加延迟避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handleBatchDelete = async () => {
    // 静态网站不支持删除功能
    alert('静态网站不支持删除功能');
  };

  const cancelMultiSelect = () => {
    setMultiSelectMode(false);
    setSelectedImages(new Set());
  };

  const handleViewImage = (image: Image) => {
    setPreviewImage(image);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleImageZoom = (delta: number) => {
    setImageScale(prev => {
      const newScale = prev + delta;
      return Math.max(0.5, Math.min(3, newScale));
    });
  };

  const handleImagePan = (deltaX: number, deltaY: number) => {
    setImagePosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  };

  const resetImageTransform = () => {
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // 无限滚动加载
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (pagination?.hasNextPage && !loadingMore) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pagination, loadingMore]);

  const distributeImages = (images: Image[], numColumns: number): Image[][] => {
    const columns: Image[][] = Array(numColumns).fill(null).map(() => []);
    
    images.forEach((image, index) => {
      const columnIndex = index % numColumns;
      columns[columnIndex].push(image);
    });
    
    return columns;
  };

  // 移动端检测
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const actualColumns = isMobile ? 2 : columns;

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>加载失败: {error}</p>
        <button 
          onClick={() => fetchImages(1)}
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

  const imageColumns = distributeImages(images, actualColumns);

  return (
    <div>
      {/* 时间筛选器 */}
      <TimeFilter 
        currentFilter={timeFilter}
        onFilterChange={setTimeFilter}
      />

      {/* 全局多选控制 */}
      <div className="global-controls">
        <button 
          className={`multi-select-toggle ${multiSelectMode ? 'active' : ''}`}
          onClick={toggleMultiSelect}
        >
          {multiSelectMode ? '取消多选' : '多选'}
        </button>
      </div>

      <div className="waterfall-container">
        {imageColumns.map((columnImages, columnIndex) => (
          <div key={columnIndex} className="waterfall-column">
            {columnImages.map((image) => (
              <ImageItem 
                key={image.id} 
                image={image}
                multiSelectMode={multiSelectMode}
                selected={selectedImages.has(image.id)}
                isMobile={isMobile}
                onSelect={handleImageSelect}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onView={handleViewImage}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 多选操作栏 */}
      <div className={`multi-select-bar ${multiSelectMode ? 'active' : ''}`}>
        <div className="multi-select-info">
          已选择 {selectedImages.size} 张图片
        </div>
        <div className="multi-select-actions">
          <button 
            className="multi-select-btn download"
            onClick={handleBatchDownload}
            disabled={selectedImages.size === 0}
          >
            批量下载
          </button>
          <button 
            className="multi-select-btn delete"
            onClick={handleBatchDelete}
            disabled={selectedImages.size === 0}
          >
            批量删除
          </button>
          <button 
            className="multi-select-btn cancel"
            onClick={cancelMultiSelect}
          >
            取消
          </button>
        </div>
      </div>
      
      {loadingMore && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div className="spinner"></div>
        </div>
      )}

      {/* 移动端大图预览 */}
      {previewImage && (
        <div className="image-preview-modal" onClick={closePreview}>
          <div 
            className="image-preview-content"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const delta = e.deltaY > 0 ? -0.1 : 0.1;
              handleImageZoom(delta);
            }}
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const distance = Math.sqrt(
                  Math.pow(touch2.clientX - touch1.clientX, 2) +
                  Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                e.currentTarget.setAttribute('data-initial-distance', distance.toString());
              }
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const distance = Math.sqrt(
                  Math.pow(touch2.clientX - touch1.clientX, 2) +
                  Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                const initialDistance = parseFloat(e.currentTarget.getAttribute('data-initial-distance') || '0');
                if (initialDistance > 0) {
                  const scaleChange = (distance - initialDistance) / 100;
                  handleImageZoom(scaleChange);
                  e.currentTarget.setAttribute('data-initial-distance', distance.toString());
                }
              }
            }}
          >
            <img 
              src={previewImage.path} 
              alt={previewImage.filename}
              style={{
                transform: `scale(${imageScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: imageScale > 1 ? 'grab' : 'default'
              }}
              draggable={false}
            />
            
            {/* 关闭按钮 */}
            <button 
              className="image-close-float"
              onClick={(e) => {
                e.stopPropagation();
                closePreview();
              }}
            >
              ×
            </button>
            
            {/* 下载浮层按钮 */}
            <button 
              className="image-download-float"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(previewImage);
              }}
            >
              ⬇
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterfallGallery;
