import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/">
      <Image
        src={
          "https://res.cloudinary.com/dujxkvyf8/image/upload/v1772005745/clients-logos/ujjl3wehvghmxrrkltnx.png"
        }
        alt="logo"
        width={100}
        height={100}
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
