import React from 'react';
import { Room } from '../types';
interface RoomFormProps {
    room: Room;
    onUpdate: (updatedRoom: Room) => void;
    onDelete: () => void;
}
declare const RoomForm: React.FC<RoomFormProps>;
export default RoomForm;
