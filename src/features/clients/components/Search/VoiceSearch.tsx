import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';

interface VoiceSearchProps {
	onSearch?: (query: string) => void;
	placeholder?: string;
	language?: string;
	className?: string;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({
	onSearch,
	placeholder = 'Tìm kiếm sản phẩm...',
	language = 'vi-VN',
	className = '',
}) => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState('');
	const [submitTimeout, setSubmitTimeout] = useState<NodeJS.Timeout | null>(null);
	const {
		isListening,
		transcript,
		error,
		isSupported,
		startListening,
		stopListening,
		resetTranscript,
	} = useVoiceSearch(language);

	// Update search query when transcript changes
	useEffect(() => {
		if (transcript) {
			setSearchQuery(transcript);
		}
	}, [transcript]);

	// Auto-submit search when speech recognition ends with delay
	useEffect(() => {
		// Clear any existing timeout
		if (submitTimeout) {
			clearTimeout(submitTimeout);
		}

		if (!isListening && transcript && transcript.trim().length > 2) {
			// Wait 500ms after recognition stops before submitting
			const timeout = setTimeout(() => {
				handleSearch(transcript);
			}, 500);
			setSubmitTimeout(timeout);
		}

		return () => {
			if (submitTimeout) {
				clearTimeout(submitTimeout);
			}
		};
	}, [isListening, transcript]);

	const handleSearch = (query: string) => {
		if (!query.trim()) return;

		if (onSearch) {
			onSearch(query);
		} else {
			// Default behavior: navigate to search page with query
			navigate(`/search?q=${encodeURIComponent(query)}`);
		}
		resetTranscript();
		setSearchQuery('');
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSearch(searchQuery);
	};

	const toggleListening = () => {
		if (isListening) {
			stopListening();
		} else {
			startListening();
		}
	};

	return (
		<div className={`w-full max-w-3xl mx-auto ${className}`}>
			<form onSubmit={handleSubmit} className="relative">
				<div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
					{/* Search Icon */}
					<div className="pl-6 pr-3">
						<svg
							className="w-5 h-5 text-gray-400"
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
					</div>

					{/* Input Field */}
					<input
						type="text"
						value={searchQuery}
						onChange={handleInputChange}
						placeholder={isListening ? 'Đang lắng nghe...' : placeholder}
						className={`flex-1 py-4 px-2 text-gray-700 outline-none bg-transparent ${
							isListening ? 'placeholder-red-400' : 'placeholder-gray-400'
						}`}
						disabled={isListening}
					/>

					{/* Voice Search Button */}
					{isSupported && (
						<button
							type="button"
							onClick={toggleListening}
							className={`p-3 mr-2 rounded-full transition-all duration-300 ${
								isListening
									? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
									: 'bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white'
							}`}
							title={isListening ? 'Dừng ghi âm' : 'Tìm kiếm bằng giọng nói'}
						>
							{isListening ? (
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
									<path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
								</svg>
							) : (
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
									<path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
								</svg>
							)}
						</button>
					)}

					{/* Search Button */}
					<button
						type="submit"
						disabled={!searchQuery.trim()}
						className="px-6 py-4 bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300"
					>
						Tìm kiếm
					</button>
				</div>

				{/* Voice Recognition Indicator */}
				{isListening && (
					<div className="absolute -bottom-12 left-0 right-0 text-center">
						<div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-full">
							<div className="flex space-x-1">
								<span className="animate-bounce w-2 h-2 bg-red-500 rounded-full" style={{ animationDelay: '0ms' }}></span>
								<span className="animate-bounce w-2 h-2 bg-red-500 rounded-full" style={{ animationDelay: '150ms' }}></span>
								<span className="animate-bounce w-2 h-2 bg-red-500 rounded-full" style={{ animationDelay: '300ms' }}></span>
							</div>
							<span className="text-sm font-medium">Đang lắng nghe...</span>
						</div>
					</div>
				)}
			</form>

			{/* Error Message */}
			{error && (
				<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
					<div className="flex items-start">
						<svg
							className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clipRule="evenodd"
							/>
						</svg>
						<div>
							<p className="text-sm text-red-700 font-medium">{error}</p>
						</div>
					</div>
				</div>
			)}

			{/* Browser Support Warning */}
			{!isSupported && (
				<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
					<div className="flex items-start">
						<svg
							className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clipRule="evenodd"
							/>
						</svg>
						<div>
							<p className="text-sm text-yellow-700">
								Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói. Vui lòng sử dụng Chrome, Edge hoặc Safari để sử dụng tính năng này.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default VoiceSearch;
