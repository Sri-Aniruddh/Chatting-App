import React, { useEffect } from 'react';
import { ProfileInfo } from './components/profile-info/ProfileInfo';
import { NewDm } from './components/new-dm/NewDm';
import { useAppStore } from '@/store';
import ContactList from '@/components/ContactList';
import { CreateChannel } from './components/create-channel/CreateChannel';

export function ContactContainer(props) {
  const setDirectMessageContacts = useAppStore(state => state.setDirectMessageContacts);
  const directMessageContacts = useAppStore(state => state.directMessageContacts);
  
  const setChannels = useAppStore(state => state.setChannels);
  const channels = useAppStore(state => state.channels);

  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await fetch('http://localhost:7052/getting-Contacts-list', {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        if (responseData.contacts) {
          setDirectMessageContacts(responseData.contacts);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    const getChannels = async () => {
      try {
        const response = await fetch('http://localhost:7052/getUser-channel', {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        if (responseData.channels) {
          setChannels(responseData.channels);
        }
      } catch (error) {
        console.error('Error fetching Channels:', error);
      }
    };

    getContacts();
    getChannels();
  }, [setDirectMessageContacts, setChannels]);

  console.log('Channels state:', channels); // Debugging
  console.log('DirectMessageContacts state:', directMessageContacts); // Debugging

  return (
    <div className='relative w-full md:w-[20vw] lg:w-[35vh] xl:w-[40vh] bg-[#1b1c24] border-r-2 border-[#2f303b]'>
      <div className="pt-3">
        <Logo />
      </div>
      <div className="my-5">
        <div className="flex items-center justify-center pr-10">
          <Title text="Direct Messages" />
          <NewDm />
        </div>
        <div className='max-h-[38vh] overflow-y-auto scroll-hidden'>
          <ContactList contacts={directMessageContacts} />
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-center pr-10">
          <Title text="Channels" />
          <CreateChannel />
        </div>
        <div className='max-h-[38vh] overflow-y-auto scroll-hidden'>
          {channels.length > 0 ? (
            <ContactList contacts={channels} isChannel={true} />
          ) : (
            <p className="text-white text-center">No channels available.</p>
          )}
        </div>
      </div>
      <ProfileInfo />
    </div>
  );
}


const Logo = () => {
  return (
    <div className="flex p-5 md:text-xs justify-start items-center gap-2">
      <svg
        id="logo-38"
        width="78"
        height="32"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
          className="ccustom"
          fill="#8338ec"
        ></path>
        <path
          d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
          className="ccompli1"
          fill="#975aed"
        ></path>
        <path
          d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
          className="ccompli2"
          fill="#a16ee8"
        ></path>
      </svg>
      <span className="text-3xl font-semibold">Syncronus</span>
    </div>
  );
}

const Title = ({ text }) => {
  return (
    <h6 className='uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm'>{text}</h6>
  )
}
