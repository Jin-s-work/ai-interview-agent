// src/components/ui/textarea.jsx
export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full border border-gray-300 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
      {...props}
    />
  );
}
