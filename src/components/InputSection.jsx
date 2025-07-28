import Image from "next/image";

function InputSection({askQuestion, textareaRef, query, handleInput, setQuery }) {
  return (
    <div className='flex justify-center'>
        <form className="
                w-[90%] lg:w-[70%]
                bg-zinc-900
                mb-4
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
                ref={textareaRef}
                value={query}
                onInput={handleInput}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    askQuestion();
                    }
                }}
                rows={1} 
                className={
                    `w-full max-h-[8rem] min-h-[2.5rem]
                    resize-none 
                    p-3 
                    outline-none 
                    bg-transparent
                    overflow-y-auto 
                    scroll-invisible`
                }
                placeholder="Ask me anything..."
            ></textarea>
            { query.length>0 && 
                <button 
                    type='submit' 
                    className='mt-auto mb-2 select-none'
                >
                    <Image 
                        src={'/send-button.png'} 
                        alt='Ask' width={30} 
                        height={30}
                    />
                </button>
            }
        </form>
    </div>
  )
}

export default InputSection;