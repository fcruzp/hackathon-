import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Car, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { Vehicle } from '../../types';
import { useAuthStore } from '../../stores/auth-store';
import { useLanguageStore } from '../../stores/language-store';
import { translations } from '../../translations';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from '../../lib/logActivity';
import ImageUploadModal from '../../components/vehicles/ImageUploadModal';

type VehicleFormData = Omit<Vehicle, 'id' | 'createdAt' | 'status'>;

export default function AddVehicle() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language].vehicles.add;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<VehicleFormData>();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  const onSubmit = async (data: VehicleFormData) => {
    try {
      setIsSubmitting(true);

      if (!selectedImageUrl) {
        toast.error('Debes seleccionar una imagen para el vehículo');
        setIsSubmitting(false);
        return;
      }

      // Prepare vehicle data
      const vehicleData = {
        make: data.make,
        model: data.model,
        year: data.year,
        license_plate: data.licensePlate,
        vin: data.vin,
        color: data.color,
        status: 'active',
        image_url: selectedImageUrl,
        mileage: data.mileage,
        odometer_reading: data.mileage, // Initially same as mileage
        purchase_date: new Date().toISOString().split('T')[0],
        fuel_type: data.fuelType,
        notes: data.notes || null,
        insurance_policy: data.insurancePolicy || null,
        insurance_expiry: data.insuranceExpiry || null,
      };

      // Insert vehicle into database
      const { data: inserted, error: insertError } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select();

      if (insertError) {
        // Handle specific database errors
        if (insertError.code === '23505') {
          if (insertError.message.includes('license_plate')) {
            throw new Error('A vehicle with this license plate already exists');
          }
          if (insertError.message.includes('vin')) {
            throw new Error('A vehicle with this VIN already exists');
          }
        }
        throw insertError;
      }

      // Registrar log
      await logActivity({
        userId: user.id,
        action: 'create',
        entity: 'vehicle',
        entityId: inserted?.[0]?.id,
        description: `Creó el vehículo: ${data.make} ${data.model}`,
      });

      toast.success('Vehicle added successfully');
      navigate('/vehicles');
    } catch (error: any) {
      console.error('Failed to create vehicle:', error);
      toast.error(error.message || 'Failed to create vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link
          to="/vehicles"
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t.backToVehicles}
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center">
            <Car className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.basicInfo.title}</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.basicInfo.make}
                </label>
                <input
                  type="text"
                  {...register('make', { required: t.validation.required })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.make && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.make.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.basicInfo.model}
                </label>
                <input
                  type="text"
                  {...register('model', { required: t.validation.required })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.model.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.basicInfo.year}
                </label>
                <input
                  type="number"
                  {...register('year', { 
                    required: t.validation.required,
                    min: { value: 1900, message: t.validation.yearRange },
                    max: { value: new Date().getFullYear() + 1, message: t.validation.yearRange }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.basicInfo.color}
                </label>
                <input
                  type="text"
                  {...register('color', { required: t.validation.required })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.color.message}</p>
                )}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.vehicleDetails.title}</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.vehicleDetails.licensePlate}
                </label>
                <input
                  type="text"
                  {...register('licensePlate', { required: t.validation.required })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.licensePlate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.licensePlate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.vehicleDetails.vin}
                </label>
                <input
                  type="text"
                  {...register('vin', { 
                    required: t.validation.required,
                    pattern: {
                      value: /^[A-HJ-NPR-Z0-9]{17}$/,
                      message: t.validation.invalidVin
                    }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.vin && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vin.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.vehicleDetails.mileage}
                </label>
                <input
                  type="number"
                  {...register('mileage', { 
                    required: t.validation.required,
                    min: { value: 0, message: t.validation.negativeMileage }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.mileage && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mileage.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.vehicleDetails.fuelType}
                </label>
                <select
                  {...register('fuelType', { required: t.validation.required })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t.vehicleDetails.selectFuelType}</option>
                  <option value="gasoline">{t.vehicleDetails.fuelTypes.gasoline}</option>
                  <option value="diesel">{t.vehicleDetails.fuelTypes.diesel}</option>
                  <option value="electric">{t.vehicleDetails.fuelTypes.electric}</option>
                  <option value="hybrid">{t.vehicleDetails.fuelTypes.hybrid}</option>
                </select>
                {errors.fuelType && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fuelType.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.additionalInfo.title}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.additionalInfo.notes}
                </label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Insurance Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.additionalInfo.insurancePolicy}
                  </label>
                  <input
                    type="text"
                    {...register('insurancePolicy')}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.additionalInfo.insuranceExpiry}
                  </label>
                  <input
                    type="date"
                    {...register('insuranceExpiry')}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Imagen del vehículo <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="w-1/5 min-w-[120px] max-w-[160px] h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center"
                >
                  {selectedImageUrl ? (
                    <img
                      src={selectedImageUrl}
                      alt="Previsualización"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 py-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11l4 4 4-4" /></svg>
                      <span className="text-xs">Haz clic para seleccionar una imagen</span>
                    </div>
                  )}
                </button>
                <ImageUploadModal
                  isOpen={isImageModalOpen}
                  onClose={() => setIsImageModalOpen(false)}
                  bucket="user-images"
                  folder="vehicles/"
                  onImageSelect={(url) => {
                    setSelectedImageUrl(url);
                    setIsImageModalOpen(false);
                  }}
                  selectedUrl={selectedImageUrl}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Link
              to="/vehicles"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t.buttons.cancel}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSubmitting ? t.buttons.saving : t.buttons.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}