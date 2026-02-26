import { useState } from "react";
import { uploadImage } from "@/services/file.service";
import { Icon } from "@iconify/react";

export interface FormDataType {
  _id?: string;
  photo?: string;
  from: string;
  to: string;
  title: string;
  description: string;
  items?: string;
}

interface ModalEditProps {
  data: FormDataType;
  onSave: (data: FormDataType) => void;
  setShowModal: (show: boolean) => void;
}

export default function ModalEdit({
  data,
  onSave,
  setShowModal,
}: ModalEditProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(data);

  const handleSubmit = async () => {
    if (
      !formData.from ||
      !formData.to ||
      !formData.title ||
      !formData.description
    ) {
      alert("Tous les champs requis doivent être remplis");
      return;
    }

    setIsSubmitting(true);
    try {
      // Si une nouvelle image est sélectionnée mais pas encore uploadée
      let finalPhotoUrl = formData.photo;
      if (selectedFile && !formData.photo) {
        try {
          console.log("📤 Début du téléchargement de l'image...");
          finalPhotoUrl = await uploadImage(selectedFile);
          console.log("✅ Image téléchargée avec succès:", finalPhotoUrl);
        } catch (error) {
          console.error("❌ Erreur lors du téléchargement de l'image:", error);
          alert(
            "❌ Erreur lors du téléchargement de l'image. Veuillez essayer avec une image plus petite ou vérifier votre connexion.",
          );
          setIsSubmitting(false);
          return;
        }
      }

      console.log("💾 Sauvegarde du calendrier en cours...");
      onSave({
        ...formData,
        photo: finalPhotoUrl,
      });
      console.log("✅ Calendrier sauvegardé avec succès");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("Body exceeded") ||
        errorMessage.includes("413")
      ) {
        alert(
          "❌ Le contenu est trop volumineux. Remarques:\n\n• Assurez-vous que les images sont réduites\n• Le poids total ne doit pas dépasser 50 MB\n• Essayez de nouveau avec une image plus compressée\n\nSi le problème persiste, contactez l'administrateur.",
        );
        console.error("ℹ️ Détails techniques:", errorMessage);
      } else {
        alert(
          "❌ Une erreur est survenue lors de la sauvegarde. Veuillez essayer à nouveau.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSizeMB = file.size / 1024 / 1024;
      console.log("📁 Fichier sélectionné:", file.name);
      console.log("📊 Taille du fichier:", fileSizeMB.toFixed(2), "MB");

      if (fileSizeMB > 10) {
        alert(
          "⚠️ Attention: L'image sélectionnée est volumineuse (" +
            fileSizeMB.toFixed(2) +
            " MB). Il est recommandé d'utiliser une image plus légère pour éviter les problèmes de téléchargement.",
        );
      }

      setSelectedFile(file);
      // Créer une URL de prévisualisation locale
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      console.log("👁️ Prévisualisation créée");

      await handleUploadImage();
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      console.log("📤 Début du téléchargement de l'image vers le serveur...");
      console.log(
        "📊 Taille du fichier:",
        (selectedFile.size / 1024 / 1024).toFixed(2),
        "MB",
      );

      const imageUrl = await uploadImage(selectedFile);
      setFormData({ ...formData, photo: imageUrl });
      setPreviewUrl(imageUrl);

      console.log("✅ Image téléchargée et sauvegardée avec succès");
      alert("✅ Image uploadée avec succès");
    } catch (error) {
      console.error("❌ Erreur lors du téléchargement de l'image:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("Body exceeded") ||
        errorMessage.includes("413")
      ) {
        alert(
          "❌ L'image est trop volumineuse (> 1 MB).\n\nVeuillez:\n• Réduire la taille de l'image\n• Ou la compresser avant upload\n• Ou choisir une image plus légère",
        );
        console.error(
          "ℹ️ Limite dépassée. Taille actuelle:",
          (selectedFile.size / 1024 / 1024).toFixed(2),
          "MB",
        );
      } else {
        alert(
          "❌ Erreur lors du téléchargement de l'image. Veuillez vérifier votre connexion et essayer à nouveau.",
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-midnight_text">
            {data?._id ? "Éditer le calendrier" : "Ajouter un calendrier"}
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon icon="material-symbols:close" width={24} height={24} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo (optionnel)
            </label>

            {/* Prévisualisation de l'image */}
            {previewUrl && (
              <div className="mb-3">
                <img
                  src={previewUrl}
                  alt="Prévisualisation"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Sélection de fichier */}
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                disabled={isSubmitting || isUploading}
              />

              {/* Bouton d'upload si fichier sélectionné */}
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleUploadImage}
                  disabled={isUploading || isSubmitting}
                  className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icon icon="eos-icons:loading" width={20} height={20} />
                      Upload en cours...
                    </span>
                  ) : (
                    "Uploader l'image"
                  )}
                </button>
              )}

              {/* URL manuelle en alternative */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.photo}
                  onChange={(e) => {
                    setFormData({ ...formData, photo: e.target.value });
                    setPreviewUrl(e.target.value);
                    setSelectedFile(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Ou collez une URL d'image..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <input
                type="text"
                value={formData.from}
                onChange={(e) =>
                  setFormData({ ...formData, from: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                placeholder="Ex: 15 Sept"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin *
              </label>
              <input
                type="text"
                value={formData.to}
                onChange={(e) =>
                  setFormData({ ...formData, to: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                placeholder="Ex: 20 Sept"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Ex: Rentrée académique"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description * (séparez par des virgules)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Ex: Inscription, Orientation, Cours"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items (optionnel, séparez par des virgules)
            </label>
            <textarea
              value={formData.items}
              onChange={(e) =>
                setFormData({ ...formData, items: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Ex: Item 1, Item 2, Item 3"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowModal(false)}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Icon icon="eos-icons:loading" width={20} height={20} />
                {data?._id ? "Mise à jour..." : "Création..."}
              </span>
            ) : data?._id ? (
              "Mettre à jour"
            ) : (
              "Créer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
