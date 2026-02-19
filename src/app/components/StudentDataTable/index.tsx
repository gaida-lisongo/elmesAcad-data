'use client'

import { useState, useRef } from 'react'
import { Icon } from '@iconify/react'
import {
  createSubscription,
  createSubscriptionsFromCSV,
  deleteSubscription,
} from '@/app/actions/subscription.actions'
import {
  createStudent,
  updateStudent,
  deleteStudent,
} from '@/app/actions/student.actions'
import { StudentType } from '@/app/actions/student.actions'

interface EnrolledStudent {
  _id: string
  subscription: {
    _id: string
    isValid: boolean
  }
  etudiant: StudentType
}

interface StudentDataTableProps {
  initialStudents: EnrolledStudent[]
  promotionId: string
  promotionName: string
  anneeId: string
  anneeName: string
  onRefresh: () => void
}

const StudentDataTable = ({
  initialStudents,
  promotionId,
  promotionName,
  anneeId,
  anneeName,
  onRefresh,
}: StudentDataTableProps) => {
  const [students, setStudents] = useState<EnrolledStudent[]>(initialStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [csvFile, setCSVFile] = useState<File | null>(null)
  const [csvPreview, setCSVPreview] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    telephone: '',
    adresse: '',
    matricule: '',
    grade: 'L1',
    password: '',
  })

  const filteredStudents = students.filter((item) => {
    const student = item.etudiant
    const searchLower = searchTerm.toLowerCase()
    return (
      student.nomComplet.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      (student.matricule && student.matricule.toLowerCase().includes(searchLower))
    )
  })

  const handleOpenModal = (student?: StudentType) => {
    if (student) {
      setEditingStudent(student)
      setFormData({
        nomComplet: student.nomComplet,
        email: student.email,
        telephone: student.telephone || '',
        adresse: student.adresse || '',
        matricule: student.matricule || '',
        grade: student.grade,
        password: '',
      })
    } else {
      setEditingStudent(null)
      setFormData({
        nomComplet: '',
        email: '',
        telephone: '',
        adresse: '',
        matricule: '',
        grade: 'L1',
        password: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingStudent(null)
    setFormData({
      nomComplet: '',
      email: '',
      telephone: '',
      adresse: '',
      matricule: '',
      grade: 'L1',
      password: '',
    })
  }

  const handleSave = async () => {
    if (!formData.nomComplet || !formData.email || !formData.grade) {
      alert('Veuillez remplir tous les champs requis')
      return
    }

    if (!editingStudent && !formData.password) {
      alert('Le mot de passe est requis pour un nouvel étudiant')
      return
    }

    setIsLoading(true)
    try {
      if (editingStudent) {
        // Update existing student
        const updateData: any = {
          nomComplet: formData.nomComplet,
          email: formData.email,
          telephone: formData.telephone,
          adresse: formData.adresse,
          matricule: formData.matricule,
          grade: formData.grade,
        }
        if (formData.password) {
          updateData.password = formData.password
        }

        const result = await updateStudent(editingStudent._id, updateData)

        if (!result.success) {
          alert(result.error || 'Une erreur est survenue')
          return
        }

        // Update in local state
        if (result.data) {
          setStudents(
            students.map((item) =>
              item.etudiant._id === editingStudent._id
                ? { ...item, etudiant: result.data! }
                : item
            )
          )
        }
      } else {
        // Create new student
        const studentResult = await createStudent({
          nomComplet: formData.nomComplet,
          email: formData.email,
          telephone: formData.telephone,
          adresse: formData.adresse,
          matricule: formData.matricule,
          grade: formData.grade,
          password: formData.password,
        })

        if (!studentResult.success || !studentResult.data) {
          alert(studentResult.error || 'Une erreur est survenue')
          return
        }

        // Create subscription
        const subscriptionResult = await createSubscription({
          etudiantId: studentResult.data._id,
          promotionId: promotionId,
          anneeId: anneeId,
        })

        if (!subscriptionResult.success) {
          alert(subscriptionResult.error || 'Une erreur est survenue')
          return
        }

        // Refresh the list
        onRefresh()
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving student:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (subscriptionId: string) => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir supprimer cette inscription ? L\'étudiant ne sera pas supprimé.'
      )
    )
      return

    setIsLoading(true)
    try {
      const result = await deleteSubscription(subscriptionId)

      if (!result.success) {
        alert(result.error || 'Une erreur est survenue')
        return
      }

      setStudents(students.filter((item) => item.subscription._id !== subscriptionId))
    } catch (error) {
      console.error('Error deleting subscription:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      alert('Veuillez sélectionner un fichier CSV')
      return
    }

    setCSVFile(file)

    // Read and parse CSV
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter((line) => line.trim())

      if (lines.length < 2) {
        alert('Le fichier CSV doit contenir au moins une ligne de données')
        return
      }

      const headers = lines[0].split(',').map((h) => h.trim())
      const preview = lines.slice(1, 6).map((line) => {
        const values = line.split(',').map((v) => v.trim())
        const obj: any = {}
        headers.forEach((header, i) => {
          obj[header] = values[i] || ''
        })
        return obj
      })

      setCSVPreview(preview)
    }
    reader.readAsText(file)
  }

  const handleCSVUpload = async () => {
    if (!csvFile) {
      alert('Veuillez sélectionner un fichier CSV')
      return
    }

    setIsLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const text = event.target?.result as string
        const lines = text.split('\n').filter((line) => line.trim())

        if (lines.length < 2) {
          alert('Le fichier CSV doit contenir au moins une ligne de données')
          setIsLoading(false)
          return
        }

        const headers = lines[0].split(',').map((h) => h.trim())
        const csvData = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim())
          const obj: any = {}
          headers.forEach((header, i) => {
            obj[header] = values[i] || ''
          })
          return {
            nomComplet: obj.nomComplet || obj.nom || '',
            email: obj.email || '',
            telephone: obj.telephone || obj.tel || '',
            adresse: obj.adresse || '',
            matricule: obj.matricule || '',
            grade: obj.grade || 'L1',
            password: obj.password || obj.motdepasse || 'default123',
          }
        })

        const result = await createSubscriptionsFromCSV(
          promotionId,
          anneeId,
          csvData
        )

        if (!result.success) {
          alert(result.error || 'Une erreur est survenue')
          setIsLoading(false)
          return
        }

        if (result.data) {
          const { created, errors } = result.data
          let message = `${created} étudiant(s) inscrit(s) avec succès.`
          if (errors.length > 0) {
            message += `\n\nErreurs (${errors.length}):\n${errors.slice(0, 5).join('\n')}`
            if (errors.length > 5) {
              message += `\n... et ${errors.length - 5} autres erreurs`
            }
          }
          alert(message)
        }

        handleCloseCSVModal()
        onRefresh()
        setIsLoading(false)
      }
      reader.readAsText(csvFile)
    } catch (error) {
      console.error('Error uploading CSV:', error)
      alert('Une erreur est survenue')
      setIsLoading(false)
    }
  }

  const handleCloseCSVModal = () => {
    setIsCSVModalOpen(false)
    setCSVFile(null)
    setCSVPreview([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className='py-8'>
      {/* Header */}
      <div className='flex items-center justify-between gap-4 mb-6'>
        <div>
          <h2 className='text-2xl font-bold mb-1 text-black'>{promotionName}</h2>
          <p className='text-sm text-gray-600'>
            Année académique: {anneeName} • {students.length} étudiant(s)
          </p>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={() => setIsCSVModalOpen(true)}
            className='bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2'
          >
            <Icon icon='material-symbols:upload-file' width={20} height={20} />
            Import CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            className='bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2'
          >
            <Icon icon='material-symbols:add' width={20} height={20} />
            Inscrire
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className='mb-6'>
        <div className='relative'>
          <Icon
            icon='material-symbols:search'
            width={20}
            height={20}
            className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'
          />
          <input
            type='text'
            placeholder='Rechercher par nom, email ou matricule...'
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
                  Étudiant
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
                  Statut
                </th>
                <th className='px-6 py-4 text-center text-sm font-semibold text-gray-900'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className='px-6 py-8 text-center text-gray-500'>
                    Aucun étudiant inscrit
                  </td>
                </tr>
              ) : (
                filteredStudents.map((item) => {
                  const student = item.etudiant
                  return (
                    <tr key={item._id} className='hover:bg-gray-50 transition'>
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
                            {student.nomComplet}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {student.email}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {student.telephone || '-'}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {student.matricule || '-'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <span className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>
                          {student.grade}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            item.subscription.isValid
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.subscription.isValid
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          />
                          {item.subscription.isValid ? 'Valide' : 'Invalide'}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <div className='flex items-center justify-center gap-3'>
                          <button
                            onClick={() => handleOpenModal(student)}
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
                            onClick={() => handleDelete(item.subscription._id)}
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg px-8 pt-14 pb-8 bg-white max-h-[90vh] overflow-y-auto'>
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
              {editingStudent ? 'Modifier l\'étudiant' : 'Inscrire un étudiant'}
            </h2>

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
                  Téléphone
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
                <input
                  type='text'
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                  disabled={isLoading}
                  className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
                  placeholder='L1, L2, L3...'
                />
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
                  Mot de passe{' '}
                  {editingStudent ? (
                    '(laisser vide pour ne pas modifier)'
                  ) : (
                    <span className='text-red-500'>*</span>
                  )}
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

      {/* CSV Upload Modal */}
      {isCSVModalOpen && (
        <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='relative mx-auto w-full max-w-3xl overflow-hidden rounded-lg px-8 pt-14 pb-8 bg-white max-h-[90vh] overflow-y-auto'>
            <button
              onClick={handleCloseCSVModal}
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

            <h2 className='text-2xl font-bold mb-2 text-black'>
              Import CSV - Inscription en masse
            </h2>
            <p className='text-sm text-gray-600 mb-6'>
              Format attendu: nomComplet, email, telephone, adresse, matricule,
              grade, password
            </p>

            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Fichier CSV
              </label>
              <input
                ref={fileInputRef}
                type='file'
                accept='.csv'
                onChange={handleFileChange}
                disabled={isLoading}
                className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50'
              />
            </div>

            {csvPreview.length > 0 && (
              <div className='mb-6'>
                <h3 className='text-sm font-semibold text-gray-700 mb-2'>
                  Aperçu (5 premières lignes)
                </h3>
                <div className='overflow-x-auto border border-gray-200 rounded-lg'>
                  <table className='w-full text-xs'>
                    <thead className='bg-gray-50'>
                      <tr>
                        {Object.keys(csvPreview[0]).map((key) => (
                          <th
                            key={key}
                            className='px-3 py-2 text-left font-semibold text-gray-700'
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                      {csvPreview.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className='px-3 py-2 text-gray-600'>
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className='flex gap-4 justify-end'>
              <button
                onClick={handleCloseCSVModal}
                disabled={isLoading}
                className='px-6 py-3 rounded-lg font-medium border border-primary text-primary hover:bg-primary hover:text-white transition disabled:opacity-50'
              >
                Annuler
              </button>
              <button
                onClick={handleCSVUpload}
                disabled={isLoading || !csvFile}
                className='px-6 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50'
              >
                {isLoading ? 'Traitement...' : 'Importer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDataTable
