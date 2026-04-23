import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { ArticlesListPage } from './pages/ArticlesListPage';
import { AboutPage } from './pages/AboutPage';
import { LibraryPage } from './pages/LibraryPage';
import { QuizPage } from './pages/QuizPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles" element={<ArticlesListPage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
