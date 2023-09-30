'use client';

import {useState, useEffect} from 'react';
import { useSearchParams } from 'next/navigation'
import Link from 'next/link';

interface Info {
    place_name?: string;
    place_url?: string;
    road_address_name?: string;
    address_name?: string;
    category_name?: string;
    phone?: string;
    x?: string;
    y?: string;
};

declare global {
    interface Window {
    kakao: any;
    }
};

export default function Result(){
    const params = useSearchParams();
    const local = params.get('local');
    const category = params.get('category');
    const x = params.get('x');
    const y = params.get('y');

    const [page, setPage] = useState<number>(1);
    const [list, setList] = useState<Info[]>();
    const [isShowMap, setIsShowMap] = useState<boolean>(false);

    useEffect(() => {
        getCategorySearch();

        const kakaoMapScript = document.createElement('script');
        kakaoMapScript.async = false;
        kakaoMapScript.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=246a4b82711acbbbb55f493b4eb884ea&autoload=false';
        document.head.appendChild(kakaoMapScript);

        let mapContainer = null;
        let mapOption = null;
        let map = null;

        const onLoadKakaoApi = () => {
            window.kakao.maps.load(() => {
                mapContainer = document.getElementById('map');
                mapOption = { 
                    center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
                    level: 3 // 지도의 확대 레벨
                };
                map = new window.kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다
            })
        };

        kakaoMapScript.addEventListener('load', onLoadKakaoApi);
    },[]);

    useEffect(() => {
        if(isShowMap) {
            showMap();
        }
    }, [isShowMap]);

    const getCategorySearch = async() => {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json;charset=UTF-8');
        requestHeaders.set('Authorization', `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`);
    
        const url = "https://dapi.kakao.com/v2/local/search/category.json?";
    
        await fetch(`${url}category_group_code=${category}&x=${x}&y=${y}&size=10&page=${page}`, 
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
            }
        });
    };

    const returnCategory = (category: string): string => {
        let temp = category.split(">");
        return temp[temp.length-1];
    };

    const toggleHandler = () => {
        setIsShowMap(prev => !prev);
    };

    const showMap = () => {

        // // 마커가 표시될 위치입니다 
        // var markerPosition  = new window.kakao.maps.LatLng(33.450701, 126.570667); 

        // // 마커를 생성합니다
        // var marker = new window.kakao.maps.Marker({
        // position: markerPosition
        // });

        // // 마커가 지도 위에 표시되도록 설정합니다
        // marker.setMap(map);
    };

    return (
        <section className='px-4'>
            {
                list && list.length ?
                    <div className='text-l font-medium mb-6'>
                        {local}에서 {category === "FD6" ? "음식점을" : "카페를"} 뽑아봤어요! (최대 5개)<br/>
                        마음에 드는 항목이 없을 경우, 다시 뽑을래요 버튼을 눌러 다시 뽑아보실 수 있어요.
                    </div>
                : 
                <div className=''>
                    검색 결과가 없어요!    
                </div>
            }
            <button className='block mx-auto mb-9 w-36 px-3 py-2 bg-red-400 text-white rounded-lg shadow-md'>다시 뽑을래요</button>
            <ul className='mb-10'>
                {
                    list && list.length ? list.map((item,index) => (
                        <li key={index} className='bg-white rounded-lg shadow-md p-4 border border-gray-100 mb-2'>
                            <div>
                                <div className='text-lg font-semibold mb-1'>{item.place_name}</div>
                                <div className='text-sm text-gray-400 mb-3'>{item.category_name ? returnCategory(item.category_name) : "-"}</div>
                                <div>{item.phone}</div>
                                <div className='mb-3'>{item.road_address_name || item.address_name}</div>
                                <a href={item.place_url} target="_blank" className='inline-block text-xs rounded-lg bg-slate-400 text-white py-1 px-2 mr-2'>상세 보기</a>
                                <div className='inline-block text-xs text-white py-1 px-2 rounded-lg bg-orange-500' onClick={() => toggleHandler()}>지도 보기</div>
                            </div>
                            {
                                isShowMap ?
                                    <div id='map' className='w-4 h-4'></div>
                                : null
                            }
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
                        <button className='block mx-auto mb-9 w-36 px-3 py-2 bg-red-400 text-white rounded-lg shadow-md'>하나만 뽑을래요</button>

                        <div className='text-l font-medium mb-3'>
                            무작위로 한 곳을 뽑아봤어요! 즐거운 식사되세요!
                        </div>
                        <div className='bg-white rounded-lg shadow-md p-4 border border-gray-100 mb-10'>
                            <div>
                                <div className='text-lg font-semibold mb-1'>정돈정돈정정돈정돈정돈정돈정돈정돈정돈정돈</div>
                                <div className='text-sm text-gray-400 mb-3'>돈까스, 우동</div>
                                <div>02-336-0923</div>
                                <div className='mb-3'>서울 마포구 어울마당로 46</div>
                                <a href="https://www.naver.com" target="_blank" className='inline-block text-xs rounded-lg bg-slate-400 text-white py-1 px-2 mr-2'>상세 보기</a>
                                <div className='inline-block text-xs text-white py-1 px-2 rounded-lg bg-orange-500'>지도 보기</div>
                            </div>
                        </div>
                    </>
                : null
            }

            <div className='text-l font-medium mb-3'>
                지역과 카테고리를 다시 검색하고 싶으신 경우 아래 버튼을 눌러주세요!
            </div>
            <Link href="/">
                <button className='block mx-auto w-36 px-3 py-2 mb-10 bg-red-400 text-white rounded-lg shadow-md'>다시 검색하기</button>
            </Link>
        </section>
    )
}