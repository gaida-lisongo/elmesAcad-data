'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import ProfileClient from './client'
import { Icon } from '@iconify/react'

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return (
      <div className='py-20 px-6'>
        <div className='container max-w-2xl'>
          <div className='flex items-center justify-center h-96'>
            <Icon icon='eos-icons:loading' width={40} height={40} className='text-primary' />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated() || !user) {
    return (
      <div className='py-20 px-6'>
        <div className='container max-w-2xl'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-8 text-center'>
            <Icon
              icon='material-symbols:error-outline'
              width={48}
              height={48}
              className='text-red-500 mx-auto mb-4'
            />
            <h1 className='text-2xl font-bold text-red-900 mb-2'>Non authentifié</h1>
            <p className='text-red-700'>Veuillez vous connecter pour accéder à votre profil.</p>
          </div>
        </div>
      </div>
    )
  }

  return <ProfileClient initialUser={user} />
}

export default ProfilePage
