// React
import { useState } from 'react';

// Redux
import { connect } from 'react-redux';

// Redux Actions
import { createChatMessage } from '../redux/actions/chatMessageActions';

// Helper functions
import { createAlert } from '../util/helperFunctions';

// MUI
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';

const ChatInput = props => {
  // Local State
  const [chatMessage, setChatMessage] = useState('');

  //   Local funcions
  const handleChange = e => {
    setChatMessage(e.target.value);
  };

  const submitChatMessage = e => {
    e.preventDefault();

    let trimmedChatMessage = chatMessage.trim();
    if (trimmedChatMessage) {
      // Create chat message action
      props.createChatMessage({
        chatRoomId: props.activeChatRoom._id,
        body: trimmedChatMessage,
      });

      setChatMessage('');
    }
  };

  return (
    <>
      {props.activeChatRoom._id ? (
        <Grid container wrap='nowrap'>
          <Grid item xs={12}>
            <form onSubmit={submitChatMessage}>
              <TextField
                id='outlined-basic-email'
                label='Typ hier uw bericht...'
                fullWidth
                autoFocus={true}
                value={chatMessage}
                onChange={handleChange}
              />
            </form>
          </Grid>
          <Grid onClick={submitChatMessage} item xs align='right'>
            <Fab color='secondary' aria-label='add'>
              <SendIcon />
            </Fab>
          </Grid>
        </Grid>
      ) : (
        ''
      )}
      {props.alert !== '' && createAlert('error', props.alert)}
    </>
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket.socket,
    chatMessages: state.chat.chatMessages,
    alert: state.chat.alert,
    user: state.user.user,
    activeChatRoom: state.chat.activeChatRoom,
  };
};

export default connect(mapStateToProps, {
  createChatMessage,
})(ChatInput);
