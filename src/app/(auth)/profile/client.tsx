'use client'

import { useState } from 'react'
import { UserType } from '@/app/types/mentor'
import { Icon } from '@iconify/react'
import { updateProfile, changePassword } from '@/app/actions/profile.actions'
import { useAuthStore } from '@/store/auth.store'

interface ProfileClientProps {
  initialUser: UserType
}

const ProfileClient = ({ initialUser }: ProfileClientProps) => {
  const { setSession } = useAuthStore()
  const [user, setUser] = useState<UserType>(initialUser)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    nomComplet: user.nomComplet,
    email: user.email,
    telephone: user.telephone || '',
    adresse: user.adresse || '',
    fonction: user.fonction || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async () => {
    if (!profileForm.nomComplet || !profileForm.email) {
      alert('Nom complet et email sont obligatoires')
      return
    }

    setIsLoading(true)
    try {
      const result = await updateProfile(user._id, profileForm)

      if (!result.success) {
        alert(result.error || 'Une erreur est survenue')
        return
      }

      if (result.data) {
        setUser(result.data)
        setSession({ user: result.data, token: '' })
      }

      setIsEditingProfile(false)
      alert('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Tous les champs sont obligatoires')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    if (passwordForm.newPassword.trim().length < 8) {
      alert('Le nouveau mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      alert('Le nouveau mot de passe doit être différent de l\'actuel')
      return
    }

    setIsLoading(true)
    try {
      const result = await changePassword(
        user._id,
        passwordForm.currentPassword,
        passwordForm.newPassword
      )

      if (!result.success) {
        alert(result.error || 'Une erreur est survenue')
        return
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsChangingPassword(false)
      alert('Mot de passe changé avec succès')
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='py-20 px-6'>
      <div className='container max-w-2xl'>
        {/* Header */}
        <div className='mb-10'>
          <h1 className='text-4xl font-bold mb-2 text-black'>
            Mon profil
          </h1>
          <p className='text-gray-600'>
            Gérez vos informations personnelles et votre sécurité
          </p>
        </div>

        {/* Info Cards */}
        <div className='space-y-6'>
          {/* Personal Information Card */}
          <div className='bg-white rounded-lg shadow-md border border-gray-100 p-8'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h2 className='text-2xl font-bold text-black flex items-center gap-2'>
                  <Icon icon='solar:user-linear' width={28} height={28} className='text-primary' />
                  Informations personnelles
                </h2>
              </div>
              <button
                onClick={() => {
                  if (isEditingProfile) {
                    setProfileForm({
                      nomComplet: user.nomComplet,
                      email: user.email,
                      telephone: user.telephone || '',
                      adresse: user.adresse || '',
                      fonction: user.fonction || '',
                    })
                  }
                  setIsEditingProfile(!isEditingProfile)
                }}
                className='px-4 py-2 rounded-lg font-medium border border-primary text-primary hover:bg-primary hover:text-white transition'
              >
                {isEditingProfile ? 'Annuler' : 'Modifier'}
              </button>
            </div>

            {isEditingProfile ? (
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Nom complet
                  </label>
                  <input
                    type='text'
                    name='nomComplet'
                    value={profileForm.nomComplet}
                    onChange={handleProfileChange}
                    disabled={isLoading}
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    disabled={isLoading}
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Téléphone
                  </label>
                  <input
                    type='tel'
                    name='telephone'
                    value={profileForm.telephone}
                    onChange={handleProfileChange}
                    disabled={isLoading}
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Adresse
                  </label>
                  <textarea
                    name='adresse'
                    value={profileForm.adresse}
                    onChange={handleProfileChange}
                    disabled={isLoading}
                    rows={3}
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Fonction
                  </label>
                  <input
                    type='text'
                    name='fonction'
                    value={profileForm.fonction}
                    onChange={handleProfileChange}
                    disabled={isLoading}
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  />
                </div>

                <div className='flex gap-4 justify-end pt-4'>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    disabled={isLoading}
                    className='px-6 py-3 rounded-lg font-medium border border-primary text-primary hover:bg-primary hover:text-white transition disabled:opacity-50'
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className='px-6 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2'
                  >
                    {isLoading && <Icon icon='eos-icons:loading' width={18} height={18} />}
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500 mb-1'>Nom complet</p>
                    <p className='text-lg font-medium text-black'>{user.nomComplet}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500 mb-1'>Email</p>
                    <p className='text-lg font-medium text-black'>{user.email}</p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500 mb-1'>Téléphone</p>
                    <p className='text-lg font-medium text-black'>
                      {user.telephone || 'Non renseigné'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500 mb-1'>Fonction</p>
                    <p className='text-lg font-medium text-black'>
                      {user.fonction || 'Non renseignée'}
                    </p>
                  </div>
                </div>

                {user.adresse && (
                  <div>
                    <p className='text-sm text-gray-500 mb-1'>Adresse</p>
                    <p className='text-base text-black'>{user.adresse}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Information Card */}
          <div className='bg-white rounded-lg shadow-md border border-gray-100 p-8'>
            <div>
              <h2 className='text-2xl font-bold text-black flex items-center gap-2 mb-6'>
                <Icon icon='solar:shield-linear' width={28} height={28} className='text-primary' />
                Informations du compte
              </h2>
            </div>

            <div className='space-y-4 mb-6'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Matricule</p>
                <p className='text-lg font-medium text-black'>{user.matricule || 'Non renseigné'}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Grade</p>
                <div className='inline-block px-4 py-2 bg-primary/10 rounded-full'>
                  <p className='text-lg font-medium text-primary'>{user.grade}</p>
                </div>
              </div>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Rôles</p>
                <div className='flex flex-wrap gap-2'>
                  {user.autorisations && user.autorisations.length > 0 ? (
                    user.autorisations.map((role, index) => (
                      <span
                        key={index}
                        className='inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full'
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className='text-gray-500'>Aucun rôle assigné</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className='bg-white rounded-lg shadow-md border border-gray-100 p-8'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-black flex items-center gap-2'>
                <Icon icon='solar:lock-linear' width={28} height={28} className='text-primary' />
                Sécurité
              </h2>
              <button
                onClick={() => {
                  if (isChangingPassword) {
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }
                  setIsChangingPassword(!isChangingPassword)
                }}
                className='px-4 py-2 rounded-lg font-medium border border-primary text-primary hover:bg-primary hover:text-white transition'
              >
                {isChangingPassword ? 'Annuler' : 'Changer le mot de passe'}
              </button>
            </div>

            {isChangingPassword ? (
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Mot de passe actuel
                  </label>
                  <input
                    type='password'
                    name='currentPassword'
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Nouveau mot de passe
                  </label>
                  <input
                    type='password'
                    name='newPassword'
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type='password'
                    name='confirmPassword'
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  />
                </div>

                <div className='flex gap-4 justify-end pt-4'>
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    disabled={isLoading}
                    className='px-6 py-3 rounded-lg font-medium border border-primary text-primary hover:bg-primary hover:text-white transition disabled:opacity-50'
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className='px-6 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2'
                  >
                    {isLoading && <Icon icon='eos-icons:loading' width={18} height={18} />}
                    {isLoading ? 'Changement...' : 'Changer le mot de passe'}
                  </button>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
                  <p className='text-sm text-blue-800 font-medium mb-3'>
                    🔒 Recommandations de sécurité
                  </p>
                  <ul className='text-sm text-blue-700 space-y-2'>
                    <li className='flex items-center gap-2'>
                      <span>✓</span> Changez votre mot de passe régulièrement
                    </li>
                    <li className='flex items-center gap-2'>
                      <span>✓</span> Minimum 8 caractères
                    </li>
                    <li className='flex items-center gap-2'>
                      <span>✓</span> Utilisez un mot de passe unique
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileClient
