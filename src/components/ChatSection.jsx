import Question from "./Question";
import Answers from './Answers';
import { Collapsible } from "./Collapsible";

function ChatSection({scrollContainerRef, chat, questionRefs, isAnsLoading}) {

  return (
    <div 
        ref={scrollContainerRef} 
        className={`flex-1 flex flex-col container p-3 overflow-auto text-zinc-300`}
    >
        {chat.map((chatItem, i) => (
        <div 
            key={i} 
            className="mb-5"  
            ref={(el) => (questionRefs.current[i] = el)}
        >
            <Question 
                question={chatItem.question} 
                time={chatItem.time}
            />
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
                            <Answers
                                ansType={item.type}
                                ans={item.content}
                                language={item.type.trim() == 'code' ? item.language : ''}
                            />
                        </li>
                    })}
                </ul>
            </Collapsible>
            <hr />
        </div>
        ))}
    </div>
  )
}

export default ChatSection