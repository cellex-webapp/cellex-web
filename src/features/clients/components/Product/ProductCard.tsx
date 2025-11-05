import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Tag, Rate, Tooltip } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

interface Props {
	product: IProduct;
}

const ProductCard: React.FC<Props> = ({ product }) => {
	const img = product.images && product.images.length > 0 ? product.images[0] : '';
	const hasSale = !!product.saleOff && Number(product.saleOff) > 0;
	const price = Number(product.price || 0);
	const finalPrice = Number(product.finalPrice || price);

	return (
		<Link to={`/products/${product.id}`} className="no-underline text-inherit block h-full">
			<Card
				hoverable
				className="h-full flex flex-col rounded-lg overflow-hidden"
				bodyStyle={{ padding: 12 }}
				cover={
					<div className="relative w-full pt-[100%] bg-gray-50 overflow-hidden">
						{img ? (
							<img
								src={img}
								alt={product.name}
								className="absolute inset-0 h-full w-full object-cover"
							/>
						) : (
							<div className="absolute inset-0 flex items-center justify-center">
								<AppstoreOutlined className="text-2xl text-gray-400" />
							</div>
						)}
					</div>
				}
			>
				<div className="flex-1 flex flex-col gap-2">
					<Tooltip title={product.name}>
						<div className="min-h-[40px] text-sm font-medium text-gray-800 line-clamp-2">
							{product.name}
						</div>
					</Tooltip>

					<div className="flex flex-wrap items-center gap-1.5">
						<span className="text-base font-semibold text-orange-600">{finalPrice.toLocaleString()}₫</span>
						{hasSale && (
							<span className="text-xs line-through text-gray-400">{price.toLocaleString()}₫</span>
						)}
						{hasSale && (
							<Tag color="red" className="m-0 text-[11px] px-1">-{Number(product.saleOff)}%</Tag>
						)}
					</div>

					<div className="flex items-center gap-1.5 text-xs text-gray-600">
						<Rate allowHalf disabled value={Number(product.averageRating || 0)} style={{ fontSize: 12 }} />
						<span>({product.reviewCount || 0})</span>
					</div>
				</div>
			</Card>
		</Link>
	);
};

export default ProductCard;

