import React, { useRef, useState } from "react";
import { Camera, X, Loader2, ImageOff } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    await performSearch(file);
  };

  const performSearch = async (file: File) => {
    setIsSearching(true);
    onLoading(true);

    try {
      // Giảm topK xuống 10 để tránh trả về quá nhiều kết quả không liên quan (chỉ lấy top kết quả giống nhất)
      const data = await searchProductsByImage(file, 10);

      if (data.success) {
        onResults(data.products ?? []);
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
    fileInputRef.current?.click();
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
    <div className="relative flex items-center">
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
          ${previewUrl ? "text-blue-600" : "text-gray-500"}
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

      {/* Preview popup */}
      {previewUrl && (
        <div
          className="absolute top-12 right-0 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 w-48"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">
              {isSearching ? "Đang tìm kiếm..." : "Ảnh tìm kiếm"}
            </span>
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative rounded-lg overflow-hidden bg-gray-50 aspect-square">
            <img
              src={previewUrl}
              alt="Ảnh tìm kiếm"
              className="w-full h-full object-cover"
            />
            {isSearching && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
          </div>

          {error && (
            <div className="mt-2 flex items-center gap-1 text-red-500">
              <ImageOff className="w-3 h-3 flex-shrink-0" />
              <p className="text-xs">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageSearch;
