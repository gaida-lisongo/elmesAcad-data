'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { Icon } from '@iconify/react'
import mdAdd from '@iconify/icons-ion/md-add'
import mdTrash from '@iconify/icons-ion/md-trash'
import mdCreate from '@iconify/icons-ion/md-create'
import { UserType } from '@/app/types/mentor'
import MentorSkeleton from '../../Skeleton/Mentor'

const Users = () => {
  const [mentor, setMentor] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<{
    name: string
    adresse: string
    matricule: string
    grade: string
    fonction: string
    email: string
    password: string
  }>({
    name: '',
    adresse: '',
    matricule: '',
    grade: 'ADMIN',
    fonction: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const req = await fetch('/api/users')
        if (!req.ok) throw new Error('Failed to fetch')
        const res = await req.json()

        if (res.length === 0) {
          setMentor([])
          return
        }
        setMentor(res)
      } catch (error) {
        console.error('Error fetching service:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ✅ tes méthodes CRUD existantes (je les utilise telles quelles)
  const handleCreate = async (payload: {
    name: string
    adresse: string
    matricule: string
    grade: string
    fonction: string
    email: string
    password: string
  }) => {
    try {
      const req = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!req.ok) throw new Error('Failed to create user')
      const res = await req.json()
      setMentor((prev) => [...prev, res])
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleUpdate = async (
    id: string,
    payload: {
      name?: string
      adresse?: string
      matricule?: string
      grade?: string
      fonction?: string
      email?: string
      password?: string
    }
  ) => {
    try {
      const req = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      })
      if (!req.ok) throw new Error('Failed to update user')
      const res = await req.json()
      setMentor((prev) => prev.map((m) => (m._id === id ? res : m)))
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const req = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!req.ok) throw new Error('Failed to delete user')
      await req.json()
      setMentor((prev) => prev.filter((m) => m._id !== id))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    cssEase: 'linear',
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 1000, settings: { slidesToShow: 2 } },
      { breakpoint: 530, settings: { slidesToShow: 1 } },
    ],
  }

  const openCreateModal = () => {
    setModalMode('create')
    setActiveUserId(null)
    setForm({
      name: '',
      adresse: '',
      matricule: '',
      grade: 'ADMIN',
      fonction: '',
      email: '',
      password: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (u: UserType) => {
    setModalMode('edit')
    setActiveUserId(u._id)
    setForm({
      name: (u as any)?.nomComplet || '',
      adresse: (u as any)?.adresse || '',
      matricule: (u as any)?.matricule || '',
      grade: (u as any)?.grade || 'ADMIN',
      fonction: (u as any)?.fonction || '',
      email: (u as any)?.email || '',
      password: '', // jamais pré-remplir le password
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (submitting) return
    setIsModalOpen(false)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    try {
      if (modalMode === 'create') {
        await handleCreate(form)
        setIsModalOpen(false)
        return
      }

      if (!activeUserId) return

      const payload: any = { ...form }
      if (!payload.password?.trim()) delete payload.password

      await handleUpdate(activeUserId, payload)
      setIsModalOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className='bg-deep-slate scroll-mt-12' id='mentor'>
      <div className='container relative'>
        <h2 className='text-midnight_text max-w-96 leading-12 lg:leading-14'>
          Notre Equipe
        </h2>

        <Slider {...settings}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <MentorSkeleton key={i} />)
            : [
                ...mentor.map((items, i) => (
                  <div key={items._id || i}>
                    <div
                      className='m-3 py-14 mt-10 text-center rounded-2xl bg-white shadow-md relative cursor-pointer hover:shadow-lg transition'
                      onClick={() => openEditModal(items)}
                      role='button'
                      tabIndex={0}
                    >
                      {/* badge delete */}
                      <button
                        type='button'
                        className='absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-red-600 text-white text-xs px-3 py-1 shadow hover:bg-red-700'
                        onClick={(e) => {
                          e.stopPropagation()
                          void handleDelete(items._id)
                        }}
                        title='Supprimer'
                      >
                        <Icon icon={mdTrash} width={14} height={14} />
                        Supprimer
                      </button>

                      <div className='relative mb-10'>
                        <Image
                          src={items?.photo || '/images/mentor/user1.webp'}
                          alt='user-image'
                          width={206}
                          height={206}
                          className='inline-block m-auto rounded-full border border-black/10'
                        />
                        <div className='absolute right-[22%] -bottom-[2%] bg-white rounded-full p-4'>
                          <span className='text-sm font-medium text-gray-800'>
                            {(items as any)?.grade}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h6>{(items as any)?.nomComplet}</h6>
                        <p className='text-lg font-normal text-black/50 pt-2'>
                          {(items as any)?.fonction}
                        </p>
                        <div className='mt-4 inline-flex items-center gap-2 text-sm text-black/60'>
                          <Icon icon={mdCreate} width={16} height={16} />
                          Modifier
                        </div>
                      </div>
                    </div>
                  </div>
                )),

                // Add card (+)
                <div key='add-card'>
                  <div
                    className='m-3 py-14 mt-10 text-center rounded-2xl bg-white/80 border border-dashed border-black/20 shadow-sm hover:shadow-md cursor-pointer transition flex items-center justify-center min-h-[420px]'
                    onClick={openCreateModal}
                    role='button'
                    tabIndex={0}
                  >
                    <div className='flex flex-col items-center justify-center gap-3'>
                      <div className='w-16 h-16 rounded-full bg-black/5 flex items-center justify-center'>
                        <Icon icon={mdAdd} width={34} height={34} className='text-black/70' />
                      </div>
                      <p className='text-base font-medium text-black/70'>
                        Ajouter un utilisateur
                      </p>
                    </div>
                  </div>
                </div>,
              ]}
        </Slider>

        {/* Modal Create/Update */}
        {isModalOpen && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
            onClick={closeModal}
            role='dialog'
            aria-modal='true'
          >
            <div
              className='w-full max-w-xl rounded-2xl bg-white shadow-xl p-6'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h3 className='text-xl font-semibold text-black'>
                    {modalMode === 'create' ? 'Créer un utilisateur' : 'Modifier l’utilisateur'}
                  </h3>
                  <p className='text-sm text-black/60 mt-1'>
                    Renseigne les informations ci-dessous.
                  </p>
                </div>
                <button
                  type='button'
                  className='text-black/60 hover:text-black px-2 py-1'
                  onClick={closeModal}
                  disabled={submitting}
                >
                  ✕
                </button>
              </div>

              <form className='mt-6 grid grid-cols-1 gap-4' onSubmit={onSubmit}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-black/70'>Nom complet</label>
                    <input
                      className='mt-1 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10'
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-black/70'>Email</label>
                    <input
                      type='email'
                      className='mt-1 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10'
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-black/70'>Matricule</label>
                    <input
                      className='mt-1 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10'
                      value={form.matricule}
                      onChange={(e) => setForm((p) => ({ ...p, matricule: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-black/70'>Fonction</label>
                    <input
                      className='mt-1 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10'
                      value={form.fonction}
                      onChange={(e) => setForm((p) => ({ ...p, fonction: e.target.value }))}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-black/70'>Grade</label>
                    <select
                      className='mt-1 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10'
                      value={form.grade}
                      onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))}
                    >
                      <option value='SUPER_ADMIN'>SUPER_ADMIN</option>
                      <option value='ADMIN'>ADMIN</option>
                      <option value='FINANCE'>FINANCE</option>
                      <option value='RECHERCHE'>RECHERCHE</option>
                      <option value='ENSEIGNANT'>ENSEIGNANT</option>
                      <option value='ETUDIANT'>ETUDIANT</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-black/70'>Adresse</label>
                    <input
                      className='mt-1 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10'
                      value={form.adresse}
                      onChange={(e) => setForm((p) => ({ ...p, adresse: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-black/70'>
                    Mot de passe {modalMode === 'edit' && '(laisser vide pour ne pas changer)'}
                  </label>
                  <input
                    type='password'
                    className='mt-1 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10'
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    required={modalMode === 'create'}
                  />
                </div>

                <div className='mt-2 flex items-center justify-end gap-3'>
                  <button
                    type='button'
                    className='rounded-xl px-4 py-2 border border-black/10 text-black/70 hover:bg-black/5'
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                  <button
                    type='submit'
                    className='rounded-xl px-5 py-2 bg-black text-white hover:bg-black/90 disabled:opacity-60'
                    disabled={submitting}
                  >
                    {submitting ? 'En cours...' : modalMode === 'create' ? 'Créer' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Users
