import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/">
      <Image
        src={"/images/logo/logo.png"}
        alt="logo"
        width={45}
        height={45}
        style={{
          width: "auto",
          height: "auto",
          maxHeight: "100px",
          maxWidth: "100%",
        }}
        quality={100}
      />
    </Link>
  );
};

export default Logo;
