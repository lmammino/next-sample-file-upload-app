import PropTypes from 'prop-types'
import '../styles/globals.css'

function MyApp ({ Component, pageProps }) {
  return <Component {...pageProps} />
}

MyApp.propTypes = {
  Component: PropTypes.element.isRequired,
  pageProps: PropTypes.object
}

export default MyApp
