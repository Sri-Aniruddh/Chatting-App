import React, { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { FaPlus } from 'react-icons/fa'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import Lottie from 'react-lottie'
import { animationDefaultOptions } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { useAppStore } from '@/store'

export function NewDm(props) {
    const setSelectedChatType = useAppStore(state => state.setSelectedChatType);
    const setSelectedChatData = useAppStore(state => state.setSelectedChatData);
    const [openNewContactModel, setOpenNewContactModel] = useState(false);
    const [searchedContact, setSearchedContact] = useState([])

    const searchContact = async (searchTerm) => {
        try {
            if (searchTerm.length > 0) {
                const response = await fetch('http://localhost:7052/getting-Contacts', {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ searchTerm })
                });
                const responseData = await response.json();
                if (response.status === 200 && responseData.contacts) {
                    setSearchedContact(responseData.contacts);
                } else {
                    console.error('Failed to fetch contacts:', responseData.error);
                }
            } else {
                setSearchedContact([]);
            }
        } catch (error) {
            console.log({ error });
        }
    }

    const selectNewContact = (contact) => {
        setOpenNewContactModel(false);
        setSelectedChatType("contact");
        setSelectedChatData(contact)
        setSearchedContact([]);
    }

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus
                            className='text-neutral-400 ml-16 font-light text-opacity-90 text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300'
                            onClick={() => setOpenNewContactModel(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent
                        className="bg-[#1c1b1e] border-none text-white">
                        Select New Contact
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={openNewContactModel} onOpenChange={setOpenNewContactModel}>
                <DialogContent
                    className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Please Select a Contact!</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder="Search Contact"
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                            onChange={e => searchContact(e.target.value)}
                        />
                    </div>

                    {searchContact.length > 0 && (

                        <ScrollArea className="h-[256px]" >
                            <div className="flex flex-col gap-5">
                                {searchedContact.length > 0 ? (
                                    searchedContact.map((contact) => (
                                        <div key={contact._id}
                                            onClick={() => { selectNewContact(contact) }}
                                            className='flex gap-5 items-center cursor-pointer'>
                                            <div className='w-12 h-12 relative'>
                                                <Avatar className='h-12 w-12 rounded-full overflow-hidden'>
                                                    {contact.image ? (
                                                        <AvatarImage src={`http://localhost:7052/${contact.image}`} alt='profile' className='object-cover w-full h-full bg-black rounded-full' />
                                                    ) : (
                                                        <div className='uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full bg-gray-600 text-white'>
                                                            {contact.username ? contact.username.charAt(0) : contact?.email?.charAt(0)}
                                                        </div>
                                                    )}
                                                </Avatar>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className='text-lg text-white'>
                                                    <span>{contact.username ? contact.username : contact.email}</span>
                                                </div>
                                                <div className='text-xs text-neutral-400'>
                                                    <span>{contact.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className='hidden md:flex flex-1 bg-[#181921] flex-col justify-center items-center transition-all duration-100'>
                                        <Lottie
                                            isClickToPauseDisabled={true}
                                            height={100}
                                            width={100}
                                            options={animationDefaultOptions}
                                        />
                                        <div className="text-opacity-80 text-white flex flex-col gap-5 items-center lg:text-2xl text-xl text-center">
                                            <h3 className='poppins-medium'>
                                                Hi<span className='text-purple-500'>! </span>
                                                Search New <span className='text-purple-500'>Contacts </span>
                                                <span className='text-purple-500'>.</span>
                                            </h3>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>)}
                </DialogContent>
            </Dialog>
        </>
    )
}
