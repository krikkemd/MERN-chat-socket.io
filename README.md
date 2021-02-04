# MERN-chat-socket.io

From browser:

1) Client submits a chatMessage
  - onSubmit: socket.io-client emits chatMessage to the server
  
2) Server receives the chatMessage
  - server socket.io listens for incoming chatMessages
  - on chatMessage, server makes an axios.post('/chatMessages') request
  - the chatMessage is stored inside the DB collection
  - server listens to changes inside the DB collection using changeStream.watch()
  - on changeStream 'change' trigger -> return io.emit(change.fullDocument) back to ALL connected clients
  
3) All clients receive the chatMessage back from the server
  - clients listen to incoming chatMessages with socket.io-client, sent back from the server 
  - clients dispatch an action to the Redux chatMessageReducer containing the chatMessage
  - Reducer update the state / props
  - All clients rerender with the new chatMessage
  
  From Postman:
  
  1) Directly make a post request to /chatMessages
    - the chatMessage is inserted into the DB
    - the server is listening to db collection changes using changeStream.watch()
    - onChange, the inserted chatMessage is emitted to all connected clients that are using socket.io
    
  2) CLients receive the chatMessage
    - on receive chatMessage, dispatch action containg the chatMessage to chatMessageReducer
    - chatMessageReducer updates the state / props
    - clients rerender
    
  
