import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin, Empty } from 'antd';
import ProductCard from '@/features/clients/components/Product/ProductCard';
import { useProduct } from '@/hooks/useProduct';

const SearchPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const query = searchParams.get('q') || '';
	const { products, isLoading, searchProducts } = useProduct();

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
				{query && (
					<>
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
								Kết quả tìm kiếm
							</h1>
							<p className="text-gray-600">
								Tìm kiếm cho: <span className="font-semibold text-gray-800">"{query}"</span>
							</p>
						</div>

						{isLoading ? (
							<div className="flex justify-center items-center py-20">
								<Spin size="large" tip="Đang tìm kiếm..." />
							</div>
						) : products.length > 0 ? (
							<div className="bg-white rounded-lg shadow-sm p-6">
								<p className="text-gray-600 mb-4">
									Tìm thấy {products.length} sản phẩm
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

				{!query && (
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
								Nhập từ khóa để tìm kiếm
							</h2>
							<p className="text-gray-600">
								Sử dụng thanh tìm kiếm ở trên để tìm sản phẩm bạn muốn
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SearchPage;
