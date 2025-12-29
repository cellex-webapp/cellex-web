import React, { useEffect, useRef, useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Spin } from 'antd';
import ProductCard from './ProductCard';
import productService from '@/services/product.service';

interface RecommendedProductsProps {
	currentProductId?: string;
	shopId?: string;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ 
	currentProductId,
	shopId
}) => {
	const [products, setProducts] = useState<IProduct[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	useEffect(() => {
		if (!shopId) return;
		
		const fetchShopProducts = async () => {
			setIsLoading(true);
			try {
				const response = await productService.getProductsByShop(shopId, {
					page: 1,
					limit: 30,
					sortBy: 'createdAt',
					sortType: 'desc'
				});
				
				// Filter out current product
				const filtered = response.result.content.filter(
					(p: IProduct) => p.id !== currentProductId
				);
				setProducts(filtered);
			} catch (error) {
				console.error('Failed to fetch shop products:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchShopProducts();
	}, [shopId, currentProductId]);

	useEffect(() => {
		checkScrollButtons();
	}, [products]);

	const checkScrollButtons = () => {
		const container = scrollContainerRef.current;
		if (!container) return;

		setCanScrollLeft(container.scrollLeft > 0);
		setCanScrollRight(
			container.scrollLeft < container.scrollWidth - container.clientWidth - 10
		);
	};

	const scroll = (direction: 'left' | 'right') => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const cardWidth = 200; // Approximate card width
		const gap = 12; // Gap between cards
		const scrollAmount = (cardWidth + gap) * 5; // Scroll 5 cards at a time
		
		const newScrollLeft = direction === 'left'
			? container.scrollLeft - scrollAmount
			: container.scrollLeft + scrollAmount;

		container.scrollTo({
			left: newScrollLeft,
			behavior: 'smooth'
		});

		setTimeout(checkScrollButtons, 400);
	};

	if (isLoading) {
		return (
			<div className="bg-white rounded-lg p-8 flex justify-center">
				<Spin size="large" />
			</div>
		);
	}

	if (products.length === 0) {
		return null;
	}

	return (
		<div className="bg-white rounded-lg p-6">
			<h2 className="text-xl font-bold text-gray-900 mb-4 uppercase">
				Sản phẩm cùng shop
			</h2>

			<div className="flex items-center gap-3">
				{/* Left Arrow */}
				<Button
					type="text"
					icon={<LeftOutlined className="text-lg" />}
					onClick={() => scroll('left')}
					disabled={!canScrollLeft}
					className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-300 shadow-sm hover:!border-indigo-500 hover:!text-indigo-600 disabled:!opacity-30 disabled:!cursor-not-allowed transition-all duration-200"
					style={{ 
						minWidth: '48px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				/>

				{/* Products Container */}
				<div
					ref={scrollContainerRef}
					onScroll={checkScrollButtons}
					className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
					style={{ 
						scrollbarWidth: 'none',
						msOverflowStyle: 'none',
						scrollBehavior: 'smooth'
					}}
				>
					{products.map((product) => (
						<div
							key={product.id}
							className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
							style={{ width: '200px' }}
						>
							<ProductCard product={product} />
						</div>
					))}
				</div>

				{/* Right Arrow */}
				<Button
					type="text"
					icon={<RightOutlined className="text-lg" />}
					onClick={() => scroll('right')}
					disabled={!canScrollRight}
					className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-300 shadow-sm hover:!border-indigo-500 hover:!text-indigo-600 disabled:!opacity-30 disabled:!cursor-not-allowed transition-all duration-200"
					style={{ 
						minWidth: '48px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				/>
			</div>

			<style>{`
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
				
				.scroll-smooth {
					scroll-behavior: smooth;
				}
				
				@media (prefers-reduced-motion: reduce) {
					.scroll-smooth {
						scroll-behavior: auto;
					}
				}
			`}</style>
		</div>
	);
};

export default RecommendedProducts;
