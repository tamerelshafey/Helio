import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useLanguage } from './shared/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { getAIEstimatorConfig } from '../services/aiConfig';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { addRequest } from '../services/requests';
import { RequestType } from '../types';
import { useToast } from './shared/ToastContext';

// ... (existing code)

const AIEstimator: React.FC = () => {
    // ... (existing component logic)
};

// FIX: Added a default export to make this file a module that can be lazily loaded.
export default AIEstimator;
