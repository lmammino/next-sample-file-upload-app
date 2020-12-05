import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home () {
  return (
    <div className={styles.container}>
      <Head>
        <title>File manager</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <nav className={styles.nav}>
          <button className={styles.upload_btn}>UPLOAD</button>
          <input className={styles.search_input} type="text" placeholder="Search documents..." />
        </nav>
        <header className={styles.header}>
          <h2>6 documents</h2>
          <span>Total size: 600kb</span>
        </header>
        <ul className={styles.files_container}>
          <li>
            <h3>Doc1</h3>
            <footer>
              <span>100kb</span>
              <button className={styles.delete_btn}>delete</button>
            </footer>
          </li>
          <li>
            <h3>Doc2</h3>
            <footer>
              <span>100kb</span>
              <button className={styles.delete_btn}>delete</button>
            </footer>
          </li>
          <li>
            <h3>Doc3</h3>
            <footer>
              <span>100kb</span>
              <button className={styles.delete_btn}>delete</button>
            </footer>
          </li>
          <li>
            <h3>Doc4</h3>
            <footer>
              <span>100kb</span>
              <button className={styles.delete_btn}>delete</button>
            </footer>
          </li>
          <li>
            <h3>Doc5</h3>
            <footer>
              <span>100kb</span>
              <button className={styles.delete_btn}>delete</button>
            </footer>
          </li>
          <li>
            <h3>Doc6</h3>
            <footer>
              <span>100kb</span>
              <button className={styles.delete_btn}>delete</button>
            </footer>
          </li>
        </ul>
      </main>
    </div>
  )
}
