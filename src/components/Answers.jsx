import { useState } from "react";

function Answers({ ans, ansType, language }) {

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ans);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!ans) return null;

  switch (ansType) {
    case 'h1':
      return (
        <div className="text-xl font-bold text-zinc-200 py-2">
          {ans}
        </div>
      );

    case 'h2':
      return (
        <div className="text-lg font-semibold text-zinc-300 py-1">
          {ans}
        </div>
      );

    case 'h3':
      return (
        <div className="text-base font-medium text-zinc-400 py-1 pl-2">
          {ans}
        </div>
      );

    case 'code':
      return (
        <div className="rounded-lg">
          <div className="bg-zinc-600 px-4 py-2 flex justify-between rounded-t-lg">
            <div className="text-xl">{language}</div>
            <button type="button" className="text-sm px-1 rounded-md bg-zinc-700 hover:bg-zinc-500 transition-colors border border-zinc-500" onClick={handleCopy}>{copied ? 'copied' : 'copy'}</button>
          </div>
          <div className="bg-zinc-800 text-green-300 text-sm  p-3 overflow-auto rounded-b-lg">
            <pre>
              <code>{ans}</code>
            </pre>
          </div>
        </div>
      );

    case 'para':
    default:
      return (
        <p className="text-sm text-zinc-300 leading-relaxed py-1">
          {ans}
        </p>
      );
  }
}

export default Answers