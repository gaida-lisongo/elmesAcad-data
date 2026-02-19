import { fetchUsers } from '@/app/actions/user.actions'
import UserDataTable from '@/app/components/UserDataTable'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const result = await fetchUsers()

  if (!result.success) {
    console.error('Error fetching users:', result.error)
    // You might want to redirect to an error page or show an error message
    return (
      <div className='py-20 px-6'>
        <div className='container'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
            <h2 className='text-2xl font-bold text-red-700 mb-2'>
              Erreur de chargement
            </h2>
            <p className='text-red-600'>
              {result.error || 'Impossible de charger les utilisateurs'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <UserDataTable initialUsers={result.data || []} />
}
