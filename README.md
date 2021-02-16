# MERN-chat-socket.io

From browser:

1) Client submits a chatMessage
  - onSubmit: client makes an axios post request to the server. {withCredentials: true } // for cookie
  
2) Server receives the chatMessage
  - server runs protect middleware to check the jwt cookie
  - the chatMessage is stored inside the DB collection
  - server listens to changes inside the DB collection using changeStream.watch()
  - on changeStream 'change' trigger -> return io.emit(change.fullDocument) back to ALL connected clients
  
3) All clients receive the chatMessage back from the server
  - clients listen to incoming chatMessages with socket.io-client, sent back from the server 
  - clients dispatch an action from useEffect to update the Redux state for ALL clients // important to dispatch from the useEffect, so that the redux state is updated for ALL connected clients!
  - Reducer updates the state / props
  - All clients rerender with the new chatMessage
  
  From Postman:
  
  1) Directly make a post request to /chatMessages
    - the chatMessage is inserted into the DB
    - the server is listening to db collection changes using changeStream.watch()
    - onChange, the inserted chatMessage is emitted to all connected clients that are using socket.io
    
  2) CLients receive the chatMessage
    - on receive chatMessage, dispatch action containing the chatMessage to chatMessageReducer
    - chatMessageReducer updates the state / props
    - clients rerender
    
  
