import {useState, useEffect, useRef} from 'react';
import socket from '../../socket';
import ACTIONS from '../../socket/actions';
import {useHistory} from 'react-router';
//import {v4} from 'uuid';

export default function Main() {
  const history = useHistory();
  const [rooms, updateRooms] = useState([]);
  const rootNode = useRef();
  const [myRoomId, setMyRoomId] = useState('')

  useEffect(() => {
    socket.on(ACTIONS.SHARE_ROOMS, ({rooms = []} = {}) => {
      if (rootNode.current) {
        updateRooms(rooms);
      }
    });
  }, []);

  return (
    <div ref={rootNode}>
      <h1>Available Rooms</h1>
      <ul>
        {rooms.map(roomID => (
          <li key={roomID}>
            {roomID}
            <button onClick={() => {
              history.push(`/${roomID}`);
            }}>JOIN ROOM</button>
          </li>
        ))}
      </ul>
        <div>
            <input type="text" value={myRoomId} onChange={e => setMyRoomId(e.target.value)} />
            <button onClick={() => {
                history.push(`/${myRoomId}`);
            }}>Create New Room</button>
        </div>

      {/*<button onClick={() => {*/}
      {/*  history.push(`/room/${v4()}`);*/}
      {/*}}>Create New Room</button>*/}
    </div>
  );
}