import { useState, useEffect, useCallback } from 'react';

interface UseVoiceSearchReturn {
	isListening: boolean;
	transcript: string;
	error: string | null;
	isSupported: boolean;
	startListening: () => void;
	stopListening: () => void;
	resetTranscript: () => void;
}

export const useVoiceSearch = (
	language: string = 'vi-VN',
	continuous: boolean = false
): UseVoiceSearchReturn => {
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

	// Check if Web Speech API is supported
	const isSupported =
		typeof window !== 'undefined' &&
		('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

	useEffect(() => {
		if (!isSupported) {
			setError('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói');
			return;
		}

		// Initialize Speech Recognition
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		const recognitionInstance = new SpeechRecognition();

		recognitionInstance.lang = language;
		recognitionInstance.continuous = continuous;
		recognitionInstance.interimResults = true;
		recognitionInstance.maxAlternatives = 1;

		// Event handlers
		recognitionInstance.onstart = () => {
			setIsListening(true);
			setError(null);
		};

		recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
			let finalTranscript = '';

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				if (result.isFinal) {
					const transcriptPiece = result[0].transcript;
					finalTranscript += transcriptPiece;
				}
			}

			// Only update with final results
			if (finalTranscript) {
				setTranscript(prev => prev + finalTranscript);
			}
		};

		recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
			setIsListening(false);
			
			switch (event.error) {
				case 'no-speech':
					setError('Không phát hiện giọng nói. Vui lòng thử lại.');
					break;
				case 'audio-capture':
					setError('Không tìm thấy microphone. Vui lòng kiểm tra thiết bị.');
					break;
				case 'not-allowed':
					setError('Quyền truy cập microphone bị từ chối.');
					break;
				case 'network':
					setError('Lỗi kết nối mạng. Vui lòng thử lại.');
					break;
				default:
					setError('Đã xảy ra lỗi khi nhận diện giọng nói.');
			}
		};

		recognitionInstance.onend = () => {
			setIsListening(false);
		};

		setRecognition(recognitionInstance);

		return () => {
			if (recognitionInstance) {
				recognitionInstance.abort();
			}
		};
	}, [language, continuous, isSupported]);

	const startListening = useCallback(() => {
		if (!recognition) return;

		try {
			setTranscript('');
			setError(null);
			recognition.start();
		} catch (err) {
			setError('Không thể khởi động nhận diện giọng nói');
		}
	}, [recognition]);

	const stopListening = useCallback(() => {
		if (!recognition) return;

		try {
			recognition.stop();
		} catch (err) {
			console.error('Error stopping recognition:', err);
		}
	}, [recognition]);

	const resetTranscript = useCallback(() => {
		setTranscript('');
		setError(null);
	}, []);

	return {
		isListening,
		transcript,
		error,
		isSupported,
		startListening,
		stopListening,
		resetTranscript,
	};
};

// Type declarations for Web Speech API (add to vite-env.d.ts if needed)
declare global {
	interface Window {
		SpeechRecognition: typeof SpeechRecognition;
		webkitSpeechRecognition: typeof SpeechRecognition;
	}

	interface SpeechRecognition extends EventTarget {
		lang: string;
		continuous: boolean;
		interimResults: boolean;
		maxAlternatives: number;
		start(): void;
		stop(): void;
		abort(): void;
		onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
		onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
		onend: ((this: SpeechRecognition, ev: Event) => any) | null;
		onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
		onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
		onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
		onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
		onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
		onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
		onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
	}

	var SpeechRecognition: {
		prototype: SpeechRecognition;
		new(): SpeechRecognition;
	};

	interface SpeechRecognitionErrorEvent extends Event {
		readonly error: string;
		readonly message: string;
	}

	interface SpeechRecognitionEvent extends Event {
		readonly resultIndex: number;
		readonly results: SpeechRecognitionResultList;
	}

	interface SpeechRecognitionResultList {
		readonly length: number;
		item(index: number): SpeechRecognitionResult;
		[index: number]: SpeechRecognitionResult;
	}

	interface SpeechRecognitionResult {
		readonly length: number;
		item(index: number): SpeechRecognitionAlternative;
		[index: number]: SpeechRecognitionAlternative;
		readonly isFinal: boolean;
	}

	interface SpeechRecognitionAlternative {
		readonly transcript: string;
		readonly confidence: number;
	}
}

export default useVoiceSearch;
