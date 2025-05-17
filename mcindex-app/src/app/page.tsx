"use client";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white/66 font-mono p-5 relative bg-black"
    >
      {/* Background GIF with opacity */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(/burgir.gif)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.2,
          zIndex: 0,
        }}
      />
      {/* Content Area */}
      <div className="p-8 max-w-xl w-full relative z-10">
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
          <div className="text-sm p-3">

            <span className="text-yellow-400">▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░</span>
            <br /><br />
            {'>'} Expected completion: when it&apos;s ready
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm p-3">
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
