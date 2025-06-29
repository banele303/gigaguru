import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between p-4">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/gigalogo.jpeg"
          alt="SF Shoes Logo"
          width={40}
          height={40}
          className="object-contain"
        />
        <span className="text-xl font-bold">SF Shoes</span>
      </Link>
    </div>
  );
};

export default Navbar; 