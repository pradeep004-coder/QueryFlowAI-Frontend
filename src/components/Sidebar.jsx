import { useEffect, useState } from "react";

function Sidebar({denySidebar, chat, questionRefs, isAnsLoading}) {
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
      const timer = setTimeout(() => {
        setIsOpening(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  ,[])

  const handleCloseSidebar = () => {
    setIsOpening(false);
    setTimeout(() => {
      denySidebar();
    }, 300);
  }
  

  return (
    <div 
      className="bg-black/50 h-full w-full fixed left-0 top-0 "
      onClick={handleCloseSidebar}
    >
      <div className={`bg-zinc-800 h-full p-3
                        w-[80%] md:w-[30%] 
                        shadow-lg z-50
                        transition-all ease-in-out duration-300 transform ${isOpening ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={(e)=> e.stopPropagation()}
          >
        <div className='flex justify-end'>
          <button 
                type='button' 
                className='text-zinc-300 hover:text-white text-lg font-bold select-none' 
                onClick={handleCloseSidebar}
            >✕</button>
        </div>
        <div className='text-center select-none cursor-pointer'>Recent</div>
        <hr/>
        <div className='flex flex-col'>
          {[...chat].map((item, index) => (
              <div 
                key={index}
                className={
                    `w-full
                    gap-1
                    select-none cursor-pointer
                    truncate
                    overflow-hidden text-ellipsis whitespace-nowrap
                    transition-colors duration-700 ${isAnsLoading && !item.answer ? 'fade-text' : null}`
                }
                onClick={
                    () => {
                        questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
                >
                {item.question}
              </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Sidebar;