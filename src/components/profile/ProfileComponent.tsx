"use client";

import React, { useState, useEffect, useRef } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import Card from "../ui/Card";
import { useAuthContext } from "../../contexts/AuthContext";
import { useProfile } from "../../contexts/ProfileContext";
import { updateUserProfile } from "../../services/userService";
import { supabase } from "../../lib/supabase";
import ConfirmModal from "../shared/ConfirmModal";
import EstadoCombobox from "../ui/EstadoCombobox";
import CiudadCombobox from "../ui/CiudadCombobox";

export default function ProfileComponent() {
  const { user, userProfile } = useAuthContext();
  const { profile, loading, error, fetched, fetchData, refreshData } =
    useProfile();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [signedProfileImageUrl, setSignedProfileImageUrl] = useState<
    string | null
  >(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
    phone: "",
    company: "",
    website: "",
    bio: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
    },
    business_info: {
      business_name: "",
      tax_id: "",
      business_type: "",
      industry: "",
    },
  });

  const [initialFormData, setInitialFormData] = useState(formData);
  const [initialPhoto, setInitialPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !fetched) {
      fetchData();
    }
  }, [loading, fetched, fetchData]);

  // Función para obtener datos de Google
  const getGoogleData = () => {
    if (!user) return null;

    const fullName = user.displayName || "";
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    return {
      first_name: firstName,
      last_name: lastName,
      display_name: user.displayName || "",
      phone: "",
      company: "",
      website: "",
      bio: "",
      address: {
        street: "",
        city: "",
        state: "",
        zip_code: "",
        country: "",
      },
      business_info: {
        business_name: user.displayName || "",
        tax_id: "",
        business_type: "",
        industry: "",
      },
    };
  };

  // Función para sincronizar datos de Google a la base de datos
  const syncGoogleDataToDatabase = async () => {
    if (!user || !userProfile || !userProfile.first_name) return;

    try {
      await updateUserProfile(user.uid, {
        display_name: userProfile.display_name,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        phone: userProfile.phone || "",
        company: userProfile.company || "",
        business_info: userProfile.business_info || {
          business_name: userProfile.display_name || "",
        },
      });

      // Recargar el perfil del contexto
      refreshData();
    } catch (error) {
      setMessage({
        type: "error",
        text: "❌ Error al guardar datos en la base de datos",
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  useEffect(() => {
    // Priorizar userProfile si tiene datos y profile está vacío
    if (userProfile && userProfile.first_name && userProfile.last_name) {
      const authProfileData = {
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        display_name: userProfile.display_name || "",
        phone: userProfile.phone || "",
        company: userProfile.company || "",
        website: userProfile.website || "",
        bio: userProfile.bio || "",
        address: {
          street: userProfile.address?.street || "",
          city: userProfile.address?.city || "",
          state: userProfile.address?.state || "",
          zip_code: userProfile.address?.zip_code || "",
          country: userProfile.address?.country || "",
        },
        business_info: {
          business_name:
            userProfile.business_info?.business_name ||
            userProfile.display_name ||
            "",
          tax_id: userProfile.business_info?.tax_id || "",
          business_type: userProfile.business_info?.business_type || "",
          industry: userProfile.business_info?.industry || "",
        },
      };

      setFormData(authProfileData);
      setInitialFormData(authProfileData);
      setInitialPhoto(userProfile.photo_url || null);

      // Si el perfil de la base de datos está vacío, sincronizar automáticamente
      if (!profile || !profile.first_name) {
        setTimeout(() => {
          syncGoogleDataToDatabase();
        }, 1000);
      }
    } else if (profile && profile.first_name && profile.last_name) {
      // Si hay perfil en la base de datos con datos, usarlo
      const profileData = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        display_name: profile.display_name || "",
        phone: profile.phone || "",
        company: profile.company || "",
        website: profile.website || "",
        bio: profile.bio || "",
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          zip_code: profile.address?.zip_code || "",
          country: profile.address?.country || "",
        },
        business_info: {
          business_name: profile.business_info?.business_name || "",
          tax_id: profile.business_info?.tax_id || "",
          business_type: profile.business_info?.business_type || "",
          industry: profile.business_info?.industry || "",
        },
      };

      setFormData(profileData);
      setInitialFormData(profileData);
      setInitialPhoto(profile.photo_url || null);
    } else if (user && fetched && !loading) {
      // Si no hay perfil pero hay usuario autenticado, usar datos de Google
      const googleData = getGoogleData();
      if (googleData) {
        setFormData(googleData);
        setInitialFormData(googleData);
        setInitialPhoto(user.photoURL || null);
      }
    }
  }, [profile, userProfile, user, fetched, loading]);

  useEffect(() => {
    if (profile && profile.photo_url) {
      setProfileImage(profile.photo_url);
    }
    // Si hay una imagen temporal en localStorage, úsala
    const tempImage = localStorage.getItem("tempProfileImage");
    if (tempImage) {
      setProfileImage(tempImage);
    }
  }, [profile]);

  // Hook para obtener la signed URL cuando cambia la imagen de perfil (si no es base64)
  useEffect(() => {
    async function fetchSignedUrl() {
      if (profileImage && !profileImage.startsWith("data:")) {
        let path = profileImage;
        const publicPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/`;
        if (profileImage.startsWith(publicPrefix)) {
          path = profileImage.replace(publicPrefix, "");
        }
        // Intenta obtener la signed URL de localStorage
        const cacheKey = `signedProfileImageUrl:${path}`;
        const cached = localStorage.getItem(cacheKey);
        const cachedObj = cached ? JSON.parse(cached) : null;
        const now = Date.now();
        if (cachedObj && cachedObj.url && cachedObj.expiry > now) {
          setSignedProfileImageUrl(cachedObj.url);
        } else {
          const { data, error } = await supabase.storage
            .from("profile-pictures")
            .createSignedUrl(path, 60 * 60);
          if (!error && data?.signedUrl) {
            setSignedProfileImageUrl(data.signedUrl);
            // Guarda en cache con expiración (por ejemplo, 55 minutos)
            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                url: data.signedUrl,
                expiry: now + 55 * 60 * 1000,
              })
            );
          } else {
            setSignedProfileImageUrl(null);
          }
        }
      } else {
        setSignedProfileImageUrl(null);
      }
    }
    fetchSignedUrl();
  }, [profileImage]);

  // Efecto para limpiar el estado de saving cuando se cierra el modal
  useEffect(() => {
    if (!showSuccessModal && saving) {
      setSaving(false);
      setUploading(false);
    }
  }, [showSuccessModal, saving]);

  // Efecto para resetear la bandera modalShown cuando cambien los datos del perfil
  useEffect(() => {
    if (profile && profile.first_name) {
      setModalShown(false);
    }
  }, [profile?.first_name, profile?.last_name, profile?.display_name]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => {
        if (section === "address") {
          return {
            ...prev,
            address: {
              ...prev.address,
              [field]: value,
            },
          };
        } else if (section === "business_info") {
          return {
            ...prev,
            business_info: {
              ...prev.business_info,
              [field]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Solo previsualiza la imagen, no la sube
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Redimensionar la imagen a 1024x1024 px antes de previsualizar y subir
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 1024;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Calcular el recorte centrado (crop cuadrado)
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
            setProfileImage(dataUrl);
            localStorage.setItem("tempProfileImage", dataUrl);
            // Convertir el dataURL a File para subirlo
            fetch(dataUrl)
              .then((res) => res.arrayBuffer())
              .then((buf) => {
                const resizedFile = new File([buf], file.name, {
                  type: "image/jpeg",
                });
                setNewProfileImageFile(resizedFile);
              });
          }
        };
        if (typeof reader.result === "string") {
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Subida real y actualización de perfil solo al guardar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    setUploading(true);
    setSaving(true);
    setMessage(null);

    try {
      let photo_url = profile.photo_url;

      // Si hay una nueva foto, súbela primero
      if (newProfileImageFile) {
        const file = newProfileImageFile;
        const fileExt = file.name.split(".").pop();
        const fileName = `${profile.id}.${fileExt}`;
        const filePath = `${fileName}`;
        // Limpiar la signed URL cacheada para este path
        const cacheKey = `signedProfileImageUrl:${filePath}`;
        localStorage.removeItem(cacheKey);
        const { error: uploadError } = await supabase.storage
          .from("profile-pictures")
          .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from("profile-pictures")
          .getPublicUrl(filePath);
        photo_url = data.publicUrl;
      }
      console.log("Datos a guardar:", formData);
      console.log("Nueva imagen:", newProfileImageFile);
      await updateUserProfile(profile.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
        phone: formData.phone,
        company: formData.company,
        website: formData.website,
        bio: formData.bio,
        address: formData.address,
        business_info: formData.business_info,
        photo_url, // actualiza la foto si cambió
      });

      // Actualizar el estado local después de guardar
      setNewProfileImageFile(null); // limpia el estado temporal
      localStorage.removeItem("tempProfileImage"); // limpia la imagen temporal

      // Mostrar mensaje de éxito
      setMessage({ type: "success", text: "Perfil actualizado exitosamente" });

      // Mostrar modal solo si no se ha mostrado antes
      if (!modalShown) {
        setModalShown(true);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.message || "Error desconocido al actualizar el perfil",
      });
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  function isFormChanged() {
    const formChanged =
      JSON.stringify(formData) !== JSON.stringify(initialFormData);
    const photoChanged = newProfileImageFile !== null;

    return formChanged || photoChanged;
  }

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">No se encontró el perfil</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Mi Perfil</h1>
            <p className="text-[#666666]">
              Gestiona tu información personal y de negocio
            </p>
          </div>
        </div>

        {/* Mensajes de estado */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-4 ${message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
              }`}
          >
            {message.text}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg mb-4 bg-red-100 text-red-800 border border-red-200">
            Error: {error}
          </div>
        )}

        {/* Mensaje informativo para usuarios de Google */}
        {user && user.displayName && !profile?.first_name && (
          <div className="p-4 rounded-lg mb-4 bg-blue-100 text-blue-800 border border-blue-200">
            <strong>¡Bienvenido!</strong> Tus datos de Google se han cargado
            automáticamente. Puedes editar cualquier campo según tus
            necesidades.
          </div>
        )}

        {showSuccessModal && (
          <ConfirmModal
            title="¡Perfil actualizado correctamente!"
            message="Tus datos han sido guardados en la base de datos."
            confirmText="OK"
            cancelText=""
            onConfirm={() => {
              setShowSuccessModal(false);
              setModalShown(false);
              // Recargar datos después de cerrar el modal
              setTimeout(() => {
                refreshData();
              }, 100);
            }}
            onCancel={() => {
              setShowSuccessModal(false);
              setModalShown(false);
              // Recargar datos después de cerrar el modal
              setTimeout(() => {
                refreshData();
              }, 100);
            }}
            variant="profile-success"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="w-full">
            <div className="p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Perfil a la izquierda */}
              <div className="flex flex-col items-center justify-center w-full md:w-1/3 min-h-[420px] text-center">
                <div className="mb-2">
                  <img
                    src={
                      profileImage && profileImage.startsWith("data:")
                        ? profileImage
                        : signedProfileImageUrl || "/images/Logo.svg"
                    }
                    alt="Foto de perfil"
                    className="w-80 h-80 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-[#9ae700] transition-transform duration-200 hover:scale-105"
                    style={{
                      imageRendering: "auto",
                      width: "320px",
                      height: "320px",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      background:
                        "linear-gradient(135deg, #e0ffe0 0%, #fff 100%)",
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 bg-[#9ae700] text-[#ffffff] px-3 py-2 rounded-xl shadow hover:bg-[#7fc400] transition disabled:opacity-60"
                  disabled={uploading}
                >
                  Cambiar foto
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading}
                />
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1 mt-2 text-center">
                  {formData.first_name} {formData.last_name}
                </h2>
                <span className="text-[#9ae700] font-medium text-center mb-2">
                  {formData.display_name || profile?.email}
                </span>
                <span className="text-[#666] text-sm text-center">
                  {profile?.email}
                </span>
              </div>
              {/* Detalles a la derecha */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="relative">
                  <Input
                    label="Nombre"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                  {user?.displayName && formData.first_name && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Google
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Input
                    label="Apellido"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                  {user?.displayName && formData.last_name && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Google
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Input
                    label="Nombre de Usuario"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    required
                  />
                  {user?.displayName && formData.display_name && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Google
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Input
                    label="Teléfono"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  {user?.displayName && formData.phone && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Google
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <TextArea
                    label="Biografía"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Cuéntanos sobre ti y tu experiencia..."
                  />
                </div>
                <Input
                  label="Empresa"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
                <Input
                  label="Sitio Web"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </Card>

          {/* Información de Negocio */}
          <Card className="w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                Información de Negocio
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre del Negocio"
                  name="business_info.business_name"
                  value={formData.business_info.business_name}
                  onChange={handleInputChange}
                  required
                />

                <Input
                  label="Empresa"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Input
                  label="Sitio Web"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                />

                <Input
                  label="RFC (opcional)"
                  name="business_info.tax_id"
                  value={formData.business_info.tax_id}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Input
                  label="Tipo de Negocio"
                  name="business_info.business_type"
                  value={formData.business_info.business_type}
                  onChange={handleInputChange}
                  placeholder="Freelancer, Empresa, etc."
                />

                <Input
                  label="Industria"
                  name="business_info.industry"
                  value={formData.business_info.industry}
                  onChange={handleInputChange}
                  placeholder="Tecnología, Diseño, etc."
                />
              </div>
            </div>
          </Card>

          {/* Dirección */}
          <Card className="w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                Dirección
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Calle y Número"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                />

                {/* Ciudad */}
                <CiudadCombobox
                  label="Ciudad"
                  value={formData.address.city}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: value },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <EstadoCombobox
                  label="Estado"
                  value={formData.address.state}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, state: value },
                    }))
                  }
                />

                <Input
                  label="Código Postal"
                  name="address.zip_code"
                  value={formData.address.zip_code}
                  onChange={handleInputChange}
                />

                <Input
                  label="País"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={saving}
              disabled={saving || !isFormChanged()}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
