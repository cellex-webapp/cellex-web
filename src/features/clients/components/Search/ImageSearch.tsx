import React, { useRef, useState, useEffect } from "react";
import { Camera, X, Loader2, ImageOff, UploadCloud } from "lucide-react";

import { searchProductsByImage } from "../../../../services/productService";

interface ImageSearchResult {
  id: string;
  name: string;
  price: number;
  finalPrice: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  shopId: string;
  categoryId: string;
  similarityScore: number;
  rank: number;
}

interface ImageSearchProps {
  onResults: (products: ImageSearchResult[]) => void;
  onLoading: (loading: boolean) => void;
}

const ImageSearch: React.FC<ImageSearchProps> = ({ onResults, onLoading }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh (JPEG, PNG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Ảnh quá lớn. Vui lòng chọn ảnh dưới 10MB.");
      return;
    }

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsPopupOpen(true);
    await performSearch(file);
  };

  const performSearch = async (file: File) => {
    setIsSearching(true);
    onLoading(true);

    try {
      const data = await searchProductsByImage(file, 10);

      if (data.success) {
        onResults(data.products ?? []);
        setIsPopupOpen(false);
      } else {
        setError(data.message ?? "Không tìm thấy sản phẩm tương tự.");
        onResults([]);
      }
    } catch (err) {
      console.error("Image search error:", err);
      setError("Lỗi kết nối. Vui lòng thử lại.");
      onResults([]);
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  const handleCameraClick = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setError(null);
    onResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="relative flex items-center" ref={popupRef}>
      {/* Camera button */}
      <button
        type="button"
        onClick={handleCameraClick}
        title="Tìm kiếm bằng hình ảnh"
        className={`
          flex items-center justify-center w-9 h-9 rounded-full
          transition-all duration-200
          ${isSearching
            ? "bg-blue-100 cursor-not-allowed"
            : "bg-gray-100 hover:bg-blue-100 hover:text-blue-600 cursor-pointer"
          }
          ${isPopupOpen || previewUrl ? "text-blue-600" : "text-gray-500"}
        `}
        disabled={isSearching}
      >
        {isSearching ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {/* Preview and Upload popup */}
      {(isPopupOpen || previewUrl) && (
        <div
          className="absolute top-12 right-0 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              {isSearching ? "Đang tìm kiếm..." : "Tìm kiếm bằng hình ảnh"}
            </span>
            <button
              onClick={() => {
                setIsPopupOpen(false);
                if (previewUrl && !isSearching) handleClear();
              }}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!previewUrl ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium mb-1">
                Kéo thả ảnh vào đây
              </p>
              <p className="text-xs text-gray-400 mb-3">
                hoặc
              </p>
              <button 
                type="button"
                className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Chọn ảnh
              </button>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-gray-50 aspect-square group">
              <img
                src={previewUrl}
                alt="Ảnh tìm kiếm"
                className="w-full h-full object-cover"
              />
              {isSearching && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-blue-800">Đang phân tích...</span>
                </div>
              )}
              {!isSearching && (
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button 
                      type="button"
                      className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                    >
                      Chọn ảnh khác
                    </button>
                 </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-start gap-2 text-red-500 bg-red-50 p-2 rounded-lg">
              <ImageOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageSearch;
