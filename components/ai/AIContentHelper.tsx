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
    // This component is currently disabled to remove AI dependencies.
    // It returns null to render nothing if accidentally invoked.
    return null;
};

export default AIContentHelper;