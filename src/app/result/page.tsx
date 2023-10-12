'use client';

import {useState, useEffect, useRef} from 'react';
import { useSearchParams } from 'next/navigation'
import Link from 'next/link';

interface Info {
    place_name?: string;
    place_url?: string;
    road_address_name?: string;
    address_name?: string;
    category_name?: string;
    phone?: string;
    x?: number;
    y?: number;
};

declare global {
    interface Window {
        kakao: any;
    }
}

export default function Result(){
    const params = useSearchParams();
    const local = params.get('local');
    const category = params.get('category');
    const x = Number(params.get('x'));
    const y = Number(params.get('y'));
    
    const [page, setPage] = useState<number>(1);
    const [originList, setOriginList] = useState<any>([]);
    const [list, setList] = useState<Info[]>([]);
    const [isPageEnd, setIsPageEnd] = useState<boolean>(false);
    const [selectedOne, setSelectedOne] = useState<Info>();
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollOneRef = useRef<HTMLDivElement>(null);

    const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_API_KEY}&autoload=false`;
    let kakaoMapScript: HTMLScriptElement | null = null;
    
    useEffect(() => {
        getCategorySearch();
    },[page]);
    
    useEffect(() => {
        if(list && list.length) {
            if(!kakaoMapScript){
                kakaoMapScript = document.createElement('script');
                kakaoMapScript.async = false;
                kakaoMapScript.src = KAKAO_SDK_URL;
                document.head.appendChild(kakaoMapScript);
            }

            const onLoadKakaoAPI = () => {
                window.kakao.maps.load(() => {
                    let container, map, markerPosition, marker = null;

                    list.map((item, index) => {
                        container = document.getElementById("map_"+index);
                        map = new window.kakao.maps.Map(
                            container, 
                            {
                                center: new window.kakao.maps.LatLng(item?.y, item?.x),
                                level: 3,
                            }
                        );
                        markerPosition  = new window.kakao.maps.LatLng(item?.y, item?.x);
                        marker = new window.kakao.maps.Marker({position: markerPosition});
                        marker.setMap(map);
                    });
                });
            }
            
            kakaoMapScript?.addEventListener('load', onLoadKakaoAPI);
            scrollRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }
    }, [list]);

    useEffect(() => {
        if(!selectedOne) return;

        const container = document.getElementById("map_selected");
        const map = new window.kakao.maps.Map(
            container,
            {
                center: new window.kakao.maps.LatLng(selectedOne?.y, selectedOne?.x),
                level: 3,
            }
        );
        const markerPosition  = new window.kakao.maps.LatLng(selectedOne?.y, selectedOne?.x);
        const marker = new window.kakao.maps.Marker({position: markerPosition});
        marker.setMap(map);

        scrollOneRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [selectedOne]);

    const getCategorySearch = async() => {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json');
        requestHeaders.set('Authorization', `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`);
    
        const url = "https://dapi.kakao.com/v2/local/search/category.json?";
    
        await fetch(`${url}category_group_code=${category}&x=${x}&y=${y}&radius=1000&size=10&page=${page}`, 
        {
            method: "GET",
            headers: requestHeaders
        })
        .then(resp => resp.json())
        .then(data => {
            if(data?.documents?.length) {
                let resultArray = makeRandomList(data.documents);
                setOriginList(data.documents);
                setList(resultArray);
            } else {
                setList([]);
            }
            setIsPageEnd(data.meta.is_end);
        });
    };

    const returnCategory = (category: string): string => {
        let temp = category.split(">");
        return temp[temp.length-1];
    };

    const apiPageHandler = () => {
        if(!isPageEnd){
            setPage(prev => prev + 1);
        } else {
            if(page === 1){
                let resultArray = makeRandomList(originList);
                setList(resultArray);

                scrollRef.current?.scrollIntoView({
                    behavior: "smooth"
                });

            } else {
                setPage(1);
            }
        }
    };

    const makeRandomList = (arr: any[]): Info[] => {
        let copy = JSON.parse(JSON.stringify(arr));
        let index = 0;
        let randomItem: Info;
        let randomArray: Info[] = [];

        if(copy.length >5) {
            for(let i=0; i<5; i++) {
                index = Math.floor(Math.random()*copy.length);
                randomItem = copy[index];
                randomArray.push(randomItem);
                copy.splice(index, 1);
            }
        } else {
            randomArray = copy;
        }

        return randomArray;
    };

    const selectOne = () => {
        const randomOne = list[Math.floor(Math.random()*list.length)];
        setSelectedOne(randomOne);
    };


    return (
        <div ref={scrollRef}>
            <div className='p-4'>
                {
                    list && list.length ?
                    <div className='text-l font-medium mb-6 text-gray-700 break-keep'>
                        <span className='font-bold text-orange-500'>{local}</span> 주변에서&nbsp;
                        {
                            category === "FD6" ? 
                                <><span className='font-bold text-orange-500'>음식점</span>을</>
                            : <><span className='font-bold text-orange-500'>카페</span>를</>
                        } 
                        &nbsp;뽑아봤어요! (최대 5개)
                    </div>
                    : 
                    <div className='text-l font-medium mb-6 text-gray-700 break-keep text-center'>
                        검색 결과가 없어요!    
                    </div>
                }
                <ul className='mb-6'>
                    {
                        list && list.length ? list.map((item,index) => (
                            <li key={index} id={item.place_name} className='bg-white rounded-lg shadow-md p-4 border border-gray-100 mb-2'>
                                <div className='mb-6 text-l font-medium text-gray-700'>
                                    <div className='text-lg font-semibold mb-1 break-keep'>{item.place_name}</div>
                                    <div className='text-sm text-gray-400 mb-3'>{item.category_name ? returnCategory(item.category_name) : "-"}</div>
                                    <div>{item.phone}</div>
                                    <div className='mb-3 break-keep'>{item.road_address_name || item.address_name}</div>
                                    <a href={item.place_url} target="_blank" className='inline-block text-xs rounded-lg bg-slate-400 text-white py-1 px-2 mr-2'>상세 보기</a>
                                </div>
                                <div id={`map_${index}`} className='map w-full h-60 mb-4'/>
                            </li>
                        ))
                        : null
                    }
                </ul>
                <button className='block mx-auto w-full px-3 py-2 bg-orange-400 text-white rounded-lg shadow-md text-l font-medium'
                        onClick={() => apiPageHandler()}>
                    다시 뽑을래요
                </button>
            </div>
            <div className='py-2 bg-gray-100'/>
            <div className='p-4'>
                {
                    list && list.length > 1 ?
                        <div>
                            <div className='text-l font-medium mb-3 text-gray-700 break-keep'>
                                목록에서 결정이 어려우시다면 아래 버튼을 눌러주세요!
                            </div>
                            <button className='text-l font-medium block mx-auto mb-9 w-full px-3 py-2 bg-orange-400 text-white rounded-lg shadow-md'
                                    onClick={() => selectOne()}>하나만 뽑을래요</button>

                            {
                                selectedOne ?
                                    <>
                                        <div className='text-l font-medium mb-3 text-gray-700 break-keep' ref={scrollOneRef}>
                                            무작위로 한 곳을 뽑아봤어요!
                                        </div>
                                        <div className='bg-white rounded-lg shadow-md p-4 border border-gray-100 mb-10'>
                                            <div className='mb-6'>
                                                <div className='text-lg font-semibold mb-1 break-keep'>{selectedOne.place_name}</div>
                                                <div className='text-sm text-gray-400 mb-3'>{selectedOne.category_name ? returnCategory(selectedOne.category_name) : "-"}</div>
                                                <div>{selectedOne.phone}</div>
                                                <div className='mb-3 break-keep'>{selectedOne.road_address_name || selectedOne.address_name}</div>
                                                <a href={selectedOne.place_url} target="_blank" className='inline-block text-xs rounded-lg bg-slate-400 text-white py-1 px-2 mr-2'>상세 보기</a>
                                            </div>
                                            <div id='map_selected' className='w-full h-60 mb-4'/>
                                        </div>
                                    </>
                                : null    
                            }
                        </div>
                    : null
                }
            </div>
            <div className='py-2 bg-gray-100'/>
            <Link className='p-4 block' href="/">
                <button className='block mx-auto w-full px-3 py-2 mb-10 bg-orange-400 text-white rounded-lg shadow-md'>이전 페이지로 돌아가기</button>
            </Link>
        </div>
    )
}