'use client';
import { useState, useEffect, useRef, useContext } from 'react';
import { URL } from '../constants/Constants';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatSection from '../components/ChatSection';
import WelcomeContent from '../components/WelcomeContent';
import InputSection from '../components/InputSection';
import { ChatContext } from './context/context.js';
import { toast } from 'react-toastify';

export default function Home() {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const scrollContainerRef = useRef(null);
  const questionRefs = useRef([]);
  const textareaRef = useRef(null);
  const context = useContext(ChatContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("https://vercel.com/pradeeps-projects-b5345319/query-flow-ai-backend/6CfkGNFSxeMDCB4PS7gnFzhLdAL1/getchats", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ chatLength: chat.length })
      })
        .then(response => {
          if (response.status === 401) {
            context.setIsLoggedIn(false);
            localStorage.removeItem("token");
          }
          context.setIsLoggedIn(true);
          response.json();
        })
        .then(data => {
          if (!context.isLoggedIn) return;
          if (data.success && Array.isArray(data.selectedChats)) {
            setChat(prev => [...data.selectedChats, ...prev]);
            context.setIsLoggedIn(true);
            context.setCanLoadMore(data.canLoadMore);
            toast.success("Chats loaded successfully!")
          }
        })
        .catch(err => {
          toast.error("Failed to load chats!")
          return console.error("unable to load chats: ", err)
        }).finally(() => setIsPosting(false));
    }
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
  }, [chat.length])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query])

  const getCurrentTime = () => {
    return Date.now();
    //now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const askQuestion = async () => {

    const newEntry = {
      question: query.trim(),
      timestamp: getCurrentTime(),
    }

    setChat(prev => [...prev, newEntry]);
    setQuery('');
    context.setIsAnsLoading(true)

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
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

    try {
      let res = await fetch(URL, { // send question and get response from AI
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();   // process the response
      const answer = json.candidates[0].content.parts[0].text;

      setChat(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            answer: answer
          }
        }
        return updated;
      });

    } catch (error) {
      console.error(error);
    } finally {
      context.setIsAnsLoading(false);
    }
    
    if (context.isLoggedIn && !isPosting) {
      setIsPosting(true);
      const token = localStorage.getItem("token");
      fetch("https://vercel.com/pradeeps-projects-b5345319/query-flow-ai-backend/6CfkGNFSxeMDCB4PS7gnFzhLdAL1/postchat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...newEntry, answer })
      })
        .then(response => response.json())
        .catch(err => console.error("failde to post ", err))
        .finally(() => setIsPosting(false))
    }
  }

  const handleInput = (e) => {
    setQuery(e.target.value);
  }

  return (
    <>
      <div className='h-full overflow-hidden flex flex-col'>
        <Navbar openSidebar={() => setShowSidebar(true)} />
        {showSidebar && (<Sidebar
          denySidebar={() => setShowSidebar(false)}
          chat={chat} questionRefs={questionRefs}
        />)
        }
        {!chat.length ?
          <WelcomeContent />
          : <ChatSection
            scrollContainerRef={scrollContainerRef}
            chat={chat}
            setChat={setChat}
            questionRefs={questionRefs}
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
    </>
  )
}