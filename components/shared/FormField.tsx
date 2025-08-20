import React from 'react';

export const inputClasses = "w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-white placeholder-gray-400";
export const selectClasses = `${inputClasses} appearance-none`;

interface FormFieldProps {
  label: string;
  id: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, id, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    {children}
  </div>
);

export default FormField;
