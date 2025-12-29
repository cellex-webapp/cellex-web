import React from 'react';
import ProductListPreview from '@/features/clients/components/Product/ProductListPreview';
import CategoryList from '@/features/clients/components/Category/CategoryList';
import { RecommendationSectionPreview } from '@/features/clients/components/Recommendation';
import VoiceSearch from '@/features/clients/components/Search/VoiceSearch';

const HomePage: React.FC = () => {
	return (
		<div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
			<div className="container mx-auto space-y-8">
				{/* Voice Search Section */}
				<div className="pt-4 pb-8">
					<h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-2">
						Tìm kiếm sản phẩm
					</h1>
					<p className="text-gray-600 text-center mb-6">
						Nhập hoặc nói tên sản phẩm bạn muốn tìm
					</p>
					<VoiceSearch 
						placeholder="Tìm kiếm sản phẩm..."
						language="vi-VN"
					/>
				</div>

				<CategoryList title="Danh mục sản phẩm" />
				<RecommendationSectionPreview 
					title="Dành riêng cho bạn" 
					maxItems={12}
					viewAllLink="/recommendations"
				/>
				<ProductListPreview 
					title="Sản phẩm mới nhất" 
					maxItems={12}
					viewAllLink="/products"
				/>
			</div>
		</div>
	);
};

export default HomePage;

