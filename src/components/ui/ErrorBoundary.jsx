import { Component } from 'react'

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
      <div className="glass-card estado-vacio" role="alert">
        <i className="fas fa-exclamation-triangle" aria-hidden="true" />
        <h2>Esta sección no se pudo mostrar</h2>
        <p>Recarga la página. Si vuelve a pasar, avisa al administrador.</p>
        <button type="button" className="btn-outline" onClick={() => this.setState({ error: null })}>
          Intentar de nuevo
        </button>
      </div>
    )
  }
}
