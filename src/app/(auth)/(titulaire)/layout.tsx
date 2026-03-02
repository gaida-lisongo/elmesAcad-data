"use client";

import { fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchElementByTitulaireIdAndAnneeId } from "@/app/actions/unite-element.actions";
import Loader from "@/app/components/Common/Loader";
import { TitulaireSidebar } from "@/app/components/TitulaireSidebar/TitulaireSidebar";
import { AnneeType } from "@/app/page";
import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";

export interface ElementType {
  _id: string;
  anneeId: AnneeType;
  code: string;
  credit: number;
  designation: string;
  planning?: {
    chapitre: string;
    sections: string[];
  }[];
  mode_evaluation?: string[];
  mode_enseignement?: string[];
  penalites?: { faute: string; sanction: string }[];
  place_ec: string;
  objectifs: string[];
  titulaireId: string;
  uniteId: string;
  createdAt: string;
  updatedAt: string;
}

export default function TituliaireLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuthStore();
  const [currentAnnee, setCurrentAnnee] = useState<any | null>(null);
  const [elments, setElments] = useState<ElementType[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAnneeActive()
      .then((res) => {
        if (res?.success && res.data) {
          setCurrentAnnee(res.data);
        } else {
          setCurrentAnnee(null);
        }
      })
      .catch(() => setCurrentAnnee(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    console.log("Current annee:", currentAnnee);

    if (currentAnnee) {
      setLoading(true);
      fetchElementByTitulaireIdAndAnneeId(user?._id || "", currentAnnee._id)
        .then((res) => {
          if (res?.success && res.data) {
            setElments(res.data);
          } else {
            setElments([]);
          }
        })
        .catch(() => setElments([]))
        .finally(() => setLoading(false));
    }
  }, [currentAnnee]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen">
      <TitulaireSidebar elements={elments} />
      <main className="flex-1 md:ml-0 ml-0 w-full">
        {children}
      </main>
    </div>
  );
}
