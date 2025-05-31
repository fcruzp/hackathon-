import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users2, Filter } from 'lucide-react';
import type { User, UserRole, Position, Department } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function UsersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [positionFilter, setPositionFilter] = useState<Position | 'all'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchDepartments()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
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
        `);

      if (error) throw error;

      const mappedUsers: User[] = data.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        position: user.position || undefined,
        departmentId: user.department_id || undefined,
        phone: user.phone || undefined,
        imageUrl: user.image_url || undefined,
        licenseImageUrl: user.license_image_url || undefined,
        createdAt: user.created_at,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, description')
        .order('name');

      if (error) throw error;

      setDepartments(data.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description || undefined,
        createdAt: new Date().toISOString() // Default value since we don't need it for display
      })));
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || 'Not assigned';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesPosition = positionFilter === 'all' || user.position === positionFilter;
    
    return matchesSearch && matchesRole && matchesPosition;
  });

  const roleColors = {
    admin: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100',
    staff: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    driver: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <Link
          to="/users/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add User
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 dark:text-gray-500 h-5 w-5" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="driver">Driver</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 dark:text-gray-500 h-5 w-5" />
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value as Position | 'all')}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Positions</option>
            <option value="ministro">Ministro</option>
            <option value="viceministro">Viceministro</option>
            <option value="director">Director</option>
            <option value="encargado">Encargado</option>
            <option value="asistente">Asistente</option>
            <option value="asesor">Asesor</option>
            <option value="chofer">Chofer</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Link
            key={user.id}
            to={`/users/${user.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                {user.imageUrl ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={user.imageUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <Users2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {user.firstName} {user.lastName}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>Email: {user.email}</p>
                {user.phone && <p>Phone: {user.phone}</p>}
                {user.position && (
                  <p>Position: {user.position.charAt(0).toUpperCase() + user.position.slice(1)}</p>
                )}
                {user.departmentId && <p>Department: {getDepartmentName(user.departmentId)}</p>}
                <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </Link>
        ))}

        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || roleFilter !== 'all' || positionFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding a new user'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}