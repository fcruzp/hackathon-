export const translations = {
  en: {
    settings: {
      title: 'Settings',
      appearance: {
        title: 'Appearance',
        darkMode: 'Dark Mode',
        darkModeDesc: 'Toggle between light and dark themes',
        language: 'Language',
        languageDesc: 'Choose your preferred language',
        english: 'English',
        spanish: 'Spanish'
      },
      notifications: {
        title: 'Notifications',
        emailNotifications: 'Email Notifications',
        emailNotificationsDesc: 'Receive email notifications for important updates'
      },
      security: {
        title: 'Security',
        twoFactor: 'Two-Factor Authentication',
        twoFactorDesc: 'Add an extra layer of security to your account',
        enable2FA: 'Enable 2FA'
      },
      account: {
        title: 'Fleet',
        profileInfo: 'Fleet Images',
        profileInfoDesc: 'Update the images of the fleet vehicles',
        editProfile: 'Edit Fleet'
      },
      branding: {
        title: 'Branding',
        logo: 'Institution Logo',
        logoDesc: 'Upload your institution logo to customize the application',
        uploadLogo: 'Upload Logo'
      }
    },
    layout: {
      appName: 'Fleet Manager',
      navigation: {
        dashboard: 'Dashboard',
        vehicles: 'Vehicles',
        users: 'Users',
        maintenance: 'Maintenance'
      },
      userMenu: {
        settings: 'Settings',
        logout: 'Logout'
      }
    },
    auth: {
      login: {
        title: 'Sign in to Fleet Manager',
        email: 'Email address',
        password: 'Password',
        submit: 'Sign in',
        noAccount: 'Don\'t have an account?',
        register: 'Register here',
        error: 'Invalid credentials',
        loading: 'Signing in...'
      },
      register: {
        title: 'Create your account',
        email: 'Email address',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        submit: 'Create account',
        loading: 'Creating account...',
        hasAccount: 'Already have an account?',
        login: 'Sign in',
        passwordMismatch: 'Passwords do not match',
        validation: {
          passwordLength: 'Password must be at least 6 characters long',
          serverError: 'An error occurred while creating your account. Please try again.'
        }
      }
    },
    dashboard: {
      title: 'Fleet Management Dashboard',
      stats: {
        totalVehicles: 'Total Vehicles',
        activeDrivers: 'Active Drivers',
        pendingMaintenance: 'Pending Maintenance',
        scheduledServices: 'Scheduled Services'
      },
      quickActions: {
        title: 'Quick Actions',
        addVehicle: 'Add Vehicle',
        addDriver: 'Add Driver',
        scheduleService: 'Schedule Service',
        viewCalendar: 'View Calendar'
      },
      recentActivities: {
        title: 'Recent Activities',
        maintenance: 'Vehicle Maintenance',
        driverAssignment: 'New Driver Assignment',
        fuelReport: 'Fuel Report'
      }
    },
    vehicles: {
      list: {
        title: 'Vehicle Fleet',
        addVehicle: 'Add Vehicle',
        searchPlaceholder: 'Search vehicles...',
        filterStatus: {
          all: 'All Status',
          active: 'Active',
          maintenance: 'In Maintenance',
          outOfService: 'Out of Service'
        },
        details: {
          year: 'Year',
          licensePlate: 'License Plate',
          mileage: 'Mileage',
          fuelType: 'Fuel Type'
        }
      },
      add: {
        title: 'Add New Vehicle',
        backToVehicles: 'Back to Vehicles',
        basicInfo: {
          title: 'Basic Information',
          make: 'Make',
          model: 'Model',
          year: 'Year',
          color: 'Color'
        },
        vehicleDetails: {
          title: 'Vehicle Details',
          licensePlate: 'License Plate',
          vin: 'VIN',
          mileage: 'Mileage',
          fuelType: 'Fuel Type',
          selectFuelType: 'Select Fuel Type',
          fuelTypes: {
            gasoline: 'Gasoline',
            diesel: 'Diesel',
            electric: 'Electric',
            hybrid: 'Hybrid'
          }
        },
        additionalInfo: {
          title: 'Additional Information',
          notes: 'Notes',
          imageUrl: 'Image URL',
          insurancePolicy: 'Insurance Policy',
          insuranceExpiry: 'Insurance Expiry Date'
        },
        buttons: {
          cancel: 'Cancel',
          save: 'Save Vehicle',
          saving: 'Saving...'
        },
        validation: {
          required: 'This field is required',
          yearRange: 'Year must be between 1900 and current year',
          invalidVin: 'Invalid VIN format',
          negativeMileage: 'Mileage cannot be negative'
        }
      }
    }
  },
  es: {
    settings: {
      title: 'Configuración',
      appearance: {
        title: 'Apariencia',
        darkMode: 'Modo Oscuro',
        darkModeDesc: 'Cambiar entre tema claro y oscuro',
        language: 'Idioma',
        languageDesc: 'Selecciona tu idioma preferido',
        english: 'Inglés',
        spanish: 'Español'
      },
      notifications: {
        title: 'Notificaciones',
        emailNotifications: 'Notificaciones por Email',
        emailNotificationsDesc: 'Recibe notificaciones por email para actualizaciones importantes'
      },
      security: {
        title: 'Seguridad',
        twoFactor: 'Autenticación de Dos Factores',
        twoFactorDesc: 'Añade una capa extra de seguridad a tu cuenta',
        enable2FA: 'Activar 2FA'
      },
      account: {
        title: 'Flota',
        profileInfo: 'Imagenes de la Flota',
        profileInfoDesc: 'Actualiza las images de los vehículos de la flota',
        editProfile: 'Editar Flota'
      },
      branding: {
        title: 'Marca',
        logo: 'Logo de la Institución',
        logoDesc: 'Sube el logo de tu institución para personalizar la aplicación',
        uploadLogo: 'Subir Logo'
      }
    },
    layout: {
      appName: 'Gestor de Flota',
      navigation: {
        dashboard: 'Panel',
        vehicles: 'Vehículos',
        users: 'Usuarios',
        maintenance: 'Mantenimiento'
      },
      userMenu: {
        settings: 'Configuración',
        logout: 'Cerrar Sesión'
      }
    },
    auth: {
      login: {
        title: 'Iniciar sesión en Gestor de Flota',
        email: 'Correo electrónico',
        password: 'Contraseña',
        submit: 'Iniciar sesión',
        noAccount: '¿No tienes una cuenta?',
        register: 'Regístrate aquí',
        error: 'Credenciales inválidas',
        loading: 'Iniciando sesión...'
      },
      register: {
        title: 'Crear tu cuenta',
        email: 'Correo electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        submit: 'Crear cuenta',
        loading: 'Creando cuenta...',
        hasAccount: '¿Ya tienes una cuenta?',
        login: 'Iniciar sesión',
        passwordMismatch: 'Las contraseñas no coinciden',
        validation: {
          passwordLength: 'La contraseña debe tener al menos 6 caracteres',
          serverError: 'Ocurrió un error al crear tu cuenta. Por favor, inténtalo de nuevo.'
        }
      }
    },
    dashboard: {
      title: 'Panel de Gestión de Flota',
      stats: {
        totalVehicles: 'Total de Vehículos',
        activeDrivers: 'Conductores Activos',
        pendingMaintenance: 'Mantenimiento Pendiente',
        scheduledServices: 'Servicios Programados'
      },
      quickActions: {
        title: 'Acciones Rápidas',
        addVehicle: 'Añadir Vehículo',
        addDriver: 'Añadir Conductor',
        scheduleService: 'Programar Servicio',
        viewCalendar: 'Ver Calendario'
      },
      recentActivities: {
        title: 'Actividades Recientes',
        maintenance: 'Mantenimiento de Vehículo',
        driverAssignment: 'Nueva Asignación de Conductor',
        fuelReport: 'Informe de Combustible'
      }
    },
    vehicles: {
      list: {
        title: 'Flota de Vehículos',
        addVehicle: 'Añadir Vehículo',
        searchPlaceholder: 'Buscar vehículos...',
        filterStatus: {
          all: 'Todos los Estados',
          active: 'Activo',
          maintenance: 'En Mantenimiento',
          outOfService: 'Fuera de Servicio'
        },
        details: {
          year: 'Año',
          licensePlate: 'Matrícula',
          mileage: 'Kilometraje',
          fuelType: 'Tipo de Combustible'
        }
      },
      add: {
        title: 'Añadir Nuevo Vehículo',
        backToVehicles: 'Volver a Vehículos',
        basicInfo: {
          title: 'Información Básica',
          make: 'Marca',
          model: 'Modelo',
          year: 'Año',
          color: 'Color'
        },
        vehicleDetails: {
          title: 'Detalles del Vehículo',
          licensePlate: 'Matrícula',
          vin: 'VIN',
          mileage: 'Kilometraje',
          fuelType: 'Tipo de Combustible',
          selectFuelType: 'Seleccionar Tipo de Combustible',
          fuelTypes: {
            gasoline: 'Gasolina',
            diesel: 'Diésel',
            electric: 'Eléctrico',
            hybrid: 'Híbrido'
          }
        },
        additionalInfo: {
          title: 'Información Adicional',
          notes: 'Notas',
          imageUrl: 'URL de la Imagen',
          insurancePolicy: 'Póliza de Seguro',
          insuranceExpiry: 'Fecha de Vencimiento del Seguro'
        },
        buttons: {
          cancel: 'Cancelar',
          save: 'Guardar Vehículo',
          saving: 'Guardando...'
        },
        validation: {
          required: 'Este campo es obligatorio',
          yearRange: 'El año debe estar entre 1900 y el año actual',
          invalidVin: 'Formato de VIN inválido',
          negativeMileage: 'El kilometraje no puede ser negativo'
        }
      }
    }
  }
};