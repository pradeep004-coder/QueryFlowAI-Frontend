function Sidebar({denySidebar, chat, questionRefs, isAnsLoading}) {
  return (
    <>
        <div className='flex justify-end'>
              <button 
                    type='button' 
                    className='text-zinc-300 hover:text-white text-lg font-bold select-none' 
                    onClick={
                        () => denySidebar()
                    }
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
    </>
  )
}

export default Sidebar;