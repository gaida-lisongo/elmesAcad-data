'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Slider from 'react-slick'
import { Icon } from '@iconify/react'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useAuthStore } from '@/store/auth.store'
import { fetchFilieres, createFiliere, updateFiliere, deleteFiliere } from '@/app/actions/filiere.actions'

interface IFiliere {
  _id: string
  designation: string
  description: string
  icon?: string
}

const Filieres = () => {
  const router = useRouter()
  const { isAuthenticated, hydrated } = useAuthStore()
  const [filieres, setFilieres] = useState<IFiliere[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingFiliere, setEditingFiliere] = useState<IFiliere | null>(null)
  const [formData, setFormData] = useState({
    designation: '',
    description: '',
    icon: 'mdi:home',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadFilieres()
  }, [])

  const loadFilieres = async () => {
    setLoading(true)
    try {
      const result = await fetchFilieres()
      if (result.success && result.data) {
        setFilieres(result.data)
      }
    } catch (error) {
      console.error('Error loading filieres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiliereClick = (id: string) => {
    router.push(`/filiere/${id}`)
  }

  const openAddModal = () => {
    setEditingFiliere(null)
    setFormData({ designation: '', description: '', icon: 'mdi:home' })
    setShowModal(true)
  }

  const openEditModal = (filiere: IFiliere) => {
    setEditingFiliere(filiere)
    setFormData({
      designation: filiere.designation,
      description: filiere.description,
      icon: filiere.icon || 'mdi:home',
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.designation || !formData.description) {
      alert('Tous les champs sont requis')
      return
    }

    setIsSubmitting(true)
    try {
      let result
      if (editingFiliere) {
        result = await updateFiliere(editingFiliere._id, formData)
      } else {
        result = await createFiliere(formData)
      }

      if (!result.success) {
        alert(result.error || 'Une erreur est survenue')
        return
      }

      setShowModal(false)
      loadFilieres()
      alert(`Filière ${editingFiliere ? 'modifiée' : 'créée'} avec succès`)
    } catch (error) {
      console.error('Error saving filiere:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette filière ?')) return

    try {
      const result = await deleteFiliere(id)
      if (!result.success) {
        alert(result.error || 'Une erreur est survenue')
        return
      }

      loadFilieres()
      alert('Filière supprimée avec succès')
    } catch (error) {
      console.error('Error deleting filiere:', error)
      alert('Une erreur est survenue')
    }
  }

  const settings = {
    dots: false,
    infinite: filieres.length > 4,
    slidesToShow: Math.min(4, filieres.length),
    slidesToScroll: 1,
    arrows: false,
    autoplay: filieres.length > 4,
    speed: 2000,
    autoplaySpeed: 2000,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(4, filieres.length),
          slidesToScroll: 1,
          infinite: filieres.length > 4,
          dots: false,
        },
      },
      {
        breakpoint: 700,
        settings: {
          slidesToShow: Math.min(2, filieres.length),
          slidesToScroll: 1,
          infinite: filieres.length > 2,
          dots: false,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: filieres.length > 1,
          dots: false,
        },
      },
    ],
  }

  return (
    <section className='text-center py-10 bg-white'>
      <div className='container'>
        <div className='flex justify-between items-center mb-6'>
          <h6 className='text-midnight_text capitalize text-2xl font-semibold'>
            Nos Filières
          </h6>
          {mounted && hydrated && isAuthenticated() && (
            <button
              onClick={openAddModal}
              className='flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition shadow-md'
            >
              <Icon icon='material-symbols:add' width={20} height={20} />
              Ajouter une filière
            </button>
          )}
        </div>

        {loading ? (
          <div className='flex justify-center py-10'>
            <Icon icon='eos-icons:loading' className='text-primary text-4xl' />
          </div>
        ) : filieres.length === 0 ? (
          <div className='py-10 text-gray-500'>
            <p>Aucune filière disponible</p>
            {mounted && hydrated && isAuthenticated() && (
              <button
                onClick={openAddModal}
                className='mt-4 text-primary hover:underline'
              >
                Ajouter la première filière
              </button>
            )}
          </div>
        ) : (
          <div className='py-7 border-b'>
            <Slider {...settings}>
              {filieres.map((filiere) => (
                <div key={filiere._id} className='px-2'>
                  <div className='relative group'>
                    <div
                      onClick={() => handleFiliereClick(filiere._id)}
                      className='cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-all duration-300 border border-gray-200 hover:border-primary h-full flex flex-col items-center justify-center gap-4'
                    >
                      <Icon
                        icon={filiere.icon || 'mdi:home'}
                        className='text-primary text-6xl'
                      />
                      <h4 className='font-semibold text-lg text-midnight_text'>
                        {filiere.designation}
                      </h4>
                      <p className='text-sm text-gray-600 line-clamp-2'>
                        {filiere.description}
                      </p>
                    </div>

                    {/* Admin Controls */}
                    {mounted && hydrated && isAuthenticated() && (
                      <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(filiere)
                          }}
                          className='bg-blue-500 text-white p-1.5 rounded-lg hover:bg-blue-600 transition'
                        >
                          <Icon icon='material-symbols:edit' width={16} height={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(filiere._id)
                          }}
                          className='bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition'
                        >
                          <Icon icon='material-symbols:delete' width={16} height={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-xl font-semibold text-midnight_text'>
                {editingFiliere ? 'Modifier la filière' : 'Ajouter une filière'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <Icon icon='material-symbols:close' width={24} height={24} />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Désignation
                </label>
                <input
                  type='text'
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary'
                  placeholder='Ex: Informatique'
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary'
                  placeholder='Décrivez la filière...'
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Icône (Iconify)
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary'
                    placeholder='mdi:home'
                    disabled={isSubmitting}
                  />
                  <div className='w-12 h-10 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50'>
                    <Icon icon={formData.icon || 'mdi:home'} className='text-primary text-xl' />
                  </div>
                </div>
                <p className='text-xs text-gray-500 mt-1'>
                  Recherchez des icônes sur{' '}
                  <a
                    href='https://icon-sets.iconify.design/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary hover:underline'
                  >
                    Iconify
                  </a>
                </p>
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-6'>
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50'
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50'
              >
                {isSubmitting ? (
                  <span className='flex items-center gap-2'>
                    <Icon icon='eos-icons:loading' width={20} height={20} />
                    Enregistrement...
                  </span>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Filieres
