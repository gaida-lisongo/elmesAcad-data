'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { SectionType } from '@/app/page'
import { useAuthStore } from '@/store/auth.store'
import { createPromotion, deletePromotion } from '@/app/actions/promotion.actions'
import CourseSkeleton from '../../Skeleton/Course'

interface CoursesProps {
  section: SectionType
  promotions: any[]
}

const Courses = (data: CoursesProps) => {
  const { isAuthenticated, hydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [allPromotions, setAllPromotions] = useState(data.promotions || [])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState(1)
  const [selectedFiliereId, setSelectedFiliereId] = useState('')
  const [formData, setFormData] = useState({
    niveau: '',
    designation: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalPromotions = allPromotions.length
  console.log("Total promotions: ", totalPromotions)

   // Log the list of promotions for debugging
   console.log("Liste of promotions : ", allPromotions);

  const openCreateModal = () => {
    setModalStep(1)
    setSelectedFiliereId('')
    setFormData({ niveau: '', designation: '', description: '' })
    setShowModal(true)
  }

  const handleNextStep = () => {
    if (!selectedFiliereId) {
      alert('Veuillez sélectionner une filière')
      return
    }
    setModalStep(2)
  }

  const handleCreatePromotion = async () => {
    if (!formData.niveau || !formData.designation || !formData.description) {
      alert('Tous les champs sont requis')
      return
    }

    if (!data.section._id || data.section._id === '') {
      alert('Section ID manquant')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createPromotion(data.section._id, selectedFiliereId, formData)

      if (!result.success) {
        alert(result.error || 'Une erreur est survenue')
        return
      }

      alert('Promotion créée avec succès')
      setShowModal(false)
      window.location.reload()
    } catch (error) {
      console.error('Error creating promotion:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateTotalCredits = (semestres: any[]) => {
    if (!semestres) return 0
    return semestres.reduce((total, sem) => total + (sem.credit || 0), 0)
  }

  const calculateTotalUnites = (semestres: any[]) => {
    if (!semestres) return 0
    return semestres.reduce((total, sem) => total + (sem.unites?.length || 0), 0)
  }

  const settings = {
    dots: true,
    infinite: allPromotions.length > 4,
    slidesToShow: Math.min(4, allPromotions.length),
    slidesToScroll: 2,
    arrows: false,
    autoplay: allPromotions.length > 4,
    speed: 500,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(3, allPromotions.length),
          slidesToScroll: 1,
          infinite: allPromotions.length > 2,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: allPromotions.length > 1,
          dots: true,
        },
      },
    ],
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const halfStars = rating % 1 >= 0.5 ? 1 : 0
    const emptyStars = 5 - fullStars - halfStars

    return (
      <div>
        {Array.from({ length: fullStars }).map((_, i) => (
          <Icon
            key={`full-${i}`}
            icon='tabler:star-filled'
            className='text-yellow-500 text-xl inline-block'
          />
        ))}
        {halfStars > 0 && (
          <Icon
            icon='tabler:star-half-filled'
            className='text-yellow-500 text-xl inline-block'
          />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Icon
            key={`empty-${i}`}
            icon='tabler:star-filled'
            className='text-gray-400 text-xl inline-block'
          />
        ))}
      </div>
    )
  }

  return (
    <section id='courses' className='scroll-mt-12 pb-20'>
      <div className='container'>
        <div className='sm:flex justify-between items-center mb-10'>
          <h2 className='text-midnight_text mb-5 sm:mb-0 capitalize'>
            Total des programmes ({totalPromotions})
          </h2>
          {mounted && hydrated && isAuthenticated() && (
            <button
              onClick={openCreateModal}
              className='flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition shadow-md'
            >
              <Icon icon='material-symbols:add' width={20} height={20} />
              Créer une promotion
            </button>
          )}
        </div>

        {allPromotions.length === 0 ? (
          <div className='py-10 text-center text-gray-500'>
            <p>Aucun programme disponible</p>
          </div>
        ) : (
          <Slider {...settings}>
            {allPromotions.map((promotion, i) => (
              <div key={i}>
                <div className='bg-white m-2 px-3 pt-3 pb-8 shadow-md rounded-lg h-full border border-black/10 capitalize'>
                  <div className='relative rounded-lg overflow-hidden'>
                    <div className='rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 h-40'>
                      <Image
                        src={`/images/courses/UiUx.webp`}
                        alt='programme'
                        width={250}
                        height={160}
                        className='w-full h-full object-cover rounded-lg'
                      />
                    </div>
                    <div className='absolute right-2 -bottom-2 bg-secondary rounded-full p-2'>
                      <p className='text-white uppercase text-center text-xs font-medium'>
                        {String(promotion.niveau)}
                      </p>
                    </div>
                  </div>

                  <div className='px-3 pt-4'>
                    <h6 className='text-black text-base font-semibold hover:text-primary line-clamp-2'>
                      {String(promotion.designation)}
                    </h6>
                    <p className='text-sm font-normal pt-2 text-black/70 line-clamp-2'>
                      {Array.isArray(promotion.description)
                        ? promotion.description.join(' • ')
                        : String(promotion.description)}
                    </p>
                    <div className='flex items-center justify-between py-2 border-b text-xs'>
                      <div className='flex items-center gap-1'>
                        <p className='text-red-700 font-medium'>
                          {promotion.semestres?.length || 0}
                        </p>
                        <div className='flex scale-75 origin-left'>
                          {renderStars(promotion.semestres?.length || 0)}
                        </div>
                      </div>
                      <p className='font-medium text-primary'>
                        {calculateTotalCredits(promotion.semestres)} pts
                      </p>
                    </div>
                    <div className='flex justify-between pt-2 text-xs'>
                      <div className='flex items-center gap-1'>
                        <Icon
                          icon='solar:notebook-minimalistic-outline'
                          className='text-primary text-base'
                        />
                        <p className='font-medium text-black/75'>
                          {promotion.semestres?.length || 0}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Icon
                          icon='solar:users-group-rounded-linear'
                          className='text-primary text-base'
                        />
                        <p className='font-medium text-black/75'>
                          {calculateTotalUnites(promotion.semestres)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </div>

      {/* Modal 2 Étapes */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full'>
            {modalStep === 1 ? (
              <>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-xl font-semibold text-midnight_text'>
                    Étape 1: Choisir une filière
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className='text-gray-500 hover:text-gray-700'
                  >
                    <Icon icon='material-symbols:close' width={24} height={24} />
                  </button>
                </div>

                <div className='space-y-3 mb-6 max-h-96 overflow-y-auto'>
                  {data.section.filieres && data.section.filieres.length > 0 ? (
                    data.section.filieres.map((filiere) => (
                      <button
                        key={String(filiere._id)}
                        onClick={() => setSelectedFiliereId(String(filiere._id))}
                        className={`w-full p-3 rounded-lg border-2 transition text-left ${
                          selectedFiliereId === String(filiere._id)
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 hover:border-primary'
                        }`}
                      >
                        <p className='font-semibold text-midnight_text'>
                          {String(filiere.designation)}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {String(filiere.sigle)}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className='text-gray-500'>Aucune filière disponible</p>
                  )}
                </div>

                <div className='flex justify-end gap-2'>
                  <button
                    onClick={() => setShowModal(false)}
                    className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition'
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedFiliereId}
                    className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50'
                  >
                    Suivant
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-xl font-semibold text-midnight_text'>
                    Étape 2: Créer la promotion
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className='text-gray-500 hover:text-gray-700'
                  >
                    <Icon icon='material-symbols:close' width={24} height={24} />
                  </button>
                </div>

                <div className='space-y-4 mb-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Niveau
                    </label>
                    <input
                      type='text'
                      value={formData.niveau}
                      onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary'
                      placeholder='Ex: Licence'
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Désignation
                    </label>
                    <input
                      type='text'
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary'
                      placeholder='Ex: Licence 1'
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
                      placeholder='Décrivez le programme... (séparez par des virgules)'
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className='flex justify-end gap-2'>
                  <button
                    onClick={() => setModalStep(1)}
                    disabled={isSubmitting}
                    className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50'
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleCreatePromotion}
                    disabled={isSubmitting}
                    className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50'
                  >
                    {isSubmitting ? (
                      <span className='flex items-center gap-2'>
                        <Icon icon='eos-icons:loading' width={20} height={20} />
                        Création...
                      </span>
                    ) : (
                      'Créer'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default Courses
