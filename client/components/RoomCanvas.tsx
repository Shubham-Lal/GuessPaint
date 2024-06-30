import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import useWindowSize from '@/utils/useWindowSize'
import { useDraw } from '@/hooks/useDraw'
import { useSidebarStore, useToolbarStore } from '@/store'
import { drawLine } from '@/utils/drawLine'
import { connectSocket } from '@/utils/connectSocket'
import RoomToolbar from './RoomToolbar'
import RoomSidebar from './RoomSidebar'
import { DrawingSubject } from './Input'

const RoomCanvas: React.FC = () => {
    const roomID = useParams().roomID as string;

    const { width, height } = useWindowSize();
    const { brushThickness, color } = useToolbarStore();
    const { players, setPlayers, addPlayer, setAssignedPlayerName } = useSidebarStore();

    const socketRef = useRef(connectSocket());
    const joinedRoomRef = useRef(false);
    const [canDraw, setCanDraw] = useState(false);
    const [isWordEntryEnabled, setIsWordEntryEnabled] = useState(false);

    const { canvasRef, onMouseDown, clear } = useDraw(createLine);

    function createLine({ prevPoint, currPoint, ctx }: Draw) {
        if (canDraw) {
            socketRef.current.emit('draw-line', { prevPoint, currPoint, color, brushThickness });
            drawLine({ prevPoint, currPoint, ctx, color, brushThickness });
        }
    }

    const handleClear = () => {
        clear();
        socketRef.current.emit('clear');
    }

    useEffect(() => {
        const socket = socketRef.current;
        const ctx = canvasRef.current?.getContext('2d');

        if (!joinedRoomRef.current) {
            if (typeof window !== 'undefined') {
                socket.emit('join-room', { roomID, playerName: localStorage.getItem('playerName') });
            }
            joinedRoomRef.current = true;
        }

        socket.on('assign-player-name', (assignedName: string) => {
            setAssignedPlayerName(assignedName);
            localStorage.setItem('playerName', assignedName);
        });

        socket.on('players-in-room', (players: string[]) => {
            setPlayers(players);
        });

        socket.on('new-player', (playerName: string) => {
            if (!players.includes(playerName)) {
                addPlayer(playerName);
                toast.success(`${playerName.split('#')[0]} joined`);
            }
        });

        socket.on('player-left', ({ playerName, players }) => {
            if (playerName === localStorage.getItem('playerName')) toast.success("Room left");
            else toast.error(`${playerName.split('#')[0]} left`);

            if (players && players.length < 2) {
                setIsWordEntryEnabled(false);
                setCanDraw(false);
                handleClear();
            }
        });

        socket.emit('client-ready');

        socket.on('get-canvas-state', () => {
            if (!canvasRef.current?.toDataURL()) return;
            socket.emit('canvas-state', canvasRef.current.toDataURL());
        });

        socket.on('canvas-state-from-server', (state: string) => {
            const image = new Image();
            image.src = state;
            image.onload = () => {
                ctx?.drawImage(image, 0, 0);
            };
        });

        socket.on('draw-line', ({ prevPoint, currPoint, color, brushThickness }: DrawLineProps) => {
            if (ctx) {
                drawLine({ prevPoint, currPoint, ctx, color, brushThickness });
            }
        });

        socket.on('clear', clear);

        socket.on('prompt-word-entry', (playerName: string) => {
            const currentPlayerName = localStorage.getItem('playerName');
            setIsWordEntryEnabled(currentPlayerName === playerName);
        });

        socket.on('word-submitted', ({ playerName }) => {
            setIsWordEntryEnabled(false);
            setCanDraw(playerName === localStorage.getItem('playerName'));
        });

        socket.on('correct-guess', () => {
            setCanDraw(false);
            handleClear();
        });

        socket.on('time-up', () => {
            setCanDraw(false);
            handleClear();
        });

        return () => {
            socket.off('join-room');
            socket.off('assign-player-name');
            socket.off('players-in-room');
            socket.off('new-player');
            socket.off('player-left');
            socket.off('client-ready')
            socket.off('get-canvas-state');
            socket.off('canvas-state-from-server');
            socket.off('draw-line');
            socket.off('clear');
            socket.off('prompt-word-entry');
            socket.off('word-submitted');
            socket.off('correct-guess');
            socket.off('time-up');
        };
    }, []);

    return (
        <div className='relative'>
            <RoomToolbar
                canDraw={canDraw}
                clear={handleClear}
                exit={() => socketRef.current.emit('leave-room')}
            />

            <canvas
                id='draw'
                width={`${width}px`}
                height={`${height}px`}
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
                style={{
                    cursor: "url(https://icons.iconarchive.com/icons/github/octicons/24/pencil-16-icon.png) 0 30, crosshair"
                }}
                className={`bg-white ${!canDraw ? '!cursor-not-allowed' : ''}`}
            />

            <RoomSidebar socketRef={socketRef} />

            {isWordEntryEnabled && <DrawingSubject socketRef={socketRef} />}
        </div>
    );
};

export default React.memo(RoomCanvas);