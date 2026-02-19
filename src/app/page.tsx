import React from "react";
import Hero from "@/app/components/Home/Hero";
import Companies from "@/app/components/Home/Companies";
import Courses from "@/app/components/Home/Courses";
import Mentor from "@/app/components/Home/Mentor";
import Testimonial from "@/app/components/Home/Testimonials";
import ContactForm from "@/app/components/ContactForm";
import Newsletter from "@/app/components/Home/Newsletter";

import { Metadata } from "next";
import { fetchSections } from "./actions/section.actions";

export const metadata: Metadata = {
  title: "eLearning",
};

export interface PromotionType {
    _id: string
    niveau: String
    designation: String
    description: String[]
    semestres?: {
        designation: String
        credit: Number
        unites: any[]
    }[]
    createdAt: Date
    updatedAt: Date
}

export interface SectionType {
    _id: string
    mention: string
    designation: string
    mission: string
    promesses: string[]
    filieres?: Array<{
      _id: string
      sigle: string
      designation: string
      description: string
      programmes: any[]
    }>
    createdAt: Date
    updatedAt: Date
}

export default async function Home() {
  const req = await fetchSections();
  console.log("Sections fetch result:", req);

  const section: SectionType = req.data?.length ? req.data[0] : {
    _id: "",
    mention: "",
    designation: "",
    mission: "",
    promesses: [],
    filieres: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as SectionType;
  
  console.log("Section being used:", section);
  console.log("Section ID:", section._id);

  let allPromotions : PromotionType[] = [];

  section.filieres?.forEach(filiere => {
    allPromotions.push(...filiere.programmes || []);
  });

  console.log("Liste of promotions : ", allPromotions);

  return (
    <main>
      <Hero section={section} />
      <Companies section={section} />
      <Courses section={section} promotions={allPromotions} />
      <Mentor />
      <Testimonial />
      <ContactForm/>
      <Newsletter />
    </main>
  );
}