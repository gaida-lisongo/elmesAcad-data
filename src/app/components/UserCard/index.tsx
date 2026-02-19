'use client'

import { UserType } from '@/app/types/mentor'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useState } from 'react'

interface UserCardProps {
  user: UserType
  actionLabel?: string
  onAction?: () => void | Promise<void>
  onDelete?: (id: string) => void | Promise<void>
}

const UserCard = ({ user, actionLabel, onAction, onDelete }: UserCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isActioning, setIsActioning] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(user._id)
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAction = async () => {
    if (!onAction) return
    setIsActioning(true)
    try {
      await onAction()
    } catch (error) {
      console.error('Error executing action:', error)
    } finally {
      setIsActioning(false)
    }
  }

  return (
    <div className='bg-white m-3 px-3 pt-3 pb-12 shadow-md rounded-2xl h-full border border-black/10 capitalize relative'>
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label='Delete user'
          className='absolute top-3 right-3 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-full transition duration-300 disabled:opacity-50'
        >
          <Icon
            icon='material-symbols:delete-outline'
            width={20}
            height={20}
          />
        </button>
      )}

      {/* Avatar Section */}
      <div className='relative rounded-3xl h-32 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4'>
        {user.photo ? (
          <Image
            src={user.photo}
            alt={user.nomComplet}
            width={128}
            height={128}
            className='w-full h-full rounded-3xl object-cover'
          />
        ) : (
          <div className='flex items-center justify-center w-full h-full text-primary text-4xl font-bold'>
            {user.nomComplet.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Action Badge */}
      {actionLabel && onAction && (
        <div className='absolute right-5 -bottom-3 bg-secondary rounded-full p-3'>
          <button
            onClick={handleAction}
            disabled={isActioning}
            className='text-white uppercase text-center text-xs font-medium hover:opacity-80 transition disabled:opacity-50'
            aria-label={actionLabel}
          >
            {actionLabel}
          </button>
        </div>
      )}

      {/* User Info */}
      <div className='px-3 pt-6'>
        <h6 className='text-black font-semibold text-lg hover:text-primary cursor-pointer transition'>
          {user.nomComplet}
        </h6>

        <p className='text-base font-normal pt-3 text-black/75'>
          {user.fonction || 'N/A'}
        </p>

        {/* Contact Info */}
        <div className='py-6 border-b space-y-2'>
          <div className='flex items-center gap-2'>
            <Icon
              icon='solar:letter-linear'
              className='text-primary text-lg'
            />
            <p className='text-sm text-black/75 truncate'>{user.email}</p>
          </div>
          <div className='flex items-center gap-2'>
            <Icon
              icon='solar:phone-linear'
              className='text-primary text-lg'
            />
            <p className='text-sm text-black/75'>{user.telephone || 'N/A'}</p>
          </div>
        </div>

        {/* Grade & Matricule */}
        <div className='flex justify-between items-center pt-6 gap-4'>
          <div className='flex-1'>
            <p className='text-xs text-black/50 uppercase mb-1'>Grade</p>
            <div className='px-3 py-1 bg-primary/10 rounded-full'>
              <p className='text-sm font-medium text-primary text-center'>
                {user.grade}
              </p>
            </div>
          </div>
          <div className='flex-1'>
            <p className='text-xs text-black/50 uppercase mb-1'>Matricule</p>
            <p className='text-sm font-medium text-black/75 text-center'>
              {user.matricule || 'N/A'}
            </p>
          </div>
        </div>

        {/* Adresse */}
        {user.adresse && (
          <div className='mt-4 pt-4 border-t'>
            <p className='text-xs text-black/50 uppercase mb-1'>Adresse</p>
            <p className='text-xs text-black/75 line-clamp-2'>
              {user.adresse}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserCard
