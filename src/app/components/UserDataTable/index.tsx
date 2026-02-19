'use client'

import { useState, useMemo } from 'react'
import { Icon } from '@iconify/react'
import { createUser, updateUser, deleteUser, updateUserPermissions } from '@/app/actions/user.actions'
import { UserType } from '@/app/types/mentor'

interface UserDataTableProps {
  initialUsers: UserType[]
}

const GRADES = [
  'Administrateur',
  'Professeur',
  'Assistant',
  'Chef de Travaux',
  'Chercheur',
  'Etudiant',
  'Personnel Administratif'
]

const AUTORISATIONS_OPTIONS = [
  'Gestion Utilisateurs',
  'Gestion Étudiants',
  'Gestion Cours',
  'Gestion Finances',
  'Gestion Recherche',
  'Consultation',
  'Modification',
  'Suppression'
]

const UserDataTable = ({ initialUsers }: UserDataTableProps) => {
  const [users, setUsers] = useState<UserType[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    telephone: '',
    adresse: '',
    matricule: '',
    grade: 'Professeur',
    fonction: '',
    password: '',
    autorisations: [] as string[],
  })

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        user.nomComplet.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.grade.toLowerCase().includes(searchLower) ||
        (user.matricule && user.matricule.toLowerCase().includes(searchLower))
      )
    })
  }, [users, searchTerm])

  const handleOpenModal = (user?: UserType) => {
    if (user) {
      setEditingId(user._id)
      setFormData({
        nomComplet: user.nomComplet,
        email: user.email,
        telephone: user.telephone,
        adresse: user.adresse || '',
        matricule: user.matricule || '',
        grade: user.grade,
        fonction: user.fonction || '',
        password: '',
        autorisations: user.autorisations || [],
      })
    } else {
      setEditingId(null)
      setFormData({
        nomComplet: '',
        email: '',
        telephone: '',
        adresse: '',
        matricule: '',
        grade: 'Professeur',
        fonction: '',
        password: '',
        autorisations: [],
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({
      nomComplet: '',
      email: '',
      telephone: '',
      adresse: '',
      matricule: '',
      grade: 'Professeur',
      fonction: '',
      password: '',
      autorisations: [],
    })
  }

  const handleOpenPermissionsModal = (user: UserType) => {
    setSelectedUser(user)
    setIsPermissionsModalOpen(true)
  }

  const handleClosePermissionsModal = () => {
    setIsPermissionsModalOpen(false)
    setSelectedUser(null)
  }

  const handleSave = async () => {
    if (!formData.nomComplet || !formData.email || !formData.telephone || !formData.grade) {
      alert('Veuillez remplir tous les champs requis')
      return
    }

    if (!editingId && !formData.password) {
      alert('Le mot de passe est requis pour un nouvel utilisateur')
      return
    }

    setIsLoading(true)
    try {
      let result: { success: boolean; data?: UserType; error?: string }
      if (editingId) {
        const updateData: any = {
          nomComplet: formData.nomComplet,
          email: formData.email,
          telephone: formData.telephone,
          adresse: formData.adresse,
          matricule: formData.matricule,
          grade: formData.grade,
          fonction: formData.fonction,
        }
        if (formData.password) {
          updateData.password = formData.password
        }

        result = await updateUser(editingId, updateData)

        if (result.success && result.data) {
          const updatedUser = result.data
          setUsers(users.map((u) => (u._id === editingId ? updatedUser : u)))
        }
      } else {
        result = await createUser({
          nomComplet: formData.nomComplet,
          email: formData.email,
          telephone: formData.telephone,
          adresse: formData.adresse,
          matricule: formData.matricule,
          grade: formData.grade,
          fonction: formData.fonction,
          password: formData.password,
          autorisations: formData.autorisations,
        })

        if (result.success && result.data) {
          setUsers([...users, result.data])
        }
      }

      if (!result.success) {
        alert(result.error || 'Une erreur est survenue')
        return
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    setIsLoading(true)
    try {
      const result = await deleteUser(id)

      if (!result.success) {
        alert(result.error || 'Une erreur est survenue')
        return
      }

      setUsers(users.filter((u) => u._id !== id))
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      const result = await updateUserPermissions(
        selectedUser._id,
        selectedUser.autorisations
      )

      if (!result.success) {
        alert(result.error || 'Une erreur est survenue')
        return
      }

      setUsers(users.map((u) => (u._id === selectedUser._id ? { ...u, autorisations: selectedUser.autorisations } : u)))
      handleClosePermissionsModal()
    } catch (error) {
      console.error('Error updating permissions:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePermission = (permission: string) => {
    if (!selectedUser) return
    const autorisations = selectedUser.autorisations.includes(permission)
      ? selectedUser.autorisations.filter((p) => p !== permission)
      : [...selectedUser.autorisations, permission]
    setSelectedUser({ ...selectedUser, autorisations })
  }

  return (
    <div className='py-20 px-6'>
      <div className='container'>
        {/* Header */}
        <div className='flex items-center justify-between gap-4 mb-10'>
          <div>
            <h1 className='text-4xl font-bold mb-2 text-black'>
              Gestion des utilisateurs
            </h1>
            <p className='text-gray-600'>
              Gérez les utilisateurs et leurs autorisations
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className='bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition flex items-center gap-2'
          >
            <Icon icon='material-symbols:add' width={20} height={20} />
            Nouvel utilisateur
          </button>
        </div>

        {/* Search Bar */}
        <div className='mb-8'>
          <div className='relative'>
            <Icon
              icon='material-symbols:search'
              width={20}
              height={20}
              className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'
            />
            <input
              type='text'
              placeholder='Rechercher par nom, email, grade ou matricule...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary'
            />
          </div>
        </div>

        {/* DataTable */}
        <div className='bg-white rounded-lg shadow-md overflow-hidden border border-gray-100'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    Nom complet
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    Email
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    Téléphone
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    Matricule
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    Grade
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    Autorisations
                  </th>
                  <th className='px-6 py-4 text-center text-sm font-semibold text-gray-900'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='px-6 py-8 text-center text-gray-500'>
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className='hover:bg-gray-50 transition'>
                      <td className='px-6 py-4 text-sm'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
                            <Icon
                              icon='material-symbols:person'
                              width={20}
                              height={20}
                              className='text-primary'
                            />
                          </div>
                          <span className='font-medium text-gray-900'>
                            {user.nomComplet}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {user.email}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {user.telephone}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {user.matricule || '-'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <span className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>
                          {user.grade}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <button
                          onClick={() => handleOpenPermissionsModal(user)}
                          className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition'
                        >
                          <Icon
                            icon='material-symbols:shield'
                            width={14}
                            height={14}
                          />
                          {user.autorisations.length} autorisations
                        </button>
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <div className='flex items-center justify-center gap-3'>
                          <button
                            onClick={() => handleOpenModal(user)}
                            disabled={isLoading}
                            className='p-2 text-primary hover:bg-primary/10 rounded-lg transition disabled:opacity-50'
                            aria-label='Edit'
                          >
                            <Icon
                              icon='material-symbols:edit-outline'
                              width={18}
                              height={18}
                            />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={isLoading}
                            className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50'
                            aria-label='Delete'
                          >
                            <Icon
                              icon='material-symbols:delete-outline'
                              width={18}
                              height={18}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg px-8 pt-14 pb-8 bg-white max-h-[90vh] overflow-y-auto'>
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                disabled={isLoading}
                className='absolute top-0 right-0 mr-4 mt-8 hover:cursor-pointer disabled:opacity-50'
                aria-label='Close Modal'
              >
                <Icon
                  icon='material-symbols:close-rounded'
                  width={24}
                  height={24}
                  className='text-black hover:text-primary'
                />
              </button>

              <h2 className='text-2xl font-bold mb-6 text-black'>
                {editingId ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>

              {/* Form */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Nom complet <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={formData.nomComplet}
                    onChange={(e) =>
                      setFormData({ ...formData, nomComplet: e.target.value })
                    }
                    disabled={isLoading}
                    className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                    placeholder='Ex: Jean Dupont'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isLoading}
                    className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                    placeholder='exemple@email.com'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Téléphone <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='tel'
                    value={formData.telephone}
                    onChange={(e) =>
                      setFormData({ ...formData, telephone: e.target.value })
                    }
                    disabled={isLoading}
                    className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                    placeholder='+243 900 000 000'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Grade <span className='text-red-500'>*</span>
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
                    disabled={isLoading}
                    className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  >
                    {GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Matricule
                  </label>
                  <input
                    type='text'
                    value={formData.matricule}
                    onChange={(e) =>
                      setFormData({ ...formData, matricule: e.target.value })
                    }
                    disabled={isLoading}
                    className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                    placeholder='MAT-2024-001'
                  />
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Fonction
                  </label>
                  <input
                    type='text'
                    value={formData.fonction}
                    onChange={(e) =>
                      setFormData({ ...formData, fonction: e.target.value })
                    }
                    disabled={isLoading}
                    className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                    placeholder='Ex: Directeur des études'
                  />
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Adresse
                  </label>
                  <input
                    type='text'
                    value={formData.adresse}
                    onChange={(e) =>
                      setFormData({ ...formData, adresse: e.target.value })
                    }
                    disabled={isLoading}
                    className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                    placeholder='Adresse complète'
                  />
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Mot de passe {editingId ? '(laisser vide pour ne pas modifier)' : <span className='text-red-500'>*</span>}
                  </label>
                  <input
                    type='password'
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={isLoading}
                    className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                    placeholder='••••••••'
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-4 justify-end'>
                <button
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className='px-6 py-3 rounded-lg font-medium border border-primary text-primary hover:bg-primary hover:text-white transition disabled:opacity-50'
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className='px-6 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50'
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Modal */}
        {isPermissionsModalOpen && selectedUser && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='relative mx-auto w-full max-w-lg overflow-hidden rounded-lg px-8 pt-14 pb-8 bg-white'>
              {/* Close Button */}
              <button
                onClick={handleClosePermissionsModal}
                disabled={isLoading}
                className='absolute top-0 right-0 mr-4 mt-8 hover:cursor-pointer disabled:opacity-50'
                aria-label='Close Modal'
              >
                <Icon
                  icon='material-symbols:close-rounded'
                  width={24}
                  height={24}
                  className='text-black hover:text-primary'
                />
              </button>

              <div className='flex items-center gap-3 mb-6'>
                <div className='w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center'>
                  <Icon
                    icon='material-symbols:shield'
                    width={24}
                    height={24}
                    className='text-purple-700'
                  />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-black'>
                    Autorisations
                  </h2>
                  <p className='text-sm text-gray-600'>{selectedUser.nomComplet}</p>
                </div>
              </div>

              {/* Permissions List */}
              <div className='space-y-3 mb-8'>
                {AUTORISATIONS_OPTIONS.map((permission) => (
                  <label
                    key={permission}
                    className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition'
                  >
                    <input
                      type='checkbox'
                      checked={selectedUser.autorisations.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      disabled={isLoading}
                      className='w-5 h-5 accent-primary rounded disabled:opacity-50'
                    />
                    <span className='text-sm font-medium text-gray-700'>
                      {permission}
                    </span>
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              <div className='flex gap-4 justify-end'>
                <button
                  onClick={handleClosePermissionsModal}
                  disabled={isLoading}
                  className='px-6 py-3 rounded-lg font-medium border border-primary text-primary hover:bg-primary hover:text-white transition disabled:opacity-50'
                >
                  Annuler
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={isLoading}
                  className='px-6 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50'
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDataTable
