import PropTypes from 'prop-types'
import styles from '../styles/Home.module.css'

function FileCard ({ name, size, onDelete }) {
  return (<li className={styles.file_card}>
    <h3 title={ name }>{ name }</h3>
    <footer>
      <span>{ size }</span>
      <button className={styles.delete_btn} onClick={onDelete}>delete</button>
    </footer>
  </li>)
}

FileCard.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default FileCard
