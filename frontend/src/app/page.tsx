import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-[100vh] gap-6 flex-col">
        <h1 className="font-bold text-white text-3xl">Welcome to Labify</h1>
        <Link href={"/signin"}>
          <button className="bg-white text-black px-4 py-2 rounded-lg hover:scale-90 transition-all duration-200 font-bold">Sign In</button>
        </Link>
    </div>
  );
}
