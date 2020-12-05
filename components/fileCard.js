import PropTypes from 'prop-types'
import styles from '../styles/Home.module.css'

function FileCard ({ name, size, deleting, onDelete }) {
  return (<li className={`${styles.file_card} ${deleting ? styles.delete_progress : ''}`}>
    <h3 title={ name }>{ name }</h3>
    <footer>
      <span>{ size }</span>
      <button
        disabled={deleting}
        className={styles.delete_btn}
        onClick={(e) => {
          e.preventDefault()
          onDelete()
        }}
      >delete</button>
    </footer>
  </li>)
}

FileCard.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
  deleting: PropTypes.bool,
  onDelete: PropTypes.func.isRequired
}

export default FileCard
