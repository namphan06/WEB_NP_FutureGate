import React from 'react';
import * as Templates from './templates';
import type { CVTemplateProps } from './types';

interface CVRendererProps extends CVTemplateProps {
    templateCode?: string;
}

const CVRenderer: React.FC<CVRendererProps> = ({ templateCode, data, onSectionTap, isViewOnly }) => {
    const mcv = templateCode || data.mcv || 'CV001';

    // Map mcv code to component
    const TemplateComponent = (Templates as any)[mcv];

    if (!TemplateComponent) {
        // Fallback to CV001 if template not found
        return <Templates.CV001 data={data} onSectionTap={onSectionTap} isViewOnly={isViewOnly} />;
    }

    return <TemplateComponent data={data} onSectionTap={onSectionTap} isViewOnly={isViewOnly} />;
};

export default CVRenderer;
