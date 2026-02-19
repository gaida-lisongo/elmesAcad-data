export type MentorType = {
  profession: string
  name: string
  imgSrc: string
}

export type UserType = {
  _id: string
  nomComplet: string
  email: string
  telephone: string
  adresse?: string
  matricule?: string
  photo?: string
  autorisations: string[]
  grade: string
  fonction?: string
  passwordHash: string
}
