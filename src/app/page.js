'use client';
import { useState, useEffect } from 'react';
import { URL } from '../constants/Constants';
import Answers from '../components/Answers';
import Question from '../components/Question';
import {Collapsible} from '../components/Collapsible';
import { parseResponse } from '../utils/Helper';
import Image from 'next/image';

export default function Home() {
  const [query, setQuery] = useState('rank best miltitaries in the world also mention usp of each');
  const [response, setResponse] = useState(undefined);
  const [ chat, setChat ] = useState([])
  const [showSidebar, setShowSidebar] = useState(true);
  const [isAnsLoading, setIsAnsLoading] = useState(false);
  const [time, setTime] = useState(null);

useEffect(() => {
  setTime(getCurrentTime());
}, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowSidebar(true);  // Desktop → open
      } else {
        setShowSidebar(false); // Mobile → closed by default
      }
    };

    handleResize(); // Run on mount

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
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
    const newEntry = { // make record of each query-response object
      id: chat.length+1,
      question: query,
      time: time,
    };
    setChat(prev => [...prev, newEntry]);
    setIsAnsLoading(true)
    
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
      console.log(dataArray);
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
    <div className='grid grid-cols-10  h-screen'>
      {/*-------Sidebar--------*/}
      {showSidebar && <div className='col-span-3 bg-zinc-800 h-full p-3'>
        <div className='flex justify-end'>
          <button type='button' className='' onClick={() => setShowSidebar(false)}>X</button>
        </div>
        <div className='text-center'>Recent</div>
        <hr/>
        <div className='flex flex-col-reverse'>
          {[...chat].map((item, index) => (
            <div className={`w-full truncate overflow-hidden text-ellipsis whitespace-nowrap transition-colors duration-700 ${
    isAnsLoading && !item.answer ? 'fade-text' : 'text-yellow'}`} key={index}>
              {item.question}
            </div>
          ))}
        </div>
      </div>}
      <div className={`${showSidebar ? 'col-span-7' : 'col-span-full'} h-screen flex flex-col`}>
        {/* -------Navabr------- */}
        <nav className='flex bg-zinc-900 p-2'>
          {!showSidebar && <button type='button' className='justify-start' onClick={() => setShowSidebar(true)}>☰</button>}
          <h2 className='w-full text-center font-semibold'>QueryFlow.AI</h2>
        </nav>
        {/*-------Chat Section--------*/}
        <div className={`flex-1 flex flex-col container p-3 overflow-auto text-zinc-300`}>
            {!chat.length && <div className='h-full flex items-center justify-center'>
                <h1 className="
                    text-4xl lg:text-5xl font-bold text-center text-transparent
                    bg-clip-text bg-gradient-to-r from-zinc-100 to-blue-400"
                  >
                    Welcome to QueryFlow<span className="text-blue-500">.ai</span>
                </h1>
              </div>
            }
            {chat.map((chatItem, i) => (
              <div key={i} className="mb-5">
                  <Question question={chatItem.question}/>
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
                  <hr/>
              </div>
              ))}
        </div>
        {/*-------Input Section--------*/}
        <div className='flex justify-center'>
          <form className="
              w-[90%] lg:w-[70%]
              bg-zinc-800
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
              className="w-full max-h-[8rem] min-h-[2.5rem] resize-none p-3 outline-none bg-transparent  overflow-y-auto scroll-invisible"
              placeholder="Ask me anything..."
            ></textarea>
            { query.length>0 && <button type='submit' className='mt-auto mb-2'><Image src={'/send-button.png'} alt='Ask' width={30} height={30}/></button>}
          </form>
        </div>
      </div>
    </div>
  )
}