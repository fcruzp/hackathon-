import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguageStore } from '../../stores/language-store';
import { translations } from '../../translations';
import { v4 as uuidv4 } from 'uuid';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (url: string) => void;
  currentLogoUrl?: string | null;
}

export default function LogoUploadModal({ 
  isOpen, 
  onClose, 
  onUploadComplete,
  currentLogoUrl 
}: LogoUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguageStore();
  const t = translations[language].settings;

  if (!isOpen) return null;

  const deleteExistingLogo = async () => {
    try {
      // Obtener la lista de archivos en la carpeta logos
      const { data: files, error: listError } = await supabase.storage
        .from('user-images')
        .list('logos');

      if (listError) throw listError;

      // Eliminar todos los archivos existentes
      if (files && files.length > 0) {
        const deletePromises = files.map(file => 
          supabase.storage
            .from('user-images')
            .remove([`logos/${file.name}`])
        );

        await Promise.all(deletePromises);
      }
    } catch (err) {
      console.error('Error deleting existing logo:', err);
      // No lanzamos el error aquí para permitir que continúe con la subida del nuevo logo
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido.');
      return;
    }

    // Validar el tamaño del archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande. El tamaño máximo permitido es 5MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Primero eliminar el logo existente
      await deleteExistingLogo();

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        if (uploadError.message.includes('row-level security policy')) {
          throw new Error(
            'No tienes permisos para subir archivos. Por favor, contacta al administrador para configurar los permisos necesarios.'
          );
        }
        throw new Error(`Error al subir el archivo: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('user-images')
        .getPublicUrl(filePath);

      onUploadComplete?.(publicUrl);
      onClose();
    } catch (err) {
      console.error('Error detallado:', err);
      setError(err instanceof Error ? err.message : 'Error al subir el logo. Por favor, intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t.branding.uploadLogo}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Mostrar el logo actual si existe */}
          {currentLogoUrl && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo actual:
              </h3>
              <div className="relative w-32 h-32 mx-auto border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
                <img
                  src={currentLogoUrl}
                  alt="Logo actual"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="logo-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {isUploading ? 'Subiendo...' : 'Haz clic para seleccionar un logo'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PNG, JPG o GIF (máx. 5MB)
              </span>
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
              {error}
            </div>
          )}

          {isUploading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 