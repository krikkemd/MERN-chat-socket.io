// React
import { useState, useRef } from 'react';

// Redux
import { connect } from 'react-redux';

// Redux Actions
import { createChatMessage } from '../redux/actions/chatMessageActions';

// Helper functions
import { createAlert } from '../util/helperFunctions';
import Picker from 'emoji-picker-react';

// MUI
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

const ChatInput = props => {
  // Local State
  const [chatMessage, setChatMessage] = useState('');
  // const [chosenEmoji, setChosenEmoji] = useState(null);
  const [open, setOpen] = useState(false);
  const [pageX, setPageX] = useState(0);
  const [pageY, setPageY] = useState(0);
  const inputEl = useRef(null);

  //   Local funcions
  const onEmojiClick = (event, emojiObject) => {
    console.log(emojiObject);
    inputEl.current.focus();
    setChatMessage(`${chatMessage} ${emojiObject.emoji}`);
    inputEl.current.focus();
  };

  const openPicker = e => {
    console.log(e.pageX);
    setPageX(e.pageX);
    setPageY(e.pageY - 340);

    console.log('openPicker');
    setOpen(!open);
    console.log(open);
  };

  const handleChange = e => {
    setChatMessage(e.target.value);
    setOpen(false);
    inputEl.current.focus();
  };

  const submitChatMessage = e => {
    e.preventDefault();
    setOpen(false);

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
            <IconButton edge={'start'} onClick={openPicker}>
              <Tooltip title='Emojis' placement='top-start' arrow interactive>
                {props.theme === 'dark' || props.theme === 'true' ? (
                  <InsertEmoticonIcon />
                ) : (
                  <InsertEmoticonIcon color='primary' />
                )}
              </Tooltip>
            </IconButton>
            <Picker
              pickerStyle={{
                display: open ? '' : 'none',
                position: 'absolute',
                top: pageY,
                left: pageX,
                background: props.theme === 'dark' || props.theme === 'true' ? '#757575' : '#fff',
                border: props.theme === 'dark' || props.theme === 'true' ? '#757575' : '#efefef',
                boxShadow:
                  props.theme === 'dark' || props.theme === 'true'
                    ? '0 5px 10px #424242'
                    : '0 5px 10px #efefef',
                // zIndex: 100000,
              }}
              onEmojiClick={onEmojiClick}
              // disableAutoFocus={true}
              disableSearchBar={true}
              disableSkinTonePicker={true}
              groupVisibility={{
                recently_used: false,
                flags: false,
                symbols: false,
              }}
              native
            />

            <form onSubmit={submitChatMessage}>
              <TextField
                id='outlined-basic-email'
                label='Typ hier uw bericht...'
                fullWidth
                onClick={() => setOpen(false)}
                autoFocus={true}
                value={chatMessage}
                onChange={handleChange}
                inputRef={inputEl}
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
    theme: state.theme.theme,
  };
};

export default connect(mapStateToProps, {
  createChatMessage,
})(ChatInput);
