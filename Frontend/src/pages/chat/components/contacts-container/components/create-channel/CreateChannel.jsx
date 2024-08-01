import React, { useEffect, useState } from 'react'
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
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import MultipleSelector from '@/components/ui/multipleselect'

export function CreateChannel(props) {
    const addChannel = useAppStore(state => state.addChannel);
    const [newChannelModel, setNewChannelModel] = useState(false);
    const [allContact, setAllContact] = useState([]);
    const [selectContact, setSelectContact] = useState([]);
    const [channelName, setChannelName] = useState("");

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetch('http://localhost:7052/gettingALLcontact-channel', {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });
                const responseData = await response.json();
                if (response.status === 200) {
                    setAllContact(responseData.contacts);
                } else {
                    console.error('Failed to fetch all contacts:', responseData.error);
                }
            } catch (error) {
                console.log({ error });
            }
        };
        getData();
    }, []);

    const handleCreateChannel = async () => {
        try {
            if (channelName.length > 0 && selectContact.length > 0) {
                const response = await fetch("http://localhost:7052/create-channel", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        name: channelName,
                        member: selectContact.map((contact) => contact.value),
                    }),
                });

                const responseData = await response.json();
                if (response.status === 201) {
                    console.log('Channel created:', responseData.channel); // Debug
                    setChannelName("");
                    setSelectContact([]);
                    setNewChannelModel(false);
                    addChannel(responseData.channel);
                } else {
                    console.error('Failed to create channel:', responseData.error);
                }
            } else {
                console.error('Channel name or contacts are missing.');
            }
        } catch (error) {
            console.log({ error });
        }
    }

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus
                            className='text-neutral-400 ml-16 font-light text-opacity-90 text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300'
                            onClick={() => setNewChannelModel(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                        Create New Channel
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={newChannelModel} onOpenChange={setNewChannelModel}>
                <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col space-y-4">
                    <DialogHeader>
                        <DialogTitle>Please fill up the details for new channel</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder="Channel Name"
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                            onChange={e => setChannelName(e.target.value)}
                            value={channelName}
                        />
                    </div>
                    <div>
                        <MultipleSelector
                            className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
                            defaultOptions={allContact}
                            placeholder="Search contact"
                            value={selectContact}
                            onChange={setSelectContact}
                            emptyIndicator={
                                <p className='text-center text-lg leading-10 text-gray-600'>No results found.</p>
                            }
                        />
                    </div>
                    <div className="mt-auto">
                        <Button
                            className='w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300'
                            onClick={handleCreateChannel}>
                            Create Channel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
