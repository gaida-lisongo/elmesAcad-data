import React from "react";
import Link from "next/link";

const ExpiredSubscription = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-lg">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Abonnement expiré
        </h1>

        {/* Message */}
        <p className="mb-2 text-base text-gray-600">
          Votre accès à cette application a été suspendu.
        </p>
        <p className="mb-8 text-sm text-gray-400">
          Veuillez renouveler votre abonnement ou contacter notre support pour
          réactiver votre compte.
        </p>

        {/* Divider */}
        <div className="mb-8 h-px w-full bg-gray-100" />

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="mailto:support@example.com"
            className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
          >
            Contacter le support
          </Link>
          <Link
            href="https://www.example.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
          >
            Voir nos offres
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExpiredSubscription;
