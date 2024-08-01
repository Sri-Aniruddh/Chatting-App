import { animationDefaultOptions } from '@/lib/utils'
import React from 'react'
import Lottie from 'react-lottie'

export function EmptyChat(props) {


    return (
        <div className='hidden md:flex flex-1 bg-[#1c1d25] flex-col justify-center items-center'>
            <Lottie
                isClickToPauseDisabled={true}
                height={200}
                width={200}
                options={animationDefaultOptions}
            />
            <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl text-center">
                <h3 className='poppins-medium'>
                    Hi<span className='text-purple-500'>! </span>
                    Welcome to <span className='text-purple-500'>Syncronous </span>Chat App
                    <span className='text-purple-500'>.</span>
                </h3>
            </div>
        </div>


    )
}
