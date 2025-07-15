import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInviteStore, useSidebarStore } from '../store'
import { useRoom } from '../hooks/useRoom'
import { toast } from 'sonner'
import { BarLoader } from 'react-spinners'
import { IoIosArrowBack } from 'react-icons/io'
import { AiOutlineClose } from 'react-icons/ai'
import { FaPlay } from "react-icons/fa"
import { GrAdd } from 'react-icons/gr'
import { GoPeople } from 'react-icons/go'
import { BsFillClipboardCheckFill, BsFillClipboardFill } from 'react-icons/bs'

const Invite = () => {
    const { roomID } = useParams();

    const { assignedPlayerName, setAssignedPlayerName } = useSidebarStore();
    const { invite, setInvite, preference, setPreference } = useInviteStore();

    const [name, setName] = useState('');

    const handlePlayerName = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim()) return toast.warning("Enter your name to proceed");
        if (name.trim().length > 20) return toast.warning("Maximum 20 characters allowed");
        setAssignedPlayerName(name.trim());
        localStorage.setItem('playerName', name.trim());
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-30">
            {preference === "Share" ? (
                <div className="bg-black opacity-70 fixed inset-0 z-20"></div>
            ) : (
                <div className='bg-container fixed inset-0 z-20' />
            )}
            <div className={`${preference === 'Share' ? 'bg-white' : 'bg-gradient-to-br from-[rgba(75,30,133,1)] to-[rgba(75,30,133,0.01)] border-2 border-[rgba(75,30,133,0.5)]'} p-5 w-[95%] md:w-[500px] grid place-items-center mx-auto rounded-lg shadow-lg overflow-hidden z-30 relative`}>
                {preference === "" && <p className='mb-6 text-[20px] font-semibold text-center text-white'>Guess Paint</p>}

                {!assignedPlayerName.split('#')[0].trim() && (
                    <form id='player-name' className="mb-4 w-full flex items-center justify-between gap-2" onSubmit={handlePlayerName}>
                        <div className='bg-[rgba(0,0,0,0.3)] h-[45px] p-1 rounded-md'>
                            <input
                                name='name-input'
                                className='bg-[rgba(0,0,0,0.3)] h-full w-full outline-none rounded-md px-5 text-white'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder='Enter your name'
                            />
                        </div>
                        <div className='bg-[rgba(0,0,0,0.3)] h-[45px] p-1 flex items-end justify-center rounded-md'>
                            <button className='h-full w-full px-4 bg-[#53e237] text-white rounded active:scale-90 duration-200'>
                                Save
                            </button>
                        </div>
                    </form>
                )}

                {preference === "" ? (
                    <PreferenceSelector />
                ) : preference === "Join" ? (
                    <JoinRoom />
                ) : preference === "Share" ? (
                    <ShareRoom />
                ) : null}

                <div className={`mt-8 mb-6 w-full border-b ${preference === 'Share' ? 'border-gray-300' : 'border-[rgba(75,30,133,0.5)]'}`} />

                <p className={`text-center text-sm ${preference === 'Share' ? '' : 'text-white'}`}>
                    Made with ❤️ by <a href="https://github.com/Shubham-Lal" target="_blank" rel="noopener noreferrer" className='underline'>Shubham Lal</a>
                </p>

                {(preference !== "Share" && preference !== "") && (
                    <button
                        className='absolute left-0 top-0 w-[30px] h-[30px] bg-gray-100 hover:bg-black text-black hover:text-white duration-200 flex items-center justify-center'
                        onClick={() => {
                            if (roomID) return setPreference("Share");
                            setPreference("");
                        }}
                    >
                        <IoIosArrowBack />
                    </button>
                )}
                {location.pathname !== "/" && location.pathname !== "/room" && (
                    <button
                        className='absolute right-0 top-0 w-[30px] h-[30px] bg-gray-100 hover:bg-black text-black hover:text-white duration-200 flex items-center justify-center'
                        onClick={() => setInvite(!invite)}
                    >
                        <AiOutlineClose />
                    </button>
                )}
            </div>
        </div>
    )
};

const PreferenceSelector = () => {
    const { isPlaying, handleRandomRoom, handleCreateRoom, isCreating } = useRoom();

    const { assignedPlayerName } = useSidebarStore();
    const { setPreference } = useInviteStore();

    const handleJoinRoom = () => {
        if (!assignedPlayerName.split('#')[0].trim()) {
            toast.warning("Enter your name to proceed");
            return;
        }

        setPreference("Join")
    }

    return (
        <div className='w-full flex flex-col gap-4 justify-between'>
            <button
                className={`bg-[rgba(0,0,0,0.3)] sm:max-w-[175px] w-full h-[50px] p-1 mx-auto rounded-md ${isPlaying || isCreating ? 'cursor-not-allowed' : 'hover:border-2 border-green-500'}`}
                disabled={isPlaying || isCreating}
                onClick={handleRandomRoom}
            >
                <div className='bg-[rgba(0,0,0,0.3)] h-full flex items-center justify-center gap-2 text-white rounded-md'>
                    {isPlaying ? <BarLoader height={4} width={50} /> : (
                        <>
                            <p>Play</p>
                            <FaPlay size={15} />
                        </>
                    )}
                </div>
            </button>
            <div className='h-full flex items-center justify-center gap-4 flex-wrap'>
                <button
                    className={`bg-[rgba(0,0,0,0.3)] sm:max-w-[175px] w-full h-[50px] p-1 rounded-md ${isPlaying || isCreating ? 'cursor-not-allowed' : 'hover:border-2 border-green-500'}`}
                    disabled={isPlaying || isCreating}
                    onClick={handleCreateRoom}
                >
                    <div className='bg-[rgba(0,0,0,0.3)] h-full flex items-center justify-center gap-2 text-white rounded-md'>
                        {isCreating ? <BarLoader height={4} width={50} /> : (
                            <>
                                <p>Create Room</p>
                                <GrAdd size={15} />
                            </>
                        )}
                    </div>
                </button>
                <button
                    className={`bg-[rgba(0,0,0,0.3)] sm:max-w-[175px] w-full h-[50px] p-1 rounded-md ${isPlaying || isCreating ? 'cursor-not-allowed' : 'hover:border-2 border-green-500'}`}
                    disabled={isPlaying || isCreating}
                    onClick={handleJoinRoom}
                >
                    <div className='bg-[rgba(0,0,0,0.3)] h-full flex items-center justify-center gap-2 text-white rounded-md'>
                        <p>Join Room</p>
                        <GoPeople size={15} />
                    </div>
                </button>
            </div>
        </div>
    )
};

const JoinRoom = () => {
    type Room = {
        roomID: string;
        playerCount: number;
        isLoading: boolean;
    };

    const navigate = useNavigate();
    const { setInvite } = useInviteStore();
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [isInputJoining, setIsInputJoining] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomID, setRoomID] = useState(Array(5).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.toUpperCase();
        if (/^[A-Z0-9]$/.test(value) || value === '') {
            const newRoomID = [...roomID];
            newRoomID[index] = value;
            setRoomID(newRoomID);

            if (value !== '' && index < 4) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && roomID[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    useEffect(() => {
        const getAllRooms = async () => {
            setIsLoadingRooms(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/list-rooms`, { method: 'GET' });
                const roomsData = await response.json();
                const roomsWithLoading: Room[] = roomsData.map((room: { roomID: string, playerCount: number }) => ({
                    ...room,
                    isLoading: false,
                }));
                setRooms(roomsWithLoading);
            } catch (error) {
                console.error('Error fetching rooms:', error);
                toast.error('Failed to fetch rooms');
            } finally {
                setIsLoadingRooms(false);
            }
        };
        getAllRooms();
    }, []);

    const handleJoinRoom = async (roomID: string, isInputJoin: boolean, roomIndex?: number) => {
        if (!roomID.length) return toast.warning("Enter Room ID to proceed");

        if (isInputJoin) {
            setIsInputJoining(true);
        } else if (roomIndex !== undefined) {
            const newRooms = [...rooms];
            newRooms[roomIndex].isLoading = true;
            setRooms(newRooms);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/join-room?roomID=${roomID}`, { method: 'GET' });
            const data = await response.json();

            if (data.success) {
                setInvite(false);
                navigate(`/${roomID}`);
            } else {
                toast.error('No room found');
                if (isInputJoin) {
                    setIsInputJoining(false);
                } else if (roomIndex !== undefined) {
                    const newRooms = [...rooms];
                    newRooms[roomIndex].isLoading = false;
                    setRooms(newRooms);
                }
            }
        } catch (error) {
            console.error('Error joining room:', error);
            toast.error('Failed to join room');
            if (isInputJoin) {
                setIsInputJoining(false);
            } else if (roomIndex !== undefined) {
                const newRooms = [...rooms];
                newRooms[roomIndex].isLoading = false;
                setRooms(newRooms);
            }
        }
    };

    return (
        <div className='w-full h-[400px] flex flex-col overflow-hidden'>
            <p className='text-[20px] text-center text-white mb-3'>
                Join Room
            </p>
            <div className='flex items-center justify-between'>
                <div className='flex justify-end space-x-1'>
                    {roomID.map((digit, index) => (
                        <div className='bg-[rgba(0,0,0,0.3)] size-[45px] p-1 rounded-md'>
                            <input
                                key={index}
                                name={`roomid-input-${index}`}
                                ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                                className='bg-[rgba(0,0,0,0.3)] size-full rounded text-center text-white outline-none'
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                maxLength={1}
                            />
                        </div>
                    ))}
                </div>

                <div className='bg-[rgba(0,0,0,0.3)] ml-auto w-fit h-[45px] p-1 flex items-end justify-center rounded-md'>
                    <button className={`${isInputJoining ? "cursor-not-allowed" : ""} h-full w-full px-4 bg-[#53e237] text-white rounded active:scale-90 duration-200`}
                        onClick={() => handleJoinRoom(roomID.join(''), true)}
                    >
                        {isInputJoining ? <BarLoader color='#fff' height={4} width={32} className='mx-auto' /> : 'Join'}
                    </button>
                </div>
            </div>

            <div className='w-full border-b border-[rgba(75,30,133,0.5)] my-3' />

            <div className='flex-1 flex flex-col overflow-y-auto'>
                <p className='text-[20px] text-center text-white mb-3'>
                    Available Rooms
                </p>
                {isLoadingRooms ? <BarLoader height={4} width={50} className='mx-auto' /> : rooms.length === 0 ? <p className='text-gray-300'>No Rooms</p> : (
                    <ul className='flex-1 flex flex-col gap-2'>
                        {rooms.map((item, i) => (
                            <li key={i} className={`p-1 min-h-[50px] bg-[rgba(0,0,0,0.3)] flex items-center justify-center rounded-md border-2 border-transparent ${item.isLoading || isInputJoining ? 'cursor-not-allowed' : 'cursor-pointer hover:border-green-500'}`}>
                                {item.isLoading ? <BarLoader height={4} width={50} /> : (
                                    <button
                                        className='bg-[rgba(0,0,0,0.3)] px-2 h-full w-full flex items-center justify-between text-white rounded-md'
                                        disabled={item.isLoading || isInputJoining}
                                        onClick={() => handleJoinRoom(item.roomID, false, i)}
                                    >
                                        <p>{item.roomID}</p>
                                        <p>{item.playerCount === 0 ? "No players" : <>{item.playerCount} {item.playerCount === 1 ? "player" : "players"}</>}</p>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div >
    )
};

const ShareRoom = () => {
    const { roomID } = useParams();

    const [hasCopied, setHasCopied] = useState<boolean>(false);
    const copyToClipboard = async () => {
        if (!hasCopied) {
            try {
                await navigator.clipboard.writeText(`${import.meta.env.VITE_FRONTEND_URL}/${roomID}`);
                setHasCopied(true);
                toast.success("Copied");
            } catch (err) {
                console.error('Failed to copy URL: ', err);
            }
        } else toast("Already Copied!");
    };

    return (
        <div className='w-full flex flex-col gap-5 justify-between'>
            {roomID ? (
                <>
                    <p className='text-[20px] text-center'>
                        Share Invite
                    </p>
                    <div className='relative mx-auto w-[175px] h-[175px] flex items-center justify-center border-2'>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${import.meta.env.VITE_FRONTEND_URL}/${roomID}`}
                            className='absolute z-[1] top-0 left-0 size-full object-contain'
                            alt="Share QR"
                        />
                        <BarLoader
                            height={4}
                            width={50}
                            className='absolute z-0'
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 mx-auto">
                        {roomID.split('').map((digit, index) => (
                            <div key={index} className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded font-semibold">
                                {digit}
                            </div>
                        ))}
                    </div>
                    <div className='w-full min-h-[42px] flex border border-gray-300 rounded-md pl-2 overflow-hidden'>
                        <div className='w-[90%] min-h-full text-ellipsis overflow-hidden border-r border-gray-300 py-2'>
                            {`${import.meta.env.VITE_FRONTEND_URL?.split(/https?:\/\//)[1]}/${roomID}`}
                        </div>
                        <button
                            title={`${hasCopied ? "Copied" : "Copy URL"}`}
                            className={`w-[10%] min-h-full flex items-center justify-center py-2 cursor-pointer ${hasCopied ? "bg-gray-200 text-black" : "bg-black text-white"} duration-200`}
                            onClick={copyToClipboard}
                        >
                            {hasCopied ? <BsFillClipboardCheckFill size={20} /> : <BsFillClipboardFill size={20} />}
                        </button>
                    </div>
                </>
            ) : <PreferenceSelector />}
        </div>
    )
};

export default Invite