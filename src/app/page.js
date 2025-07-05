'use client';
import { useState, useEffect, useRef } from 'react';
import { URL } from '../constants/Constants';
import Answers from '../components/Answers';
import Question from '../components/Question';
import {Collapsible} from '../components/Collapsible';
import { parseResponse } from '../utils/Helper';
import Image from 'next/image'

export default function Home() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(undefined);
  const [chat, setChat] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isAnsLoading, setIsAnsLoading] = useState(false);
  const [time, setTime] = useState(null);
  const scrollContainerRef = useRef(null);
  const questionRefs = useRef([]);


  useEffect(() => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100);
  } , [chat.length]);

  useEffect(() => {
    setTime(getCurrentTime());
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }))
  };

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
      question: query,
      time: time,
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
      console.log(json.candidates[0].content.parts[0]);
      const dataArray = parseResponse(dataString)
      setResponse(dataArray);

      setChat(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            answer: dataArray
          };
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
    e.target.style.height = 'auto'; // Reset height
    e.target.style.height = `${e.target.scrollHeight}px`; // Set to content height
    setQuery(e.target.value);
  };
  
  return (
    <div className='h-full overflow-hidden flex flex-col' onClick={() => setShowSidebar(false)}>
        {/* -------Navabr------- */}
        <nav className='flex bg-zinc-900 p-2'>
          <button 
            type='button'
            className='justify-start'
            onClick={(e) => { 
              e.stopPropagation();
              setShowSidebar(true)
            }}
          >☰</button>
          <h2 className='w-full text-lg text-center font-semibold'>QueryFlow.AI</h2>
        </nav>
        {/*-------Sidebar--------*/}
          {showSidebar && (
            <div className="bg-zinc-800 h-full p-3 fixed left-0 top-0 
                          w-[90%] lg:w-[30%] 
                          shadow-lg z-50 "
                  onClick={(e)=> e.stopPropagation()}
            >
            <div className='flex justify-end'>
              <button type='button' className='text-zinc-300 hover:text-white text-lg font-bold' onClick={() => setShowSidebar(false)}>✕</button>
            </div>
            <div className='text-center'>Recent</div>
            <hr/>
            <div className='flex flex-col-reverse'>
              {[...chat].map((item, index) => (
                  <div 
                    key={index}
                    className={
                        `w-full
                        gap-1
                        truncate
                        overflow-hidden text-ellipsis whitespace-nowrap
                        transition-colors duration-700 ${isAnsLoading && !item.answer ? 'fade-text' : null}`
                    }
                    onClick={() => {
                        questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}>
                    {item.question}
                  </div>
              ))}
            </div>
          </div>)}
        {/*-------Chat Section--------*/}
        
          {!chat.length ? <div className='h-[50%] flex items-center justify-center'>
              <h1 className="
                  text-4xl lg:text-5xl font-bold text-center text-transparent
                  bg-clip-text bg-gradient-to-r from-zinc-100 to-blue-400"
                >
                  Welcome to QueryFlow<span className="text-blue-500">.ai</span>
              </h1>
            </div>
          :
          <div ref={scrollContainerRef} className={`flex-1 flex flex-col container p-3 overflow-auto text-zinc-300`}>
          {chat.map((chatItem, i) => (
            <div key={i} className="mb-5"  ref={(el) => (questionRefs.current[i] = el)}>
                <Question question={chatItem.question} time={chatItem.time}/>
                <Collapsible>
                  <ul className="my-2">
                      { !chatItem.answer && isAnsLoading ? 
                        <div className="text-zinc-400 animate-dots">
                          Answering
                          <span className="dot-1">.</span>
                          <span className="dot-2">.</span>
                          <span className="dot-3">.</span>
                        </div>
                        : chatItem.answer && chatItem.answer.map((item, index) => {
                            return <li key={index}>
                              <Answers ansType={item.type} ans={item.content} language={item.type.trim() == 'code' ? item.language : ''}/>
                            </li>
                        })}
                  </ul>
                </Collapsible>
                <hr />
            </div>
          ))}
      </div>}
        {/*-------Input Section--------*/}
        <div className='flex justify-center'>
          <form className="
              w-[90%] lg:w-[70%]
              bg-zinc-900
              mb-5
              p-1 pr-3
              text-white
              rounded-4xl
              border border-zinc-400
              flex"
            onSubmit={(e) => {
              e.preventDefault()
              askQuestion()
            }}
          >
            <textarea
              value={query}
              onInput={handleInput}
              onChange={(e) => setQuery(e.target.value)}
              rows={1} 
              className={`w-full ${query.length<=1 ? 'h-[3rem]' : ''} max-h-[8rem] min-h-[2.5rem] resize-none p-3 outline-none bg-transparent  overflow-y-auto scroll-invisible`}
              placeholder="Ask me anything..."
            ></textarea>
            { query.length>0 && <button type='submit' className='mt-auto mb-2'><Image src={'/send-button.png'} alt='Ask' width={30} height={30}/></button>}
          </form>
        </div>
    </div>
  )
}