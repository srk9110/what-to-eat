import './globals.css'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '어디서 뭐 먹을까',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&&family=Do+Hyeon&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <section className='max-w-screen-sm mx-auto bg-white'>
        <div className='flex flex-col items-center pb-12 px-4 title-wrap'>
          <h2 className='title text-3xl py-6 text-gray-700 font-normal'>
            <Link href={"/"}>어디서 뭐 먹을까?🤔</Link>
          </h2>
          <div className='text-gray-500 text-center break-keep text-base'>
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
