'use client'

import { useState, useMemo } from 'react'
import { Icon } from '@iconify/react'
import { createAnnee, updateAnnee, deleteAnnee } from '@/app/actions/annee.actions'

interface Annee {
  _id: string
  debut: string | Date
  fin: string | Date
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface AnneeDataTableProps {
  initialAnnees: Annee[]
}

const AnneeDataTable = ({ initialAnnees }: AnneeDataTableProps) => {
  const [annees, setAnnees] = useState<Annee[]>(initialAnnees)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    debut: '',
    fin: '',
    isActive: false,
  })

  const filteredAnnees = useMemo(() => {
    return annees.filter((annee) => {
      const debut = new Date(annee.debut).toLocaleDateString()
      const fin = new Date(annee.fin).toLocaleDateString()
      const searchLower = searchTerm.toLowerCase()
      return debut.includes(searchLower) || fin.includes(searchLower)
    })
  }, [annees, searchTerm])

  const handleOpenModal = (annee?: Annee) => {
    if (annee) {
      setEditingId(annee._id)
      setFormData({
        debut: new Date(annee.debut).toISOString().split('T')[0],
        fin: new Date(annee.fin).toISOString().split('T')[0],
        isActive: annee.isActive,
      })
    } else {
      setEditingId(null)
      setFormData({ debut: '', fin: '', isActive: false })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ debut: '', fin: '', isActive: false })
  }

  const handleSave = async () => {
    if (!formData.debut || !formData.fin) {
      alert('Veuillez remplir tous les champs requis')
      return
    }

    setIsLoading(true)
    try {
      let result: { success: boolean; data?: any; error?: string }
      if (editingId) {
        result = await updateAnnee(editingId, {
          debut: new Date(formData.debut),
          fin: new Date(formData.fin),
          isActive: formData.isActive,
        })

        if (result.success && result.data) {
          setAnnees(
            annees.map((a) => (a._id === editingId ? result.data : a))
          )
        }
      } else {
        result = await createAnnee({
          debut: new Date(formData.debut),
          fin: new Date(formData.fin),
          isActive: formData.isActive,
        })

        if (result.success && result.data) {
          setAnnees([...annees, result.data])
        }
      }

      if (!result.success) {
        alert(result.error || 'Une erreur est survenue')
        return
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving annee:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette année académique ?')) return

    setIsLoading(true)
    try {
      const result = await deleteAnnee(id)

      if (!result.success) {
        alert(result.error || 'Une erreur est survenue')
        return
      }

      setAnnees(annees.filter((a) => a._id !== id))
    } catch (error) {
      console.error('Error deleting annee:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='py-20 px-6'>
      <div className='container'>
        {/* Header */}
        <div className='flex items-center justify-between gap-4 mb-10'>
          <div>
            <h1 className='text-4xl font-bold mb-2 text-black'>
              Années académiques
            </h1>
            <p className='text-gray-600'>
              Gérez les années académiques de votre institution
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className='bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition flex items-center gap-2'
          >
            <Icon icon='material-symbols:add' width={20} height={20} />
            Nouvelle année
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
              placeholder='Rechercher par date...'
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
                    Date de début
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    Date de fin
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    Statut
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    Créée le
                  </th>
                  <th className='px-6 py-4 text-center text-sm font-semibold text-gray-900'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredAnnees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='px-6 py-8 text-center text-gray-500'>
                      Aucune année académique trouvée
                    </td>
                  </tr>
                ) : (
                  filteredAnnees.map((annee) => (
                    <tr key={annee._id} className='hover:bg-gray-50 transition'>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        {new Date(annee.debut).toLocaleDateString('fr-FR')}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        {new Date(annee.fin).toLocaleDateString('fr-FR')}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            annee.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              annee.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                          {annee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {annee.createdAt
                          ? new Date(annee.createdAt).toLocaleDateString(
                              'fr-FR'
                            )
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <div className='flex items-center justify-center gap-3'>
                          <button
                            onClick={() => handleOpenModal(annee)}
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
                            onClick={() => handleDelete(annee._id)}
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

        {/* Modal */}
        {isModalOpen && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
            <div className='relative mx-auto w-full max-w-md overflow-hidden rounded-lg px-8 pt-14 pb-8 bg-white'>
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
                {editingId ? 'Modifier l\'année' : 'Nouvelle année académique'}
              </h2>

              {/* Form */}
              <div className='space-y-4 mb-8'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Date de début
                  </label>
                  <input
                    type='date'
                    value={formData.debut}
                    onChange={(e) =>
                      setFormData({ ...formData, debut: e.target.value })
                    }
                    disabled={isLoading}
                    className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Date de fin
                  </label>
                  <input
                    type='date'
                    value={formData.fin}
                    onChange={(e) =>
                      setFormData({ ...formData, fin: e.target.value })
                    }
                    disabled={isLoading}
                    className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  />
                </div>

                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='isActive'
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    disabled={isLoading}
                    className='w-5 h-5 accent-primary rounded disabled:opacity-50'
                  />
                  <label htmlFor='isActive' className='text-sm font-medium text-gray-700'>
                    Année active
                  </label>
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
      </div>
    </div>
  )
}

export default AnneeDataTable
