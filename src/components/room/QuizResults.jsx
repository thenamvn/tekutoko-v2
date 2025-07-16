// src/components/QuizResults/QuizResults.js
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import NavigationComponent from '../NavigationBar/NavigationBar';

const QuizResults = () => {
    const { roomId } = useParams();

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-[#1977D3] p-4 text-white text-xl font-bold text-center shadow-md">
                Quiz Completed!
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <h2 className="text-3xl font-semibold text-gray-800">Congratulations!</h2>
                <p className="text-gray-600">You have completed the quiz.</p>
                {/* You can add score display here if your API provides it */}
                {/* <p className="text-lg">Your Score: X / 5</p> */}

                <Link
                    to={`/quiz/room/${roomId}`} // Link back to the quiz room start
                    className="mt-6 px-6 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-150"
                >
                    Back to Quiz Room
                </Link>
                 <Link
                    to="/dashboard" // Or link to the main dashboard
                    className="mt-2 px-6 py-2 rounded-md text-blue-600 border border-blue-500 hover:bg-blue-50 transition-colors duration-150"
                >
                    Go to Dashboard
                </Link>
            </div>

            {/* Footer Navigation */}
            <div className="fixed w-full max-w-md bottom-0 z-50">
                <NavigationComponent />
            </div>
        </div>
    );
};

export default QuizResults;