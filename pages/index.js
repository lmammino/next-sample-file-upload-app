import Head from 'next/head'
import styles from '../styles/Home.module.css'
import FileCard from '../components/fileCard'

const data = {
  files: [
    { name: '1999229.png', size: 43090 },
    { name: '457cc040ca23e98d84f70d215111255c.jpg', size: 11572 },
    { name: '9b822e70053cb1f65dfd7a99fcd6d98a-best-quality-badge-by-vexels.png', size: 28655 },
    { name: 'best-of-the-best-png-transparent-best-of-the-bestpng-images-best-png-600_285.png', size: 89183 },
    { name: 'best-png-images-6.png', size: 22476 },
    { name: 'pngtree-simple-best-seller-symbol-png-image_5299870.jpg', size: 425441 },
    { name: 'unnamed.png', size: 178725 }
  ],
  totalSize: 799142
}

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
          { data.files.map(f => {
            return <FileCard key={ f.name } name={ f.name } size={ f.size } onDelete={() => console.log(f.name)} />
          }) }
        </ul>
      </main>
    </div>
  )
}
