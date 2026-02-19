'use client'

import { useState } from 'react'
import { UserType } from '@/app/types/mentor'
import UserCard from '@/app/components/UserCard'
import { Icon } from '@iconify/react'
import { updateUserPermissions, deleteUser } from '@/app/actions/user.actions'

const AVAILABLE_PERMISSIONS = [
  'SUPER-ADMIN',
  'ADMIN',
  'FINANCE',
  'RECHERCHE',
  'ENSEIGNEMENT',
  'ETUDIANT',
  'JURY',
  'TITULAIRE',
]

interface SettingsClientProps {
  initialUsers: UserType[]
}

const SettingsClient = ({ initialUsers }: SettingsClientProps) => {
  const [users, setUsers] = useState<UserType[]>(initialUsers)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleManagePermissions = (user: UserType) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handlePermissionToggle = (permission: string) => {
    if (!selectedUser) return

    const updatedPermissions = selectedUser.autorisations.includes(permission)
      ? selectedUser.autorisations.filter((p) => p !== permission)
      : [...selectedUser.autorisations, permission]

    setSelectedUser({
      ...selectedUser,
      autorisations: updatedPermissions,
    })
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return

    try {
      const result = await updateUserPermissions(selectedUser._id, selectedUser.autorisations)

      if (!result.success) throw new Error(result.error || 'Failed to update permissions')

      // Update the users list
      if (result.data) {
        setUsers(
          users.map((u) => (u._id === selectedUser._id ? result.data! : u))
        )
      }

      setIsModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating permissions:', error)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    try {
      const result = await deleteUser(id)

      if (!result.success) throw new Error(result.error || 'Failed to delete user')

      setUsers(users.filter((u) => u._id !== id))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  return (
    <div className='py-20 px-6'>
      <div className='container'>
        <div className='mb-10'>
          <h1 className='text-4xl font-bold mb-2 text-black'>
            Gestion des utilisateurs
          </h1>
          <p className='text-gray-600'>
            Gérez et contrôlez les autorisations de vos utilisateurs
          </p>
        </div>

        {/* Users Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              actionLabel='Autorisations'
              onAction={() => handleManagePermissions(user)}
              onDelete={() => handleDeleteUser(user._id)}
            />
          ))}
        </div>

        {/* Permissions Modal */}
        {isModalOpen && selectedUser && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
            <div className='relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg px-8 pt-14 pb-8 bg-white'>
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedUser(null)
                }}
                className='absolute top-0 right-0 mr-4 mt-8 hover:cursor-pointer'
                aria-label='Close Modal'
              >
                <Icon
                  icon='material-symbols:close-rounded'
                  width={24}
                  height={24}
                  className='text-black hover:text-primary text-24 inline-block'
                />
              </button>

              <h2 className='text-2xl font-bold mb-2 text-black'>
                Gérer les autorisations
              </h2>
              <p className='text-gray-600 mb-6'>
                {selectedUser.nomComplet}
              </p>

              {/* Permissions Checklist */}
              <div className='space-y-3 mb-8'>
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <label
                    key={permission}
                    className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition'
                  >
                    <input
                      type='checkbox'
                      checked={selectedUser.autorisations.includes(
                        permission
                      )}
                      onChange={() => handlePermissionToggle(permission)}
                      className='w-5 h-5 accent-primary rounded'
                    />
                    <div>
                      <p className='font-medium text-black text-sm'>
                        {permission.replace(/_/g, ' ')}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {getPermissionDescription(permission)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              <div className='flex gap-4 justify-end'>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setSelectedUser(null)
                  }}
                  className='px-6 py-3 rounded-lg font-medium border border-primary text-primary hover:bg-primary hover:text-white transition'
                >
                  Annuler
                </button>
                <button
                  onClick={handleSavePermissions}
                  className='px-6 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition'
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getPermissionDescription(permission: string): string {
  const descriptions: Record<string, string> = {
    'SUPER-ADMIN': 'Gère la plateforme et les autorisations',
    'ADMIN': 'Gère les personnels et les étudiants',
    'FINANCE': 'Gère les finances',
    'RECHERCHE': 'Gère les stages et les sujets de recherche',
    'ENSEIGNEMENT': 'Gère les classes et cours',
    'ETUDIANT': 'Gère ses activités et ressources',
    'JURY': 'Gère la délibération',
    'TITULAIRE': 'Gère les notes et charge horaire',
  }
  return descriptions[permission] || ''
}

export default SettingsClient
