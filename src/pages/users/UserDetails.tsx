import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, UserCircle, Shield, FileText, Building2, Edit2, Car as IdCard } from 'lucide-react';
import type { User, Department } from '../../types';
import UserEditModal from '../../components/users/UserEditModal';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { validate as uuidValidate } from 'uuid';

export default function UserDetails() {
  const { id } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !uuidValidate(id)) {
      setError('Invalid user ID');
      setIsLoading(false);
      return;
    }
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (user?.departmentId) {
      fetchDepartment(user.departmentId);
    }
  }, [user?.departmentId]);

  const fetchUser = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          position,
          department_id,
          phone,
          image_url,
          license_image_url,
          created_at
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('User not found');
        return;
      }

      setUser({
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        position: data.position || undefined,
        departmentId: data.department_id || undefined,
        phone: data.phone || undefined,
        imageUrl: data.image_url || undefined,
        licenseImageUrl: data.license_image_url || undefined,
        createdAt: data.created_at,
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user data');
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartment = async (departmentId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('departments')
        .select('id, name, description')
        .eq('id', departmentId)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setDepartment({
          id: data.id,
          name: data.name,
          description: data.description || undefined,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching department:', err);
      toast.error('Failed to load department data');
    }
  };

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      // Validate department ID if present
      if (updatedUser.departmentId && !uuidValidate(updatedUser.departmentId)) {
        throw new Error('Invalid department ID format');
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: updatedUser.email,
          first_name: updatedUser.firstName,
          last_name: updatedUser.lastName,
          role: updatedUser.role,
          position: updatedUser.position || null,
          department_id: updatedUser.departmentId || null,
          phone: updatedUser.phone || null,
          image_url: updatedUser.imageUrl || null,
          license_image_url: updatedUser.licenseImageUrl || null,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setUser(updatedUser);
      setIsEditModalOpen(false);
      toast.success('User updated successfully');

      // Fetch updated department if changed
      if (updatedUser.departmentId !== user?.departmentId) {
        if (updatedUser.departmentId) {
          await fetchDepartment(updatedUser.departmentId);
        } else {
          setDepartment(null);
        }
      }
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user');
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <Link
            to="/users"
            className="mt-4 inline-flex items-center text-red-800 dark:text-red-200 hover:underline"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/users" replace />;
  }

  const detailSections = [
    {
      title: 'Contact Information',
      icon: Mail,
      items: [
        { label: 'Email', value: user.email },
        { label: 'Phone', value: user.phone || 'Not provided' },
      ],
    },
    {
      title: 'Account Details',
      icon: Shield,
      items: [
        { label: 'Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
        { label: 'Position', value: user.position?.charAt(0).toUpperCase() + user.position?.slice(1) },
        { label: 'Department', value: department?.name || 'Not assigned' },
        { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString() },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/users"
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Users
        </Link>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Edit2 className="h-5 w-5 mr-2" />
          Edit User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100' :
                  user.role === 'staff' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' :
                  'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                }`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <span className="text-gray-600 dark:text-gray-300">
                  {user.position?.charAt(0).toUpperCase() + user.position?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {user.role === 'driver' && (
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center mb-4">
              <IdCard className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Driver's License</h2>
            </div>
            {user.licenseImageUrl ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={user.licenseImageUrl}
                  alt="Driver's License"
                  className="w-full max-w-md mx-auto object-cover"
                />
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center text-gray-600 dark:text-gray-400">
                No license image available
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {detailSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h2>
                </div>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <UserEditModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUserUpdate}
      />
    </div>
  );
}