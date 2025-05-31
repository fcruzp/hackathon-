import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Upload, Check, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  bucket: string;
  folder?: string;
  onImageSelect?: (url: string | null) => void;
  selectedUrl?: string | null;
}

export default function ImageUploadModal({ 
  isOpen, 
  onClose, 
  bucket, 
  folder = 'vehicles/', 
  onImageSelect,
  selectedUrl 
}: ImageUploadModalProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchImages = async () => {
    const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 100, offset: 0 });
    if (error) {
      toast.error('Failed to fetch images');
      return;
    }
    const files = (data || []).filter(
      (item) =>
        item.name &&
        !item.name.startsWith('.') &&
        !item.name.toLowerCase().includes('emptyfolder') &&
        /\.[a-zA-Z0-9]+$/.test(item.name)
    );
    setImages(files.map((item) => `${folder.replace(/\/$/, '')}/${item.name}`));
  };

  useEffect(() => {
    if (isOpen) fetchImages();
  }, [isOpen]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `vehicles/${fileName}`;

      const { error } = await supabase.storage
        .from('user-images')
        .upload(filePath, file);

      if (error) throw error;

      toast.success('Image uploaded successfully');
      fetchImages();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImageSelect = (imageUrl: string) => {
    if (onImageSelect) {
      const publicUrl = getPublicUrl(imageUrl);
      onImageSelect(publicUrl);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Gallery</h2>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div
              className={`mb-6 flex justify-center px-6 pt-5 pb-6 border-2 ${
                dragActive 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 border-dashed'
              } rounded-lg`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG up to 10MB
                </p>
                {isUploading && (
                  <div className="mt-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Uploading...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  No images available
                </div>
              )}
              {images.map((img) => {
                const publicUrl = getPublicUrl(img);
                const isSelected = selectedUrl === publicUrl;
                return (
                  <button
                    key={img}
                    onClick={() => handleImageSelect(img)}
                    className={`relative group aspect-video rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all ${
                      isSelected ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <img
                      src={publicUrl}
                      alt="Vehicle"
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <Check className={`h-8 w-8 ${
                        isSelected ? 'text-primary-400' : 'text-white'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}