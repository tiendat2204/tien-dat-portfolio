import Image from 'next/image'
import { ProductCardClient } from '../DynamicColorExtraction'

export default function ProductCardDemo () {
  const booksData = [
    {
      id: '1',
      title: 'Quang Nam Memories',
      coverImage: '/blog/charity-quang-nam.JPG',
      author: 'Tien Dat Dev'
    },
    {
      id: '2',
      title: "It's me",
      coverImage: '/me.jpg',
      author: 'Tien Dat Dev'
    },
    {
      id: '3',
      title: 'Shadcn UI Sticker',
      coverImage: '/freelancer.jpeg',
      author: 'Tien Dat Dev'
    }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4'>
      {booksData.map((book) => (
        <ProductCardClient key={book.id} data={book}>
          <div className='p-4'>
            <Image src={book.coverImage} alt={book.title} width={500} height={500} />
            <h3 className='mt-2 font-bold'>{book.title}</h3>
            <p className='text-sm text-gray-600'>{book.author}</p>
          </div>
        </ProductCardClient>
      ))}
    </div>
  )
}
