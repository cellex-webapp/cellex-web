import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Spin, Empty } from 'antd';
import ProductCard from '@/features/clients/components/Product/ProductCard';
import { useProduct } from '@/hooks/useProduct';
import ImageSearch from '../../components/Search/ImageSearch';
import { Camera } from 'lucide-react';


const SearchPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const location = useLocation();
	const query = searchParams.get('q') || '';
	const { products, isLoading, searchProducts } = useProduct();
	const [imageSearchResults, setImageSearchResults] = React.useState<any[]>(location.state?.imageSearchResults || []);
	const [imageSearchLoading, setImageSearchLoading] = React.useState(false);

	useEffect(() => {
		if (location.state?.imageSearchResults) {
			setImageSearchResults(location.state.imageSearchResults);
		}
	}, [location.state]);

	const handleImageSearchResults = (results: any[]) => {
		setImageSearchResults(results);
		if (results.length > 0) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};


	useEffect(() => {
		if (query) {
			searchProducts(query, { page: 1, limit: 50 });
		}
		// Scroll to top when search query changes
		window.scrollTo(0, 0);
	}, [query, searchProducts]);

	return (
		<div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
			<div className="container mx-auto space-y-6">
				{(query || imageSearchResults.length > 0 || imageSearchLoading) && (
					<div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-start">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
								Kết quả tìm kiếm
							</h1>
							{query && (
								<p className="text-gray-600">
									Tìm kiếm cho: <span className="font-semibold text-gray-800">"{query}"</span>
								</p>
							)}
						</div>
						<div className="mt-2">
							<ImageSearch onResults={handleImageSearchResults} onLoading={setImageSearchLoading} />
						</div>
					</div>
				)}

				{imageSearchLoading && (
					<div className="flex justify-center items-center py-10">
						<Spin size="large" tip="Đang tìm kiếm bằng ảnh..." />
					</div>
				)}

				{imageSearchResults.length > 0 && !imageSearchLoading && (
					<div className="mb-8 bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center gap-2 mb-4">
							<Camera className="w-5 h-5 text-blue-500" />
							<h2 className="text-lg font-semibold text-gray-800">
								Kết quả tìm kiếm bằng hình ảnh ({imageSearchResults.length})
							</h2>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{imageSearchResults.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					</div>
				)}

				{query && (
					<>
						{isLoading ? (
							<div className="flex justify-center items-center py-20">
								<Spin size="large" tip="Đang tìm kiếm bằng từ khóa..." />
							</div>
						) : products.length > 0 ? (
							<div className="bg-white rounded-lg shadow-sm p-6">
								<p className="text-gray-600 mb-4">
									Tìm thấy {products.length} sản phẩm theo từ khóa
								</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
									{products.map((product) => (
										<ProductCard key={product.id} product={product} />
									))}
								</div>
							</div>
						) : (
							<div className="bg-white rounded-lg shadow-sm p-8">
								<Empty
									description={
										<span className="text-gray-600">
											Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}"
										</span>
									}
								/>
							</div>
						)}
					</>
				)}

				{!query && !imageSearchResults.length && !imageSearchLoading && (
					<div className="bg-white rounded-lg shadow-sm p-8 text-center">
						<div className="max-w-md mx-auto">
							<svg
								className="w-16 h-16 mx-auto text-gray-400 mb-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							<h2 className="text-xl font-semibold text-gray-800 mb-2">
								Nhập từ khóa hoặc hình ảnh để tìm kiếm
							</h2>
							<p className="text-gray-600 mb-4">
								Sử dụng thanh tìm kiếm ở trên để tìm sản phẩm bạn muốn
							</p>
							<div className="flex justify-center">
								<ImageSearch onResults={handleImageSearchResults} onLoading={setImageSearchLoading} />
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SearchPage;
