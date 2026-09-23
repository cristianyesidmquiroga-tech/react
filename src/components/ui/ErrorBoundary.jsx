import { Component } from 'react'
import { TriangleAlert } from 'lucide-react'

// Si una vista falla al pintarse, se aísla el fallo y el resto de la aplicación sigue funcionando
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Error al mostrar la vista', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="estado estado--error" role="alert">
        <TriangleAlert size={32} aria-hidden="true" />
        <h2>Esta sección no se pudo mostrar</h2>
        <p>Recarga la página. Si vuelve a pasar, avisa al administrador.</p>
        <button type="button" className="boton boton--secundario" onClick={() => this.setState({ error: null })}>
          Intentar de nuevo
        </button>
      </div>
    )
  }
}
