import React from 'react'
import logoUrl from '../assets/logo.svg'

/* ============================================================
   LOGO DO VINHASENSE  —  é aqui que você troca pela sua logo
   ------------------------------------------------------------
   Jeito mais fácil: SUBSTITUA o arquivo  src/assets/logo.svg
   pela sua imagem (mantenha o mesmo nome).
   Se a sua for PNG/JPG/WEBP, coloque em src/assets/ e mude a
   linha do import lá em cima, ex.:
       import logoUrl from '../assets/minha-logo.png'
   O nome ao lado da logo é BRAND_NAME logo abaixo.
   ============================================================ */
export const BRAND_NAME = 'VinhaSense'

export default function Logo({ showName = true }) {
  return (
    <>
      <div className="logo"><img src={logoUrl} alt={showName ? '' : BRAND_NAME} /></div>
      {showName && BRAND_NAME}
    </>
  )
}
