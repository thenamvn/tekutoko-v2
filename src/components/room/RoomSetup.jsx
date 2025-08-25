// src/components/RoomSetup/RoomSetup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationComponent from '../NavigationBar/NavigationBar'; // Adjust path as needed
import { useTranslation } from 'react-i18next'; // Uncomment for i18n
import useFirebaseUpload from "../../utils/upload"; // Import the upload function
import { processImages } from '../../utils/imageProcessing';
import imageCompression from 'browser-image-compression'; // Add this import
import AIQuestionGenerator from './AIQuestionGenerator';
const apiUrl = process.env.REACT_APP_API_URL;
// --- Mock API Function (Replace with actual API call) ---
const saveRoomConfiguration = async (roomData) => {
    try {
        // Lấy token từ localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('You must be logged in to create a room');
        }

        const response = await fetch(`${apiUrl}/api/rooms/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(roomData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create room');
        }

        return data;
    } catch (error) {
        console.error('Error saving room:', error);
        throw error;
    }
};

// --- API Function for Reward/Voucher System ---
const saveRewardConfiguration = async (rewardData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('You must be logged in to create a reward');
        }

        const response = await fetch(`${apiUrl}/api/vouchers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(rewardData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create reward');
        }

        return data;
    } catch (error) {
        console.error('Error saving reward:', error);
        throw error;
    }
};
// --- End Mock API Function ---

// --- Initial State Definitions ---
const initialQuestionState = {
    tempId: null, // Temporary client-side ID for list management
    question_text: '',
    question_type: 'text', // Default type
    hint: '',
    explanation: '',
    correct_text_answer: '', // For type 'text'
    additional_correct_answers: [], // For type 'upload'
    options: [ // For type 'multiple-choice'
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
    ],
};

const initialRewardState = {
    rewardType: 'discount', // 'discount' or 'ticket'
    // For discount vouchers
    discountName: '',
    discountValue: '',
    discountDescription: '',
    // For tickets
    ticketName: '',
    ticketDescription: '',
    ticketImage: null,
    ticketImagePreview: null,
    // Common
    expirationDate: '',
};

const RoomSetup = () => {
    const { t } = useTranslation(); // Uncomment for i18n
    const navigate = useNavigate();
    const newRoomId = Math.random().toString(36).substring(2, 7); // Generate a unique room ID
    const { uploading, error: uploadError, uploadFiles } = useFirebaseUpload();
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    // --- State Variables ---
    const [roomDetails, setRoomDetails] = useState({
        room_id: newRoomId,
        room_title: '',
        admin_username: '',
        description: '',
        thumbnail: '',
        how2play: ''
    }); // Room details state
    const [questions, setQuestions] = useState([]); // Array to hold questions added so far
    const [currentQuestion, setCurrentQuestion] = useState({ ...initialQuestionState, tempId: Date.now() }); // Form state for the question being added/edited

    // Reward state
    const [reward, setReward] = useState({ ...initialRewardState });
    const [hasReward, setHasReward] = useState(false); // Whether this room has a reward

    const [isLoading, setIsLoading] = useState(false); // For save operation
    const [compressing, setCompressing] = useState(false); // For image compression
    const [error, setError] = useState(null); // For save errors
    const [successMessage, setSuccessMessage] = useState(null); // For success message

    // --- Event Handlers ---

    // Update room title/description
    const handleRoomDetailsChange = (event) => {
        const { name, value } = event.target;
        setRoomDetails(prev => ({ ...prev, [name]: value }));
    };

    // Hàm xử lý thumbnail
    const handleThumbnailChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // Tạo preview từ file gốc
            const thumbnailPreview = URL.createObjectURL(file);
            setRoomDetails(prev => ({
                ...prev,
                thumbnailFile: file,
                thumbnailPreview,
                processing: true // Thêm trạng thái đang xử lý
            }));

            // Xử lý ảnh
            const [processedFile] = await processImages([file], {
                maxSizeMB: 0.5, // Giảm dung lượng hơn cho thumbnail
                maxWidthOrHeight: 1280,
            });

            // Cập nhật state với file đã xử lý
            setRoomDetails(prev => ({
                ...prev,
                thumbnailFile: processedFile,
                processing: false
            }));
        } catch (error) {
            console.error('Error processing thumbnail:', error);
            // Xử lý lỗi nếu cần
            setRoomDetails(prev => ({
                ...prev,
                processing: false
            }));
        }
    };

    // --- Reward Event Handlers ---
    const handleRewardToggle = () => {
        setHasReward(!hasReward);
        if (hasReward) {
            // Reset reward data when disabling reward
            setReward({ ...initialRewardState });
        }
    };

    const handleRewardChange = (event) => {
        const { name, value } = event.target;
        setReward(prev => ({ ...prev, [name]: value }));

        // Reset fields when reward type changes
        if (name === 'rewardType') {
            setReward(prev => ({
                ...prev,
                discountName: '',
                discountValue: '',
                discountDescription: '',
                ticketName: '',
                ticketDescription: '',
                ticketImage: null,
                ticketImagePreview: null,
            }));
        }
    };

    const handleRewardImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setCompressing(true);
        try {
            // Create preview
            const ticketImagePreview = URL.createObjectURL(file);
            setReward(prev => ({
                ...prev,
                ticketImagePreview
            }));

            // Compress the image
            const config = {
                maxSizeMB: 1, // Limit size to 1 MB
                maxWidthOrHeight: 1920, // Limit to Full HD resolution
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, config);
            setReward(prev => ({
                ...prev,
                ticketImage: compressedFile
            }));
        } catch (error) {
            console.error("Error compressing image:", error);
            alert("Error compressing image. Please try again.");
        } finally {
            setCompressing(false);
        }
    };

    // Update fields in the current question form
    const handleCurrentQuestionChange = (event) => {
        const { name, value } = event.target;
        setCurrentQuestion(prev => ({ ...prev, [name]: value }));

        // Reset irrelevant fields when type changes
        if (name === 'question_type') {
            setCurrentQuestion(prev => ({
                ...prev,
                correct_text_answer: '',
                explanation: '',
                options: [
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                ] // Reset options
            }));
        }
    };

    // Update a specific option text for multiple-choice
    const handleOptionTextChange = (index, event) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index].option_text = event.target.value;
        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    };

    // Set which option is correct for multiple-choice (radio button style)
    const handleSetCorrectOption = (index) => {
        const newOptions = currentQuestion.options.map((opt, i) => ({
            ...opt,
            is_correct: i === index // Set only the clicked one to true
        }));
        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    };

    // Add a new blank option field
    const handleAddOption = () => {
        if (currentQuestion.options.length < 6) { // Limit options for simplicity
            setCurrentQuestion(prev => ({
                ...prev,
                options: [...prev.options, { option_text: '', is_correct: false }]
            }));
        }
    };

    // Remove an option field
    const handleRemoveOption = (index) => {
        // Prevent removing if only 2 options left
        if (currentQuestion.options.length <= 2) return;
        const newOptions = currentQuestion.options.filter((_, i) => i !== index);
        // If the removed option was the correct one, reset correctness
        if (!newOptions.some(opt => opt.is_correct)) {
            if (newOptions.length > 0) {
                newOptions[0].is_correct = true; // Default to first option if correct one removed
            }
        }
        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    };
    // Add new answer to additional answers
    const handleAddCorrectAnswer = () => {
        if (currentQuestion.additional_correct_answers.length < 5) {
            setCurrentQuestion(prev => ({
                ...prev,
                additional_correct_answers: [...prev.additional_correct_answers, '']
            }));
        }
    };

    // Update specific additional answer
    const handleAdditionalAnswerChange = (index, value) => {
        const newAnswers = [...currentQuestion.additional_correct_answers];
        newAnswers[index] = value;
        setCurrentQuestion(prev => ({
            ...prev,
            additional_correct_answers: newAnswers
        }));
    };

    // Remove additional answer
    const handleRemoveCorrectAnswer = (index) => {
        const newAnswers = currentQuestion.additional_correct_answers.filter((_, i) => i !== index);
        setCurrentQuestion(prev => ({
            ...prev,
            additional_correct_answers: newAnswers
        }));
    };

    // Add the question currently in the form to the main list
    const handleAddQuestion = () => {
        setError(null);

        // --- Validation ---
        if (!currentQuestion.question_text.trim()) {
            setError(t('setupRoom.validation.questionTextRequired'));
            return;
        }

        if (currentQuestion.question_type === 'text') {
            if (!currentQuestion.correct_text_answer.trim()) {
                setError(t('setupRoom.validation.correctAnswerRequired'));
                return;
            }

            // Check for empty additional answers
            const hasEmptyAdditional = currentQuestion.additional_correct_answers.some(answer => answer.trim() === '');
            if (hasEmptyAdditional) {
                setError(t('setupRoom.validation.fillAdditionalAnswers'));
                return;
            }
        }

        if (currentQuestion.question_type === 'multiple-choice') {
            if (currentQuestion.options.length < 2) {
                setError(t('setupRoom.validation.multipleChoiceMinOptions'));
                return;
            }
            if (currentQuestion.options.some(opt => !opt.option_text.trim())) {
                setError(t('setupRoom.validation.fillAllOptions'));
                return;
            }
            if (!currentQuestion.options.some(opt => opt.is_correct)) {
                setError(t('setupRoom.validation.markCorrectOption'));
                return;
            }
        }

        // Create a copy for modification
        const questionToAdd = { ...currentQuestion };

        // Combine all correct answers with separator for text questions
        if (questionToAdd.question_type === 'text' && questionToAdd.additional_correct_answers.length > 0) {
            const allAnswers = [
                questionToAdd.correct_text_answer,
                ...questionToAdd.additional_correct_answers.filter(answer => answer.trim() !== '')
            ];
            questionToAdd.correct_text_answer = allAnswers.join('|'); // Combine with |

            console.log('Combined answers:', questionToAdd.correct_text_answer); // Debug log
        }

        // Remove additional_correct_answers from the saved question since it's now combined
        delete questionToAdd.additional_correct_answers;

        // ✅ FIXED: Add the modified questionToAdd instead of original currentQuestion
        setQuestions(prev => [...prev, questionToAdd]);

        // Reset form for next question
        setCurrentQuestion({ ...initialQuestionState, tempId: Date.now() });
    };

    const handleAddQuestionToList = () => {
        handleAddQuestion(); // Call the function to add the question to the list
    };

    // Remove a question from the main list
    const handleRemoveQuestion = (tempIdToRemove) => {
        setQuestions(prev => prev.filter(q => q.tempId !== tempIdToRemove));
    };

    // Validate reward data
    const validateReward = () => {
        if (!hasReward) return true;

        if (!reward.expirationDate) {
            setError("Please set an expiration date for the reward.");
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiration = new Date(reward.expirationDate);
        expiration.setHours(0, 0, 0, 0);

        if (expiration < today) {
            setError("Expiration date cannot be in the past.");
            return false;
        }

        if (reward.rewardType === 'discount') {
            if (!reward.discountName.trim()) {
                setError("Please enter a discount name.");
                return false;
            }
            if (!reward.discountValue.trim()) {
                setError("Please enter a discount value.");
                return false;
            }
        } else if (reward.rewardType === 'ticket') {
            if (!reward.ticketName.trim()) {
                setError("Please enter a ticket name.");
                return false;
            }
            if (!reward.ticketImage) {
                setError("Please upload a ticket image.");
                return false;
            }
        }

        return true;
    };

    // Final save action - send data to backend
    const handleSaveRoom = async () => {
        setError(null);
        setSuccessMessage(null);

        // --- Final Validation ---
        if (!roomDetails.room_title.trim()) {
            setError("Room Title cannot be empty.");
            return;
        }
        if (questions.length === 0) {
            setError("Please add at least one question to the room.");
            return;
        }

        // Validate reward if enabled
        if (!validateReward()) {
            return;
        }

        setIsLoading(true);
        try {
            // Upload thumbnail nếu có
            let thumbnailUrl = null;
            if (roomDetails.thumbnailFile) {
                // Lấy username từ localStorage hoặc context authentication
                const adminUsername = localStorage.getItem('username') || roomDetails.admin_username;

                try {
                    const [url] = await uploadFiles([roomDetails.thumbnailFile], 'thumbnails', adminUsername);
                    thumbnailUrl = url;
                } catch (uploadError) {
                    console.error("Error uploading thumbnail:", uploadError);
                    setError("Failed to upload thumbnail. Please try again.");
                    setIsLoading(false);
                    return;
                }
            }

            // --- Prepare Payload ---
            // Map client-side question structure to potential backend structure
            const payloadQuestions = questions.map((q, index) => {
                const backendQuestion = {
                    question_number: index + 1,
                    question_text: q.question_text,
                    question_type: q.question_type,
                    hint: q.hint || null, // Send null if empty
                    explanation: q.explanation || null, // Add explanation to payload
                    correct_text_answer: q.question_type === 'text' ? q.correct_text_answer : null,
                    options: q.question_type === 'multiple-choice' ? q.options.map(opt => ({
                        option_text: opt.option_text,
                        is_correct: opt.is_correct
                    })) : null
                };
                // Remove null option/answer fields if not relevant
                if (backendQuestion.correct_text_answer === null) delete backendQuestion.correct_text_answer;
                if (backendQuestion.options === null) delete backendQuestion.options;
                if (backendQuestion.hint === null) delete backendQuestion.hint;
                if (backendQuestion.explanation === null) delete backendQuestion.explanation; // Remove explanation if not set
                return backendQuestion;
            });

            const payload = {
                room_details: {
                    room_id: roomDetails.room_id,
                    room_title: roomDetails.room_title,
                    admin_username: localStorage.getItem('username') || roomDetails.admin_username,
                    description: roomDetails.description || null, // Send null if empty
                    thumbnail: thumbnailUrl, // Sử dụng URL đã upload
                    how2play: roomDetails.how2play || null, // Uncomment if how2play is used
                },
                questions: payloadQuestions
            };

            // --- Call Room API First ---
            const roomResult = await saveRoomConfiguration(payload);

            // --- Then Create Reward Separately if enabled ---
            if (hasReward) {
                // Upload ticket image if needed
                let ticketImageUrl = null;
                if (reward.rewardType === 'ticket' && reward.ticketImage) {
                    const adminUsername = localStorage.getItem('username') || roomDetails.admin_username;

                    try {
                        const [url] = await uploadFiles([reward.ticketImage], roomDetails.room_id, adminUsername);
                        ticketImageUrl = url;
                    } catch (uploadError) {
                        console.error("Error uploading ticket image:", uploadError);
                        setError("Room created but failed to upload ticket image. You can add reward later.");
                        setIsLoading(false);
                        return;
                    }
                }

                // Prepare reward data using the same structure as setupVoucher
                const rewardData = {
                    rewardType: reward.rewardType,
                    roomId: roomDetails.room_id,
                    hostId: localStorage.getItem('username') || roomDetails.admin_username,
                    username: localStorage.getItem('username') || roomDetails.admin_username,
                    expirationDate: reward.expirationDate,
                };

                if (reward.rewardType === 'discount') {
                    rewardData.discountName = reward.discountName;
                    rewardData.discountValue = reward.discountValue;
                    rewardData.discountDescription = reward.discountDescription;
                } else if (reward.rewardType === 'ticket') {
                    rewardData.ticketName = reward.ticketName;
                    rewardData.ticketDescription = reward.ticketDescription;
                    rewardData.ticketImage = ticketImageUrl;
                }

                try {
                    await saveRewardConfiguration(rewardData);
                    setSuccessMessage(`Room and reward created successfully! (Room ID: ${roomResult.roomId})`);
                } catch (rewardError) {
                    console.error("Error creating reward:", rewardError);
                    setSuccessMessage(`Room created successfully (Room ID: ${roomResult.roomId}), but reward creation failed. You can add reward later.`);
                }
            } else {
                setSuccessMessage(`Room created successfully! (Room ID: ${roomResult.roomId})`);
            }

            // Reset form after successful save
            setRoomDetails({
                room_id: Math.random().toString(36).substring(2, 7),
                room_title: '',
                admin_username: '',
                description: '',
                thumbnail: '',
                how2play: ''
            });
            setQuestions([]);
            setCurrentQuestion({ ...initialQuestionState, tempId: Date.now() });
            setReward({ ...initialRewardState });
            setHasReward(false);

            // Optional: Navigate to the created room or dashboard
            navigate(`/quiz/room/${roomResult.roomId}`);
        } catch (err) {
            console.error("Error saving room:", err);
            setError(err.message || "An unknown error occurred during saving.");
        } finally {
            setIsLoading(false);
        }
    };

    // Thêm hàm xử lý khi AI tạo câu hỏi xong
    const handleAIQuestionsGenerated = (aiQuestions) => {
        // Thêm các câu hỏi AI vào danh sách hiện tại
        setQuestions(prev => [...prev, ...aiQuestions]);
        setShowAIGenerator(false);
    };

    // --- JSX Render ---
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
            {/* Loading Overlays với glassmorphism */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto mb-3"></div>
                        <p className="text-sm text-slate-600 font-medium">Saving room...</p>
                    </div>
                </div>
            )}
            {compressing && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto mb-3"></div>
                        <p className="text-sm text-slate-600 font-medium">Processing image...</p>
                    </div>
                </div>
            )}

            {/* Header với gradient */}
            <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg">
                <h1 className="text-xl font-bold text-white text-center">
                    {t('setupRoom.title')}
                </h1>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
                {/* --- Room Details Form --- */}
                <section className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20">
                    <h2 className="text-lg font-semibold mb-3 border-b border-slate-200 pb-2 text-slate-800 flex items-center">
                        <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4M9 7h1m-1 4h1m2-4h1m-1 4h1m2-4h1m-1 4h1m-1-8h1m-1 4h1" />
                        </svg>
                        {t('setupRoom.roomInformation')}
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="room_title" className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.roomTitle')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="room_title"
                                name="room_title"
                                value={roomDetails.room_title}
                                onChange={handleRoomDetailsChange}
                                placeholder={t('setupRoom.roomTitlePlaceholder')}
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-lg"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.description')}</label>
                            <textarea
                                id="description"
                                name="description"
                                value={roomDetails.description}
                                onChange={handleRoomDetailsChange}
                                placeholder={t('setupRoom.descriptionPlaceholder')}
                                rows="3"
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-lg resize-none"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="how2play" className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.rules')}</label>
                            <textarea
                                id="how2play"
                                name="how2play"
                                value={roomDetails.how2play}
                                onChange={handleRoomDetailsChange}
                                placeholder={t('setupRoom.rulesPlaceholder')}
                                rows="3"
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-lg resize-none"
                                required
                            />
                        </div>

                        {/* --- Upload Thumbnail với modern design --- */}
                        <div className="pt-2">
                            <label htmlFor="thumbnail" className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.roomThumbnail')}</label>
                            <div className="mt-1 flex items-center space-x-4">
                                {roomDetails.thumbnailPreview ? (
                                    <img
                                        src={roomDetails.thumbnailPreview}
                                        alt="Thumbnail Preview"
                                        className="h-20 w-32 object-cover rounded-xl border border-white/20 shadow-lg"
                                    />
                                ) : (
                                    <div className="h-20 w-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-white/20 flex items-center justify-center text-xs text-slate-400">
                                        {t('setupRoom.noPreview')}
                                    </div>
                                )}
                                <div>
                                    <label
                                        htmlFor="thumbnail-upload"
                                        className="cursor-pointer bg-gradient-to-r from-violet-100 to-indigo-100 hover:from-violet-200 hover:to-indigo-200 text-violet-700 py-2 px-4 rounded-xl shadow-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                                    >
                                        <span>{t('setupRoom.thumbnailUpload')}</span>
                                        <input
                                            id="thumbnail-upload"
                                            name="thumbnail"
                                            type="file"
                                            accept="image/png, image/jpeg, image/gif, image/webp"
                                            className="sr-only"
                                            onChange={handleThumbnailChange}
                                        />
                                    </label>
                                    {roomDetails.thumbnailFile && (
                                        <button
                                            type="button"
                                            onClick={() => setRoomDetails(prev => ({ ...prev, thumbnailFile: null, thumbnailPreview: null }))}
                                            className="ml-3 text-xs text-red-500 hover:text-red-700 transition-colors duration-200"
                                        >
                                            {t('setupRoom.thumbnailRemove')}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {roomDetails.thumbnailFile && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Selected: {roomDetails.thumbnailFile.name} ({(roomDetails.thumbnailFile.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">{t('setupRoom.thumbnailRecommendation')}</p>
                        </div>
                    </div>
                </section>

                {/* --- Reward Setup Section --- */}
                <section className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                            <span className="mr-2 text-2xl">🎁</span>
                            {t('setupRoom.roomReward')}
                        </h2>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hasReward}
                                onChange={handleRewardToggle}
                                className="sr-only"
                            />
                            <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${hasReward ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-slate-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${hasReward ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                            </div>
                        </label>
                    </div>

                    {hasReward && (
                        <div className="space-y-4 border-t border-slate-200 pt-4">
                            {/* Reward Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.rewardType')} <span className="text-red-500">*</span></label>
                                <select
                                    name="rewardType"
                                    value={reward.rewardType}
                                    onChange={handleRewardChange}
                                    className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm shadow-lg"
                                >
                                    <option value="discount">{t('setupRoom.discountVoucher')}</option>
                                    <option value="ticket">{t('setupRoom.ticketPrize')}</option>
                                </select>
                            </div>

                            {/* Expiration Date */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.expirationDate')} <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    name="expirationDate"
                                    value={reward.expirationDate}
                                    onChange={handleRewardChange}
                                    className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm shadow-lg"
                                />
                            </div>

                            {/* Discount Voucher Fields */}
                            {reward.rewardType === 'discount' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.voucherName')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="discountName"
                                            value={reward.discountName}
                                            onChange={handleRewardChange}
                                            placeholder={t('setupRoom.voucherNamePlaceholder')}
                                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm placeholder-slate-400 shadow-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.discountValue')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="discountValue"
                                            value={reward.discountValue}
                                            onChange={handleRewardChange}
                                            placeholder={t('setupRoom.discountValuePlaceholder')}
                                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm placeholder-slate-400 shadow-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.rewardDescription')}</label>
                                        <textarea
                                            name="discountDescription"
                                            value={reward.discountDescription}
                                            onChange={handleRewardChange}
                                            placeholder={t('setupRoom.rewardDescriptionPlaceholder')}
                                            rows="3"
                                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm placeholder-slate-400 shadow-lg resize-none"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Ticket Fields */}
                            {reward.rewardType === 'ticket' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.ticketName')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="ticketName"
                                            value={reward.ticketName}
                                            onChange={handleRewardChange}
                                            placeholder={t('setupRoom.ticketNamePlaceholder')}
                                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm placeholder-slate-400 shadow-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.ticketDescription')}</label>
                                        <textarea
                                            name="ticketDescription"
                                            value={reward.ticketDescription}
                                            onChange={handleRewardChange}
                                            placeholder={t('setupRoom.ticketDescriptionPlaceholder')}
                                            rows="3"
                                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm placeholder-slate-400 shadow-lg resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.ticketImage')}</label>
                                        <div className="mt-1 flex items-center space-x-4">
                                            {reward.ticketImagePreview ? (
                                                <img
                                                    src={reward.ticketImagePreview}
                                                    alt="Ticket Preview"
                                                    className="h-20 w-32 object-cover rounded-xl border border-white/20 shadow-lg"
                                                />
                                            ) : (
                                                <div className="h-20 w-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-white/20 flex items-center justify-center text-xs text-slate-400">
                                                    {t('setupRoom.noPreview')}
                                                </div>
                                            )}
                                            <div>
                                                <label
                                                    htmlFor="ticket-image-upload"
                                                    className="cursor-pointer bg-gradient-to-r from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 text-emerald-700 py-2 px-4 rounded-xl shadow-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                                                >
                                                    <span>{t('setupRoom.uploadImage')}</span>
                                                    <input
                                                        id="ticket-image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={handleRewardImageChange}
                                                    />
                                                </label>
                                                {reward.ticketImage && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setReward(prev => ({ ...prev, ticketImage: null, ticketImagePreview: null }))}
                                                        className="ml-3 text-xs text-red-500 hover:text-red-700 transition-colors duration-200"
                                                    >
                                                        {t('setupRoom.remove')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {reward.ticketImage && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                Selected: {reward.ticketImage.name} ({(reward.ticketImage.size / 1024).toFixed(2)} KB)
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </section>

                {/* --- Added Questions List --- */}
                {questions.length > 0 && (
                    <section className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20">
                        <h2 className="text-lg font-semibold mb-3 border-b border-slate-200 pb-2 text-slate-800 flex items-center">
                            <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {t('setupRoom.addedQuestions')} ({questions.length})
                        </h2>
                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {questions.map((q, index) => (
                                <li key={q.tempId} className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-xl border border-white/20">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <span className="text-sm text-slate-800">
                                                <strong className="mr-1 text-violet-600">Q{index + 1}:</strong>
                                                {q.question_text} <span className="text-slate-500">({q.question_type})</span>
                                            </span>
                                            {q.question_type === 'text' && q.correct_text_answer && (
                                                <div className="mt-2 text-xs">
                                                    <span className="text-slate-600">Correct answers: </span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {q.correct_text_answer.split('|').map((answer, ansIndex) => (
                                                            <span key={ansIndex} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                                                                {answer.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveQuestion(q.tempId)}
                                            className="text-red-500 hover:text-red-700 text-xs font-medium ml-2 px-2 py-1 rounded-lg hover:bg-red-50 transition-all duration-200"
                                            title="Remove Question"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* --- Add New Question Form --- */}
                <section className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center">
                        <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {t('setupRoom.addNewQuestion')}
                    </h2>
                    <div className="space-y-4">
                        {/* Question Text */}
                        <div>
                            <label htmlFor="question_text" className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.questionText')} <span className="text-red-500">*</span></label>
                            <textarea
                                id="question_text"
                                name="question_text"
                                value={currentQuestion.question_text}
                                onChange={handleCurrentQuestionChange}
                                placeholder={t('setupRoom.questionTextPlaceholder')}
                                rows="3"
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-lg resize-none"
                            />
                        </div>

                        {/* Question Type */}
                        <div>
                            <label htmlFor="question_type" className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.questionType')} <span className="text-red-500">*</span></label>
                            <select
                                id="question_type"
                                name="question_type"
                                value={currentQuestion.question_type}
                                onChange={handleCurrentQuestionChange}
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm shadow-lg"
                            >
                                <option value="text">{t('setupRoom.textInput')}</option>
                                <option value="multiple-choice">{t('setupRoom.multipleChoice')}</option>
                                <option value="upload">{t('setupRoom.fileUpload')}</option>
                            </select>
                        </div>

                        {/* Hint */}
                        <div>
                            <label htmlFor="hint" className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.hint')}</label>
                            <input
                                type="text"
                                id="hint"
                                name="hint"
                                value={currentQuestion.hint}
                                onChange={handleCurrentQuestionChange}
                                placeholder={t('setupRoom.hintPlaceholder')}
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-lg"
                            />
                        </div>

                        {/* --- Conditional Answer/Options Input --- */}
                        {currentQuestion.question_type === 'text' && (
                            <div className="space-y-4">
                                {/* Main Correct Answer */}
                                <div>
                                    <label htmlFor="correct_text_answer" className="block text-sm font-medium text-slate-700 mb-1">
                                        {t('setupRoom.primaryAnswer')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="correct_text_answer"
                                        name="correct_text_answer"
                                        value={currentQuestion.correct_text_answer}
                                        onChange={handleCurrentQuestionChange}
                                        placeholder={t('setupRoom.primaryAnswerPlaceholder')}
                                        className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-lg"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        {t('setupRoom.japaneseHint')}
                                    </p>
                                </div>

                                {/* Additional Correct Answers */}
                                <div className="border-t border-slate-200 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-slate-700">
                                            {t('setupRoom.alternativeAnswers')}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddCorrectAnswer}
                                            disabled={currentQuestion.additional_correct_answers.length >= 5}
                                            className="text-sm text-violet-600 hover:text-violet-800 font-medium px-3 py-1 rounded-lg hover:bg-violet-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t('setupRoom.addAlternative')}
                                        </button>
                                    </div>

                                    {currentQuestion.additional_correct_answers.length > 0 && (
                                        <div className="space-y-3">
                                            {currentQuestion.additional_correct_answers.map((answer, index) => (
                                                <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-blue-600">{index + 2}</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={answer}
                                                        onChange={(e) => handleAdditionalAnswerChange(index, e.target.value)}
                                                        placeholder={`Alternative answer ${index + 2}`}
                                                        className="flex-grow px-3 py-2 bg-white/90 backdrop-blur-sm border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm placeholder-slate-400 shadow-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCorrectAnswer(index)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-medium p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                                                        title="Remove Alternative Answer"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-xl border border-amber-200 mt-3">
                                        <div className="flex items-start space-x-2">
                                            <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div className="text-xs text-amber-700">
                                                <p className="font-medium mb-1">{t('setupRoom.alternativeHelp')}</p>
                                                <ul className="list-disc ml-4 space-y-0.5">
                                                    {t('setupRoom.alternativeHelpItems', { returnObjects: true }).map((item, index) => (
                                                        <li key={index}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentQuestion.question_type === 'multiple-choice' && (
                            <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
                                <h3 className="text-md font-medium text-slate-700 mb-1">{t('setupRoom.options')} <span className="text-red-500">*</span></h3>
                                {currentQuestion.options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                                        <input
                                            type="radio"
                                            id={`option_correct_${index}`}
                                            name={`correct_option_radio_${currentQuestion.tempId}`}
                                            checked={option.is_correct}
                                            onChange={() => handleSetCorrectOption(index)}
                                            className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-300"
                                        />
                                        <input
                                            type="text"
                                            value={option.option_text}
                                            onChange={(e) => handleOptionTextChange(index, e)}
                                            placeholder={`${t('setupRoom.optionPlaceholder')} ${index + 1}`}
                                            className="flex-grow px-3 py-2 bg-white/90 backdrop-blur-sm border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-lg"
                                        />
                                        {currentQuestion.options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(index)}
                                                className="text-red-500 hover:text-red-700 text-xs font-medium p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                                                title="Remove Option"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {currentQuestion.options.length < 6 && (
                                    <button
                                        type="button"
                                        onClick={handleAddOption}
                                        className="text-sm text-violet-600 hover:text-violet-800 font-medium mt-2 px-3 py-2 rounded-lg hover:bg-violet-50 transition-all duration-200"
                                    >
                                        {t('setupRoom.addOption')}
                                    </button>
                                )}
                            </div>
                        )}

                        {currentQuestion.question_type === 'upload' && (
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border border-white/20">
                                <p className="text-sm text-slate-600 flex items-center">
                                    <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {t('setupRoom.uploadInfo')}
                                </p>
                            </div>
                        )}

                        {/* Explanation */}
                        <div>
                            <label htmlFor="explanation" className="block text-sm font-medium text-slate-700 mb-1">{t('setupRoom.explanation')}</label>
                            <textarea
                                id="explanation"
                                name="explanation"
                                value={currentQuestion.explanation}
                                onChange={handleCurrentQuestionChange}
                                placeholder={t('setupRoom.explanationPlaceholder')}
                                rows="3"
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-lg resize-none"
                            />
                        </div>

                        {/* Add Question Button */}
                        <div className="text-right">
                            {/* Thêm button AI Generator trước button Add Question */}
                            <div className="flex space-x-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowAIGenerator(true)}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-1 px-2 rounded-xl shadow-lg font-semibold transition-all duration-200 hover:scale-[1.02] flex items-center"
                                >
                                    <span className="mr-2">🤖</span>
                                    {t('aiGenerator.title', 'Tạo bằng AI')}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={handleAddQuestionToList}
                                    className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-1 px-2 rounded-xl shadow-lg font-semibold transition-all duration-200 hover:scale-[1.02]"
                                >
                                    {t('setupRoom.addThisQuestion')}
                                </button>
                            </div>
                        </div>
                        {/* Display error for adding question */}
                        {error && !isLoading && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </section>

                {/* --- Save Room Section --- */}
                <section className="mt-6 text-center">
                    {/* Display final save errors/success */}
                    {error && isLoading && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-4">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleSaveRoom}
                        disabled={isLoading || questions.length === 0}
                        className={`px-8 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] ${(isLoading || questions.length === 0)
                            ? 'bg-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
                            }`}
                    >
                        {isLoading ? t('setupRoom.saving') : t('setupRoom.saveRoom')}
                    </button>
                    {questions.length === 0 && <p className="text-xs text-slate-500 mt-2">{t('setupRoom.addAtLeastOne')}</p>}
                </section>

            </div>
            {/* AI Question Generator Modal */}
            {showAIGenerator && (
                <AIQuestionGenerator
                    onQuestionsGenerated={handleAIQuestionsGenerated}
                    onClose={() => setShowAIGenerator(false)}
                />
            )}

            {/* Footer Navigation với glassmorphism */}
            <div className="fixed w-full max-w-md bottom-0 z-50">
                <div className="">
                    <NavigationComponent />
                </div>
            </div>
        </div>
    );
};

export default RoomSetup;