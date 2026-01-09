import Link from "next/link"; // <--- Jangan lupa import ini di paling atas

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 text-white overflow-hidden">
      <h1 className="text-5xl font-bold mb-4 tracking-tight">DATAION</h1>
      <p className="text-xl text-gray-400 mb-8">End-to-End Data Platform</p>
      
      {/* Ubah button menjadi Link */}
      <Link href="/dashboard">
        <button className="px-8 py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/20 cursor-pointer">
          Get Started
        </button>
      </Link>
    </main>
  );
}