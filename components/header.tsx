"use client"

export default function Header() {
  return (
    <header className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
          CryptoTracker
        </h1>
        <p className="text-gray-400">Real-time cryptocurrency prices</p>
      </div>
    </header>
  )
}
