import './globals.css'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '어디서 먹을까',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head></head>
      <body>
        <section className='max-w-screen-sm mx-auto bg-white'>
        <div className='flex flex-col items-center pb-12 px-4 title-wrap'>
          <h2 className='text-3xl font-black py-6 text-gray-700'>
            <Link href={"/"}>어디서 먹을까?🤔</Link>
          </h2>
          <div className='text-sm font-medium text-gray-500 text-center break-keep'>
            직장에서, 여행지에서, 약속 장소에서 어디서 식사할지 고민이신가요?<br/>
            지역과 카테고리에 따라 무작위로 골라드립니다 :)
          </div>
        </div>
          {children}
        </section>
      </body>
    </html>
  )
}
