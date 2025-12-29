import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVoiceSearchReturn {
	isListening: boolean;
	transcript: string;
	interimTranscript: string;
	confidence: number;
	error: string | null;
	isSupported: boolean;
	startListening: () => void;
	stopListening: () => void;
	resetTranscript: () => void;
}

// Minimum confidence threshold to accept results
const MIN_CONFIDENCE_THRESHOLD = 0.5;

// Words/phrases to filter out (common misrecognitions in Vietnamese)
const FILTERED_WORDS = [
	'phẩy',
	'chấm',
	'dấu phẩy',
	'dấu chấm',
	'comma',
	'period',
	'dot',
];

// Clean and normalize transcript
const cleanTranscript = (text: string): string => {
	if (!text) return '';

	let cleaned = text.trim();

	// Remove standalone punctuation words
	FILTERED_WORDS.forEach(word => {
		// Match word with optional spaces around it
		const regex = new RegExp(`^${word}$|\\s+${word}\\s+|^${word}\\s+|\\s+${word}$`, 'gi');
		cleaned = cleaned.replace(regex, ' ');
	});

	// Remove excessive punctuation
	cleaned = cleaned
		.replace(/[,\.]{2,}/g, '') // Remove multiple consecutive punctuation
		.replace(/^[,\.\s]+|[,\.\s]+$/g, '') // Remove leading/trailing punctuation and spaces
		.replace(/\s+/g, ' ') // Normalize spaces
		.trim();

	return cleaned;
};

// Get best alternative from results based on confidence and content
const getBestAlternative = (
	result: SpeechRecognitionResult
): { transcript: string; confidence: number } | null => {
	let bestResult: { transcript: string; confidence: number } | null = null;
	let highestConfidence = 0;

	for (let i = 0; i < result.length; i++) {
		const alternative = result[i];
		const cleaned = cleanTranscript(alternative.transcript);

		// Skip empty or filtered results
		if (!cleaned || cleaned.length < 2) continue;

		// Check if the result is just a filtered word
		const isFilteredWord = FILTERED_WORDS.some(
			word => cleaned.toLowerCase() === word.toLowerCase()
		);
		if (isFilteredWord) continue;

		// Prefer results with higher confidence
		if (alternative.confidence > highestConfidence) {
			highestConfidence = alternative.confidence;
			bestResult = {
				transcript: cleaned,
				confidence: alternative.confidence,
			};
		}
	}

	return bestResult;
};

export const useVoiceSearch = (
	language: string = 'vi-VN',
	continuous: boolean = false
): UseVoiceSearchReturn => {
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState('');
	const [interimTranscript, setInterimTranscript] = useState('');
	const [confidence, setConfidence] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
	
	// Use refs to prevent stale closures
	const transcriptRef = useRef('');
	const retryCountRef = useRef(0);
	const maxRetries = 3;

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

		// Configure for better Vietnamese recognition
		recognitionInstance.lang = language;
		recognitionInstance.continuous = continuous;
		recognitionInstance.interimResults = true;
		// Increase alternatives for better selection
		recognitionInstance.maxAlternatives = 5;

		// Event handlers
		recognitionInstance.onstart = () => {
			setIsListening(true);
			setError(null);
			setInterimTranscript('');
			retryCountRef.current = 0;
		};

		recognitionInstance.onaudiostart = () => {
			// Audio capture started - good sign
			console.log('Voice search: Audio capture started');
		};

		recognitionInstance.onsoundstart = () => {
			// Sound detected
			console.log('Voice search: Sound detected');
		};

		recognitionInstance.onspeechstart = () => {
			// Speech detected
			console.log('Voice search: Speech detected');
		};

		recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
			let finalTranscript = '';
			let interim = '';
			let bestConfidence = 0;

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];

				if (result.isFinal) {
					// Get the best alternative from all options
					const bestAlt = getBestAlternative(result);

					if (bestAlt && bestAlt.confidence >= MIN_CONFIDENCE_THRESHOLD) {
						finalTranscript += bestAlt.transcript + ' ';
						bestConfidence = Math.max(bestConfidence, bestAlt.confidence);
					} else if (bestAlt) {
						// Lower confidence - still use but log warning
						console.warn(
							`Voice search: Low confidence result (${bestAlt.confidence.toFixed(2)}): "${bestAlt.transcript}"`
						);
						// Only use if we have no better option
						if (!finalTranscript) {
							finalTranscript += bestAlt.transcript + ' ';
							bestConfidence = bestAlt.confidence;
						}
					}
				} else {
					// Show interim results for user feedback
					const interimText = cleanTranscript(result[0].transcript);
					if (interimText && interimText.length >= 2) {
						interim += interimText + ' ';
					}
				}
			}

			// Update interim transcript for real-time feedback
			setInterimTranscript(interim.trim());

			// Only update with cleaned final results
			if (finalTranscript) {
				const cleanedFinal = finalTranscript.trim();
				if (cleanedFinal) {
					transcriptRef.current = continuous
						? transcriptRef.current + ' ' + cleanedFinal
						: cleanedFinal;
					setTranscript(transcriptRef.current.trim());
					setConfidence(bestConfidence);
					setInterimTranscript(''); // Clear interim when we have final
				}
			}
		};

		recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
			console.error('Voice search error:', event.error, event.message);

			switch (event.error) {
				case 'no-speech':
					// Auto retry for no-speech errors
					if (retryCountRef.current < maxRetries) {
						retryCountRef.current++;
						console.log(
							`Voice search: No speech detected, retrying (${retryCountRef.current}/${maxRetries})...`
						);
						setTimeout(() => {
							try {
								recognitionInstance.start();
							} catch {
								setIsListening(false);
								setError('Không phát hiện giọng nói. Vui lòng thử lại.');
							}
						}, 100);
						return;
					}
					setError('Không phát hiện giọng nói. Vui lòng nói rõ hơn và thử lại.');
					break;
				case 'audio-capture':
					setError(
						'Không tìm thấy microphone. Vui lòng kiểm tra thiết bị và cho phép truy cập.'
					);
					break;
				case 'not-allowed':
					setError(
						'Quyền truy cập microphone bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt.'
					);
					break;
				case 'network':
					setError('Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.');
					break;
				case 'aborted':
					// User aborted, not an error
					break;
				default:
					setError(`Lỗi nhận diện giọng nói: ${event.error}`);
			}
			setIsListening(false);
		};

		recognitionInstance.onend = () => {
			setIsListening(false);
			setInterimTranscript('');
		};

		recognitionInstance.onnomatch = () => {
			console.warn('Voice search: No match found');
			if (retryCountRef.current < maxRetries) {
				retryCountRef.current++;
				setTimeout(() => {
					try {
						recognitionInstance.start();
					} catch {
						setError('Không thể nhận diện. Vui lòng nói rõ hơn.');
					}
				}, 100);
			}
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
			// Reset state
			transcriptRef.current = '';
			setTranscript('');
			setInterimTranscript('');
			setConfidence(0);
			setError(null);
			retryCountRef.current = 0;
			recognition.start();
		} catch (err) {
			// May already be running
			try {
				recognition.stop();
				setTimeout(() => {
					try {
						recognition.start();
					} catch {
						setError('Không thể khởi động nhận diện giọng nói');
					}
				}, 100);
			} catch {
				setError('Không thể khởi động nhận diện giọng nói');
			}
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
		transcriptRef.current = '';
		setTranscript('');
		setInterimTranscript('');
		setConfidence(0);
		setError(null);
	}, []);

	return {
		isListening,
		transcript,
		interimTranscript,
		confidence,
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
		onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
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
