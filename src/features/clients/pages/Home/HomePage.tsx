import React from 'react';
import ProductList from '@/features/clients/components/Product/ProductList';
import CategoryList from '@/features/clients/components/Category/CategoryList';

const HomePage: React.FC = () => {
	return (
		<div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
			<div className="container mx-auto space-y-8">
				<CategoryList title="Danh mục sản phẩm" />
				<ProductList title="Sản phẩm mới nhất" />
			</div>
		</div>
	);
};

export default HomePage;

