'use client';
import { useState, useEffect, useRef } from 'react';
import { URL } from '../constants/Constants';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { parseResponse } from '../utils/Helper';
import ChatSection from '../components/ChatSection';
import WelcomeContent from '../components/WelcomeContent';
import InputSection from '../components/InputSection';

export default function Home() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(undefined);
  const [chat, setChat] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isAnsLoading, setIsAnsLoading] = useState(false);
  const [time, setTime] = useState(null);
  const scrollContainerRef = useRef(null);
  const questionRefs = useRef([]);
  const textareaRef = useRef(null)


  useEffect(() => {
    const now = new Date();
    setTime(now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }
    }, 100)
  } , [chat.length])

  useEffect(()=>{
    if(textareaRef.current){
      textareaRef.current.style.height ='auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query])

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const payload = {
     "contents": [
      {
        "parts": [
          {
            "text": query
          }
        ]
      }
    ]
  }


  const askQuestion = async () => {
    getCurrentTime()
    const newEntry = { // make record of each query-response object
      id: chat.length+1,
      question: query.trim(),
      time: getCurrentTime(),
    };
    setChat(prev => [...prev, newEntry]);
    setQuery('');
    setIsAnsLoading(true)

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    
    try {
      let res = await fetch(URL, { // send question and get response from the api
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body : JSON.stringify(payload)
      });
    
      const json = await res.json();   // process the response
      const dataString =  json.candidates[0].content.parts[0].text;
      const dataArray = parseResponse(dataString);
      setResponse(dataArray);

      setChat(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            answer: dataArray
          }
        }

        return updated;
      });
    } catch (error) {
      console.error("fetching failed:", error);
    } finally {
      setIsAnsLoading(false);
    }  
  }

  const handleInput = (e) => {
    setQuery(e.target.value);
  }
  
  return (
    <div 
      className='h-full overflow-hidden flex flex-col' 
      onClick={() => setShowSidebar(false)}
    >
      <Navbar openSidebar={()=>setShowSidebar(true)} />
      {showSidebar && (
        <div className="bg-zinc-800 h-full p-3 fixed left-0 top-0 
                      w-[90%] lg:w-[30%] 
                      shadow-lg z-50 "
              onClick={(e)=> e.stopPropagation()}
        >
          <Sidebar 
            denySidebar={()=>setShowSidebar(false)}
            chat={chat} questionRefs={questionRefs}
            isAnsLoading={isAnsLoading}
          />
        </div>
      )}
      {!chat.length ? 
        <WelcomeContent/>
      : <ChatSection
          scrollContainerRef={scrollContainerRef}
          chat={chat}
          questionRefs={questionRefs}
          isAnsLoading={isAnsLoading}
        />
      }
      <InputSection
        textareaRef={textareaRef}
        askQuestion={askQuestion}
        query={query}
        handleInput={handleInput}
        setQuery={setQuery}
      />
    </div>
  )
}