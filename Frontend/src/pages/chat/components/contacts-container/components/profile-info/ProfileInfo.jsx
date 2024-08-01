import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppStore } from '@/store'
import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import React from 'react'
import { FiEdit2 } from 'react-icons/fi'
import { IoPowerSharp } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function ProfileInfo(props) {
    const navigate=useNavigate();
    const { userInfo ,setUserInfo} = useAppStore()


    const logOut=async()=>{
        try {
            const response = await fetch('http://localhost:7052/logout', {
                method: 'POST',
                credentials: 'include' // Ensure cookies are sent with the request
            });

            if (response.status === 200) {
                // Clear client-side storage
                localStorage.removeItem('token');
                // Or if using cookies:
                document.cookie = 'jwt=; Max-Age=0; path=/;'; // Clear the cookie

                toast.success("Logged out successfully.");
                // Redirect to login or home page
                navigate('/auth');
                setUserInfo(null); 
            } else {
                const responseData = await response.json();
                toast.error(responseData.error || "Failed to log out.");
            }
        } catch (error) {
            console.error("Error in logout:", error);
            toast.error("An error occurred. Please try again.");
        }
    }

    return (
        <div className='absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]'>
            <div className="flex gap-3 items-center">
                <div className='w-12 h-12 relative'>
                    <Avatar className='h-12 w-12 rounded-full overflow-hidden'>
                        {userInfo.image ? (
                            <AvatarImage src={`http://localhost:7052/${userInfo.image}`} alt='profile' className='object-cover w-full h-full bg-black rounded-full' />
                        ) : (
                            <div className='uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full bg-gray-600 text-white'>
                                {userInfo.email ? userInfo.email.charAt(0) : userInfo?.email?.charAt(0)}
                            </div>
                        )}
                    </Avatar>
                </div>
                <div className='text-white text-lg'>
                    {userInfo.username ? userInfo.username : ""}
                </div>
            </div>
            <div className="flex gap-5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <FiEdit2 
                            onClick={() => { navigate('/profile') }}
                            className="text-purple-500 text-xl font-medium cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                            Edit Profile
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <IoPowerSharp 
                            onClick={logOut}
                            className="text-red-500 text-xl font-medium cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                            Logout
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}
