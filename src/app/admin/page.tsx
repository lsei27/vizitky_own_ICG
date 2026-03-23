import { getCards } from '@/app/actions/card'
import CardForm from './CardForm'
import styles from './admin.module.css'

export default async function AdminPage() {
  const cards = await getCards()

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>Správa vizitek</h1>
      </div>
      <CardForm initialCards={cards} />
    </main>
  )
}
