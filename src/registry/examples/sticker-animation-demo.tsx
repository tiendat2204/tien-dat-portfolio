import React from 'react'
import Sticker1 from '@/img/image1.png'
import { StickerCop } from '../StickerCop'

const StickerAnimationDemo = () => {
  const stickers = [
    {
      id: 'sticker1',
      frameCount: 20,
      frameRate: 10,
      framesPerCol: 4,
      framesPerRow: 5,
      spriteImg: Sticker1,
    }
  ]

  return (
    <div className='flex flex-col items-center justify-center   '>
      <div className='grid grid-cols-1 w-fit mx-auto bg-background dark:bg-zinc-800  rounded-xl  dark:shadow-zinc-900/20  gap-4 mb-6 transition-colors duration-300'>
        {stickers.map((sticker) => (
          <StickerCop
            key={sticker.id}
            id={sticker.id}
            frameCount={sticker.frameCount}
            frameRate={sticker.frameRate}
            framesPerCol={sticker.framesPerCol}
            framesPerRow={sticker.framesPerRow}
            spriteImg={sticker.spriteImg.src}
          />
        ))}
      </div>
    </div>
  )
}

export default StickerAnimationDemo
