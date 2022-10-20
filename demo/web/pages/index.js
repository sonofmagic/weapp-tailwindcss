// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'

export default function Home() {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <ul role="list">
        {arr.map((item) => {
          return (
            <li key={item} className="[&:nth-child(3)]:underline">
              {item}
            </li>
          )
        })}
      </ul>
      <ul role="list">
        {arr.map((item) => {
          return (
            <li key={item} className="lg:[&:nth-child(3)]:first-letter:underline">
              abc{item}
            </li>
          )
        })}
      </ul>
    </>
  )
}
