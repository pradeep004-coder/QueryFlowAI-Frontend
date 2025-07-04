export const checkHeading = (str) => { 
  return /^\*\*(.*)\*$/.test(str);
};

export const replaceHeadStars = (str) => {
  return str.replace(/^(\*)(\*)|(\*)\$/g,'')
}

export const parseResponse = (str) => {
  const lines = str.split('\n')
  const result = []
  let codeBuffer = []
  let inCodeBlock = false
  let currentLang = 'plain'

  lines.forEach(line => {
    if(line.includes('```')) {
      inCodeBlock = !inCodeBlock

      if (inCodeBlock) {
        currentLang = line.replace('```', '').trim() || currentLang
        codeBuffer = []
      }

      if (!inCodeBlock && codeBuffer.length>0) {
        result.push({ type: 'code', content: codeBuffer.join('\n'), language : currentLang})
        codeBuffer = []
      }
    }

    if(inCodeBlock) { // Push code
      if (line.includes('```')) {
        return
      } 
       codeBuffer.push(line)
    }
    else if (line.endsWith('```')) {
      return
    }
    else if (/^\*\*(.+?)\*\*$/.test(line.trim()) || /^\*\s+\*\*(.+?):\*\*$/.test(line)) { // strict match '**content:**', '*   **`#include <stdio.h>`:**'
      result.push({ type: 'h1', content: line})
    }

    else if (/^\d+\.\s+\*\*(.+?)\*\*/.test(line) || /^\d+\.\s+\*\*(.+?)\*\*/.test(line)) { // strict match '1.  **content:**', '1.  **`#include <stdio.h>`**:'
      result.push({ type: 'h2', content: line})
    }

    else if (/^\s+\*\*(.+?):\*$/.test(line)) { // strict match '  **content:*'
      result.push({ type: 'h3', content: line})
    }

    else if (line.trim() != '```') {
       result.push({ type: 'para', content: line})
    }
  });

  return result;
};
