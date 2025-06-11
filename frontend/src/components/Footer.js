import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white shadow-md mt-8">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold text-primary-600">
              QuizSoc
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              A comprehensive quiz platform for learning and assessment
            </p>
          </div>

          <div className="flex space-x-6">
            <Link to="/" className="text-gray-500 hover:text-primary-600">
              Home
            </Link>
            <Link to="/quizzes" className="text-gray-500 hover:text-primary-600">
              Quizzes
            </Link>
            <a
              href="#"
              className="text-gray-500 hover:text-primary-600"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Back to Top
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-center text-sm text-gray-500">
            &copy; {currentYear} QuizSoc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 