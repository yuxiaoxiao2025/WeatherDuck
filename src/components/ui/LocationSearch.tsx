import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Clock, 
  X, 
  Loader2,
  Navigation,
  Star,
  StarOff
} from 'lucide-react';
import { LocationSearchResult } from '../../types';
import { cn } from '../../utils/cn';

export interface LocationSearchProps {
  onLocationSelect: (location: LocationSearchResult) => void;
  onSearch: (query: string) => Promise<LocationSearchResult[]>;
  placeholder?: string;
  className?: string;
  recentLocations?: LocationSearchResult[];
  favoriteLocations?: LocationSearchResult[];
  onAddToFavorites?: (location: LocationSearchResult) => void;
  onRemoveFromFavorites?: (location: LocationSearchResult) => void;
  showCurrentLocation?: boolean;
  onCurrentLocationClick?: () => void;
}

const LocationItem: React.FC<{
  location: LocationSearchResult;
  onClick: () => void;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
}> = ({ 
  location, 
  onClick, 
  onFavoriteToggle, 
  isFavorite = false, 
  showFavoriteButton = false 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-lg transition-colors"
    onClick={onClick}
  >
    <div className="flex items-center flex-1 min-w-0">
      <MapPin size={16} className="text-gray-400 mr-3 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {location.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {location.region && `${location.region}, `}{location.country}
        </div>
      </div>
    </div>
    
    {showFavoriteButton && onFavoriteToggle && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle();
        }}
        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-2"
      >
        {isFavorite ? (
          <Star size={16} className="text-yellow-500 fill-current" />
        ) : (
          <StarOff size={16} className="text-gray-400" />
        )}
      </button>
    )}
  </motion.div>
);

const SectionHeader: React.FC<{
  title: string;
  icon: React.ReactNode;
}> = ({ title, icon }) => (
  <div className="flex items-center px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
    {icon}
    <span className="ml-2">{title}</span>
  </div>
);

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  onSearch,
  placeholder = "搜索城市...",
  className,
  recentLocations = [],
  favoriteLocations = [],
  onAddToFavorites,
  onRemoveFromFavorites,
  showCurrentLocation = true,
  onCurrentLocationClick
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // 处理搜索
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await onSearch(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError('搜索失败，请重试');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 防抖搜索
  const debouncedSearch = (searchQuery: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // 处理位置选择
  const handleLocationSelect = (location: LocationSearchResult) => {
    onLocationSelect(location);
    setQuery('');
    setSearchResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // 清空搜索
  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    setError(null);
    inputRef.current?.focus();
  };

  // 检查是否为收藏位置
  const isFavoriteLocation = (location: LocationSearchResult) => {
    return favoriteLocations.some(fav => 
      fav.lat === location.lat && fav.lon === location.lon
    );
  };

  // 切换收藏状态
  const toggleFavorite = (location: LocationSearchResult) => {
    if (isFavoriteLocation(location)) {
      onRemoveFromFavorites?.(location);
    } else {
      onAddToFavorites?.(location);
    }
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const showSuggestions = isOpen && (
    query.trim() || 
    recentLocations.length > 0 || 
    favoriteLocations.length > 0 || 
    showCurrentLocation
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-10 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg",
            "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
            "placeholder-gray-500 dark:placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition-colors"
          )}
        />

        {/* 清空按钮 */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}

        {/* 加载指示器 */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 size={16} className="text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {/* 搜索结果下拉框 */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg",
              "border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
            )}
          >
            {/* 当前位置 */}
            {showCurrentLocation && onCurrentLocationClick && !query.trim() && (
              <>
                <SectionHeader 
                  title="当前位置" 
                  icon={<Navigation size={12} />} 
                />
                <div
                  onClick={onCurrentLocationClick}
                  className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <Navigation size={16} className="text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    使用当前位置
                  </span>
                </div>
              </>
            )}

            {/* 收藏位置 */}
            {favoriteLocations.length > 0 && !query.trim() && (
              <>
                <SectionHeader 
                  title="收藏位置" 
                  icon={<Star size={12} />} 
                />
                {favoriteLocations.map((location) => (
                  <LocationItem
                    key={`fav-${location.id}`}
                    location={location}
                    onClick={() => handleLocationSelect(location)}
                    onFavoriteToggle={() => toggleFavorite(location)}
                    isFavorite={true}
                    showFavoriteButton={true}
                  />
                ))}
              </>
            )}

            {/* 最近搜索 */}
            {recentLocations.length > 0 && !query.trim() && (
              <>
                <SectionHeader 
                  title="最近搜索" 
                  icon={<Clock size={12} />} 
                />
                {recentLocations.map((location) => (
                  <LocationItem
                    key={`recent-${location.id}`}
                    location={location}
                    onClick={() => handleLocationSelect(location)}
                    onFavoriteToggle={() => toggleFavorite(location)}
                    isFavorite={isFavoriteLocation(location)}
                    showFavoriteButton={true}
                  />
                ))}
              </>
            )}

            {/* 搜索结果 */}
            {query.trim() && (
              <>
                {error ? (
                  <div className="p-4 text-center text-red-500 dark:text-red-400">
                    {error}
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <SectionHeader 
                      title="搜索结果" 
                      icon={<Search size={12} />} 
                    />
                    {searchResults.map((location) => (
                      <LocationItem
                        key={`search-${location.id}`}
                        location={location}
                        onClick={() => handleLocationSelect(location)}
                        onFavoriteToggle={() => toggleFavorite(location)}
                        isFavorite={isFavoriteLocation(location)}
                        showFavoriteButton={true}
                      />
                    ))}
                  </>
                ) : !isLoading && (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    未找到相关城市
                  </div>
                )}
              </>
            )}

            {/* 空状态 */}
            {!query.trim() && 
             favoriteLocations.length === 0 && 
             recentLocations.length === 0 && 
             !showCurrentLocation && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                输入城市名称开始搜索
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSearch;