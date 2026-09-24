import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
// Misma clave y mismo atributo que Portería 2
const CLAVE = 'theme'

function temaInicial() {
  try {
    return localStorage.getItem(CLAVE) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    const raiz = document.documentElement
    if (tema === 'dark') raiz.setAttribute('data-theme', 'dark')
    else raiz.removeAttribute('data-theme')
    try {
      localStorage.setItem(CLAVE, tema)
    } catch {
      // no es crítico si no se puede guardar
    }
  }, [tema])

  const alternar = useCallback(() => setTema((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const valor = useMemo(() => ({ tema, alternar }), [tema, alternar])

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>
}

export const useTema = () => useContext(ThemeContext)
