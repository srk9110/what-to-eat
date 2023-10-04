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
    const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_API_KEY}&autoload=false`;

    const params = useSearchParams();
    const local = params.get('local');
    const category = params.get('category');
    const x = Number(params.get('x'));
    const y = Number(params.get('y'));

    const [page, setPage] = useState<number>(1);
    const [list, setList] = useState<Info[]>([]);
    const [isPageEnd, setIsPageEnd] = useState<boolean>(false);
    const [selectedOne, setSelectedOne] = useState<Info>();

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
            
            kakaoMapScript?.addEventListener('load', onLoadKakaoAPI)
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
                let copy = JSON.parse(JSON.stringify(data.documents));

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
                setList(randomArray);
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

    const pageHandler = () => {
        if(!isPageEnd){
            setPage(prev => prev + 1);
        } else {
            setPage(1);
        }
    };

    const selectOne = () => {
        const randomOne = list[Math.floor(Math.random()*list.length)];
        setSelectedOne(randomOne);
    };

    return (
        <section className='px-4'>
            {
                list && list.length ?
                <div className='text-l font-medium mb-6'>
                        {local} 주변에서 {category === "FD6" ? "음식점을" : "카페를"} 뽑아봤어요! (최대 5개)<br/>
                        마음에 드는 항목이 없을 경우, 다시 뽑을래요 버튼을 눌러 다시 뽑아보실 수 있어요.
                    </div>
                : 
                <div className=''>
                    검색 결과가 없어요!    
                </div>
            }
            <button className='block mx-auto mb-9 w-36 px-3 py-2 bg-orange-400 text-white rounded-lg shadow-md'
                    onClick={() => pageHandler()}>
                        다시 뽑을래요
                    </button>
            <ul className='mb-10'>
                {
                    list && list.length ? list.map((item,index) => (
                        <li key={index} id={item.place_name} className='bg-white rounded-lg shadow-md p-4 border border-gray-100 mb-2'>
                            <div className='mb-6'>
                                <div className='text-lg font-semibold mb-1'>{item.place_name}</div>
                                <div className='text-sm text-gray-400 mb-3'>{item.category_name ? returnCategory(item.category_name) : "-"}</div>
                                <div>{item.phone}</div>
                                <div className='mb-3'>{item.road_address_name || item.address_name}</div>
                                <a href={item.place_url} target="_blank" className='inline-block text-xs rounded-lg bg-slate-400 text-white py-1 px-2 mr-2'>상세 보기</a>
                            </div>
                            <div id={`map_${index}`} className='map w-full h-60 mb-4'/>
                        </li>
                    ))
                    : null
                }
            </ul>
            {
                list && list.length > 1 ?
                    <>
                        <div className='text-l font-medium mb-3'>
                            목록에서 결정이 어려우시다면 하나만 뽑을래요 버튼을 눌러주세요!
                        </div>
                        <button className='block mx-auto mb-9 w-36 px-3 py-2 bg-orange-400 text-white rounded-lg shadow-md'
                                onClick={() => selectOne()}>하나만 뽑을래요</button>

                        {
                            selectedOne ?
                                <>
                                    <div className='text-l font-medium mb-3'>
                                        무작위로 한 곳을 뽑아봤어요! 즐거운 시간되세요!
                                    </div>
                                    <div className='bg-white rounded-lg shadow-md p-4 border border-gray-100 mb-10'>
                                        <div className='mb-6'>
                                            <div className='text-lg font-semibold mb-1'>{selectedOne.place_name}</div>
                                            <div className='text-sm text-gray-400 mb-3'>{selectedOne.category_name ? returnCategory(selectedOne.category_name) : "-"}</div>
                                            <div>{selectedOne.phone}</div>
                                            <div className='mb-3'>{selectedOne.road_address_name || selectedOne.address_name}</div>
                                            <a href={selectedOne.place_url} target="_blank" className='inline-block text-xs rounded-lg bg-slate-400 text-white py-1 px-2 mr-2'>상세 보기</a>
                                        </div>
                                        <div id='map_selected' className='w-full h-60 mb-4'/>
                                    </div>
                                </>
                            : null    
                        }
                    </>
                : null
            }

            <div className='text-l font-medium mb-3'>
                지역과 카테고리를 다시 검색하고 싶으신 경우 아래 버튼을 눌러주세요!
            </div>
            <Link href="/">
                <button className='block mx-auto w-36 px-3 py-2 mb-10 bg-orange-400 text-white rounded-lg shadow-md'>다시 검색하기</button>
            </Link>
        </section>
    )
}