import React from "react";

interface Attachment {
  id: string;
  filename: string;
  content: string;
  mimeType: string;
}

interface AttachmentsProps {
  attachments: Attachment[];  // Now accepts an array of attachments
}

const Attachments: React.FC<AttachmentsProps> = ({ attachments }) => {

  if (attachments.length === 0) {
    return <p>No attachments available</p>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold">Attachments:</h3>
      <ul className="list-disc pl-5">
        {attachments.map((attachment) => (
          <li key={attachment.id} className="mt-2">
            <a
              href={attachment.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {attachment.filename}
            </a>{" "}
            ({attachment.mimeType})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Attachments;
