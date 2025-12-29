import { RecommendationSectionPreview } from "../../components/Recommendation";
import ProductDetailCard from "./ProductDetailCard";

const ProductDetailPage: React.FC = () => {
	return (
		<div className="container mx-auto py-6">
			<ProductDetailCard />
			<RecommendationSectionPreview 
					title="Dành riêng cho bạn" 
					maxItems={12}
					viewAllLink="/recommendations"
				/>
		</div>
	);
};

export default ProductDetailPage;
