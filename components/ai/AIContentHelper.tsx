
import React from 'react';
import type { Property } from '../../types';

interface AIContentHelperProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (newText: string) => void;
  originalText: string;
  propertyData: Partial<Property>;
  context: {
    field: 'description.ar' | 'description.en';
  };
}

const AIContentHelper: React.FC<Omit<AIContentHelperProps, 'language'>> = () => {
    // This component is disabled to remove AI dependencies.
    return null;
};

export default AIContentHelper;