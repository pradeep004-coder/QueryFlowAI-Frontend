
function Question({question, time}) {
  return (
     <div className="max-w-[75%] w-fit ml-auto my-6 bg-zinc-800 p-3 rounded-2xl rounded-tr-none">
        <div className="text-zinc-200">{question}</div>
        <div className="text-sm text-gray-400 text-right mt-1">{time}</div>
    </div>
  )
}

export default Question;