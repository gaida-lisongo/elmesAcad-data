import { fetchSections } from "@/app/actions/section.actions";
import Courses from "@/app/components/Home/Courses";
import { PromotionType, SectionType } from "@/app/page";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "BTP | Programmes",
};

export default async function ProgrammesPage() {
  const req = await fetchSections();
  const section: SectionType = req.data?.length
    ? req.data[0]
    : ({
        _id: "",
        mention: "",
        designation: "",
        mission: "",
        promesses: [],
        filieres: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SectionType);

  let allPromotions: PromotionType[] = [];

  section.filieres?.forEach((filiere) => {
    const promotions = filiere.programmes || [];

    for (const promo of promotions) {
      allPromotions.push({
        ...promo,
        filiere: filiere.designation,
        filiereId: filiere._id,
      });
    }
  });

  return (
    <>
      {/* Bannière avec image et description */}
      <div className="relative w-full h-[400px]">
        <Image
          src="/images/banner/1.jpg"
          alt="Banner"
          width={1920}
          height={400}
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/30 to-primary/90 flex items-center justify-center">
          <div className="container text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeIn">
              {section.designation || "Nos Programmes"}
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto animate-fadeIn animation-delay-200">
              {section.mission ||
                "Découvrez nos programmes de formation adaptés à vos besoins"}
            </p>
          </div>
        </div>
      </div>

      <main>
        <Courses section={section} promotions={allPromotions} />
        {/* <Mentor />
        <ContactForm/>
        <Newsletter /> */}
      </main>
    </>
  );
}
