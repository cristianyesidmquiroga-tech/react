import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

// Crea el gráfico al montar y lo destruye al salir para no dejar lienzos colgados
export default function Grafica({ tipo, datos, opciones, alto = 350, etiqueta }) {
  const lienzo = useRef(null)

  useEffect(() => {
    const grafico = new Chart(lienzo.current, { type: tipo, data: datos, options: { responsive: true, maintainAspectRatio: false, ...opciones } })
    return () => grafico.destroy()
  }, [tipo, datos, opciones])

  return (
    <div className="grafica" style={{ height: alto }}>
      <canvas ref={lienzo} role="img" aria-label={etiqueta} />
    </div>
  )
}
