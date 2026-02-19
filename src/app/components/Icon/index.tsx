'use client'

import { Icon as IconifyIcon } from '@iconify/react'

interface IconProps {
  icon: string
  className?: string
  width?: number | string
  height?: number | string
}

export default function Icon({ icon, className, width, height }: IconProps) {
  return (
    <IconifyIcon
      icon={icon}
      className={className}
      width={width}
      height={height}
    />
  )
}
