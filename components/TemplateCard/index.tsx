// components/TemplateCard.tsx
import React from 'react';

// defining the type for the template prop
type Template = {
  id: number;
  title: string;
  explanation: string;
  tags: string;
  owner: {
    id: number;
    userName: string;
  };
};

interface TemplateCardProps {
  template: Template;
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => {
  return (
    <div
      key={template.id}
      className="border p-4 rounded shadow cursor-pointer hover:bg-gray-100"
      onClick={onClick} // navigate to the detailed page
    >
      <h2 className="text-xl font-semibold mb-2 flex justify-between items-center">
        {template.title}
        <span className="text-sm font-normal text-gray-500">
          Author: {template.owner.userName}
        </span>
      </h2>
      <p className="mb-2">{template.explanation}</p>
      <p className="text-sm text-gray-600">Tags: {template.tags}</p>
    </div>
  );
};

export default TemplateCard;
