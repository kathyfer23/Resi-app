import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { User, Settings, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileForm {
  name: string
  phone?: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.resident?.phone || ''
    }
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm<PasswordForm>()

  const newPassword = watch('newPassword')

  const onSubmitProfile = async (data: ProfileForm) => {
    setLoading(true)
    try {
      const response = await api.put('/users/profile', data)
      updateUser(response.data.user)
      setIsEditing(false)
      toast.success('Perfil actualizado exitosamente')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitPassword = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      await api.put('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      setIsChangingPassword(false)
      resetPassword()
      toast.success('Contraseña actualizada exitosamente')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    resetProfile({
      name: user?.name || '',
      phone: user?.resident?.phone || ''
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del perfil */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Información personal</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary"
              >
                <Settings className="h-4 w-4 mr-2" />
                Editar
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  {...registerProfile('name', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres'
                    }
                  })}
                  className="input mt-1"
                />
                {profileErrors.name && (
                  <p className="mt-1 text-sm text-danger-600">{profileErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  {...registerProfile('phone')}
                  className="input mt-1"
                  placeholder="+52 123 456 7890"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nombre</label>
                <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Casa</label>
                <p className="mt-1 text-sm text-gray-900">{user?.resident?.houseNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.resident?.phone || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Rol</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.role === 'ADMIN' ? 'Administrador' : 'Residente'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cambiar contraseña */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Seguridad</h2>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="btn-secondary"
              >
                Cambiar contraseña
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  {...registerPassword('currentPassword', {
                    required: 'La contraseña actual es requerida'
                  })}
                  className="input mt-1"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  {...registerPassword('newPassword', {
                    required: 'La nueva contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                  className="input mt-1"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  {...registerPassword('confirmPassword', {
                    required: 'Debes confirmar la nueva contraseña',
                    validate: (value) =>
                      value === newPassword || 'Las contraseñas no coinciden'
                  })}
                  className="input mt-1"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Actualizar contraseña
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false)
                    resetPassword()
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Contraseña</h3>
              <p className="mt-1 text-sm text-gray-500">
                Actualiza tu contraseña para mantener tu cuenta segura.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile 