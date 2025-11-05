import React from 'react';
import type { Language } from '../../types';
import RequestsManagement from './decorations/RequestsManagement';

const AdminDecorationRequestsPage: React.FC<{ language: Language }> = ({ language }) => {
    return <RequestsManagement language={language} />;
};

export default AdminDecorationRequestsPage;