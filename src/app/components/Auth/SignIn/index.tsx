'use client'

import Link from 'next/link'
import SocialSignIn from '../SocialSignIn'
import Logo from '@/app/components/Layout/Header/Logo'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

export const renderLoader = () => (
  <div className='flex items-center justify-center'>
    <div className='loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4'></div>
  </div>
)

const Signin = ({ onSuccess }: { onSuccess?: () => void }) => {
  const setSession = useAuthStore((state) => state.setSession)
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    matricule: '',
    password: '',
  })

  const login = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()
      console.log('Login successful:', data)

      if (data.token && data.user) {
        setSession({ user: data.user, token: data.token });

        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/'); // Redirect to home page after successful login
        }
      }
    } catch (error) {
      console.error('Error during login:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return renderLoader()
  }

  return (
    <>
      <div className='mb-10 text-center mx-auto inline-block'>
        <Logo />
      </div>

      <SocialSignIn />

      <span className='z-1 relative my-8 block text-center  before:absolute before:h-px before:w-[40%] before:bg-black/20 before:left-0 before:top-3  after:absolute after:h-px after:w-[40%] after:bg-black/20 after:top-3 after:right-0'>
        <span className='text-body-secondary relative z-10 inline-block px-3 text-base text-black'>
          OR
        </span>
      </span>

      <form onSubmit={(e) => { e.preventDefault(); login(); }}>
        <div className='mb-[22px]'>
          <input
            type='text'
            placeholder='Matricule'
            value={formData.matricule}
            onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-[22px]'>
          <input
            type='password'
            placeholder='Password'
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-9'>
          <button

            type='submit'
            className='bg-primary w-full py-3 rounded-lg text-18 font-medium border text-white border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'>
            Se connecter
          </button>
        </div>
      </form>

      <Link
        href='/'
        className='mb-2 inline-block text-base text-black hover:text-primary  hover:underline'>
        Mot de passe oublié ?
      </Link>
      <p className='text-black text-base'>
        Pas encore membre ?{' '}
        <Link href='/' className='text-primary hover:underline'>
          S'inscrire
        </Link>
      </p>
    </>
  )
}

export default Signin
