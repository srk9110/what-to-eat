'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const categoryOptions = [
  {value: "FD6", label: "음식점"},
  {value: "CE7", label: "카페"}
];

type CategoryOption = {
  value: string;
  label: string;
};

type LocalProps = {
  address_name: string;
  x: string;
  y: string;
};

export default function Home() {
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<CategoryOption>();
  const [local, setLocal] = useState<LocalProps>();
  const [localList, setLocalList] = useState<LocalProps[]>([]);

  const router = useRouter();

  const handler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const goUrl = () => {
    if(local) {
      router.push(`/result?category=${category?.value}&local=${local.address_name}&x=${local.x}&y=${local.y}`);
    }
  };

  const categoryHandler = (option: CategoryOption) => {
    setCategory(option);
  };

  const localHandler = (item: LocalProps) => {
    setLocal(item);
  };

  const getLocalSearch = async () => {
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set('Content-Type', 'application/json;charset=UTF-8');
    requestHeaders.set('Authorization', `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`);

    const url = "https://dapi.kakao.com/v2/local/search/address.json?";

    await fetch(`${url}query=${search}&size=10`, 
    {
        method: "GET",
        headers: requestHeaders
    })
    .then(resp => resp.json())
    .then(data => {
      if(data?.documents?.length) {
        const arr: LocalProps[] = data.documents.map((item: LocalProps) => (
          {
            address_name: item.address_name,
            x: item.x,
            y: item.y
          }
        ));
        setLocalList(arr);
      }
  });
}

  return (
    <section className='w-full'>
      <div className='flex flex-col px-4'>
        <div className='mb-10'>
          <h3 className='text-l font-medium mb-3'>카테고리를 선택해주세요.</h3>
          <div className='flex gap-3 justify-center'>
            {
              categoryOptions.length ? 
                categoryOptions.map((option, index) => (
                  <button key={index}
                          className={`${category?.value === option.value ? "bg-orange-400" : "bg-gray-400"} w-32 px-3 py-2 text-white rounded-lg shadow-md`}
                          onClick={() => {categoryHandler(option)}}>
                          {option.label}
                  </button>
                ))
              : null  
            }
          </div>
        </div>
        <div className='mb-10'>
          <h3 className='text-l font-medium mb-3'>방문할 지역을 입력해주세요.</h3>
          <div className='flex w-full shadow-md mb-6'>
            <input className='w-full h-10 rounded-1-lg p-2' type='text' value={search} onChange={(e) => handler(e)}/>
            <button className='flex-shrink-0 rounded-r-lg bg-orange-400 px-3 py-2 text-white' onClick={() => getLocalSearch()}>검색</button>
          </div>
          {
            localList.length ? 
              <>
                <div className='mb-4'>지역 {localList.length}개가 검색되었어요. 정확한 지역을 선택해주세요!</div>
                <div className='flex flex-col gap-3 pb-36'>
                  {
                    localList.map((item, index) => (
                      <button key={index} 
                              className={`${local === item ? "bg-orange-400" : "bg-gray-400"} rounded-lg shadow-md text-white  p-2 text-left`}
                              onClick={() => localHandler(item)}>
                                {item.address_name}
                      </button>
                    ))
                  }
                </div>
              </>
            : null  
          }
        </div>
      </div>
      <div className='bg-white flex flex-col items-center max-w-screen-sm w-full fixed bottom-0 p-6 rounded-lg shadow-[-1px_-1px_15px_1px_rgba(0,0,0,0.2)]'>
        <div className='mb-3'>
          {
            !category || !local ? 
              <div>
                {!category && !local ? "카테고리와 지역을 "
                  : !category ? "카테고리를 " 
                    : "지역을 "}
                  선택해주세요
              </div> 
            : <div>{local.address_name}에서 {category.label}{category.label === "음식점" ? "을" : "를"} 뽑아볼까요? (최대 5개)</div>
          }
        </div>
        <button className={`w-64 text-center inline-block px-3 py-2 rounded-lg text-white ${category && local ? "bg-orange-400" : "bg-gray-400"}`}
                disabled={!local}
                onClick={() => {goUrl()}}>
          뽑으러 가기
        </button>
      </div>
    </section>
  );
}
