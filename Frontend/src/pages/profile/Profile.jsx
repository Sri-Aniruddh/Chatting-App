import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { getColor } from '@/lib/utils';
import { FaTrash, FaPlus } from "react-icons/fa";
import { toast } from 'sonner';

export default function Profile() {
    const navigate = useNavigate();
    const { userInfo, setUserInfo } = useAppStore((state) => state);
    const [name, setName] = useState(userInfo?.name || "");
    const [image, setImage] = useState(null);
    const [hovered, setHovered] = useState(false);
    const [selectedColor, setSelectedColor] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (userInfo.profileSetup) {
            setName(userInfo.name);
        }
        if (userInfo.image) {
            setImage(`http://localhost:7052/${userInfo.image}`);
        }
    }, [userInfo]);

    const handleNavigate = () => {
        navigate(-1);
    };

    const validateProfile = () => {
        if (!name) {
            toast.error("Name is required.");
            return false;
        };
        return true;
    }

    const saveChanges = async () => {
        if (validateProfile()) {
            try {
                const response = await fetch('http://localhost:7052/update-profile', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name }),
                    credentials: 'include'
                });

                const responseData = await response.json();

                if (response.status === 200 && responseData) {
                    setUserInfo({ ...responseData });
                    toast.success("Profile updated successfully.");
                    navigate('/chat');
                } else {
                    toast.error("Failed to update profile.");
                }
            } catch (error) {
                console.error("Error updating profile:", error);
                toast.error("An error occurred. Please try again.");
            }
        }
    };

    const handleFileInputClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("profile-image", file);

            try {
                const response = await fetch('http://localhost:7052/add-profile-image', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });

                const responseData = await response.json();

                if (response.status === 200 && responseData.image) {
                    setUserInfo(prev => ({
                        ...prev,
                        image: responseData.image
                    }));
                    setImage(`http://localhost:7052/${responseData.image}`);
                    toast.success("Image updated successfully.");
                } else {
                    toast.error("Failed to update image.");
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("An error occurred. Please try again.");
            }
        }
    };

    const handleDeleteImage = async () => {
        try {
            const response = await fetch('http://localhost:7052/remove-profile-image', {
                method: 'DELETE',
                credentials: 'include'
            });

            // Debugging: Log the response for debugging
            const responseData = await response.json();
            console.log('Delete Image Response:', responseData);

            if (response.ok) {
                // Update the user info and image state
                setUserInfo(prev => ({
                    ...prev,
                    image: null
                }));
                setImage(null);
                toast.success("Image removed successfully.");
            } else {
                // Error from the backend
                toast.error(responseData.error || "Failed to remove image.");
            }
        } catch (error) {
            console.error("Error removing image:", error);
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <div className='bg-[#1b1c24] h-screen flex items-center justify-center flex-col gap-10'>
            <div className="flex flex-col gap-10 w-full max-w-2xl">
                <div onClick={handleNavigate}>
                    <IoArrowBack className='text-4xl lg:text-6xl text-white/90 cursor-pointer' />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        className="relative flex items-center justify-center"
                    >
                        <Avatar className='h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden'>
                            {image ? (
                                <AvatarImage src={image} alt='profile' className='object-cover w-full h-full bg-black' />
                            ) : (
                                <div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(selectedColor)}`}>
                                    {name ? name.charAt(0) : userInfo?.email?.charAt(0)}
                                </div>
                            )}
                        </Avatar>
                        {hovered && (
                            <div
                                className='absolute inset-0 flex rounded-full items-center justify-center bg-black/50 p-0 m-0 cursor-pointer'
                                onClick={image ? handleDeleteImage : handleFileInputClick}
                            >
                                {image ? (
                                    <FaTrash className='text-white text-3xl' />
                                ) : (
                                    <FaPlus className='text-white text-3xl' />
                                )}
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className='hidden'
                            onChange={handleImageChange}
                            name='profile-image'
                            accept='.png, .jpg, .jpeg, .svg, .webp'
                        />
                    </div>
                    <div className="flex flex-col gap-5 items-center justify-center">
                        <div className="w-full">
                            <input type="email" placeholder='Email' disabled value={userInfo?.email || ""} className='w-full rounded-lg p-6 bg-[#2c2e3b] text-white border-none' />
                            <input type="text" placeholder='Name' onChange={(e) => setName(e.target.value)} value={name} className='w-full mt-4 rounded-lg p-6 bg-[#2c2e3b] text-white border-none' />
                        </div>
                    </div>
                </div>
                <button onClick={saveChanges} className='mt-6 py-3 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700'>
                    Save Changes
                </button>
            </div>
        </div>
    );
}
