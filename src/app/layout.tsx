import './globals.css'
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
      <head>
      <script
        type="text/javascript"
        src="//dapi.kakao.com/v2/maps/sdk.js?appkey=246a4b82711acbbbb55f493b4eb884ea&libraries=services,clusterer"
      ></script>
      </head>
      <body>
        <section className='max-w-screen-sm pt-8 mx-auto bg-white'>
        <div className='flex flex-col items-center mb-12 px-4'>
          <h2 className='text-3xl font-bold underline pb-6'>
            어디서 먹을까?
          </h2>
          <div className='font-medium text-gray-500 text-center'>
            직장에서, 여행지에서, 약속 장소에서 어디서 식사할지 고민이신가요?<br/>
            지역과 카테고리에 따라 무작위로 골라보세요 :)
          </div>
        </div>
          {children}
        </section>
      </body>
    </html>
  )
}
