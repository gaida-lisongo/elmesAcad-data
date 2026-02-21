import React from "react";
import Hero from "@/app/components/Home/Hero";
import Companies from "@/app/components/Home/Companies";
import Mentor from "@/app/components/Home/Mentor";
import Testimonial from "@/app/components/Home/Testimonials";
import ContactForm from "@/app/components/ContactForm";
import Newsletter from "@/app/components/Home/Newsletter";

import { Metadata } from "next";
import { fetchSections } from "./actions/section.actions";
import { fetchAnneeActive } from "./actions/annee.actions";

export const metadata: Metadata = {
  title: "BTP | Accueil",
};

export interface CalendrierItemType {
  _id: string;
  photo?: string;
  from: String;
  to: String;
  title: String;
  description: String[];
  items?: String[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AnneeType {
  _id: string;
  debut: Date;
  fin: Date;
  isActive: boolean;
  calendrier: CalendrierItemType[];
  evenements: {
    photo?: string;
    title: String;
    description: String[];
    date: Date;
    createdAt: Date;
    updatedAt: Date;
  }[];
  galeries: {
    photo: string;
    title: String;
    description: String[];
    createdAt: Date;
    updatedAt: Date;
  }[];
  communiques: {
    title: String;
    concerne: String;
    date_created: Date;
    content: String[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PromotionType {
  _id: string;
  niveau: String;
  designation: String;
  description: String[];
  filiere?: String;
  filiereId: string;
  semestres?: {
    designation: String;
    credit: Number;
    unites: any[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionType {
  _id: string;
  mention: string;
  designation: string;
  mission: string;
  promesses: string[];
  filieres?: Array<{
    _id: string;
    sigle: string;
    designation: string;
    description: string;
    programmes: any[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default async function Home() {
  const req = await fetchSections();
  const reqAnnee = await fetchAnneeActive();

  console.log("Annee active fetch result:", reqAnnee);
  console.log("Sections fetch result:", req);

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

  console.log("Section being used:", section);
  console.log("Section ID:", section._id);
  const anneeActive = reqAnnee.data || {
    _id: "",
    debut: new Date(),
    fin: new Date(),
    isActive: false,
    calendrier: [],
    evenements: [],
    galeries: [],
    communiques: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <main>
      <Hero section={section} />
      <Companies section={section} />
      {anneeActive?._id && <Testimonial annee={anneeActive} />}
      {/* <Mentor />
      <ContactForm/>
      <Newsletter /> */}
    </main>
  );
}
