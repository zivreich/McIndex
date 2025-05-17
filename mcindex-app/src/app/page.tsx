"use client";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white/66 font-mono p-5">
      <div className="p-8 max-w-xl w-full">
        <pre className="text-center mb-6 text-yellow-400">
          {`                                 
 _____     _____       _         
|     |___|     |___ _| |___ _ _ 
| | | |  _|-   -|   | . | -_|_'_|
|_|_|_|___|_____|_|_|___|___|_,_|
                                 `}
        </pre>

        <div className="flex justify-center mb-8">
          <div className="blink text-center text-xl">
            [ UNDER CONSTRUCTION ]
          </div>
        </div>

        <div className="mb-8 text-center">
          <div className="text-sm bg-black p-3">

            <span className="text-yellow-400">▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░</span>
            <br /><br />
            {'>'} Expected completion: when it's ready
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm bg-black p-3">
            <div>{'>'} <a href="mailto:burgir@themcindex.com" className="text-yellow-400 hover:underline">burgir@themcindex.com</a></div>
            <div>{'>'} <a href="https://github.com/zivreich/McIndex" className="text-yellow-400 hover:underline">github.com/zivreich/McIndex</a></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .blink {
          animation: blink-animation 1s steps(5, start) infinite;
        }
        @keyframes blink-animation {
          to {
            visibility: hidden;
          }
        }
      `}</style>
    </div>
  );
}
